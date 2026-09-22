import React, { useMemo } from 'react';
import { StockMovement } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StockMovementChartProps {
  movements: StockMovement[];
  companyId?: number | null;
  isGlobalAdmin?: boolean;
}

interface DayData {
  dateKey: string;     // YYYY-MM-DD
  displayDate: string; // DD/MM (Dia)
  entradas: number;
  saidas: number;
  total: number;
}

export const StockMovementChart: React.FC<StockMovementChartProps> = ({
  movements,
  companyId,
  isGlobalAdmin = false,
}) => {
  // Filtra as movimentações da empresa se não for admin global
  const filteredMovements = useMemo(() => {
    if (isGlobalAdmin || !companyId) {
      return movements;
    }
    return movements.filter(m => m.empresa_id === companyId);
  }, [movements, companyId, isGlobalAdmin]);

  // Gera os últimos 7 dias dinamicamente
  const chartData = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const dayOfWeek = dayNames[d.getDay()];
      const displayDate = `${day}/${month} (${dayOfWeek})`;

      days.push({
        dateKey,
        displayDate,
        entradas: 0,
        saidas: 0,
        total: 0
      });
    }

    // Agrupa as movimentações por dia
    filteredMovements.forEach(m => {
      if (!m.created_at) return;
      // Normaliza created_at para extrair YYYY-MM-DD
      const datePart = m.created_at.substring(0, 10);
      const targetDay = days.find(d => d.dateKey === datePart);
      if (targetDay) {
        if (m.tipo === 'entrada' || m.tipo === 'devolucao') {
          targetDay.entradas += Number(m.quantidade) || 0;
        } else if (m.tipo === 'saida') {
          targetDay.saidas += Number(m.quantidade) || 0;
        }
        targetDay.total += Number(m.quantidade) || 0;
      }
    });

    return days;
  }, [filteredMovements]);

  // Totais do período de 7 dias
  const totalEntradas7d = chartData.reduce((acc, d) => acc + d.entradas, 0);
  const totalSaidas7d = chartData.reduce((acc, d) => acc + d.saidas, 0);
  const saldoLiquido = totalEntradas7d - totalSaidas7d;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header do Gráfico */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Histórico de Movimentações de Estoque
              </h3>
              <p className="text-xs text-slate-500">
                Volume diário de entradas e saídas nos últimos 7 dias
              </p>
            </div>
          </div>
        </div>

        {/* Resumo Rápido em Chips */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Entradas: +{totalEntradas7d}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg font-semibold">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Saídas: -{totalSaidas7d}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Saldo: {saldoLiquido >= 0 ? `+${saldoLiquido}` : saldoLiquido} un</span>
          </div>
        </div>
      </div>

      {/* Área do Gráfico Recharts */}
      <div className="p-5">
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  padding: '8px 12px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                formatter={(value: any, name: any) => {
                  const label = name === 'entradas' ? 'Entradas (unidades)' : 'Saídas (unidades)';
                  return [value, label];
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(value) => {
                  return value === 'entradas' ? 'Entradas no Estoque' : 'Saídas do Estoque';
                }}
              />
              <Bar 
                dataKey="entradas" 
                name="entradas"
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={36}
              />
              <Bar 
                dataKey="saidas" 
                name="saidas"
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {totalEntradas7d === 0 && totalSaidas7d === 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            Nenhuma movimentação registrada nos últimos 7 dias. Ao registrar entradas ou saídas em estoque, as barras serão geradas automaticamente.
          </p>
        )}
      </div>
    </div>
  );
};
