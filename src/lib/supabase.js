import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não estão definidas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções para gerenciar pontos
export const getPoints = async () => {
  // A consulta foi alterada para uma sintaxe de junção mais explícita,
  // que é mais robusta a possíveis ambiguidades na configuração da relação.
  const { data, error } = await supabase
    .from('points')
    .select('*, point_tags(tags(id, name)))')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar pontos:', error);
    return [];
  }

  // A nova consulta retorna uma estrutura aninhada: point.point_tags = [{ tags: {...} }]
  // O código abaixo transforma (achata) essa estrutura de volta para o formato que
  // o resto da aplicação espera: point.tags = [{...}]
  // Isto torna a alteração "invisível" para os outros componentes, aumentando a segurança.
  const formattedData = data.map(point => {
    const tags = point.point_tags.map(pt => pt.tags).filter(Boolean);
    return { ...point, tags };
  });

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


export const updatePointStatus = async (pointId, status, dadosCliente = null) => {
  const updateData = {
    status,
    updated_at: new Date().toISOString()
  }

  if (dadosCliente) {
    updateData.dados_cliente = dadosCliente
    updateData.reservado_em = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('points')
    .update(updateData)
    .eq('id', pointId)
    .select()

  if (error) {
    console.error('Erro ao atualizar ponto:', error)
    return null
  }

  return data[0]
}

export const createOrder = async (customerData, cartItems) => {
  // Mapeia os itens do carrinho para uma estrutura mais simples, enviando apenas o necessário.
  const itemsForFunction = cartItems.map(item => ({
    point_id: item.point_id,
    period_years: item.period_years,
  }));

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: {
      customerData,
      items: itemsForFunction,
    },
  })

  if (error) {
    console.error('Erro ao invocar a Edge Function create-order:', error)
    throw error
  }

  return data
}

// Função para upload de imagens
export const uploadImagem = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('placas-fotos')
    .upload(path, file)

  if (error) {
    console.error('Erro ao fazer upload:', error)
    return null
  }

  return data
}

export const getImagemUrl = (path) => {
  const { data } = supabase.storage
    .from('placas-fotos')
    .getPublicUrl(path)

  return data.publicUrl
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

// Funções para gerenciar usuários
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'operations_manager', 'field_technician']);
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  return data;
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