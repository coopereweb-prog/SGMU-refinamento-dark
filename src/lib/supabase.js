import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciais do Supabase não estão definidas no arquivo .env.local. Verifique se o arquivo existe e se o servidor foi reiniciado.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar pontos
export const getPoints = async () => {
  const { data: points, error: pointsError } = await supabase
    .from('points')
    .select('*')
    .order('created_at', { ascending: true });

  if (pointsError) {
    console.error('Erro ao buscar pontos:', pointsError);
    return [];
  }
  if (!points) return [];

  const { data: relations, error: relationsError } = await supabase
    .from('point_tags')
    .select('point_id, tags(id, name)');

  if (relationsError) {
    console.error('Erro ao buscar relações de tags:', relationsError);
    // Retorna os pontos sem tags se a busca de relações falhar
    return points.map(p => ({ ...p, tags: [] }));
  }

  const tagsByPointId = relations.reduce((acc, relation) => {
    if (!acc[relation.point_id]) {
      acc[relation.point_id] = [];
    }
    if (relation.tags) {
      acc[relation.point_id].push(relation.tags);
    }
    return acc;
  }, {});

  const formattedData = points.map(point => ({
    ...point,
    tags: tagsByPointId[point.id] || [],
  }));

  return formattedData;
};

// Nova função para buscar todas as tags disponíveis para o painel de filtro
export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar tags:', error);
    return [];
  }
  return data;
};

// Funções para gerenciar tags
export const createTag = async (name) => {
  const { data, error } = await supabase.from('tags').insert([{ name }]).select();
  if (error) throw error;
  return data[0];
};

export const updateTag = async (id, name) => {
  const { data, error } = await supabase.from('tags').update({ name }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteTag = async (id) => {
  // Primeiro, remove as associações na tabela point_tags
  const { error: pointTagsError } = await supabase.from('point_tags').delete().eq('tag_id', id);
  if (pointTagsError) throw pointTagsError;

  // Depois, remove a tag da tabela tags
  const { error: tagsError } = await supabase.from('tags').delete().eq('id', id);
  if (tagsError) throw tagsError;
};

export const createOrder = async (customerData, cartItems) => {
  // Verificar se há um usuário logado
  const { data: { session } } = await supabase.auth.getSession();
  let userId = null;
  
  if (session?.user) {
    userId = session.user.id;
  }

  const itemsForFunction = cartItems.map(item => ({
    point_id: item.point_id,
    period_years: item.period_years,
  }));

  const headers = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: {
      customerData,
      items: itemsForFunction,
    },
    headers,
  })

  if (error) {
    console.error('Erro ao invocar a Edge Function create-order:', error);
    
    // Tenta extrair a mensagem de erro detalhada do corpo da resposta 400
    let errorMessage = error.message;
    try {
      // Se o erro for um FunctionsHttpError, o corpo da resposta pode estar em error.context.body
      const errorBody = JSON.parse(error.context.body);
      if (errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch (e) {
      // Ignora se o corpo não for JSON ou se não houver corpo
    }
    
    throw new Error(errorMessage);
  }

  return data
}

// Nova função para modificar um pedido
export const modifyOrder = async (orderId, itemIdsToKeep) => {
  const { error } = await supabase.rpc('modify_pending_order', {
    p_order_id: orderId,
    p_item_ids_to_keep: itemIdsToKeep,
  });

  if (error) {
    throw error;
  }
};

// Nova função para atualizar o período de um item do pedido
export const updateOrderItemPeriod = async (orderId, orderItemId, newPeriod) => {
  const { error } = await supabase.rpc('update_order_item_period', {
    p_order_id: orderId,
    p_order_item_id: orderItemId,
    p_new_period_years: newPeriod,
  });

  if (error) {
    throw error;
  }
};

// Funções de gerenciamento de pedidos pelo Admin
export const confirmOrder = async (orderId) => {
  const { error } = await supabase.rpc('confirm_order_and_update_points', { p_order_id: orderId });
  if (error) throw error;
};

export const cancelOrder = async (orderId) => {
  const { error } = await supabase.rpc('cancel_order_and_release_points', { p_order_id: orderId });
  if (error) throw error;
};

export const markOrderAsEditedByAdmin = async (orderId) => {
  const { error } = await supabase.from('orders').update({ edited_by_admin: true }).eq('id', orderId);
  if (error) throw error;
};


// Funções para gerenciar usuários
export const getUsers = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Usuário não autenticado.");

  // 1. Busca usuários de autenticação (via Edge Function)
  const { data: authData, error: authError } = await supabase.functions.invoke('get-users', {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (authError) {
    console.error('Error fetching users via function:', authError);
    throw authError;
  }
  
  const authUsers = authData.users;
  const userIds = authUsers.map(u => u.id);

  // 2. Busca perfis correspondentes para obter o 'role' e 'name'
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, role, name')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    // Continua, mas os dados de perfil podem estar incompletos
  }

  const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

  // 3. Mescla os dados
  return authUsers.map(user => {
    const profile = profilesMap.get(user.id);
    
    // Usa o role do perfil como fonte de verdade, mas mantém o app_metadata para compatibilidade
    const role = profile?.role || user.app_metadata?.role || 'client';
    
    return {
      ...user,
      // Sobrescreve app_metadata para garantir que o role esteja sempre presente
      app_metadata: {
        ...user.app_metadata,
        role: role,
      },
      // Sobrescreve user_metadata para garantir que o nome esteja presente
      user_metadata: {
        ...user.user_metadata,
        full_name: profile?.name || user.user_metadata?.full_name,
      }
    };
  });
};

export const inviteUser = async (email, name, role) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Usuário não autenticado.");

  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, name, role },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteUser = async (userIdToDelete) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Usuário não autenticado.");

  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { userIdToDelete },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) throw error;
  return data;
};

