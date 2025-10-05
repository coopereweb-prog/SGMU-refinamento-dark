export function InfoPanel({ points }) {
  const stats = useMemo(() => {
    const total = points.length;
    const available = points.filter(p => p.status === 'available').length;
    const reserved = points.filter(p => p.status === 'reserved').length;
    const sold = points.filter(p => p.status === 'sold').length;
    return { total, available, reserved, sold };
  }, [points]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <p className="text-sm text-gray-500 pt-1">Disponibilidade dos pontos</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total de pontos:</span>
          <span className="font-bold text-lg">{stats.total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-green-600">Disponíveis:</span>
          <span className="font-bold text-lg text-green-600">{stats.available}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-yellow-600">Reservados:</span>
          <span className="font-bold text-lg text-yellow-600">{stats.reserved}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-red-600">Contratados:</span>
          <span className="font-bold text-lg text-red-600">{stats.sold}</span>
        </div>
      </CardContent>
    </Card>
  );
}