import React from 'react';
import { UserRole, Company, User } from '../types';
import { ActiveTab } from './Sidebar';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ArrowLeftRight, 
  Users2, 
  LifeBuoy, 
  Settings, 
  FileCode2,
  X,
  LogOut,
  ShieldCheck,
  Menu,
  ChevronRight
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  currentUser: User;
  currentCompany: Company | null;
  pendingCount?: number;
  lowStockCount?: number;
  openTicketsCount?: number;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentRole,
  currentUser,
  currentCompany,
  pendingCount = 0,
  lowStockCount = 0,
  openTicketsCount = 0,
  onLogout
}) => {
  if (!isOpen) return null;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Geral',
      icon: LayoutDashboard,
      roles: ['admin', 'dono', 'gerente', 'funcionario'],
      badge: null
    },
    {
      id: 'admin-empresas' as ActiveTab,
      label: 'Painel de Admin',
      icon: Building2,
      roles: ['admin'],
      badge: (pendingCount + openTicketsCount) > 0 ? `${pendingCount + openTicketsCount} pendências` : null,
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'produtos' as ActiveTab,
      label: 'Cadastro de Produtos',
      icon: Package,
      roles: ['admin', 'dono', 'gerente', 'funcionario'],
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null,
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 'estoque' as ActiveTab,
      label: 'Controle de Estoque',
      icon: ArrowLeftRight,
      roles: ['admin', 'dono', 'gerente', 'funcionario'],
      badge: null
    },
    {
      id: 'funcionarios' as ActiveTab,
      label: 'Equipe & Funcionários',
      icon: Users2,
      roles: ['admin', 'dono', 'gerente'],
      badge: null
    },
    {
      id: 'tickets' as ActiveTab,
      label: 'Chamados de Suporte',
      icon: LifeBuoy,
      roles: ['admin'],
      badge: openTicketsCount > 0 ? `${openTicketsCount} abertos` : null,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'configuracoes' as ActiveTab,
      label: 'Dados da Empresa & Logo',
      icon: Settings,
      roles: ['admin', 'dono'],
      badge: null
    },
    {
      id: 'codigo' as ActiveTab,
      label: 'Código PHP & MySQL',
      icon: FileCode2,
      roles: ['admin'],
      badge: 'Admin / Dev',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  const handleSelect = (id: ActiveTab) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-slate-900 text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentCompany?.logo_url ? (
              <img 
                src={currentCompany.logo_url} 
                alt={currentCompany.nome_fantasia}
                className="w-9 h-9 rounded-lg object-cover border border-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                {currentRole === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate">
                {currentRole === 'admin' ? 'Painel SaaS' : (currentCompany?.nome_fantasia || 'Minha Empresa')}
              </div>
              <div className="text-[11px] text-blue-400 capitalize font-medium">
                {currentRole === 'dono' ? 'Dono / Diretor' : currentRole}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400 truncate">Conectado: <strong className="text-slate-200">{currentUser.nome}</strong></span>
          <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded font-mono uppercase">{currentRole}</span>
        </div>

        {/* Menu Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
            Menu de Navegação
          </div>
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-60" />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair / Trocar de Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MobileBottomBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  onOpenMenu: () => void;
  lowStockCount?: number;
  openTicketsCount?: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  onOpenMenu,
  lowStockCount = 0,
  openTicketsCount = 0
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
          activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`} />
        <span>Início</span>
      </button>

      <button
        onClick={() => onSelectTab('produtos')}
        className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
          activeTab === 'produtos' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Package className={`w-5 h-5 ${activeTab === 'produtos' ? 'text-blue-600' : 'text-slate-500'}`} />
        <span>Produtos</span>
        {lowStockCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('estoque')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
          activeTab === 'estoque' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <ArrowLeftRight className={`w-5 h-5 ${activeTab === 'estoque' ? 'text-blue-600' : 'text-slate-500'}`} />
        <span>Estoque</span>
      </button>

      {(currentRole === 'dono' || currentRole === 'admin' || currentRole === 'gerente') ? (
        <button
          onClick={() => onSelectTab('funcionarios')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'funcionarios' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users2 className={`w-5 h-5 ${activeTab === 'funcionarios' ? 'text-blue-600' : 'text-slate-500'}`} />
          <span>Equipe</span>
        </button>
      ) : (
        <button
          onClick={() => onSelectTab('tickets')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
            activeTab === 'tickets' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LifeBuoy className={`w-5 h-5 ${activeTab === 'tickets' ? 'text-blue-600' : 'text-slate-500'}`} />
          <span>Tickets</span>
          {openTicketsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
          )}
        </button>
      )}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium text-slate-600 hover:text-slate-900"
      >
        <Menu className="w-5 h-5 text-slate-600" />
        <span>Menu</span>
      </button>
    </div>
  );
};
