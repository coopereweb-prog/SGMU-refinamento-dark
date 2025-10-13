import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PrintableOrder({ order }) {
  if (!order) return null;

  return (
    <div className="p-8 font-sans">
      <header className="flex justify-between items-center border-b pb-4 mb-8">
        <div className="flex items-center space-x-4">
          <img src="/lightsquare-logo.png" alt="Lightsquare Logo" className="h-20" />
          <div>
            <h1 className="text-3xl font-bold">SGMU</h1>
            <p className="text-gray-600">Sistema de Gestão de Mobiliário Urbano</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">Anexo de Contrato</h2>
          <p className="text-gray-500">Pedido #{order.id.substring(0, 8)}</p>
        </div>
      </header>

      <main>
        <section className="mb-8">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Informações do Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-base">
            <p><strong>Nome:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Telefone:</strong> {order.customer_phone}</p>
            <p><strong>Data do Pedido:</strong> {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Lista de Pontos Contratados</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Ponto de Instalação</th>
                <th className="p-3 border text-center">Período Contratado</th>
                <th className="p-3 border text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map(item => (
                <tr key={item.id}>
                  <td className="p-3 border">{item.points.name}</td>
                  <td className="p-3 border text-center">{item.period_years} ano(s)</td>
                  <td className="p-3 border text-right font-mono">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-3 border text-right">Total</td>
                <td className="p-3 border text-right font-mono">{Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Este documento é um anexo e parte integrante do contrato de prestação de serviços.</p>
        <p>Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </footer>
    </div>
  );
}