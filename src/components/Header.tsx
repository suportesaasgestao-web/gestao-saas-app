import React from 'react';
import { User, Company, UserRole } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  currentCompany: Company | null;
  onSwitchUser?: (role: UserRole) => void;
  onOpenCodeExplorer?: () => void;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentCompany,
  onLogout,
  onOpenMobileMenu
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin SaaS', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'dono':
        return { label: 'Dono / Diretor', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'gerente':
        return { label: 'Gerente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'funcionario':
        return { label: 'Funcionário', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(currentUser.perfil);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 md:px-6 py-3 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Active Company & Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Abrir Menu de Navegação"
              aria-label="Abrir Menu de Navegação"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {currentCompany?.logo_url ? (
            <img 
              src={currentCompany.logo_url} 
              alt={currentCompany.nome_fantasia}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              {currentUser.perfil === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {currentUser.perfil === 'admin' ? 'Painel Master do SaaS' : (currentCompany?.nome_fantasia || 'Empresa Sem Nome')}
              </h1>
              {currentCompany && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  currentCompany.status === 'aprovada' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {currentCompany.status === 'aprovada' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Aprovada
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Pendente
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentUser.perfil === 'admin' 
                ? 'Ambiente Global de Multi-Empresas' 
                : (currentCompany?.cnpj ? `CNPJ: ${currentCompany.cnpj} • ${currentUser.departamento || 'Gestão'}` : (currentUser.departamento || 'Gestão Integrada'))}
            </p>
          </div>
        </div>

        {/* Right: User Profile Badge + Logout */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${badge.color} shadow-xs`}>
            <ShieldCheck className="w-4 h-4 text-current" />
            <span>
              Perfil: <strong>{currentUser.tag || (currentUser.perfil === 'admin' ? 'ADMIN' : badge.label)}</strong>
            </span>
            <span className="opacity-75 hidden sm:inline">• {currentUser.nome.split(' ')[0]}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sair / Trocar de conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
