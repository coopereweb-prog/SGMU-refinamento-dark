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

    // 1. Obter o token de autorização do cabeçalho
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização ausente')
    }
    const jwt = authHeader.replace('Bearer ', '')

    // 2. Obter o usuário a partir do token
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      throw new Error('JWT inválido')
    }

    // 3. Verificar se o usuário é um administrador
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // CORREÇÃO: Adicionado `!profile` para evitar crash se o perfil não for encontrado
    if (profileError || !profile || !['admin', 'operations_manager'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 4. Obter dados do corpo da requisição
    const { email, name, role } = await req.json()
    if (!email || !name || !role) {
      throw new Error('Email, nome e função são obrigatórios.')
    }

    // 5. Convidar o usuário
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name, role },
    })

    if (inviteError) {
      throw inviteError
    }

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})