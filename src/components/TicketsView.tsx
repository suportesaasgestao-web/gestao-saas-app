import React, { useState, useMemo } from 'react';
import { Ticket, TicketPriority, TicketStatus, User, Company } from '../types';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Tag,
  Headphones,
  Star,
  Award,
  Sparkles,
  CheckCheck,
  Mail,
  Copy,
  ExternalLink,
  Check,
  Trash2,
  Building2,
  ShieldCheck,
  RotateCcw,
  User as UserIcon
} from 'lucide-react';

const SUPPORT_EMAIL = 'suportesaasgestao@gmail.com';

interface TicketsViewProps {
  tickets: Ticket[];
  currentUser: User;
  currentCompany?: Company | null;
  onOpenTicket: (ticket: {
    titulo: string;
    categoria: 'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente';
    prioridade: TicketPriority;
    descricao: string;
    atendente_nome?: string;
  }) => void;
  onReplyTicket: (ticketId: number, message: string) => void;
  onUpdateStatus: (ticketId: number, status: TicketStatus) => void;
  onRateTicket?: (ticketId: number, nota: number, comentario: string) => void;
  onDeleteTicket?: (ticketId: number) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  currentUser,
  currentCompany,
  onOpenTicket,
  onReplyTicket,
  onUpdateStatus,
  onRateTicket,
  onDeleteTicket
}) => {
  const isAdmin = currentUser.perfil === 'admin';

  // Filtros e Seleção
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(tickets[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | TicketStatus>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  
  // Resposta e Modal
  const [replyMessage, setReplyMessage] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulário de Novo Chamado
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente'>('suporte');
  const [prioridade, setPrioridade] = useState<TicketPriority>('media');
  const [descricao, setDescricao] = useState('');

  // Avaliação / Feedback
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [copiedSupport, setCopiedSupport] = useState(false);

  const handleCopySupport = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedSupport(true);
    setTimeout(() => setCopiedSupport(false), 2500);
  };

  // Filtragem dos tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Filtro de texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.titulo.toLowerCase().includes(query);
        const matchesDesc = t.descricao.toLowerCase().includes(query);
        const matchesEmpresa = (t.empresa_nome || '').toLowerCase().includes(query);
        const matchesUser = t.usuario_nome.toLowerCase().includes(query);
        const matchesId = String(t.id).includes(query);
        if (!matchesTitle && !matchesDesc && !matchesEmpresa && !matchesUser && !matchesId) {
          return false;
        }
      }

      // Filtro de status
      if (statusFilter !== 'todos' && t.status !== statusFilter) {
        return false;
      }

      // Filtro de categoria
      if (categoryFilter !== 'todas' && t.categoria !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter]);

  // Ticket Selecionado
  const selectedTicket = useMemo(() => {
    return filteredTickets.find(t => t.id === selectedTicketId) 
      || (filteredTickets.length > 0 ? filteredTickets[0] : null);
  }, [filteredTickets, selectedTicketId]);

  // Contadores
  const totalCount = tickets.length;
  const abertosCount = tickets.filter(t => t.status === 'aberto').length;
  const atendimentoCount = tickets.filter(t => t.status === 'em_atendimento').length;
  const resolvidosCount = tickets.filter(t => t.status === 'resolvido' || t.status === 'fechado').length;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) {
      return;
    }
    
    // Atendente oficial da plataforma
    const defaultAttendant = 'Equipe de Suporte & Administração SaaS';

    onOpenTicket({
      titulo: titulo.trim(),
      categoria,
      prioridade,
      descricao: descricao.trim(),
      atendente_nome: defaultAttendant
    });

    setTitulo('');
    setDescricao('');
    setPrioridade('media');
    setCategoria('suporte');
    setIsNewModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    onReplyTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');
  };

  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const handleSubmitEvaluation = () => {
    if (!selectedTicket || !onRateTicket) return;
    onRateTicket(selectedTicket.id, ratingStars, ratingComment.trim());
    setRatingComment('');
  };

  const handleDelete = (ticket: Ticket) => {
    setTicketToDelete(ticket);
  };

  const confirmDeleteTicket = () => {
    if (!ticketToDelete) return;
    if (onDeleteTicket) {
      onDeleteTicket(ticketToDelete.id);
      if (selectedTicketId === ticketToDelete.id) {
        setSelectedTicketId(null);
      }
    }
    setTicketToDelete(null);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'aberto':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Aberto</span>;
      case 'em_atendimento':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Em Atendimento</span>;
      case 'resolvido':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Resolvido</span>;
      case 'fechado':
        return <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">Fechado</span>;
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgente':
        return <span className="text-red-600 font-extrabold uppercase text-[10px]">● Urgente</span>;
      case 'alta':
        return <span className="text-amber-600 font-bold uppercase text-[10px]">● Alta</span>;
      case 'media':
        return <span className="text-blue-600 font-semibold uppercase text-[10px]">● Média</span>;
      case 'baixa':
        return <span className="text-slate-500 font-medium uppercase text-[10px]">● Baixa</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isAdmin ? 'Central Administrativa de Chamados & Suporte' : 'Central de Suporte & Atendimento'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin 
                  ? 'Gerencie, atenda e responda a todas as solicitações das empresas cadastradas no sistema.'
                  : 'Abra chamados para suporte técnico, tire dúvidas e acompanhe o atendimento com nossa equipe.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('todos')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'todos' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-100' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500">Total de Chamados</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('aberto')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'aberto' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Aguardando Atendimento
          </div>
          <div className="text-xl font-extrabold text-blue-700 mt-1">{abertosCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('em_atendimento')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'em_atendimento' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
            <LifeBuoy className="w-3.5 h-3.5" /> Em Atendimento
          </div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{atendimentoCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('resolvido')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'resolvido' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolvidos / Fechados
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{resolvidosCount}</div>
        </div>
      </div>

      {/* Banner de Canal Direto por E-mail */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-xs border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Canal Direto de Suporte & Administração</span>
              <span className="bg-blue-500/30 text-blue-200 text-[10px] px-2 py-0.5 rounded-full font-medium">Oficial</span>
            </h4>
            <p className="text-[11px] text-blue-200/90 mt-0.5">
              Para urgências, redefinição de acesso ou dúvidas críticas, você também pode nos contatar por e-mail:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 select-all text-blue-200">
            {SUPPORT_EMAIL}
          </span>
          <button
            type="button"
            onClick={handleCopySupport}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs transition-colors"
            title="Copiar e-mail"
          >
            {copiedSupport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Suporte Direto - Sistema de Gestão')}`}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Enviar E-mail</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por assunto, empresa, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="todos">Todos os Status ({tickets.length})</option>
            <option value="aberto">Abertos ({abertosCount})</option>
            <option value="em_atendimento">Em Atendimento ({atendimentoCount})</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="todas">Todas Categorias</option>
            <option value="suporte">Suporte Técnico</option>
            <option value="financeiro">Financeiro</option>
            <option value="duvida">Dúvidas</option>
            <option value="sugestao">Sugestões</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Grid Principal: Lista à Esquerda e Chat/Detalhes à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna da Esquerda: Lista de Chamados */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Nenhum chamado registrado</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Não há chamados para os filtros selecionados ou nenhum chamado foi aberto ainda.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Primeiro Chamado</span>
                </button>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-purple-50/80 border-l-4 border-purple-600' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-purple-700 font-mono">#{ticket.id}</span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(ticket.prioridade)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.titulo}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ticket.descricao}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-100 mt-1">
                    {ticket.empresa_nome && (
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {ticket.empresa_nome}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-slate-500">{ticket.usuario_nome}</span>
                    <span>•</span>
                    <span className="text-slate-400">{ticket.created_at?.split(' ')[0] || ''}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Coluna da Direita: Atendimento / Chat / Detalhes */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-[500px]">
          {selectedTicket ? (
            <>
              {/* Top bar do Chamado */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        #{selectedTicket.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{selectedTicket.titulo}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                      <span>Solicitante: <strong>{selectedTicket.usuario_nome}</strong></span>
                      {selectedTicket.empresa_nome && (
                        <span>• Empresa: <strong>{selectedTicket.empresa_nome}</strong></span>
                      )}
                      <span>• Categoria: <strong className="capitalize">{selectedTicket.categoria}</strong></span>
                      <span>• Aberto em: {selectedTicket.created_at}</span>
                    </p>
                  </div>

                  {/* Ações de Status & Admin */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => onUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                      className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_atendimento">Em Atendimento</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="fechado">Fechado</option>
                    </select>

                    {selectedTicket.status !== 'fechado' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(selectedTicket.id, 'fechado')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Finalizar e fechar chamado"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Fechar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(selectedTicket.id, 'em_atendimento')}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Reabrir chamado"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </button>
                    )}

                    {/* Botão de Excluir para Admin */}
                    {isAdmin && onDeleteTicket && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedTicket)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir chamado permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Atendente e Fechamento */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg font-medium">
                    <Headphones className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Responsável: <strong>{selectedTicket.atendente_nome || 'Equipe de Suporte Central'}</strong></span>
                  </div>

                  {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Concluído por: <strong>{selectedTicket.fechado_por_nome || currentUser.nome}</strong>
                        {selectedTicket.fechado_em ? ` (${selectedTicket.fechado_em})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thread de Mensagens */}
              <div className="p-5 overflow-y-auto max-h-[440px] flex-1 space-y-4 bg-slate-50/30">
                {/* Descrição Inicial */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      {selectedTicket.usuario_nome} (Abertura do Chamado)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">{selectedTicket.created_at}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-xs text-slate-700">
                    {selectedTicket.descricao}
                  </p>
                </div>

                {/* Respostas do Chamado */}
                {selectedTicket.mensagens && selectedTicket.mensagens.length > 0 && (
                  selectedTicket.mensagens
                    .filter(m => m.mensagem !== selectedTicket.descricao) // evita duplicar primeira mensagem se já constar
                    .map(msg => {
                      const isSupportOrAdmin = msg.usuario_perfil === 'admin' || msg.usuario_perfil === 'gerente';

                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col text-xs p-3.5 rounded-xl border shadow-2xs ${
                            isSupportOrAdmin 
                              ? 'bg-purple-50/70 border-purple-200 ml-4' 
                              : 'bg-white border-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {msg.usuario_nome}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSupportOrAdmin ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {msg.usuario_perfil === 'admin' ? 'ADMINISTRADOR' : msg.usuario_perfil.toUpperCase()}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400">{msg.created_at}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{msg.mensagem}</p>
                        </div>
                      );
                    })
                )}

                {/* Bloco de Chamado Encerrado */}
                {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Atendimento Finalizado
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-normal">
                        {selectedTicket.fechado_em || 'Resolvido'}
                      </span>
                    </div>
                    <p className="text-emerald-800">
                      Este atendimento foi finalizado por <strong>{selectedTicket.fechado_por_nome || currentUser.nome}</strong>.
                    </p>
                  </div>
                )}

                {/* Avaliação do Atendimento (Feedback) */}
                {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                  <>
                    {selectedTicket.avaliacao ? (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-amber-900 text-sm">Avaliação do Atendimento</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= selectedTicket.avaliacao!.nota ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                              />
                            ))}
                            <span className="font-bold text-amber-800 ml-1">({selectedTicket.avaliacao.nota}/5)</span>
                          </div>
                        </div>
                        {selectedTicket.avaliacao.comentario && (
                          <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-slate-700 italic">
                            "{selectedTicket.avaliacao.comentario}"
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-amber-800/80 pt-1">
                          <span>Avaliado por: <strong>{selectedTicket.avaliacao.avaliado_por_nome}</strong></span>
                          <span>{selectedTicket.avaliacao.avaliado_em}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 via-amber-50 to-amber-100/60 border-2 border-amber-300/80 text-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <h5 className="font-bold text-slate-900 text-sm">Avalie este Atendimento</h5>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              Sua avaliação é importante para melhoria contínua dos nossos serviços de suporte.
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wide">
                            Pendente
                          </span>
                        </div>

                        {/* Estrelas */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Classificação:</label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingStars(star)}
                                onMouseEnter={() => setHoverStars(star)}
                                onMouseLeave={() => setHoverStars(0)}
                                className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                title={`${star} estrelas`}
                              >
                                <Star 
                                  className={`w-6 h-6 ${(hoverStars || ratingStars) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                />
                              </button>
                            ))}
                            <span className="ml-2 font-bold text-amber-900 text-xs">
                              {(hoverStars || ratingStars) === 5 && '⭐⭐⭐⭐⭐ Excelente'}
                              {(hoverStars || ratingStars) === 4 && '⭐⭐⭐⭐ Muito Bom'}
                              {(hoverStars || ratingStars) === 3 && '⭐⭐⭐ Bom'}
                              {(hoverStars || ratingStars) === 2 && '⭐⭐ Regular'}
                              {(hoverStars || ratingStars) === 1 && '⭐ Insatisfatório'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Comentário ou Sugestão (Opcional):</label>
                          <input
                            type="text"
                            placeholder="Ex: Atendimento rápido, claro e atencioso!"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full text-xs p-2.5 border border-amber-200 rounded-lg bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmitEvaluation}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Enviar Avaliação</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Caixa de Resposta */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50/60 flex gap-2">
                <input
                  type="text"
                  placeholder={isAdmin ? "Escreva sua resposta como Administrador..." : "Escreva sua resposta ou dúvida..."}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">Nenhum chamado selecionado</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Selecione um chamado da lista ao lado para ver a conversa e interagir, ou abra uma nova solicitação de suporte.
              </p>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Novo Chamado</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Abertura de Novo Chamado */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-600" />
                Abertura de Chamado de Suporte
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Informação do Solicitante e Destino */}
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Solicitante:</span>
                <span className="font-bold text-slate-900">{currentUser.nome} ({currentUser.email})</span>
              </div>
              {currentCompany && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Empresa:</span>
                  <span className="font-bold text-purple-700">{currentCompany.nome_fantasia || currentCompany.razao_social}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-purple-200/50">
                <span className="text-slate-600">Atendimento:</span>
                <span className="font-semibold text-purple-900">Equipe de Suporte & Administração SaaS</span>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Chamado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre movimentação de estoque ou erro ao salvar"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="suporte">Suporte Técnico</option>
                    <option value="financeiro">Financeiro / Faturamento</option>
                    <option value="duvida">Dúvida Operacional</option>
                    <option value="sugestao">Sugestão de Melhoria</option>
                    <option value="urgente">Incidente Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as TicketPriority)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="baixa">Baixa (Dúvida comum)</option>
                    <option value="media">Média (Padrão)</option>
                    <option value="alta">Alta (Impacta operação)</option>
                    <option value="urgente">Urgente (Sistema parado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada do Problema *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva o que ocorreu, os passos para reproduzir e como podemos te ajudar..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CHAMADO */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-red-100 text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Excluir Chamado</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tem certeza que deseja excluir o chamado <strong>#{ticketToDelete.id} - {ticketToDelete.titulo}</strong>?
                </p>
                <p className="text-[11px] text-red-600 font-semibold mt-2">
                  Esta ação é irreversível e removerá todo o histórico de mensagens associadas.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTicket}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
