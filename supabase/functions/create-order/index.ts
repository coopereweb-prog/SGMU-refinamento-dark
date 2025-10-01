// supabase/functions/create-order/index.ts

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// O e-mail para onde as notificações de novas reservas serão enviadas.
const ADMIN_EMAIL = 'placas.novaodessa@gmail.com'

interface PointData {
  id: string;
  name: string;
  price_1y: number | null;
  price_2y: number | null;
  price_3y: number | null;
  price_4y: number | null;
  price_5y: number | null;
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

    const { customerData, items } = await req.json()

    if (!customerData || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Dados do cliente e itens são obrigatórios.')
    }

    const pointIds = items.map(item => item.point_id);
    // Buscamos também o nome do ponto para usar nos e-mails
    const { data: pointsData, error: pointsError } = await supabaseAdmin
      .from('points')
      .select('id, name, price_1y, price_2y, price_3y, price_4y, price_5y')
      .in('id', pointIds);

    if (pointsError) throw new Error('Erro ao buscar dados dos pontos.');
    if (!pointsData || pointsData.length !== pointIds.length) throw new Error('Um ou mais pontos selecionados são inválidos.');

    const pointDetailsMap = new Map((pointsData as PointData[]).map(p => [p.id, p]));

    let calculatedTotalAmount = 0;
    const validatedItems = items.map(item => {
      const pointDetails = pointDetailsMap.get(item.point_id);
      if (!pointDetails) throw new Error(`Detalhes não encontrados para o ponto ${item.point_id}`);

      let price;
      switch (item.period_years) {
        case 1: price = pointDetails.price_1y; break;
        case 2: price = pointDetails.price_2y; break;
        case 3: price = pointDetails.price_3y; break;
        case 4: price = pointDetails.price_4y; break;
        case 5: price = pointDetails.price_5y; break;
        default: throw new Error(`Período inválido (${item.period_years} anos) para o ponto ${item.point_id}`);
      }

      if (typeof price !== 'number') {
        throw new Error(`Preço para ${item.period_years} anos não definido para o ponto ${item.point_id}`);
      }
      
      calculatedTotalAmount += price;

      return {
        ponto_id: item.point_id,
        period_years: item.period_years,
        price: price,
      };
    });

    const { data: newOrderId, error: rpcError } = await supabaseAdmin.rpc('create_new_order', {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      total_amount: calculatedTotalAmount,
      items: validatedItems,
    })

    if (rpcError) {
      throw rpcError
    }

    // --- INÍCIO DA LÓGICA DE ENVIO DE E-MAIL ---
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY não encontrada. E-mails não serão enviados.');
      } else {
        const resend = new Resend(resendApiKey);
        const orderIdShort = (newOrderId as string).substring(0, 8);

        // Prepara a lista de itens para os e-mails
        const itemsListHtml = items.map(item => {
          const pointDetails = pointDetailsMap.get(item.point_id);
          return `<li>${pointDetails?.name || 'Ponto desconhecido'} - ${item.period_years} ano(s)</li>`;
        }).join('');

        // 1. Envia e-mail de confirmação para o cliente
        await resend.emails.send({
          from: 'Placas Nova Odessa <onboarding@resend.dev>',
          to: [customerData.email],
          subject: `Confirmação da sua reserva #${orderIdShort}`,
          html: `
            <h1>Olá, ${customerData.name}!</h1>
            <p>Sua reserva foi realizada com sucesso e é válida por 48 horas.</p>
            <p><strong>Número do Pedido:</strong> ${orderIdShort}</p>
            <h3>Itens Reservados:</h3>
            <ul>${itemsListHtml}</ul>
            <p><strong>Valor Total:</strong> R$ ${calculatedTotalAmount.toFixed(2)}</p>
            <p>Em breve, nossa equipe entrará em contato para dar continuidade ao processo.</p>
            <p>Obrigado,<br>Equipe Placas Nova Odessa</p>
          `,
        });

        // 2. Envia e-mail de notificação para o administrador
        await resend.emails.send({
          from: 'Notificação do Sistema <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `Nova reserva recebida - Pedido #${orderIdShort}`,
          html: `
            <h1>Nova Reserva Recebida</h1>
            <p>Uma nova reserva foi feita através do site.</p>
            <p><strong>Número do Pedido:</strong> ${orderIdShort}</p>
            <h3>Dados do Cliente:</h3>
            <ul>
              <li><strong>Nome:</strong> ${customerData.name}</li>
              <li><strong>E-mail:</strong> ${customerData.email}</li>
              <li><strong>Telefone:</strong> ${customerData.phone}</li>
            </ul>
            <h3>Itens Reservados:</h3>
            <ul>${itemsListHtml}</ul>
            <p><strong>Valor Total:</strong> R$ ${calculatedTotalAmount.toFixed(2)}</p>
            <p>Acesse o painel administrativo para gerenciar este pedido.</p>
          `,
        });
      }
    } catch (emailError) {
      // Se o envio de e-mail falhar, apenas registramos o erro no console
      // mas não interrompemos o fluxo. O pedido já foi criado.
      console.error('Falha ao enviar e-mails de notificação:', emailError);
    }
    // --- FIM DA LÓGICA DE ENVIO DE E-MAIL ---

    return new Response(JSON.stringify({ orderId: newOrderId }), {
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