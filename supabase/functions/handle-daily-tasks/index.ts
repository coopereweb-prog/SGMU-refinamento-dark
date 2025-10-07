// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// O e-mail do administrador para onde as notificações serão enviadas
const ADMIN_EMAIL = 'placas.novaodessa@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use o SERVICE_ROLE_KEY para ter permissões de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não está configurada.');
    }
    const resend = new Resend(resendApiKey);

    // --- 1. Notificação de Reservas com mais de 24 horas ---
    const { data: ordersToNotify, error: fetchError } = await supabaseAdmin.rpc('get_orders_for_24h_notification');

    if (fetchError) {
      console.error('Erro ao buscar pedidos para notificação:', fetchError);
      throw fetchError;
    }

    let notificationSummary = 'Nenhuma reserva com mais de 24h para notificar.';

    if (ordersToNotify && ordersToNotify.length > 0) {
      const orderIdsNotified = [];

      for (const order of ordersToNotify) {
        const orderIdShort = order.id.substring(0, 8);
        try {
          await resend.emails.send({
            from: 'Alerta do Sistema SGMU <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `Alerta: Reserva #${orderIdShort} está pendente há mais de 24h`,
            html: `
              <h1>Alerta de Reserva Pendente</h1>
              <p>O pedido de reserva abaixo está pendente há mais de 24 horas e irá expirar em breve.</p>
              <ul>
                <li><strong>ID do Pedido:</strong> ${orderIdShort}</li>
                <li><strong>Cliente:</strong> ${order.customer_name}</li>
                <li><strong>Email:</strong> ${order.customer_email}</li>
                <li><strong>Valor:</strong> R$ ${Number(order.total_amount).toFixed(2)}</li>
                <li><strong>Data da Reserva:</strong> ${new Date(order.created_at).toLocaleString('pt-BR')}</li>
              </ul>
              <p>Considere entrar em contato com o cliente para finalizar a compra.</p>
            `,
          });
          orderIdsNotified.push(order.id);
        } catch (emailError) {
          console.error(`Falha ao enviar e-mail para o pedido ${order.id}:`, emailError);
          // Continua para o próximo pedido mesmo se um e-mail falhar
        }
      }

      // Marca os pedidos como notificados no banco de dados
      if (orderIdsNotified.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ is_24h_notification_sent: true })
          .in('id', orderIdsNotified);

        if (updateError) {
          console.error('Erro ao marcar pedidos como notificados:', updateError);
          // Não lança erro para permitir que o processo de expiração continue
        }
      }
      notificationSummary = `${orderIdsNotified.length} notificações de 24h enviadas.`;
    }

    // --- 2. Expiração de Reservas com mais de 48 horas ---
    const { error: expireError } = await supabaseAdmin.rpc('expire_old_reservations');

    if (expireError) {
      console.error('Erro ao expirar reservas antigas:', expireError);
      throw expireError;
    }

    const expirationSummary = 'Processo de expiração de reservas de 48h concluído.';

    // --- Resposta Final ---
    return new Response(JSON.stringify({ 
      message: 'Tarefas diárias executadas com sucesso.',
      notificationSummary,
      expirationSummary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na execução da tarefa agendada:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})