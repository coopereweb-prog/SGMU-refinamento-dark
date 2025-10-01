/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificação de segurança (semelhante à função de convite)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Cabeçalho de autorização ausente')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('JWT inválido')
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    
    // Apenas 'admin' pode excluir usuários
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { userIdToDelete } = await req.json()
    if (!userIdToDelete) {
      throw new Error('ID do usuário é obrigatório.')
    }
    
    if (userIdToDelete === user.id) {
      throw new Error('Você não pode excluir a si mesmo.')
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)

    if (deleteError) {
      throw deleteError
    }

    return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})