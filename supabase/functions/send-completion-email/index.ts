// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3.4.0'

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
    // 1. Receber os dados da requisição
    const { order_id, customer_email } = await req.json()
    if (!order_id || !customer_email) {
      throw new Error('order_id e customer_email são obrigatórios.')
    }

    // 2. Inicializar clientes com chaves de ambiente
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não está configurada.');
    }
    const resend = new Resend(resendApiKey);
    const siteUrl = Deno.env.get('VITE_SITE_URL') || 'http://localhost:5173';

    // 3. Buscar detalhes do pedido para personalizar o e-mail
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('customer_name')
      .eq('id', order_id)
      .single();

    if (orderError) throw new Error(`Pedido não encontrado: ${orderError.message}`);

    const customerName = order.customer_name || 'Cliente';
    const orderIdShort = order_id.substring(0, 8).toUpperCase();

    // 4. Montar o e-mail com os links de call-to-action
    const subject = `Suas instalações do pedido nº ${orderIdShort} foram concluídas!`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #1a1a1a;">Olá, ${customerName}!</h1>
        <p>Temos uma ótima notícia: todas as instalações de placas do seu pedido <strong>#${orderIdShort}</strong> foram concluídas com sucesso pela nossa equipe de campo.</p>
        <p>Agora você pode visualizar as fotos das instalações e planejar uma rota para visitar seus novos pontos de publicidade.</p>
        
        <div style="margin: 30px 0;">
          <a href="${siteUrl}/dashboard" style="background-color: #facc15; color: #1a1a1a; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 15px;">
            Ver Fotos das Instalações
          </a>
          <a href="${siteUrl}/dashboard?feature=visitation_route" style="background-color: #333; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Criar Rota de Visitação
          </a>
        </div>

        <p>Agradecemos pela sua confiança!</p>
        <p>Atenciosamente,<br>Equipe SGMU</p>
      </div>
    `;

    // 5. Enviar o e-mail
    await resend.emails.send({
      from: 'SGMU <onboarding@resend.dev>',
      to: [customer_email],
      subject: subject,
      html: emailHtml,
    });

    // 6. Retornar sucesso
    return new Response(JSON.stringify({ message: 'E-mail de conclusão enviado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 7. Tratar erros
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    console.error('Erro na Edge Function send-completion-email:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});