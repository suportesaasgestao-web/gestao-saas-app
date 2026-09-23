import React, { useState } from 'react';
import { Company, CompanyStatus, Ticket, TicketStatus, TicketPriority, User, Product } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertOctagon, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LifeBuoy, 
  Users2, 
  MessageSquare, 
  Send, 
  UserCheck, 
  Tag,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Trash2,
  Package,
  Boxes,
  DollarSign,
  Plus,
  Filter,
  UserPlus,
  RefreshCw,
  Eye,
  Key
} from 'lucide-react';

interface AdminCompaniesViewProps {
  companies: Company[];
  onUpdateStatus: (companyId: number, newStatus: CompanyStatus) => void;
  products?: Product[];
  tickets?: Ticket[];
  onReplyTicket?: (ticketId: number, message: string) => void;
  onUpdateTicketStatus?: (ticketId: number, status: TicketStatus) => void;
  currentUser: User;
  users?: User[];
  onSwitchAdmin?: (user: User) => void;
  onDeleteAdmin?: (adminId: number) => void;
  onSaveUser?: (userData: Partial<User>) => Promise<void>;
  onNavigateToTickets?: () => void;
  onClearAllTestData?: () => void;
}

export const AdminCompaniesView: React.FC<AdminCompaniesViewProps> = ({
  companies,
  onUpdateStatus,
  products = [],
  tickets = [],
  onReplyTicket,
  onUpdateTicketStatus,
  currentUser,
  users = [],
  onSwitchAdmin,
  onDeleteAdmin,
  onSaveUser,
  onNavigateToTickets,
  onClearAllTestData
}) => {
  // Aba ativa do Painel de Admin
  const [adminTab, setAdminTab] = useState<'empresas' | 'produtos-empresas' | 'tickets' | 'admins'>('empresas');
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  // Filtros de Empresas
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchCompany, setSearchCompany] = useState<string>('');

  // Filtros de Produtos por Empresa
  const [selectedCompanyIdForProducts, setSelectedCompanyIdForProducts] = useState<string>('todas');
  const [searchProductQuery, setSearchProductQuery] = useState<string>('');

  // Filtros de Tickets
  const [filterTicketStatus, setFilterTicketStatus] = useState<string>('todos');
  const [searchTicket, setSearchTicket] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [quickReplyText, setQuickReplyText] = useState<string>('');

  // Gerenciamento de Administradores
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminCargo, setNewAdminCargo] = useState('Super Administrador');
  const [newAdminDept, setNewAdminDept] = useState('Operações SaaS');
  const [adminFormError, setAdminFormError] = useState<string | null>(null);

  // Listagem de Admins
  const adminUsers = users.filter(u => u.perfil === 'admin');

  // Contadores
  const pendingCompanies = companies.filter(c => c.status === 'pendente').length;
  const approvedCompanies = companies.filter(c => c.status === 'aprovada').length;
  const openTickets = tickets.filter(t => t.status === 'aberto').length;
  const inProgressTickets = tickets.filter(t => t.status === 'em_atendimento').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolvido').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Filtragem de empresas
  const filteredCompanies = companies.filter(company => {
    const matchesFilter = filterStatus === 'todos' || company.status === filterStatus;
    const matchesSearch = 
      company.razao_social.toLowerCase().includes(searchCompany.toLowerCase()) ||
      company.nome_fantasia.toLowerCase().includes(searchCompany.toLowerCase()) ||
      company.cnpj.includes(searchCompany) ||
      company.email.toLowerCase().includes(searchCompany.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtragem de tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filterTicketStatus === 'todos' || ticket.status === filterTicketStatus;
    const matchesSearch = 
      ticket.titulo.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.categoria.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.mensagens?.some(m => m.mensagem.toLowerCase().includes(searchTicket.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Empresas a exibir na aba de Produtos por Empresa
  const companiesForProducts = companies.filter(comp => {
    if (selectedCompanyIdForProducts !== 'todas') {
      return String(comp.id) === selectedCompanyIdForProducts;
    }
    return true;
  });

  const getCompanyStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'aprovada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovada
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Aguardando Aprovação
          </span>
        );
      case 'rejeitada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejeitada
          </span>
        );
      case 'suspensa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <AlertOctagon className="w-3.5 h-3.5" /> Suspensa
          </span>
        );
    }
  };

  const getTicketStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'aberto':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-bold">Aberto</span>;
      case 'em_atendimento':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-bold">Em Atendimento</span>;
      case 'resolvido':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold">Resolvido</span>;
      case 'fechado':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[11px] font-bold">Fechado</span>;
    }
  };

  const handleSendQuickReply = (ticketId: number) => {
    if (!quickReplyText.trim() || !onReplyTicket) return;
    onReplyTicket(ticketId, quickReplyText.trim());
    setQuickReplyText('');
  };

  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      setAdminFormError('Preencha nome, e-mail e senha do novo administrador.');
      return;
    }

    if (onSaveUser) {
      await onSaveUser({
        nome: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        senha: newAdminPassword.trim(),
        perfil: 'admin',
        cargo: newAdminCargo.trim() || 'Super Administrador',
        departamento: newAdminDept.trim() || 'Operações SaaS',
        ativo: true
      });
    }

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setShowNewAdminModal(false);
    setAdminFormError(null);
  };

  const handleConfirmDeleteAdmin = () => {
    if (!adminToDelete || !onDeleteAdmin) return;
    onDeleteAdmin(adminToDelete.id);
    setAdminToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel Admin */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
              Controle Geral SaaS
            </span>
            <span className="text-xs text-slate-300">
              Conectado como <strong className="text-white">{currentUser.nome}</strong> ({currentUser.email})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Painel de Administração Global
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Supervisão e auditoria de empresas cadastradas, produtos registrados por cada cliente, atendimento de chamados e gestão dos administradores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Empresas</span>
            <strong className="text-base sm:text-lg font-black text-white">{companies.length}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Produtos Totais</span>
            <strong className="text-base sm:text-lg font-black text-emerald-400">{products.length}</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Admins</span>
            <strong className="text-base sm:text-lg font-black text-purple-300">{adminUsers.length}</strong>
          </div>
        </div>
      </div>

      {/* Navegação por Abas do Painel de Admin */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setAdminTab('empresas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'empresas'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Aprovação de Empresas</span>
          {pendingCompanies > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              adminTab === 'empresas' ? 'bg-white text-purple-700' : 'bg-amber-500 text-white'
            }`}>
              {pendingCompanies}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('produtos-empresas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'produtos-empresas'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produtos por Empresa</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            adminTab === 'produtos-empresas' ? 'bg-white text-purple-700' : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'tickets'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Chamados de Suporte (Tickets)</span>
          {openTickets > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              adminTab === 'tickets' ? 'bg-white text-purple-700' : 'bg-red-500 text-white'
            }`}>
              {openTickets}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('admins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'admins'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Administradores</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            adminTab === 'admins' ? 'bg-white text-purple-700' : 'bg-slate-100 text-slate-700 border border-slate-300'
          }`}>
            {adminUsers.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: APROVAÇÃO DE EMPRESAS                                             */}
      {/* ========================================================================= */}
      {adminTab === 'empresas' && (
        <div className="space-y-4">
          {/* Contadores e Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Razão, CNPJ ou E-mail..."
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterStatus('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'todos' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todas ({companies.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pendente')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'pendente' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Pendentes ({pendingCompanies})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('aprovada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'aprovada' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Aprovadas ({approvedCompanies})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('suspensa')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'suspensa' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Suspensas
              </button>
            </div>
          </div>

          {/* Lista de Empresas */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCompanies.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Nenhuma empresa encontrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Não existem cadastros para o filtro selecionado. Quando novas empresas se cadastrarem, os administradores poderão avaliá-las aqui.
                </p>
              </div>
            ) : (
              filteredCompanies.map(company => {
                const companyProducts = products.filter(p => p.empresa_id === company.id);
                const companyStockValue = companyProducts.reduce((acc, p) => acc + (p.estoque_atual * p.preco_venda), 0);

                return (
                  <div 
                    key={company.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      company.status === 'pendente' 
                        ? 'border-amber-300 bg-amber-50/20' 
                        : company.status === 'suspensa'
                        ? 'border-slate-300 opacity-80'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.nome_fantasia}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shrink-0 border border-purple-200 shadow-xs">
                          {company.nome_fantasia.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {company.nome_fantasia}
                          </h4>
                          <span className="text-xs text-slate-500 font-normal">
                            ({company.razao_social})
                          </span>
                          {getCompanyStatusBadge(company.status)}
                          
                          {/* Badge de produtos cadastrados */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCompanyIdForProducts(String(company.id));
                              setAdminTab('produtos-empresas');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                            title="Ver produtos cadastrados por esta empresa"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{companyProducts.length} {companyProducts.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}</span>
                            <Eye className="w-3 h-3 ml-0.5 text-blue-500" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                            CNPJ: {company.cnpj}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {company.email}
                          </span>
                          {company.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {company.telefone}
                            </span>
                          )}
                          {company.cidade && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {company.cidade}/{company.estado}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Cadastro: {company.created_at.split(' ')[0]}
                          </span>
                          {companyProducts.length > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Estoque: {formatCurrency(companyStockValue)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações de Aprovação e Acesso */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompanyIdForProducts(String(company.id));
                          setAdminTab('produtos-empresas');
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Ver Produtos ({companyProducts.length})</span>
                      </button>

                      {company.status === 'pendente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(company.id, 'aprovada')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprovar Empresa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(company.id, 'rejeitada')}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rejeitar</span>
                          </button>
                        </>
                      )}

                      {company.status === 'aprovada' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(company.id, 'suspensa')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Suspender Acesso</span>
                        </button>
                      )}

                      {(company.status === 'suspensa' || company.status === 'rejeitada') && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(company.id, 'aprovada')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reativar / Aprovar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: PRODUTOS CADASTRADOS POR CADA EMPRESA (EXCLUSIVO ADMIN)            */}
      {/* ========================================================================= */}
      {adminTab === 'produtos-empresas' && (
        <div className="space-y-6">
          {/* Card Informativo com Resumo de Estoques */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Produtos Cadastrados por Cada Empresa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualização do inventário registrado pelas empresas clientes. O painel de administração apenas audita e acompanha os catálogos criados por cada empresa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">Total Itens</span>
                <strong className="text-sm font-black text-blue-900">{products.length}</strong>
              </div>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">Valor Total Global</span>
                <strong className="text-sm font-black text-emerald-900">
                  {formatCurrency(products.reduce((acc, p) => acc + (p.estoque_atual * p.preco_venda), 0))}
                </strong>
              </div>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-600" />
                Filtrar Empresa:
              </label>
              <select
                value={selectedCompanyIdForProducts}
                onChange={(e) => setSelectedCompanyIdForProducts(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium text-slate-800"
              >
                <option value="todas">Todas as Empresas ({companies.length})</option>
                {companies.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nome_fantasia} ({products.filter(p => p.empresa_id === c.id).length} itens)
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar produto por nome, SKU ou categoria..."
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Listagem de Empresas e seus Produtos */}
          <div className="space-y-6">
            {companiesForProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Nenhuma empresa encontrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Não foram encontradas empresas para o filtro selecionado.
                </p>
              </div>
            ) : (
              companiesForProducts.map(company => {
                const companyProducts = products.filter(p => {
                  const matchesCompany = p.empresa_id === company.id;
                  const matchesQuery = 
                    p.nome.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                    p.categoria.toLowerCase().includes(searchProductQuery.toLowerCase());
                  return matchesCompany && matchesQuery;
                });

                const allCompanyProducts = products.filter(p => p.empresa_id === company.id);
                const companyStockValue = allCompanyProducts.reduce((acc, p) => acc + (p.estoque_atual * p.preco_venda), 0);
                const companyTotalUnits = allCompanyProducts.reduce((acc, p) => acc + p.estoque_atual, 0);

                return (
                  <div key={company.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Cabeçalho da Empresa */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.nome_fantasia}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm border border-purple-200 shadow-2xs">
                            {company.nome_fantasia.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{company.nome_fantasia}</h4>
                            <span className="text-xs text-slate-500">({company.razao_social})</span>
                            {getCompanyStatusBadge(company.status)}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-semibold">CNPJ: {company.cnpj}</span>
                            <span>•</span>
                            <span>{company.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>{allCompanyProducts.length} itens cadastrados</span>
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                          Valor Estoque: {formatCurrency(companyStockValue)}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium">
                          {companyTotalUnits} unidades em saldo
                        </span>
                      </div>
                    </div>

                    {/* Tabela de Produtos Cadastrados por Esta Empresa */}
                    {companyProducts.length === 0 ? (
                      <div className="p-8 text-center bg-white text-xs text-slate-500">
                        <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-700">
                          {searchProductQuery ? 'Nenhum produto corresponde à busca nesta empresa.' : 'Esta empresa ainda não cadastrou nenhum produto no catálogo.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/60 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-4 font-bold">SKU / Código</th>
                              <th className="py-2.5 px-4 font-bold">Produto</th>
                              <th className="py-2.5 px-4 font-bold">Categoria</th>
                              <th className="py-2.5 px-4 font-bold text-right">Preço de Custo</th>
                              <th className="py-2.5 px-4 font-bold text-right">Preço de Venda</th>
                              <th className="py-2.5 px-4 font-bold text-right">Margem</th>
                              <th className="py-2.5 px-4 font-bold text-center">Estoque Atual</th>
                              <th className="py-2.5 px-4 font-bold text-center">Estoque Mín.</th>
                              <th className="py-2.5 px-4 font-bold text-center">Status</th>
                              <th className="py-2.5 px-4 font-bold text-center">Data Cadastro</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {companyProducts.map(prod => {
                              const margem = prod.preco_custo > 0 
                                ? (((prod.preco_venda - prod.preco_custo) / prod.preco_custo) * 100).toFixed(0)
                                : '100';

                              return (
                                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                                    {prod.sku}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <div className="font-bold text-slate-900">{prod.nome}</div>
                                    {prod.codigo_barras && (
                                      <div className="text-[10px] text-slate-400 font-mono">EAN: {prod.codigo_barras}</div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[11px] font-medium">
                                      {prod.categoria}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right text-slate-600 font-mono">
                                    {formatCurrency(prod.preco_custo)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-bold text-emerald-700 font-mono">
                                    {formatCurrency(prod.preco_venda)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right">
                                    <span className="text-[11px] font-bold text-blue-600">
                                      +{margem}%
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                                    {prod.estoque_atual} {prod.unidade_medida}
                                  </td>
                                  <td className="py-2.5 px-4 text-center text-slate-500">
                                    {prod.estoque_minimo} {prod.unidade_medida}
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    {prod.estoque_atual <= 0 ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                                        Esgotado
                                      </span>
                                    ) : prod.estoque_atual <= prod.estoque_minimo ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
                                        Estoque Baixo
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Em Estoque
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4 text-center text-slate-500 text-[11px]">
                                    {prod.created_at ? prod.created_at.split(' ')[0] : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: CHAMADOS DE TICKETS (APENAS ADMIN)                                */}
      {/* ========================================================================= */}
      {adminTab === 'tickets' && (
        <div className="space-y-4">
          {/* Métricas de Chamados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">Abertos</span>
              <strong className="text-xl font-black text-blue-600">{openTickets}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">Em Atendimento</span>
              <strong className="text-xl font-black text-amber-600">{inProgressTickets}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">Resolvidos</span>
              <strong className="text-xl font-black text-emerald-600">{resolvedTickets}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-[11px] font-semibold uppercase block">Total de Chamados</span>
              <strong className="text-xl font-black text-slate-800">{tickets.length}</strong>
            </div>
          </div>

          {/* Filtros de Tickets */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, categoria ou mensagem..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterTicketStatus('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTicketStatus === 'todos' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTicketStatus('aberto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTicketStatus === 'aberto' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Abertos ({openTickets})
              </button>
              <button
                type="button"
                onClick={() => setFilterTicketStatus('em_atendimento')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTicketStatus === 'em_atendimento' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Em Atendimento ({inProgressTickets})
              </button>
              <button
                type="button"
                onClick={() => setFilterTicketStatus('resolvido')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTicketStatus === 'resolvido' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Resolvidos ({resolvedTickets})
              </button>
            </div>
          </div>

          {/* Lista de Chamados */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Nenhum chamado registrado</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Não há chamados de suporte abertos ou correspondentes aos filtros selecionados.
                </p>
              </div>
            ) : (
              filteredTickets.map(tkt => {
                const isSelected = selectedTicketId === tkt.id;
                return (
                  <div 
                    key={tkt.id} 
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">#{tkt.id}</span>
                          <h4 className="text-sm font-bold text-slate-900">{tkt.titulo}</h4>
                          {getTicketStatusBadge(tkt.status)}
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                            {tkt.categoria}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{tkt.descricao}</p>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1">
                          <span>Empresa: <strong className="text-slate-700">{tkt.empresa_nome}</strong></span>
                          <span>•</span>
                          <span>Autor: <strong className="text-slate-700">{tkt.usuario_nome}</strong></span>
                          <span>•</span>
                          <span>Aberto em: {tkt.created_at}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {tkt.status === 'aberto' && onUpdateTicketStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(tkt.id, 'em_atendimento')}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Atender
                          </button>
                        )}
                        {(tkt.status === 'aberto' || tkt.status === 'em_atendimento') && onUpdateTicketStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(tkt.id, 'resolvido')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Resolver
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(isSelected ? null : tkt.id)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Fechar' : 'Responder'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Resposta Rápida do Admin */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          {tkt.mensagens?.map(msg => (
                            <div key={msg.id} className="p-2 rounded bg-white border border-slate-200">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <strong className={msg.usuario_perfil === 'admin' ? 'text-purple-700 font-bold' : 'text-slate-800 font-semibold'}>
                                  {msg.usuario_nome} ({msg.usuario_perfil})
                                </strong>
                                <span>{msg.created_at}</span>
                              </div>
                              <p className="text-slate-700 whitespace-pre-wrap">{msg.mensagem}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={quickReplyText}
                            onChange={(e) => setQuickReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendQuickReply(tkt.id);
                            }}
                            placeholder="Digite a resposta do suporte oficial..."
                            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendQuickReply(tkt.id)}
                            disabled={!quickReplyText.trim()}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: ADMINISTRADORES DO SISTEMA (GERENCIAR / DELETAR ADMIN)            */}
      {/* ========================================================================= */}
      {adminTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-900">
                <strong className="block font-bold mb-0.5">Gestão de Administradores ({adminUsers.length} administradores ativos)</strong>
                Acesso master irrestrito para aprovação de empresas, atendimento de chamados técnicos e auditoria do ecossistema SaaS.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewAdminModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Administrador</span>
            </button>
          </div>

          {/* Cards dos Administradores com Ação de Excluir / Deletar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminUsers.map((admin, idx) => {
              const isCurrent = currentUser.email === admin.email;
              const isOnlyAdmin = adminUsers.length <= 1;

              return (
                <div 
                  key={admin.id || idx}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isCurrent ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          {admin.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{admin.nome}</h4>
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                              Admin {idx + 1}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{admin.cargo || 'Super Administrador'}</p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conectado Agora
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium">
                          Ativo
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">E-mail:</span>
                        <strong className="font-mono text-slate-800">{admin.email}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Departamento:</span>
                        <span>{admin.departamento || 'Operações & Atendimento'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Permissão:</span>
                        <span className="text-purple-700 font-bold">Acesso Total (Master)</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Admin: Alternar Sessão e DELETAR ADMIN */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 mt-3">
                    <div className="flex items-center gap-2">
                      {!isCurrent && onSwitchAdmin && (
                        <button
                          type="button"
                          onClick={() => onSwitchAdmin(admin)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Acessar</span>
                        </button>
                      )}
                    </div>

                    {/* Botão de Deletar Administrador */}
                    <button
                      type="button"
                      disabled={isOnlyAdmin}
                      onClick={() => setAdminToDelete(admin)}
                      title={isOnlyAdmin ? 'Não é possível deletar o único administrador' : `Deletar administrador ${admin.nome}`}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Deletar Admin</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Seção de Limpeza de Produção (Zerar tudo mantendo apenas Administradores) */}
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Limpar Cadastros e Dados de Teste (Zerar para Produção)</span>
              </div>
              <p className="text-xs text-red-700 max-w-xl">
                Exclui empresas cadastradas, produtos, movimentações de estoque e tickets de teste, mantendo estritamente os <strong>Administradores</strong> para lançamento limpo do sistema.
              </p>
            </div>

            {onClearAllTestData && (
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Zerar Tudo (Manter Admins)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETAR ADMINISTRADOR                                             */}
      {/* ========================================================================= */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">Deletar Administrador</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja remover o administrador <strong className="text-slate-900">{adminToDelete.nome}</strong>?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1">
                <div><span className="text-slate-400">E-mail:</span> <strong className="text-slate-800 font-mono">{adminToDelete.email}</strong></div>
                <div><span className="text-slate-400">Cargo:</span> <span className="text-slate-700">{adminToDelete.cargo || 'Super Administrador'}</span></div>
              </div>
              <p className="text-[11px] text-red-600 font-medium">
                Esta conta perderá imediatamente todo o acesso administrativo à plataforma.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAdmin}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Deletar Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR NOVO ADMINISTRADOR                                      */}
      {/* ========================================================================= */}
      {showNewAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Administrador</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="space-y-3.5">
              {adminFormError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {adminFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Oliveira"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@seusite.com.br"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  placeholder="Defina uma senha segura"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={newAdminCargo}
                    onChange={(e) => setNewAdminCargo(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={newAdminDept}
                    onChange={(e) => setNewAdminDept(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAdminModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Salvar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE LIMPEZA DE PRODUÇÃO                                */}
      {/* ========================================================================= */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900">Confirmar Limpeza Total</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Esta ação irá remover todas as empresas cadastradas, produtos, estoques e chamados de teste. As contas de <strong>Super Administradores</strong> permanecerão ativas para o lançamento oficial.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllTestData) onClearAllTestData();
                  setShowConfirmResetModal(false);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Limpar Tudo Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
