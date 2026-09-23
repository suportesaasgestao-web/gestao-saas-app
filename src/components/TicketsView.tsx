import React, { useState } from 'react';
import { Ticket, TicketPriority, TicketStatus, User } from '../types';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  User as UserIcon, 
  Tag,
  Headphones,
  Star,
  Award,
  Sparkles,
  CheckCheck,
  Mail,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

const SUPPORT_EMAIL = 'suportesaasgestao@gmail.com';

interface TicketsViewProps {
  tickets: Ticket[];
  currentUser: User;
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
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  currentUser,
  onOpenTicket,
  onReplyTicket,
  onUpdateStatus,
  onRateTicket
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(tickets[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulário de Novo Ticket
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente'>('suporte');
  const [prioridade, setPrioridade] = useState<TicketPriority>('media');
  const [descricao, setDescricao] = useState('');
  const [atendenteDesignado] = useState('Mariana Costa (Suporte Técnico Especializado)');

  // Avaliação / Feedback (Flashback Avaliação)
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [copiedSupport, setCopiedSupport] = useState(false);

  const handleCopySupport = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedSupport(true);
    setTimeout(() => setCopiedSupport(false), 2500);
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descricao) {
      alert('Preencha o título e a descrição do problema.');
      return;
    }
    onOpenTicket({
      titulo,
      categoria,
      prioridade,
      descricao,
      atendente_nome: atendenteDesignado
    });
    setTitulo('');
    setDescricao('');
    setIsNewModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    onReplyTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');
  };

