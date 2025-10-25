// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

    // Verifica se há um usuário autenticado
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
      if (user) {
        userId = user.id;
      }
    }

    const { customerData, items } = await req.json()

    console.log('Dados recebidos:', { customerData, items, userId });

    if (!customerData || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Dados do cliente e itens são obrigatórios.')
    }
    
    // Validação explícita das propriedades do cliente
    if (!customerData.name || !customerData.email) {
        throw new Error('Nome e email do cliente são obrigatórios.');
    }

    const pointIds = items.map(item => item.point_id);
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

      // Verificação robusta: o preço deve ser um número e maior que zero
      if (typeof price !== 'number' || price <= 0) {
        throw new Error(`Preço para ${item.period_years} anos não definido ou é zero para o ponto ${pointDetails.name} (${item.point_id}).`);
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
      customer_phone: customerData.phone || null,
      total_amount: calculatedTotalAmount,
      items: validatedItems,
      p_user_id: userId, // Passa o ID do usuário para a função
    })

    if (rpcError) {
      console.error('Erro RPC create_new_order:', rpcError);
      // Tenta extrair a mensagem de erro do PostgreSQL
      const dbErrorMessage = rpcError.message.match(/PGRST\d{3}: (.*)/)?.[1] || rpcError.message;
      
      // Retorna a resposta 400 imediatamente com a mensagem de erro do banco de dados
      return new Response(JSON.stringify({ error: dbErrorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- LÓGICA DE ENVIO DE E-MAIL (sem alterações) ---
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY não encontrada. E-mails não serão enviados.');
      } else {
        const resend = new Resend(resendApiKey);
        const orderIdShort = (newOrderId as string).substring(0, 8);
        const itemsListHtml = items.map(item => {
          const pointDetails = pointDetailsMap.get(item.point_id);
          return `<li>${pointDetails?.name || 'Ponto desconhecido'} - ${item.period_years} ano(s)</li>`;
        }).join('');

        await resend.emails.send({
          from: 'Placas Nova Odessa <onboarding@resend.dev>',
          to: [customerData.email],
          subject: `Confirmação da sua reserva #${orderIdShort}`,
          html: `<h1>Olá, ${customerData.name}!</h1><p>Sua reserva foi realizada com sucesso e é válida por 48 horas.</p><p><strong>Número do Pedido:</strong> ${orderIdShort}</p><h3>Itens Reservados:</h3><ul>${itemsListHtml}</ul><p><strong>Valor Total:</strong> R$ ${calculatedTotalAmount.toFixed(2)}</p><p>Em breve, nossa equipe entrará em contato para dar continuidade ao processo.</p><p>Obrigado,<br>Equipe Placas Nova Odessa</p>`,
        });

        await resend.emails.send({
          from: 'Notificação do Sistema <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `Nova reserva recebida - Pedido #${orderIdShort}`,
          html: `<h1>Nova Reserva Recebida</h1><p>Uma nova reserva foi feita através do site.</p><p><strong>Número do Pedido:</strong> ${orderIdShort}</p><h3>Dados do Cliente:</h3><ul><li><strong>Nome:</strong> ${customerData.name}</li><li><strong>E-mail:</strong> ${customerData.email}</li><li><strong>Telefone:</strong> ${customerData.phone}</li></ul><h3>Itens Reservados:</h3><ul>${itemsListHtml}</ul><p><strong>Valor Total:</strong> R$ ${calculatedTotalAmount.toFixed(2)}</p><p>Acesse o painel administrativo para gerenciar este pedido.</p>`,
        });
      }
    } catch (emailError) {
      console.error('Falha ao enviar e-mails de notificação:', emailError);
    }
    // --- FIM DA LÓGICA DE ENVIO DE E-MAIL ---

    return new Response(JSON.stringify({ orderId: newOrderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    console.error('Erro na Edge Function create-order:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
});