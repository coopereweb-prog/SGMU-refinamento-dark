import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PrintablePointsReport({ points, profile }) {
  if (!points || points.length === 0 || !profile) return null;

  const totalAmount = points.reduce((sum, point) => sum + Number(point.price), 0);

  return (
    <div className="font-sans text-gray-800 text-sm">
      <header className="flex justify-between items-start border-b pb-3 mb-6">
        <div className="flex items-center space-x-3">
          <img src="/lightsquare-logo.png" alt="Lightsquare Logo" className="h-16" />
          <div>
            <h1 className="text-xl font-bold">SGMU</h1>
            <p className="text-xs">Sistema de Gestão de<br />Mobiliário Urbano</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Relatório de Pontos</h2>
          <p className="text-xs">
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </header>

      <main>
        <section className="mb-6">
          <h3 className="text-base font-semibold border-b pb-1 mb-3">Informações do Cliente</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>Nome:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold border-b pb-1 mb-3">Lista de Pontos Contratados ({points.length})</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Ponto de Instalação</th>
                <th className="p-2 border text-center">Período de Vigência</th>
                <th className="p-2 border text-right">Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              {points.map(point => (
                <tr key={point.uniqueId}>
                  <td className="p-2 border">{point.name}</td>
                  <td className="p-2 border text-center">
                    {format(point.startDate, 'dd/MM/yy', { locale: ptBR })} - {format(point.endDate, 'dd/MM/yy', { locale: ptBR })}
                  </td>
                  <td className="p-2 border text-right font-mono">
                    {Number(point.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-2 border text-right">Total Selecionado</td>
                <td className="p-2 border text-right font-mono">
                  {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>

      <footer className="mt-10 text-center text-xs">
        <p>Este relatório é um resumo dos pontos selecionados e seus respectivos períodos de contratação.</p>
      </footer>
    </div>
  );
}