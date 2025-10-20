import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PrintablePointsReport({ points, profile }) {
  if (!points || points.length === 0 || !profile) return null;

  const totalAmount = points.reduce((sum, point) => sum + Number(point.price), 0);

  return (
    <div className="p-8 font-sans">
      <header className="flex justify-between items-start border-b pb-4 mb-8">
        <div className="flex items-center space-x-4">
          <img src="/lightsquare-logo.png" alt="Lightsquare Logo" className="h-20" />
          <div>
            <h1 className="text-2xl font-bold">SGMU</h1>
            <p className="text-gray-600 text-sm">Sistema de Gestão de<br />Mobiliário Urbano</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Relatório de Pontos</h2>
          <p className="text-gray-500 text-sm">
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </header>

      <main>
        <section className="mb-8">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Informações do Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-base">
            <p><strong>Nome:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Lista de Pontos Contratados</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Ponto de Instalação</th>
                <th className="p-3 border text-center">Período de Vigência</th>
                <th className="p-3 border text-right">Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              {points.map(point => (
                <tr key={point.uniqueId}>
                  <td className="p-3 border">{point.name}</td>
                  <td className="p-3 border text-center">
                    {format(point.startDate, 'dd/MM/yy', { locale: ptBR })} - {format(point.endDate, 'dd/MM/yy', { locale: ptBR })}
                  </td>
                  <td className="p-3 border text-right font-mono">
                    {Number(point.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-3 border text-right">Total Selecionado</td>
                <td className="p-3 border text-right font-mono">
                  {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Este relatório é um resumo dos pontos selecionados e seus respectivos períodos de contratação.</p>
      </footer>
    </div>
  );
}