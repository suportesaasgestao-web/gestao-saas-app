import React from 'react';
import { User, Company, Product, StockMovement, Ticket, UserRole } from '../types';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  LifeBuoy, 
  Building2, 
  Users, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  currentUser: User;
  currentCompany: Company | null;
  companies: Company[];
  products: Product[];
  movements: StockMovement[];
  tickets: Ticket[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewMovement: (type: 'entrada' | 'saida') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  currentCompany,
  companies,
  products,
  movements,
  tickets,
  onNavigate,
  onOpenNewMovement
}) => {
  const isGlobalAdmin = currentUser.perfil === 'admin';

  // Cálculos para Admin
  const totalEmpresas = companies.length;
  const empresasPendentes = companies.filter(c => c.status === 'pendente').length;
  const empresasAprovadas = companies.filter(c => c.status === 'aprovada').length;
  const ticketsGlobaisAbertos = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;

  // Cálculos para Empresa Tenant
  const totalProdutos = products.length;
  const valorTotalEstoque = products.reduce((acc, p) => acc + (p.estoque_atual * p.preco_venda), 0);
  const produtosCriticos = products.filter(p => p.estoque_atual <= p.estoque_minimo);
  const totalEntradas = movements.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.quantidade, 0);
  const totalSaidas = movements.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.quantidade, 0);
  const ticketsEmpresaAbertos = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;

  const recentMovements = movements.slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Banner da Empresa (Se configurado e não for admin) */}
      {!isGlobalAdmin && currentCompany?.banner_url && (
        <div className="relative rounded-xl overflow-hidden h-36 md:h-44 border border-slate-200 shadow-xs">
          <img 
            src={currentCompany.banner_url} 
            alt="Banner da Empresa" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-transparent flex items-center px-6 md:px-8">
            <div className="text-white space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                Painel da Empresa
              </span>
              <h2 className="text-2xl font-bold">{currentCompany.nome_fantasia}</h2>
              <p className="text-xs text-slate-300">
                Razão Social: {currentCompany.razao_social} • CNPJ: {currentCompany.cnpj}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Pending Banner */}
      {isGlobalAdmin && empresasPendentes > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Existem {empresasPendentes} nova(s) empresa(s) aguardando aprovação
              </h3>
              <p className="text-xs text-amber-700">
                Novas empresas cadastradas pelo formulário SaaS exigem revisão de CNPJ pelo administrador antes de liberarem o acesso.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-empresas')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Analisar Empresas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cards de Métricas */}
      {isGlobalAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total de Empresas</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalEmpresas}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>{empresasAprovadas} ativas no ecossistema</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Aprovações Pendentes</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{empresasPendentes}</div>
            <p className="text-xs text-slate-500">Aguardando auditoria</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Usuários Ativos</span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">18</div>
            <p className="text-xs text-slate-500">Distribuídos entre as empresas</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Tickets Abertos</span>
              <LifeBuoy className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{ticketsGlobaisAbertos}</div>
            <p className="text-xs text-slate-500">Chamados em atendimento</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Produtos Cadastrados</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalProdutos}</div>
            <p className="text-xs text-slate-500">Itens no catálogo ativo</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Valor em Estoque</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(valorTotalEstoque)}</div>
            <p className="text-xs text-slate-500">Preço de venda estimado</p>
          </div>

          <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
            produtosCriticos.length > 0 
              ? 'bg-red-50/70 border-red-200' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Estoque Crítico</span>
              <AlertTriangle className={`w-5 h-5 ${produtosCriticos.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-extrabold ${produtosCriticos.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {produtosCriticos.length}
            </div>
            <p className="text-xs text-red-600 font-medium">
              {produtosCriticos.length > 0 ? 'Abaixo da quantidade mínima!' : 'Nenhum produto crítico'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Tickets de Suporte</span>
              <LifeBuoy className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{ticketsEmpresaAbertos}</div>
            <p className="text-xs text-slate-500">Chamados aguardando resposta</p>
          </div>
        </div>
      )}

      {/* Ações Rápidas de Gestão */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-blue-600" /> Ações Rápidas de Gestão Empresarial
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onOpenNewMovement('entrada')}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Registrar Entrada (Compra/NF)</span>
          </button>

          <button
            onClick={() => onOpenNewMovement('saida')}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>Registrar Saída (Venda/Baixa)</span>
          </button>

          <button
            onClick={() => onNavigate('produtos')}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4 text-blue-600" />
            <span>Gerenciar Catálogo de Produtos</span>
          </button>

          <button
            onClick={() => onNavigate('tickets')}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-purple-600" />
            <span>Abrir Chamado / Ticket</span>
          </button>
        </div>
      </div>

      {/* Grid: Alertas de Reposição + Últimas Movimentações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Estoque Crítico */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Alertas de Reposição de Estoque</h3>
            </div>
            <button
              onClick={() => onNavigate('produtos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1">
            {produtosCriticos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum produto está com estoque abaixo do mínimo estabelecido.
              </div>
            ) : (
              <div className="space-y-2.5">
                {produtosCriticos.map(prod => (
                  <div 
                    key={prod.id} 
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between bg-slate-50/50"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{prod.nome}</div>
                      <div className="text-[11px] text-slate-500">
                        SKU: {prod.sku} • Mínimo Requerido: {prod.estoque_minimo} {prod.unidade_medida}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        prod.estoque_atual === 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prod.estoque_atual === 0 ? 'Esgotado (0)' : `${prod.estoque_atual} ${prod.unidade_medida}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Últimas Movimentações (Kardex)</h3>
            </div>
            <button
              onClick={() => onNavigate('estoque')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Histórico completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1">
            {recentMovements.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhuma movimentação de estoque registrada até o momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentMovements.map(mov => (
                  <div 
                    key={mov.id}
                    className="p-3 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-md ${
                        mov.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' :
                        mov.tipo === 'saida' ? 'bg-rose-100 text-rose-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {mov.tipo === 'entrada' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         mov.tipo === 'saida' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                         <TrendingUp className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{mov.produto_nome}</div>
                        <div className="text-[11px] text-slate-500">
                          {mov.motivo} • {mov.created_at.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${
                        mov.tipo === 'entrada' ? 'text-emerald-600' :
                        mov.tipo === 'saida' ? 'text-rose-600' :
                        'text-blue-600'
                      }`}>
                        {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : ''}
                        {mov.quantidade} un
                      </span>
                      <div className="text-[10px] text-slate-400">Saldo: {mov.saldo_posterior}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
