import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ArrowLeftRight, 
  Users2, 
  LifeBuoy, 
  Settings, 
  FileCode2,
  ChevronRight
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'admin-empresas' 
  | 'produtos' 
  | 'estoque' 
  | 'funcionarios' 
  | 'tickets' 
  | 'configuracoes' 
  | 'codigo';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingCount?: number;
  lowStockCount?: number;
  openTicketsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  pendingCount = 0,
  lowStockCount = 0,
  openTicketsCount = 0
}) => {
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
      roles: ['dono', 'gerente', 'funcionario'],
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null,
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 'estoque' as ActiveTab,
      label: 'Controle de Estoque',
      icon: ArrowLeftRight,
      roles: ['dono', 'gerente', 'funcionario'],
      badge: null
    },
    {
      id: 'funcionarios' as ActiveTab,
      label: 'Equipe & Funcionários',
      icon: Users2,
      roles: ['dono', 'gerente'],
      badge: null
    },
    {
      id: 'tickets' as ActiveTab,
      label: 'Chamados de Suporte',
      icon: LifeBuoy,
      roles: ['admin', 'dono', 'gerente', 'funcionario'],
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

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-100 flex-col shrink-0 min-h-[calc(100vh-61px)] rounded-xl border border-slate-800 shadow-xs">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
          <span>Navegação do Sistema</span>
        </div>
      </div>

      <nav className="p-3 flex flex-col gap-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal w-full text-left ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">GestãoSaaS Multi-Tenant</span>
          <span className="text-[10px] bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono">v1.0</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Arquitetura PHP 8.x + PDO Prepared Statements & MySQL
        </p>
      </div>
    </aside>
  );
};
