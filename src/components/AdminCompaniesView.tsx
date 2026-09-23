import React, { useState } from 'react';
import { Company, CompanyStatus } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertOctagon, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck,
  Building
} from 'lucide-react';

interface AdminCompaniesViewProps {
  companies: Company[];
  onUpdateStatus: (companyId: number, newStatus: CompanyStatus) => void;
}

export const AdminCompaniesView: React.FC<AdminCompaniesViewProps> = ({
  companies,
  onUpdateStatus
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCompanies = companies.filter(company => {
    const matchesFilter = filterStatus === 'todos' || company.status === filterStatus;
    const matchesSearch = 
      company.razao_social.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.nome_fantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.cnpj.includes(searchQuery) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CompanyStatus) => {
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

  const pendingCount = companies.filter(c => c.status === 'pendente').length;
  const approvedCount = companies.filter(c => c.status === 'aprovada').length;
  const suspendedCount = companies.filter(c => c.status === 'suspensa' || c.status === 'rejeitada').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Aprovação & Auditoria de Empresas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Módulo de controle do Administrador SaaS: aprove ou rejeite novos cadastros de empresas solicitados via formulário.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pendentes</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{approvedCount} Aprovadas</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Razão, CNPJ ou E-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
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
            onClick={() => setFilterStatus('pendente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'pendente' 
                ? 'bg-amber-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('aprovada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'aprovada' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Aprovadas ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('suspensa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'suspensa' 
                ? 'bg-slate-700 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Suspensas ({suspendedCount})
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
            Nenhuma empresa encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div 
              key={company.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                company.status === 'pendente' 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 text-purple-700 font-bold">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.nome_fantasia} 
                      className="w-full h-full rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{company.nome_fantasia}</h3>
                    {getStatusBadge(company.status)}
                  </div>
                  <p className="text-xs font-medium text-slate-600">{company.razao_social}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
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
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Cadastrado em: {company.created_at.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {company.status === 'pendente' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(company.id, 'aprovada')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprovar Empresa</span>
                    </button>
                    <button
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
                    onClick={() => onUpdateStatus(company.id, 'suspensa')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Suspender Acesso</span>
                  </button>
                )}

                {(company.status === 'suspensa' || company.status === 'rejeitada') && (
                  <button
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
  );
};
