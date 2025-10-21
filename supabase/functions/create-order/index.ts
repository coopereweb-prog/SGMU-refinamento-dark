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
      // Usamos o admin client para verificar o JWT
      const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
      if (user) {
        userId = user.id;
      }
    }

    const { customerData, items } = await req.json()

    if (!customerData || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Dados do cliente e itens são obrigatórios.')
    }
    
    // Validação básica dos dados do cliente
    if (!customerData.name || !customerData.email) {
        throw new Error('Nome e email do cliente são obrigatórios.');
    }

    const pointIds = items.map(item => item.point_id);
    const { data: pointsData, error: pointsError } = await supabaseAdmin
      .from('points')
      .select('id, name, price_1y, price_2y, price_3y, price_4y, price_5y')
      .in('id', pointIds);

    if (pointsError) throw new Error('Erro ao buscar dados dos pontos: ' + pointsError.message);
    if (!pointsData || pointsData.length !== pointIds.length) throw new Error('Um ou mais pontos selecionados são inválidos ou não existem.');

    const pointDetailsMap = new Map((pointsData as PointData[]).map(p => [p.id, p]));

    let calculatedTotalAmount = 0;
    const validatedItems = items.map(item => {
      const pointDetails = pointDetailsMap.get(item.point_id);
      if (!pointDetails) throw new Error(`Detalhes não encontrados para o ponto ${item.point_id}`);

      let price;
      // O período é passado em dias, mas o preço é armazenado por ano (1y, 2y, etc.)
      const periodYears = item.details.days / 365; 
      
      switch (periodYears) {
        case 1: price = pointDetails.price_1y; break;
        case 2: price = pointDetails.price_2y; break;
        case 3: price = pointDetails.price_3y; break;
        case 4: price = pointDetails.price_4y; break;
        case 5: price = pointDetails.price_5y; break;
        default: throw new Error(`Período inválido (${periodYears} anos) para o ponto ${item.point_id}`);
      }

      if (typeof price !== 'number' || price <= 0) {
        throw new Error(`Preço para ${periodYears} anos não definido ou inválido para o ponto ${item.point_id}`);
      }
      
      calculatedTotalAmount += price;

      return {
        ponto_id: item.point_id,
        period_years: periodYears, // Passa o período em anos para a função RPC
        price: price,
      };
    });

    // Chamada da função RPC
    const { data: newOrderId, error: rpcError } = await supabaseAdmin.rpc('create_new_order', {
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone || null,
      total_amount: calculatedTotalAmount,
      items: validatedItems,
      p_user_id: userId, // Passa o ID do usuário (pode ser null para convidados)
    })

    if (rpcError) {
      console.error('Erro RPC create_new_order:', rpcError);
      throw rpcError
    }

    // --- LÓGICA DE ENVIO DE E-MAIL (sem alterações) ---
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY não encontrada. E-mails não serão enviados.');
      } else {
        const resend = new Resend(resendApiKey);
        const orderIdShort = (newOrderId as string).substring(0, 8);
        const itemsListHtml = validatedItems.map(item => {
          const pointDetails = pointDetailsMap.get(item.ponto_id);
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
})