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

    // 1. Check for authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authorization header missing')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser } } = await supabaseAdmin.auth.getUser(jwt)
    if (!requestingUser) throw new Error('Invalid JWT')

    // 2. Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single()

    if (!profile || !['admin', 'operations_manager'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized access.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 3. Get data from body
    const { userIdToUpdate, userData } = await req.json()
    if (!userIdToUpdate || !userData) {
      throw new Error('User ID and user data are required.')
    }

    // 4. Update user
    const { data: { user }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userIdToUpdate,
      userData
    )
    if (updateError) throw updateError

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})