  const handleSubmitEvaluation = () => {
    if (!selectedTicket || !onRateTicket) return;
    onRateTicket(selectedTicket.id, ratingStars, ratingComment);
    setRatingComment('');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Central de Atendimento & Suporte (Tickets)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Abra chamados para suporte técnico, tire dúvidas e acompanhe o atendimento em tempo real com avaliação ao final.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Ticket</span>
        </button>
      </div>

      {/* Banner de Suporte Direto por E-mail */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-xs border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Canal Direto de Suporte & Administrador</span>
              <span className="bg-blue-500/30 text-blue-200 text-[10px] px-2 py-0.2 rounded-full font-medium">Oficial</span>
            </h4>
            <p className="text-[11px] text-blue-200/90 mt-0.5">
              Teve problema com login, código de 15 minutos ou precisa de atendimento urgente? Fale direto por e-mail:
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

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-purple-900">Precisa entender como resolver?</h4>
          <p className="text-xs text-purple-700 mt-1">
            Abra o assistente de IA para explicar o problema e receber orientação passo a passo.
          </p>
        </div>
        <a
          href={`https://chatgpt.com/?q=${encodeURIComponent('Estou usando o GestãoSaaS e preciso de ajuda para entender e resolver um problema. Explique em português, passo a passo, com segurança.')}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ajuda com IA</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Chamados Registrados ({tickets.length})</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[580px]">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Nenhum chamado aberto</p>
                <p className="text-[11px] text-slate-400 mt-1">Todos os atendimentos foram concluídos ou nenhum foi aberto ainda.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-purple-50/70 border-l-4 border-purple-600' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono">#{ticket.id}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.titulo}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ticket.descricao}</p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-700 font-medium">
                    <Headphones className="w-3 h-3 text-purple-500" />
                    <span>Atendente: {ticket.atendente_nome || 'Mariana Costa'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/60 mt-1">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.prioridade)}
                      <span>• {ticket.categoria}</span>
                    </div>
                    {ticket.status === 'fechado' && ticket.fechado_por_nome ? (
                      <span className="text-emerald-600 font-medium">✓ Fechado por {ticket.fechado_por_nome.split(' ')[0]}</span>
                    ) : (
                      <span>{ticket.created_at.split(' ')[0]}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Conversation View */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Top bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600">#{selectedTicket.id}</span>
                      <h3 className="text-sm font-bold text-slate-900">{selectedTicket.titulo}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Solicitante: <strong>{selectedTicket.usuario_nome}</strong> ({selectedTicket.empresa_nome || 'Empresa'}) • Aberto em: {selectedTicket.created_at}
                    </p>
                  </div>

                  {/* Status Dropdown & Close Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => onUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                      className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_atendimento">Em Atendimento</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="fechado">Fechado</option>
                    </select>

                    {selectedTicket.status !== 'fechado' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(selectedTicket.id, 'fechado')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Encerrar chamado"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Fechar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Atendente e Informações de Fechamento */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs font-medium">
                    <Headphones className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Atendente Responsável: <strong>{selectedTicket.atendente_nome || 'Mariana Costa (Suporte Central)'}</strong></span>
                  </div>

                  {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Fechado por: <strong>{selectedTicket.fechado_por_nome || currentUser.nome}</strong>
                        {selectedTicket.fechado_em ? ` (${selectedTicket.fechado_em})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="p-5 overflow-y-auto max-h-[420px] flex-1 space-y-4">
                {/* Original Description */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Descrição do Problema</span>
                    <span className="text-[10px] text-slate-400 font-normal">{selectedTicket.created_at}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedTicket.descricao}</p>
                </div>

                {/* Thread replies */}
                {selectedTicket.mensagens.map(msg => {
                  const isSupportOrAdmin = msg.usuario_perfil === 'admin' || msg.usuario_perfil === 'gerente';

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col text-xs p-3.5 rounded-xl border ${
                        isSupportOrAdmin 
                          ? 'bg-purple-50/60 border-purple-200 ml-4' 
                          : 'bg-white border-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {msg.usuario_nome}
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {msg.usuario_perfil.toUpperCase()}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400">{msg.created_at}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{msg.mensagem}</p>
                    </div>
                  );
                })}

                {/* Bloco de Encerramento (Quem Fechou o Chamado) */}
                {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chamado Finalizado e Fechado
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-normal">
                        {selectedTicket.fechado_em || 'Encerrado'}
                      </span>
                    </div>
                    <p className="text-emerald-800">
                      Este atendimento foi finalizado por: <strong>{selectedTicket.fechado_por_nome || currentUser.nome}</strong>.
                    </p>
                  </div>
                )}

                {/* Bloco de Avaliação / Feedback (Flashback Avaliação) */}
                {(selectedTicket.status === 'fechado' || selectedTicket.status === 'resolvido') && (
                  <>
                    {selectedTicket.avaliacao ? (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-amber-900 text-sm">Avaliação do Atendimento (Feedback)</span>
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
                              <h5 className="font-bold text-slate-900 text-sm">Avaliação do Atendimento (Feedback)</h5>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              Por favor, avalie o atendimento prestado por <strong>{selectedTicket.atendente_nome || 'nossa equipe de suporte'}</strong> para aperfeiçoar nossos serviços.
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wide">
                            Pendente
                          </span>
                        </div>

                        {/* Interactive Stars */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Como você classifica este atendimento?</label>
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
                              {(hoverStars || ratingStars) === 1 && '⭐ Ruim'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Comentário ou Sugestão (Opcional):</label>
                          <input
                            type="text"
                            placeholder="Ex: Atendimento rápido, solícito e esclarecedor!"
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
                          <span>Salvar Avaliação do Atendimento</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua resposta para este chamado..."
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
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs min-h-[350px]">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">Central de Atendimento Limpa</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Quando precisar de assistência técnica ou suporte, abra um novo chamado. Você poderá acompanhar o atendimento em tempo real.
              </p>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Chamado Agora</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Ticket */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-600" />
                Abertura de Chamado / Ticket de Suporte
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Atendente Designado em Destaque */}
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Atendente Designada: {atendenteDesignado}</span>
                <span className="text-purple-700 text-[11px]">Especialista de Suporte Central e Atendimento ao Cliente</span>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Chamado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre emissão de notas ou erro no fechamento"
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
                    <option value="financeiro">Financeiro / Cobrança</option>
                    <option value="duvida">Dúvida Operacional</option>
                    <option value="sugestao">Sugestão de Recurso</option>
                    <option value="urgente">Incidente Crítico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as TicketPriority)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente (Bloqueio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explique o que aconteceu, passos para reproduzir ou a dúvida com o máximo de detalhes..."
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
    </div>
  );
};
