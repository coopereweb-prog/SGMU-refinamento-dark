import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PrintableOrder({ order }) {
  if (!order) return null;

  return (
    <div className="font-sans text-gray-800 text-sm">
      <header className="flex justify-between items-center border-b pb-3 mb-6">
        <div className="flex items-center space-x-3">
          <img src="/lightsquare-logo.png" alt="Lightsquare Logo" className="h-16" />
          <div>
            <h1 className="text-xl font-bold">SGMU</h1>
            <p className="text-xs">Sistema de Gestão de Mobiliário Urbano</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Anexo de Contrato</h2>
          <p className="text-xs">Pedido #{order.id.substring(0, 8)}</p>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h3 className="text-base font-semibold border-b pb-1 mb-3">Informações do Cliente</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>Nome:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Telefone:</strong> {order.customer_phone}</p>
            <p><strong>Data do Pedido:</strong> {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold border-b pb-1 mb-3">Lista de Pontos Contratados</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Ponto de Instalação</th>
                <th className="p-2 border text-center">Período Contratado</th>
                <th className="p-2 border text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map(item => (
                <tr key={item.id}>
                  <td className="p-2 border">{item.points.name}</td>
                  <td className="p-2 border text-center">{item.period_years} ano(s)</td>
                  <td className="p-2 border text-right font-mono">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-2 border text-right">Total</td>
                <td className="p-2 border text-right font-mono">{Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>

      <footer className="mt-10 text-center text-xs">
        <p>Este documento é um anexo e parte integrante do contrato de prestação de serviços.</p>
        <p>Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </footer>
    </div>
  );
}