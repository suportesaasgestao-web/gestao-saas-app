import React, { useState } from 'react';
import { Company, CompanyStatus, Ticket, TicketStatus, TicketPriority, User } from '../types';
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
  Trash2,
  RefreshCw
} from 'lucide-react';

interface AdminCompaniesViewProps {
  companies: Company[];
  onUpdateStatus: (companyId: number, newStatus: CompanyStatus) => void;
  tickets?: Ticket[];
  onReplyTicket?: (ticketId: number, message: string) => void;
  onUpdateTicketStatus?: (ticketId: number, status: TicketStatus) => void;
  currentUser: User;
  users?: User[];
  onSwitchAdmin?: (user: User) => void;
  onNavigateToTickets?: () => void;
  onClearAllTestData?: () => void;
}

export const AdminCompaniesView: React.FC<AdminCompaniesViewProps> = ({
  companies,
  onUpdateStatus,
  tickets = [],
  onReplyTicket,
  onUpdateTicketStatus,
  currentUser,
  users = [],
  onSwitchAdmin,
  onNavigateToTickets,
  onClearAllTestData
}) => {
  // Aba ativa do Painel de Admin
  const [adminTab, setAdminTab] = useState<'tickets' | 'empresas' | 'admins'>('tickets');
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  // Filtros de Empresas
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchCompany, setSearchCompany] = useState<string>('');

  // Filtros de Tickets
  const [filterTicketStatus, setFilterTicketStatus] = useState<string>('todos');
  const [searchTicket, setSearchTicket] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [quickReplyText, setQuickReplyText] = useState<string>('');

  // Listagem dos 2 Admins
  const adminUsers = users.filter(u => u.perfil === 'admin');

  // Contadores
  const pendingCompanies = companies.filter(c => c.status === 'pendente').length;
  const approvedCompanies = companies.filter(c => c.status === 'aprovada').length;
  const openTickets = tickets.filter(t => t.status === 'aberto').length;
  const inProgressTickets = tickets.filter(t => t.status === 'em_atendimento').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolvido').length;

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
        return <span className="bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full text-[11px] font-bold">Fechado</span>;
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgente':
        return <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">● Urgente</span>;
      case 'alta':
        return <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">● Alta</span>;
      case 'media':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">● Média</span>;
      case 'baixa':
        return <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium uppercase">● Baixa</span>;
    }
  };

  const handleSendQuickReply = (ticketId: number) => {
    if (!quickReplyText.trim() || !onReplyTicket) return;
    onReplyTicket(ticketId, quickReplyText.trim());
    setQuickReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header do Painel de Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Painel Geral de Administração (SaaS Master)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão exclusiva para os 2 Administradores: acompanhe chamados de suporte, autorize empresas e gerencie acessos globais.
          </p>
        </div>

        {/* Informações do Administrador Atual */}
        <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200/80 px-3.5 py-2 rounded-xl text-xs text-purple-900 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser.nome.charAt(0)}
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{currentUser.nome}</span>
              <span className="bg-purple-200 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-mono">Admin Ativo</span>
            </div>
            <div className="text-[11px] text-purple-700">{currentUser.email}</div>
          </div>
        </div>
      </div>

      {/* Navegação por Abas do Painel de Admin */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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
          onClick={() => setAdminTab('admins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'admins'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Administradores (2 Admins)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            adminTab === 'admins' ? 'bg-white text-purple-700' : 'bg-slate-100 text-slate-700 border border-slate-300'
          }`}>
            2
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CHAMADOS DE TICKETS (APENAS ADMIN)                                */}
      {/* ========================================================================= */}
      {adminTab === 'tickets' && (
        <div className="space-y-4">
          {/* Métricas de Chamados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500">Total de Chamados</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{tickets.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-medium text-blue-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Aguardando Atendimento
              </div>
              <div className="text-xl font-extrabold text-blue-700 mt-1">{openTickets}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                <LifeBuoy className="w-3 h-3" /> Em Atendimento
              </div>
              <div className="text-xl font-extrabold text-amber-700 mt-1">{inProgressTickets}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolvidos
              </div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">{resolvedTickets}</div>
            </div>
          </div>

          {/* Filtros e Busca de Chamados */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar chamado por assunto, categoria ou mensagem..."
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
                <h4 className="text-sm font-bold text-slate-800">Nenhum chamado de ticket encontrado</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Não há chamados pendentes para os critérios selecionados. Quando clientes ou usuários abrirem solicitações de suporte, elas aparecerão aqui diretamente para os 2 admins.
                </p>
              </div>
            ) : (
              filteredTickets.map(tkt => {
                const isSelected = selectedTicketId === tkt.id;
                return (
                  <div 
                    key={tkt.id} 
                    className={`bg-white rounded-xl border transition-all p-4 shadow-xs ${
                      isSelected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            #{tkt.id}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {tkt.titulo}
                          </h4>
                          {getTicketStatusBadge(tkt.status)}
                          {getPriorityBadge(tkt.prioridade)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400" /> Categoria: <strong>{tkt.categoria}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Aberto em: {tkt.created_at}
                          </span>
                          {tkt.atendente_nome && (
                            <>
                              <span>•</span>
                              <span className="text-purple-700 font-medium">Atendente: {tkt.atendente_nome}</span>
                            </>
                          )}
                        </div>

                        {/* Mensagem mais recente ou descrição */}
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mt-1">
                          <p className="line-clamp-2">
                            {tkt.mensagens && tkt.mensagens.length > 0 
                              ? tkt.mensagens[tkt.mensagens.length - 1].mensagem 
                              : 'Sem mensagens no chamado.'}
                          </p>
                        </div>
                      </div>

                      {/* Ações do Admin no Ticket */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                        {/* Botões de Transição de Status */}
                        {tkt.status === 'aberto' && onUpdateTicketStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(tkt.id, 'em_atendimento')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <LifeBuoy className="w-3.5 h-3.5" />
                            <span>Assumir Chamado</span>
                          </button>
                        )}

                        {tkt.status === 'em_atendimento' && onUpdateTicketStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(tkt.id, 'resolvido')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Marcar Resolvido</span>
                          </button>
                        )}

                        {tkt.status === 'resolvido' && onUpdateTicketStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(tkt.id, 'fechado')}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            <span>Fechar Ticket</span>
                          </button>
                        )}

                        {/* Expandir / Responder rápido */}
                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(isSelected ? null : tkt.id)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Fechar Resposta' : 'Responder como Admin'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Área de Resposta Rápida do Admin */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in fade-in duration-200">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          <span>Responder como {currentUser.nome} (Admin):</span>
                        </div>

                        {/* Histórico completo de mensagens */}
                        <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          {tkt.mensagens?.map(msg => (
                            <div key={msg.id} className="p-2 rounded bg-white border border-slate-200">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <strong className={msg.usuario_perfil === 'admin' ? 'text-purple-700' : 'text-slate-800'}>
                                  {msg.usuario_nome} ({msg.usuario_perfil})
                                </strong>
                                <span>{msg.created_at}</span>
                              </div>
                              <p className="text-slate-700 whitespace-pre-wrap">{msg.mensagem}</p>
                            </div>
                          ))}
                        </div>

                        {/* Campo de Envio */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={quickReplyText}
                            onChange={(e) => setQuickReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendQuickReply(tkt.id);
                            }}
                            placeholder="Digite a resposta oficial do suporte aqui..."
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
      {/* ABA 2: APROVAÇÃO DE EMPRESAS                                             */}
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
                  Não existem cadastros para o filtro selecionado. Quando novas empresas se cadastrarem, os 2 admins poderão avaliá-las aqui.
                </p>
              </div>
            ) : (
              filteredCompanies.map(company => (
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

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {company.nome_fantasia}
                        </h4>
                        <span className="text-xs text-slate-500 font-normal">
                          ({company.razao_social})
                        </span>
                        {getCompanyStatusBadge(company.status)}
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
                      </div>
                    </div>
                  </div>

                  {/* Ações de Aprovação */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
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
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: OS 2 ADMINISTRADORES DO SAAS                                      */}
      {/* ========================================================================= */}
      {adminTab === 'admins' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900">
              <strong className="block font-bold mb-0.5">Controle dos 2 Administradores Globais</strong>
              O sistema conta com dois super administradores com privilégio total sobre aprovação de empresas, resolução de chamados de suporte (tickets) e gestão do back-end.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminUsers.map((admin, idx) => {
              const isCurrent = currentUser.email === admin.email;
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

                  {/* Ação: Alternar para este Admin */}
                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {isCurrent ? 'Você está operando como este admin' : 'Alternar sessão para este admin:'}
                    </span>

                    {!isCurrent && onSwitchAdmin && (
                      <button
                        type="button"
                        onClick={() => onSwitchAdmin(admin)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Entrar como Admin {idx + 1}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>


          {/* Seção de Limpeza de Produção (Zerar tudo menos os 2 Admins) */}
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Limpar Cadastros e Dados de Teste (Zerar para Produção)</span>
              </div>
              <p className="text-xs text-red-700 max-w-xl">
                Exclui todas as empresas, produtos, movimentações de estoque, tickets e usuários de teste, mantendo estritamente os <strong>2 Super Administradores</strong> para lançamento limpo do sistema.
              </p>
            </div>

            {onClearAllTestData && (
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Zerar Tudo (Manter 2 Admins)</span>
              </button>
            )}
          </div>

          {/* Modal de Confirmação de Limpeza de Produção */}
          {showConfirmResetModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-extrabold text-slate-900">Confirmar Limpeza Total</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Esta ação irá remover todas as empresas cadastradas, produtos, estoque e chamados. Apenas os <strong>2 Super Administradores</strong> (Messias e Admin 2) permanecerão ativos para o lançamento oficial.
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
      )}
    </div>
  );
};
