import React, { useState } from 'react';
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
  Boxes,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { StockMovementChart } from './StockMovementChart';

interface DashboardViewProps {
  currentUser: User;
  currentCompany: Company | null;
  companies: Company[];
  users: User[];
  products: Product[];
  movements: StockMovement[];
  tickets: Ticket[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewMovement: (type: 'entrada' | 'saida') => void;
  onReplenishProduct?: (productId: number) => void;
  onRecordMovement?: (movement: {
    produto_id: number;
    tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
    quantidade: number;
    motivo: string;
    documento_ref?: string;
    valor_unitario?: number;
  }) => { success: boolean; message: string };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  currentCompany,
  companies,
  users,
  products,
  movements,
  tickets,
  onNavigate,
  onOpenNewMovement,
  onReplenishProduct,
  onRecordMovement
}) => {
  const isGlobalAdmin = currentUser.perfil === 'admin';

  // Estado para Modal de Reposição Rápida
  const [quickReplenishProduct, setQuickReplenishProduct] = useState<Product | null>(null);
  const [quickQty, setQuickQty] = useState<number>(1);
  const [quickReason, setQuickReason] = useState<string>('Reposição rápida de estoque crítico');
  const [quickDocRef, setQuickDocRef] = useState<string>('');
  const [quickSubmitting, setQuickSubmitting] = useState<boolean>(false);
  const [criticalFilter, setCriticalFilter] = useState<'todos' | 'esgotados' | 'baixo'>('todos');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Cálculos para Admin
  const totalEmpresas = companies.length;
  const empresasPendentes = companies.filter(c => c.status === 'pendente').length;
  const empresasAprovadas = companies.filter(c => c.status === 'aprovada').length;
  const usuariosAtivos = users.filter(u => u.ativo && typeof u.empresa_id === 'number' && u.empresa_id > 0).length;
  const ticketsGlobaisAbertos = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;

  // Cálculos para Empresa Tenant
  const totalProdutos = products.length;
  const valorTotalEstoque = products.reduce((acc, p) => acc + (p.estoque_atual * p.preco_venda), 0);
  const produtosCriticos = products.filter(p => p.estoque_atual <= p.estoque_minimo);
  const totalEntradas = movements.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.quantidade, 0);
  const totalSaidas = movements.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.quantidade, 0);
  const ticketsEmpresaAbertos = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;

  const recentMovements = movements.slice(0, 5);

  // Cálculos da Seção de Alertas Críticos
  const zeradosCount = produtosCriticos.filter(p => p.estoque_atual <= 0).length;
  const baixoCount = produtosCriticos.filter(p => p.estoque_atual > 0).length;

  const displayedCriticalProducts = produtosCriticos.filter(p => {
    if (criticalFilter === 'esgotados') return p.estoque_atual <= 0;
    if (criticalFilter === 'baixo') return p.estoque_atual > 0;
    return true;
  });

  const handleOpenQuickModal = (prod: Product) => {
    setQuickReplenishProduct(prod);
    const deficit = Math.max(1, prod.estoque_minimo - prod.estoque_atual);
    setQuickQty(deficit > 0 ? deficit : 5);
    setQuickReason('Reposição rápida de estoque crítico');
    setQuickDocRef(`REP-${prod.sku}`);
  };

  const handleOneClickReplenish = (prod: Product) => {
    const deficit = Math.max(1, prod.estoque_minimo - prod.estoque_atual);
    if (onRecordMovement) {
      const res = onRecordMovement({
        produto_id: prod.id,
        tipo: 'entrada',
        quantidade: deficit,
        motivo: 'Reposição direta de emergência (Alertas Críticos)',
        documento_ref: `AUTO-REP-${prod.sku}`,
        valor_unitario: prod.preco_custo || undefined
      });
      if (res.success) {
        setActionSuccessMessage(`Estoque de "${prod.nome}" reposto com sucesso (+${deficit} ${prod.unidade_medida})!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    } else if (onReplenishProduct) {
      onReplenishProduct(prod.id);
    }
  };

  const handleConfirmQuickReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplenishProduct || quickQty <= 0) return;
    setQuickSubmitting(true);
    try {
      if (onRecordMovement) {
        const res = onRecordMovement({
          produto_id: quickReplenishProduct.id,
          tipo: 'entrada',
          quantidade: Number(quickQty),
          motivo: quickReason.trim() || 'Reposição rápida de estoque crítico',
          documento_ref: quickDocRef.trim() || undefined,
          valor_unitario: quickReplenishProduct.preco_custo || undefined
        });
        if (res.success) {
          setActionSuccessMessage(`Reposição de +${quickQty} un para "${quickReplenishProduct.nome}" concluída!`);
          setTimeout(() => setActionSuccessMessage(null), 4000);
        }
      } else if (onReplenishProduct) {
        onReplenishProduct(quickReplenishProduct.id);
      }
      setQuickReplenishProduct(null);
    } finally {
      setQuickSubmitting(false);
    }
  };

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
            <div className="text-2xl font-extrabold text-slate-900">{usuariosAtivos}</div>
            <p className="text-xs text-slate-500">
              {usuariosAtivos === 0 ? 'Nenhum usuário nas empresas' : `${usuariosAtivos} distribuídos entre as empresas`}
            </p>
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

      {/* SEÇÃO: ALERTAS CRÍTICOS */}
      <div id="secao-alertas-criticos" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
              produtosCriticos.length > 0 ? 'bg-red-100 text-red-600 ring-4 ring-red-50' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Alertas Críticos</h3>
                {produtosCriticos.length > 0 ? (
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-red-100 text-red-700 animate-pulse border border-red-200">
                    {produtosCriticos.length} {produtosCriticos.length === 1 ? 'item crítico' : 'itens críticos'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Estoque Seguro
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Produtos cujo saldo atual está igual ou abaixo do estoque mínimo estabelecido. Reponha com rapidez abaixo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {produtosCriticos.length > 0 && (
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium text-slate-700">
                <button
                  type="button"
                  onClick={() => setCriticalFilter('todos')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    criticalFilter === 'todos' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Todos ({produtosCriticos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCriticalFilter('esgotados')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    criticalFilter === 'esgotados' ? 'bg-white shadow-xs text-red-700 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Esgotados ({zeradosCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCriticalFilter('baixo')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    criticalFilter === 'baixo' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Baixos ({baixoCount})
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('produtos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mensagem de Sucesso de Ação Rápida */}
        {actionSuccessMessage && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setActionSuccessMessage(null)} 
              className="text-emerald-700 hover:text-emerald-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {displayedCriticalProducts.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {produtosCriticos.length === 0 
                  ? 'Estoque 100% Regularizado!' 
                  : 'Nenhum item encontrado para este filtro.'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {produtosCriticos.length === 0
                  ? 'Todos os produtos cadastrados estão com saldo superior à margem mínima de segurança.'
                  : 'Alterne os filtros acima para visualizar outros produtos sob monitoramento.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedCriticalProducts.map(prod => {
                const deficit = Math.max(1, prod.estoque_minimo - prod.estoque_atual);
                const isZero = prod.estoque_atual <= 0;
                const ratio = prod.estoque_minimo > 0 
                  ? Math.min(100, Math.round((prod.estoque_atual / prod.estoque_minimo) * 100)) 
                  : 0;

                return (
                  <div
                    key={prod.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between shadow-xs ${
                      isZero 
                        ? 'border-red-200 bg-red-50/40 hover:border-red-300' 
                        : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      {/* Top Info */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate" title={prod.nome}>
                            {prod.nome}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              {prod.sku}
                            </span>
                            <span>•</span>
                            <span className="truncate">{prod.categoria}</span>
                            {prod.localizacao && (
                              <>
                                <span>•</span>
                                <span className="truncate text-slate-400">{prod.localizacao}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className={`shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isZero 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {isZero ? 'Esgotado (0)' : 'Estoque Baixo'}
                        </span>
                      </div>

                      {/* Medidor de Estoque */}
                      <div className="space-y-1.5 my-3 p-2.5 bg-white rounded-lg border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className={isZero ? 'text-red-600 font-bold' : 'text-amber-700'}>
                            Atual: {prod.estoque_atual} {prod.unidade_medida}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            Mínimo: {prod.estoque_minimo} {prod.unidade_medida}
                          </span>
                        </div>

                        {/* Barra de Progresso do Estoque */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isZero ? 'bg-red-500 w-0' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.max(5, ratio)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span className="text-red-600 font-medium">
                            Déficit: -{deficit} {prod.unidade_medida}
                          </span>
                          <span>Preço Custo: {formatCurrency(prod.preco_custo)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações Rápidas de Reposição */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* 1-Clique: Repor Mínimo */}
                        <button
                          type="button"
                          onClick={() => handleOneClickReplenish(prod)}
                          title={`Repor imediatamente ${deficit} ${prod.unidade_medida} para alcançar o estoque mínimo`}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Repor Mín (+{deficit})</span>
                        </button>

                        {/* Modal: Reposição Rápida */}
                        <button
                          type="button"
                          onClick={() => handleOpenQuickModal(prod)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Boxes className="w-3.5 h-3.5 text-blue-600" />
                          <span>Repor Rápido</span>
                        </button>
                      </div>

                      {/* Abrir tela completa de movimentação */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onReplenishProduct) {
                            onReplenishProduct(prod.id);
                          } else {
                            onNavigate('estoque');
                          }
                        }}
                        className="text-[11px] text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1 py-0.5 transition-colors"
                      >
                        <ArrowUpRight className="w-3 h-3 text-blue-600" />
                        <span>Entrada Detalhada (NF / Fornecedor)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Histórico de Movimentações + Kardex */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Histórico de Movimentações */}
        <StockMovementChart 
          movements={movements} 
          companyId={currentCompany?.id} 
          isGlobalAdmin={isGlobalAdmin} 
        />

        {/* Últimas Movimentações (Kardex) */}
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
                    className="p-3 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
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

      {/* MODAL DE REPOSIÇÃO RÁPIDA DE ESTOQUE CRÍTICO */}
      {quickReplenishProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Ação Rápida de Reposição</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickReplenishProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickReplenish} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">{quickReplenishProduct.nome}</div>
                <div className="text-[11px] text-slate-500">
                  SKU: <span className="font-mono">{quickReplenishProduct.sku}</span> • Categoria: {quickReplenishProduct.categoria}
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 text-slate-700 border-t border-slate-200 mt-2">
                  <span>
                    Saldo Atual: <strong className={quickReplenishProduct.estoque_atual <= 0 ? 'text-red-600 font-extrabold' : 'text-amber-700 font-bold'}>
                      {quickReplenishProduct.estoque_atual} {quickReplenishProduct.unidade_medida}
                    </strong>
                  </span>
                  <span>
                    Estoque Mínimo: <strong>{quickReplenishProduct.estoque_minimo} {quickReplenishProduct.unidade_medida}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade a Adicionar ({quickReplenishProduct.unidade_medida}) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickQty}
                    onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const def = Math.max(1, quickReplenishProduct.estoque_minimo - quickReplenishProduct.estoque_atual);
                      setQuickQty(def);
                    }}
                    className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium border border-slate-200"
                    title="Ajustar quantidade exata para atingir o estoque mínimo"
                  >
                    Mínimo (+{Math.max(1, quickReplenishProduct.estoque_minimo - quickReplenishProduct.estoque_atual)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickQty(prev => prev + 10)}
                    className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium border border-slate-200"
                  >
                    +10
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saldo após entrada: <strong className="text-emerald-600 font-bold">{quickReplenishProduct.estoque_atual + Number(quickQty)} {quickReplenishProduct.unidade_medida}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={quickReason}
                  onChange={(e) => setQuickReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Ex: Reposição rápida de estoque crítico"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documento / NF (Opcional)
                </label>
                <input
                  type="text"
                  value={quickDocRef}
                  onChange={(e) => setQuickDocRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Ex: NF-12345, Pedido #88"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const prodId = quickReplenishProduct.id;
                    setQuickReplenishProduct(null);
                    if (onReplenishProduct) onReplenishProduct(prodId);
                  }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Formulário Completo</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickReplenishProduct(null)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={quickSubmitting || quickQty <= 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{quickSubmitting ? 'Salvando...' : 'Confirmar Reposição'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
