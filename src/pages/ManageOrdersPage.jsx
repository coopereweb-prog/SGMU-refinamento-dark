function generatePrintableHTML(order) {
  if (!order) return '';

  const orderItemsHTML = order.order_items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.points.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px;">${item.period_years} ano(s)</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-family: monospace; font-size: 12px;">${Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anexo de Contrato - Pedido ${order.id.substring(0, 8)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 10px; color: #333; font-size: 12px; }
        .container { max-width: 800px; margin: 0 auto; }
        header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
        .logo-section { display: flex; align-items: center; gap: 8px; }
        .logo { height: 40px; }
        .title-section { text-align: right; }
        h1 { font-size: 20px; font-weight: bold; margin: 0; }
        h2 { font-size: 16px; font-weight: 600; margin: 0; }
        h3 { font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        th { background-color: #f5f5f5; text-align: left; font-size: 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: bold; }
        .bg-gray-100 { background-color: #f5f5f5; }
        footer { margin-top: 32px; text-align: center; color: #666; font-size: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo-section">
            <img src="/logo.png" alt="Lightsquare Logo" class="logo" />
            <div>
              <h1>Lightsquare</h1>
              <p style="color: #666; font-size: 10px;">Sistema de Gestão de Mobiliário Urbano</p>
            </div>
          </div>
          <div class="title-section">
            <h2>Anexo de Contrato</h2>
            <p style="color: #666; font-size: 10px;">Pedido #${order.id.substring(0, 8)}</p>
          </div>
        </header>

        <main>
          <section style="margin-bottom: 16px;">
            <h3>Informações do Cliente</h3>
            <div class="info-grid">
              <p><strong>Nome:</strong> ${order.customer_name}</p>
              <p><strong>Data do Pedido:</strong> ${format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </section>

          <section>
            <h3>Lista de Pontos Contratados</h3>
            <table>
              <thead>
                <tr class="bg-gray-100">
                  <th>Ponto de Instalação</th>
                  <th class="text-center">Período Contratado</th>
                  <th class="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
              </tbody>
              <tfoot>
                <tr class="bg-gray-100 font-bold">
                  <td colspan="2" class="text-right">Total</td>
                  <td class="text-right font-mono">${Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              </tfoot>
            </table>
          </section>
        </main>

        <footer>
          <p>Este documento é um anexo e parte integrante do contrato de prestação de serviços.</p>
          <p>Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}