// Nova função para atualizar o perfil do cliente
export const updateClientProfile = async (userId, profileData) => {
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);

  if (error) {
    console.error('Erro ao atualizar perfil do cliente:', error);
    throw error;
  }
};

// Nova função para buscar tarefas de instalação
export const getInstallationTasks = async () => {
  const { data, error } = await supabase
    .from('installation_tasks')
    .select(`
      *,
      order_items (
        orders ( id, customer_name, kit_type )
      ),
      points ( name ),
      technician:profiles ( name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    // Se a tabela não for encontrada, retorna um array vazio para evitar que a aplicação quebre.
    if (error.code === 'PGRST205') {
      console.warn("A tabela 'installation_tasks' não foi encontrada. O pipeline de instalação estará vazio.");
      return [];
    }
    console.error('Error fetching installation tasks:', error);
    throw error;
  }

  // Formata os dados para um acesso mais fácil
  return data.map(task => ({
    ...task,
    customer_name: task.order_items?.orders?.customer_name,
    kit_type: task.order_items?.orders?.kit_type,
    point_name: task.points?.name,
    technician_name: task.technician?.name,
  }));
};

// Nova função para buscar tarefas de um técnico específico
export const getTechnicianTasks = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('installation_tasks')
    .select(`
      id,
      points (id, name, installation_photo_url, latitude, longitude, installation_notes, street_name, intersection_name),
      order_items ( orders ( customer_name, kit_type ) )
    `)
    .eq('assigned_technician_id', user.id)
    .eq('status', 'assigned');

  if (error) {
    console.error('Error fetching technician tasks:', error);
    throw error;
  }

  return data.map(task => ({
    ...task,
    customer_name: task.order_items?.orders?.customer_name,
    kit_type: task.order_items?.orders?.kit_type, // Adicionado kit_type
  }));
};

// Nova função para completar uma tarefa de instalação
export const completeInstallationTask = async (taskId) => {
  const { error } = await supabase
    .from('installation_tasks')
    .update({ status: 'completed' })
    .eq('id', taskId);

  if (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

// Nova função para atualizar o status de uma tarefa
export const updateInstallationTaskStatus = async (taskId, newStatus) => {
  const { error } = await supabase
    .from('installation_tasks')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// Nova função para buscar técnicos de campo
export const getFieldTechnicians = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'field_technician');

  if (error) {
    console.error('Error fetching field technicians:', error);
    throw error;
  }
  return data;
};

// Nova função para atribuir uma tarefa e atualizar seu status
export const assignTaskToTechnician = async (taskId, technicianId) => {
  const { data, error } = await supabase
    .from('installation_tasks')
    .update({ 
      assigned_technician_id: technicianId,
      status: 'assigned'
    })
    .eq('id', taskId)
    .select(`
      *,
      order_items ( orders ( id, customer_name, kit_type ) ),
      points ( name ),
      technician:profiles ( name )
    `)
    .single();

  if (error) {
    console.error('Error assigning task:', error);
    throw error;
  }
  
  return {
    ...data,
    customer_name: data.order_items?.orders?.customer_name,
    kit_type: data.order_items?.orders?.kit_type, // Adicionado kit_type
    point_name: data.points?.name,
    technician_name: data.technician?.name,
  };
};

// Nova função para devolver uma tarefa para o estado 'on_hold'
export const returnTaskToHold = async (taskId, pointId, notes) => {
  // Primeiro, atualiza as notas no próprio ponto
  const { error: pointUpdateError } = await supabase
    .from('points')
    .update({ installation_notes: notes })
    .eq('id', pointId);

  if (pointUpdateError) {
    console.error('Error updating point notes:', pointUpdateError);
    throw pointUpdateError;
  }

  // Em seguida, atualiza o status da tarefa e desatribui o técnico
  const { error: taskUpdateError } = await supabase
    .from('installation_tasks')
    .update({ 
      status: 'on_hold',
      assigned_technician_id: null 
    })
    .eq('id', taskId);

  if (taskUpdateError) {
    console.error('Error returning task to hold:', taskUpdateError);
    throw taskUpdateError;
  }
};

// Nova função para atualizar o kit_type do pedido
export const updateOrderKitType = async (orderId, kitType) => {
  const { error } = await supabase
    .from('orders')
    .update({ kit_type: kitType })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order kit type:', error);
    throw error;
  }
};