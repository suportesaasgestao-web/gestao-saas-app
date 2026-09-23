import React, { useState, useEffect } from 'react';
import { 
  MOCK_COMPANIES, 
  MOCK_USERS, 
  MOCK_PRODUCTS, 
  MOCK_MOVEMENTS, 
  MOCK_TICKETS,
  DEFAULT_ADMIN_USER,
  ADMIN_1,
  ADMIN_2
} from './mockData';
import { 
  Company, 
  User, 
  Product, 
  StockMovement, 
  Ticket, 
  NavigationTab, 
  UserRole, 
  CompanyStatus,
  MovementType,
  TicketStatus,
  TicketPriority
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { StockMovementsView } from './components/StockMovementsView';
import { EmployeesView } from './components/EmployeesView';
import { TicketsView } from './components/TicketsView';
import { SettingsView } from './components/SettingsView';
import { AdminCompaniesView } from './components/AdminCompaniesView';
import { PhpBackendViewer } from './components/PhpBackendViewer';
import { AuthModal } from './components/AuthModal';
import { MobileDrawer, MobileBottomBar } from './components/MobileNav';
import { CheckCircle2, AlertCircle, Info, Database } from 'lucide-react';
import { PHP_CODEBASE } from './phpCodebase';
import { 
  initializeFirestoreDatabase,
  subscribeCompanies,
  subscribeUsers,
  subscribeProducts,
  subscribeMovements,
  subscribeTickets,
  dbSaveProduct,
  dbDeleteProduct,
  dbSaveStockMovement,
  dbSaveUser,
  dbDeleteUser,
  dbUpdateCompany,
  dbUpdateCompanyStatus,
  dbSaveTicket,
  dbDeleteTicket
} from './services/firestoreService';
import {
  isSupabaseConfigured,
  getSupabase,
  checkSupabaseTablesExist,
  fetchSupabaseCompanies,
  fetchSupabaseUsers,
  fetchSupabaseProducts,
  fetchSupabaseTickets,
  saveSupabaseCompany,
  saveSupabaseUser,
  saveSupabaseProduct,
  saveSupabaseStockMovement,
  saveSupabaseTicket,
  deleteSupabaseTicket,
  deleteSupabaseUser
} from './services/supabaseClient';

export default function App() {
  // Limpeza de Produção para Lançamento Multiplataforma (PC, Android, macOS, iPhone, Linux, ChromeOS)
  const isProductionCleaned = typeof window !== 'undefined' && localStorage.getItem('gestao_clean_prod_v5') === 'true';

  // Estado das Coleções de Dados do Sistema (persistência local SQL)
  const [companies, setCompanies] = useState<Company[]>(() => {
    if (!isProductionCleaned) return [];
    const saved = localStorage.getItem('gestao_sql_companies');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [users, setUsers] = useState<User[]>(() => {
    if (!isProductionCleaned) return [ADMIN_1, ADMIN_2];
    const saved = localStorage.getItem('gestao_sql_users');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin1 = parsed.some((u: User) => u.email === ADMIN_1.email);
          const hasAdmin2 = parsed.some((u: User) => u.email === ADMIN_2.email);
          let list = [...parsed];
          if (!hasAdmin1) list.unshift(ADMIN_1);
          if (!hasAdmin2) list.splice(1, 0, ADMIN_2);
          return list;
        }
      } catch {}
    }
    return [ADMIN_1, ADMIN_2];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    if (!isProductionCleaned) return [];
    const saved = localStorage.getItem('gestao_sql_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    if (!isProductionCleaned) return [];
    const saved = localStorage.getItem('gestao_sql_movements');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (!isProductionCleaned) return [];
    const saved = localStorage.getItem('gestao_sql_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Sessão do Usuário Conectado: Entra diretamente como Administrador Global
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (!isProductionCleaned) return DEFAULT_ADMIN_USER;
    const saved = localStorage.getItem('gestao_saas_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch {}
    }
    return DEFAULT_ADMIN_USER;
  });
  const [currentCompany, setCurrentCompany] = useState<Company | null>(() => {
    if (!isProductionCleaned) return null;
    const saved = localStorage.getItem('gestao_saas_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Navegação
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Gatilhos de Movimentação Rápida de Estoque
  const [stockModalType, setStockModalType] = useState<'entrada' | 'saida' | null>(null);
  const [preSelectedProductId, setPreSelectedProductId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [supabaseTablesReady, setSupabaseTablesReady] = useState<boolean | null>(null);
  const [dismissedSupabaseBanner, setDismissedSupabaseBanner] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Limpeza de Produção para Lançamento Multiplataforma:
  // Garante que todo o histórico de testes seja limpo no navegador, mantendo estritamente os 2 administradores oficiais
  useEffect(() => {
    if (localStorage.getItem('gestao_clean_prod_v5') !== 'true') {
      localStorage.setItem('gestao_clean_prod_v5', 'true');
      localStorage.setItem('gestao_sql_companies', JSON.stringify([]));
      localStorage.setItem('gestao_sql_products', JSON.stringify([]));
      localStorage.setItem('gestao_sql_movements', JSON.stringify([]));
      localStorage.setItem('gestao_sql_tickets', JSON.stringify([]));
      localStorage.setItem('gestao_sql_users', JSON.stringify([ADMIN_1, ADMIN_2]));
      localStorage.removeItem('gestao_saas_company');
      localStorage.setItem('gestao_saas_user', JSON.stringify(ADMIN_1));
      setCompanies([]);
      setProducts([]);
      setMovements([]);
      setTickets([]);
      setUsers([ADMIN_1, ADMIN_2]);
      setCurrentCompany(null);
      setCurrentUser(ADMIN_1);
    }
  }, []);

  // Limpeza de Produção acionada pelo Admin
  const handleClearAllTestData = async () => {
    localStorage.setItem('gestao_clean_prod_v5', 'true');
    localStorage.setItem('gestao_sql_companies', JSON.stringify([]));
    localStorage.setItem('gestao_sql_products', JSON.stringify([]));
    localStorage.setItem('gestao_sql_movements', JSON.stringify([]));
    localStorage.setItem('gestao_sql_tickets', JSON.stringify([]));
    localStorage.setItem('gestao_sql_users', JSON.stringify([ADMIN_1, ADMIN_2]));
    localStorage.removeItem('gestao_saas_company');
    localStorage.setItem('gestao_saas_user', JSON.stringify(ADMIN_1));

    setCompanies([]);
    setProducts([]);
    setMovements([]);
    setTickets([]);
    setUsers([ADMIN_1, ADMIN_2]);
    setCurrentCompany(null);
    setCurrentUser(ADMIN_1);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase();
        if (client) {
          await client.from('ticket_mensagens').delete().neq('id', 0);
          await client.from('tickets').delete().neq('id', 0);
          await client.from('movimentacoes_estoque').delete().neq('id', 0);
          await client.from('produtos').delete().neq('id', 0);
          await client.from('empresas').delete().neq('id', 0);
          await client.from('usuarios').delete().neq('perfil', 'admin');
        }
      } catch (err) {
        console.warn('Erro ao limpar tabelas no Supabase:', err);
      }
    }

    showToast('Base de dados zerada com sucesso! Apenas os 2 Super Administradores foram mantidos.', 'success');
  };

  // Inicialização e sincronização contínua com Firestore
  useEffect(() => {
    let unsubCompanies: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;
    let unsubProducts: (() => void) | undefined;
    let unsubMovements: (() => void) | undefined;
    let unsubTickets: (() => void) | undefined;

    const setupFirestore = async () => {
      try {
        await initializeFirestoreDatabase();
        setFirebaseConnected(true);

        unsubCompanies = subscribeCompanies((data) => {
          setCompanies(data);
          setCurrentCompany(prev => {
            if (!prev) return null;
            return data.find(c => c.id === prev.id) || prev;
          });
        });

        unsubUsers = subscribeUsers((data) => {
          if (data && data.length > 0) {
            const hasAdmin1 = data.some(u => u.email === ADMIN_1.email);
            const hasAdmin2 = data.some(u => u.email === ADMIN_2.email);
            let merged = [...data];
            if (!hasAdmin1) merged.unshift(ADMIN_1);
            if (!hasAdmin2) merged.splice(1, 0, ADMIN_2);
            setUsers(merged);
            setCurrentUser(prev => {
              if (!prev) return DEFAULT_ADMIN_USER;
              return merged.find(u => u.id === prev.id) || prev;
            });
          } else {
            setUsers([ADMIN_1, ADMIN_2]);
          }
        });

        unsubProducts = subscribeProducts((data) => setProducts(data));
        unsubMovements = subscribeMovements((data) => setMovements(data));
        unsubTickets = subscribeTickets((data) => setTickets(data));
      } catch (err) {
        console.warn('Conexão Firebase em background:', err);
      }
    };

    setupFirestore();

    // Sincronização com Supabase (caso configurado via variáveis de ambiente)
    if (isSupabaseConfigured()) {
       checkSupabaseTablesExist().then(exists => {
         setSupabaseTablesReady(exists);
         if (exists) {
           fetchSupabaseCompanies().then(d => { if (d && d.length > 0) setCompanies(d); });
           fetchSupabaseUsers().then(d => { if (d && d.length > 0) setUsers(d); });
           fetchSupabaseProducts().then(d => { if (d && d.length > 0) setProducts(d); });
           fetchSupabaseTickets().then(d => { if (d && d.length > 0) setTickets(d); });
         }
       });
    }

    return () => {
      unsubCompanies?.();
      unsubUsers?.();
      unsubProducts?.();
      unsubMovements?.();
      unsubTickets?.();
    };
  }, []);

  // Persistência local (Compatível com SQL Local)
  useEffect(() => {
    localStorage.setItem('gestao_sql_companies', JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    localStorage.setItem('gestao_sql_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('gestao_sql_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('gestao_sql_movements', JSON.stringify(movements));
  }, [movements]);
  useEffect(() => {
    localStorage.setItem('gestao_sql_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Switch de Perfis de Demonstração (Dono, Gerente, Funcionário, Admin)
  const handleSwitchRole = (newRole: UserRole) => {
    const targetUser = users.find(u => u.perfil === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
      if (targetUser.empresa_id) {
        const comp = companies.find(c => c.id === targetUser.empresa_id) || null;
        setCurrentCompany(comp);
      } else {
        setCurrentCompany(null);
      }
      showToast(`Perfil alternado para: ${newRole.toUpperCase()} (${targetUser.nome})`, 'info');
    }
  };

  // Gerenciamento de Status de Empresa (Aprovação / Rejeição pelo Admin)
  const handleUpdateCompanyStatus = async (companyId: number, newStatus: CompanyStatus) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));

    try {
      await dbUpdateCompanyStatus(companyId, newStatus);
    } catch (err) {
      console.error('Erro ao atualizar status da empresa no Firestore:', err);
    }

    const comp = companies.find(c => c.id === companyId);
    showToast(`Status da empresa "${comp?.nome_fantasia}" alterado para: ${newStatus.toUpperCase()}`, 'success');
  };

  // Salvar ou Criar Produto
  const handleSaveProduct = async (prodData: Partial<Product>) => {
    if (prodData.id) {
      // Atualização
      const updated = {
        ...(products.find(p => p.id === prodData.id) || {}),
        ...prodData
      } as Product;
      
      setProducts(prev => prev.map(p => p.id === prodData.id ? updated : p));
      showToast('Produto atualizado com sucesso!', 'success');
      
      try {
        await dbSaveProduct(updated);
        if (isSupabaseConfigured()) await saveSupabaseProduct(updated);
      } catch (err) {
        console.error('Erro ao salvar produto:', err);
      }
    } else {
      // Novo Produto
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProd: Product = {
        id: newId,
        empresa_id: currentCompany?.id || 1,
        nome: prodData.nome || '',
        sku: prodData.sku || '',
        codigo_barras: prodData.codigo_barras,
        categoria: prodData.categoria || 'Geral',
        preco_custo: prodData.preco_custo || 0,
        preco_venda: prodData.preco_venda || 0,
        estoque_atual: prodData.estoque_atual || 0,
        estoque_minimo: prodData.estoque_minimo || 5,
        unidade_medida: prodData.unidade_medida || 'UN',
        localizacao: prodData.localizacao,
        ativo: true,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setProducts(prev => [newProd, ...prev]);
      showToast('Produto cadastrado com sucesso!', 'success');
      
      try {
        await dbSaveProduct(newProd);
        if (isSupabaseConfigured()) await saveSupabaseProduct(newProd);
      } catch (err) {
        console.error('Erro ao cadastrar produto:', err);
      }
    }
  };

  // Excluir Produto
  const handleDeleteProduct = async (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Produto removido com sucesso.', 'info');
    try {
      await dbDeleteProduct(productId);
    } catch (err) {
      console.error('Erro ao excluir produto no Firestore:', err);
    }
  };

  // Ação Rápida de Estoque
  const handleQuickMoveProduct = (productId: number) => {
    setPreSelectedProductId(productId);
    setActiveTab('estoque');
  };

  // Registrar Movimentação de Estoque com transação no Firebase
  const handleRecordMovement = (movement: {
    produto_id: number;
    tipo: MovementType;
    quantidade: number;
    motivo: string;
    documento_ref?: string;
    valor_unitario?: number;
  }): { success: boolean; message: string } => {
    const targetProduct = products.find(p => p.id === movement.produto_id);
    if (!targetProduct) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    const saldoAnterior = targetProduct.estoque_atual;
    let saldoPosterior = saldoAnterior;

    if (movement.tipo === 'entrada' || movement.tipo === 'devolucao') {
      saldoPosterior = saldoAnterior + movement.quantidade;
    } else if (movement.tipo === 'saida') {
      if (saldoAnterior < movement.quantidade) {
        return { 
          success: false, 
          message: `Saldo insuficiente! Estoque atual é de ${saldoAnterior} ${targetProduct.unidade_medida}, impossível dar saída de ${movement.quantidade}.` 
        };
      }
      saldoPosterior = saldoAnterior - movement.quantidade;
    } else if (movement.tipo === 'ajuste') {
      saldoPosterior = movement.quantidade;
    }

    const updatedProduct = { ...targetProduct, estoque_atual: saldoPosterior };

    // Atualiza o estoque do produto localmente
    setProducts(prev => prev.map(p => p.id === targetProduct.id ? updatedProduct : p));

    // Grava registro da movimentação no Kardex auditável
    const newMovementId = movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1;
    const newMov: StockMovement = {
      id: newMovementId,
      empresa_id: currentCompany?.id || 1,
      produto_id: targetProduct.id,
      produto_nome: targetProduct.nome,
      usuario_id: currentUser?.id || 1,
      usuario_nome: currentUser?.nome || 'Usuário',
      tipo: movement.tipo,
      quantidade: movement.quantidade,
      saldo_anterior: saldoAnterior,
      saldo_posterior: saldoPosterior,
      motivo: movement.motivo,
      documento_ref: movement.documento_ref,
      valor_unitario: movement.valor_unitario,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setMovements(prev => [newMov, ...prev]);
    showToast(`Movimentação de ${movement.tipo.toUpperCase()} registrada com sucesso! Novo saldo: ${saldoPosterior}`, 'success');

    // Persistência assíncrona
    dbSaveStockMovement(newMov, updatedProduct).catch(err => {
      console.error('Erro ao registrar movimentação:', err);
    });
    if (isSupabaseConfigured()) {
      saveSupabaseStockMovement(newMov, updatedProduct).catch(err => {
        console.error('Erro ao registrar movimentação no Supabase:', err);
      });
    }

    return { success: true, message: 'Movimentação registrada com sucesso.' };
  };

  // Salvar ou Criar Colaborador
  const handleSaveUser = async (userData: Partial<User>) => {
    if (userData.id) {
      const updated = {
        ...(users.find(u => u.id === userData.id) || {}),
        ...userData
      } as User;
      setUsers(prev => prev.map(u => u.id === userData.id ? updated : u));
      showToast('Dados do colaborador atualizados com sucesso!', 'success');
      try {
        await dbSaveUser(updated);
        if (isSupabaseConfigured()) await saveSupabaseUser(updated);
      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
      }
    } else {
      const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        id: newUserId,
        empresa_id: currentCompany?.id || 1,
        nome: userData.nome || '',
        email: userData.email || '',
        perfil: userData.perfil || 'funcionario',
        cargo: userData.cargo || 'Assistente',
        departamento: userData.departamento || 'Geral',
        ativo: true,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUsers(prev => [newUser, ...prev]);
      showToast('Novo colaborador cadastrado com sucesso!', 'success');
      try {
        await dbSaveUser(newUser);
        if (isSupabaseConfigured()) await saveSupabaseUser(newUser);
      } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
      }
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const next = !target.ativo;
    const updated = { ...target, ativo: next };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    showToast(`Colaborador ${target.nome} foi ${next ? 'ativado' : 'desativado'}.`, 'info');
    try {
      await dbSaveUser(updated);
    } catch (err) {
      console.error('Erro ao alterar status de usuário no Firestore:', err);
    }
  };

  // Excluir Administrador ou Usuário do Sistema
  const handleDeleteUser = async (userId: number) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (target.perfil === 'admin') {
      const remainingAdmins = users.filter(u => u.perfil === 'admin' && u.id !== userId);
      if (remainingAdmins.length === 0) {
        showToast('Não é possível excluir o único administrador ativo do sistema.', 'error');
        return;
      }
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`Administrador "${target.nome}" (${target.email}) excluído com sucesso.`, 'info');

    // Se o usuário logado foi excluído, alternar para o outro admin remanescente
    if (currentUser && currentUser.id === userId) {
      const nextAdmin = users.find(u => u.perfil === 'admin' && u.id !== userId);
      if (nextAdmin) {
        setCurrentUser(nextAdmin);
        localStorage.setItem('gestao_saas_user', JSON.stringify(nextAdmin));
      }
    }

    try {
      await dbDeleteUser(userId);
      if (isSupabaseConfigured()) await deleteSupabaseUser(userId);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    }
  };

  // Abrir Novo Ticket
  const handleOpenTicket = async (ticketData: {
    titulo: string;
    categoria: 'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente';
    prioridade: TicketPriority;
    descricao: string;
    atendente_nome?: string;
  }) => {
    const newTicketId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTicket: Ticket = {
      id: newTicketId,
      empresa_id: currentCompany?.id || (currentUser?.empresa_id ? currentUser.empresa_id : 1),
      empresa_nome: currentCompany?.nome_fantasia || currentCompany?.razao_social || 'Empresa Cliente',
      usuario_id: currentUser?.id || 1,
      usuario_nome: currentUser?.nome || 'Usuário',
      atendente_id: 2,
      atendente_nome: ticketData.atendente_nome || 'Equipe de Suporte & Administração SaaS',
      titulo: ticketData.titulo,
      categoria: ticketData.categoria,
      prioridade: ticketData.prioridade,
      status: 'aberto',
      descricao: ticketData.descricao,
      mensagens: [
        {
          id: 1,
          ticket_id: newTicketId,
          usuario_id: currentUser?.id || 1,
          usuario_nome: currentUser?.nome || 'Usuário',
          usuario_perfil: currentUser?.perfil || 'dono',
          mensagem: ticketData.descricao,
          created_at: now
        }
      ],
      created_at: now,
      updated_at: now
    };

    setTickets(prev => [newTicket, ...prev]);
    showToast(`Chamado #${newTicketId} aberto com sucesso!`, 'success');
    try {
      await dbSaveTicket(newTicket);
      if (isSupabaseConfigured()) await saveSupabaseTicket(newTicket);
    } catch (err) {
      console.error('Erro ao abrir ticket:', err);
    }
  };

  // Excluir Chamado
  const handleDeleteTicket = async (ticketId: number) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    showToast(`Chamado #${ticketId} excluído com sucesso.`, 'info');
    try {
      await dbDeleteTicket(ticketId);
      if (isSupabaseConfigured()) await deleteSupabaseTicket(ticketId);
    } catch (err) {
      console.error('Erro ao excluir ticket:', err);
    }
  };

  // Responder a um Ticket
  const handleReplyTicket = async (ticketId: number, messageText: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let updatedTicket: Ticket | null = null;
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMsgId = t.mensagens.length + 1;
        const newMsg = {
          id: newMsgId,
          ticket_id: ticketId,
          usuario_id: currentUser?.id || 1,
          usuario_nome: currentUser?.nome || 'Usuário',
          usuario_perfil: currentUser?.perfil || 'dono',
          mensagem: messageText,
          created_at: now
        };
        updatedTicket = {
          ...t,
          status: t.status === 'aberto' ? 'em_atendimento' : t.status,
          mensagens: [...t.mensagens, newMsg],
          updated_at: now
        };
        return updatedTicket;
      }
      return t;
    }));
    
    showToast('Resposta enviada com sucesso.', 'success');
    if (updatedTicket) {
      try {
        await dbSaveTicket(updatedTicket);
      } catch (err) {
        console.error('Erro ao registrar resposta do ticket no Firestore:', err);
      }
    }
  };

  // Atualizar Status do Ticket (Registrando quem fechou se concluído)
  const handleUpdateTicketStatus = async (ticketId: number, newStatus: TicketStatus) => {
    const nowFormatted = new Date().toLocaleString('pt-BR');
    let updatedTicket: Ticket | null = null;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const isClosing = newStatus === 'fechado' || newStatus === 'resolvido';
        updatedTicket = { 
          ...t, 
          status: newStatus,
          fechado_por_id: isClosing ? (t.fechado_por_id || currentUser?.id) : t.fechado_por_id,
          fechado_por_nome: isClosing ? (t.fechado_por_nome || currentUser?.nome) : t.fechado_por_nome,
          fechado_em: isClosing ? (t.fechado_em || nowFormatted) : t.fechado_em,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        return updatedTicket;
      }
      return t;
    }));
    showToast(`Status do chamado #${ticketId} atualizado para: ${newStatus.toUpperCase()}`, 'info');
    if (updatedTicket) {
      try {
        await dbSaveTicket(updatedTicket);
      } catch (err) {
        console.error('Erro ao atualizar status do ticket no Firestore:', err);
      }
    }
  };

  // Avaliação do Chamado (Feedback / Flashback)
  const handleRateTicket = async (ticketId: number, nota: number, comentario: string) => {
    const nowFormatted = new Date().toLocaleString('pt-BR');
    let updatedTicket: Ticket | null = null;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          avaliacao: {
            nota,
            comentario: comentario.trim() || undefined,
            avaliado_em: nowFormatted,
            avaliado_por_nome: currentUser?.nome || 'Usuário'
          },
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        return updatedTicket;
      }
      return t;
    }));
    showToast('Avaliação e feedback registrados com sucesso! Obrigado.', 'success');
    if (updatedTicket) {
      try {
        await dbSaveTicket(updatedTicket);
      } catch (err) {
        console.error('Erro ao registrar avaliação do ticket no Firestore:', err);
      }
    }
  };

  // Salvar Configurações da Empresa
  const handleSaveCompanySettings = async (updated: Partial<Company>) => {
    if (!currentCompany) return;
    const nextComp = { ...currentCompany, ...updated, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) };
    setCurrentCompany(nextComp);
    setCompanies(prev => prev.map(c => c.id === nextComp.id ? nextComp : c));
    showToast('Identidade visual e dados da empresa salvos com sucesso!', 'success');
    try {
      await dbUpdateCompany(nextComp);
      if (isSupabaseConfigured()) await saveSupabaseCompany(nextComp);
    } catch (err) {
      console.error('Erro ao atualizar dados da empresa:', err);
    }
  };

  // Cadastrar Nova Empresa (Formulário do AuthModal)
  const handleRegisterCompany = (companyData: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    nome_dono: string;
    email_dono: string;
    senha_dono: string;
  }): { success: boolean; message: string } => {
    // Validação de duplicidade de CNPJ
    const cleanNewCnpj = companyData.cnpj.replace(/\D/g, '');
    const exists = companies.some(c => c.cnpj && c.cnpj.replace(/\D/g, '') === cleanNewCnpj);
    if (exists) {
      return { success: false, message: 'Já existe uma empresa cadastrada com este CNPJ.' };
    }

    const newCompId = companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newComp: Company = {
      id: newCompId,
      razao_social: companyData.razao_social,
      nome_fantasia: companyData.nome_fantasia,
      cnpj: companyData.cnpj,
      email: companyData.email,
      telefone: companyData.telefone,
      status: 'aprovada', // Aprovada automaticamente para o proprietário entrar de imediato
      cor_tema: '#2563eb',
      created_at: now,
      updated_at: now
    };

    const newOwnerId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newOwner: User = {
      id: newOwnerId,
      empresa_id: newCompId,
      nome: companyData.nome_dono,
      email: companyData.email_dono,
      senha: companyData.senha_dono,
      cnpj: companyData.cnpj,
      perfil: 'dono',
      cargo: 'Diretor / Fundador',
      departamento: 'Diretoria Geral',
      ativo: true,
      created_at: now
    };

    setCompanies(prev => [newComp, ...prev]);
    setUsers(prev => [newOwner, ...prev]);

    // Persiste no Firestore
    dbUpdateCompany(newComp).catch(err => console.error('Erro ao registrar empresa no Firestore:', err));
    dbSaveUser(newOwner).catch(err => console.error('Erro ao registrar dono no Firestore:', err));

    return { 
      success: true, 
      message: `Empresa "${companyData.nome_fantasia}" cadastrada com sucesso! Você foi redirecionado para o login. Insira sua senha para acessar.` 
    };
  };

  // Redefinição de senha solicitada pelo usuário (código de 15 minutos verificado)
  const handleResetPassword = async (emailOrCnpj: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const cleanSearch = emailOrCnpj.trim().toLowerCase();
    const cleanDigits = emailOrCnpj.replace(/\D/g, '');

    let matchedUser: User | undefined;
    if (cleanDigits.length === 14) {
      const comp = companies.find(c => c.cnpj && c.cnpj.replace(/\D/g, '') === cleanDigits);
      if (comp) {
        matchedUser = users.find(u => u.empresa_id === comp.id && (u.perfil === 'dono' || u.perfil === 'gerente'));
      }
    }

    if (!matchedUser) {
      matchedUser = users.find(u => u.email && u.email.toLowerCase() === cleanSearch);
    }

    if (matchedUser) {
      const updatedUser: User = {
        ...matchedUser,
        senha: newPassword
      };
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      try {
        await dbSaveUser(updatedUser);
      } catch (err) {
        console.error('Erro ao persistir nova senha no Firestore:', err);
      }
    }

    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Faça login com sua nova senha.'
    };
  };

  // Login bem sucedido via AuthModal
  const handleSuccessLogin = (user: User, company: Company | null) => {
    setCurrentUser(user);
    setCurrentCompany(company);
    localStorage.setItem('gestao_saas_user', JSON.stringify(user));
    if (company) {
      localStorage.setItem('gestao_saas_company', JSON.stringify(company));
    } else {
      localStorage.removeItem('gestao_saas_company');
    }
    showToast(`Bem-vindo, ${user.nome}! Conectado como ${user.perfil.toUpperCase()}.`, 'success');
  };

  // Logout do sistema
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentCompany(null);
    localStorage.removeItem('gestao_saas_user');
    localStorage.removeItem('gestao_saas_company');
    showToast('Você saiu do sistema.', 'info');
  };

  const pendingCompaniesCount = companies.filter(c => c.status === 'pendente').length;
  const openTicketsCount = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;
  const lowStockCount = products.filter(p => p.estoque_atual <= p.estoque_minimo).length;

  // Tela Inicial Obrigatória de Autenticação / Cadastro caso não haja usuário conectado
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        {toast && (
          <div className="fixed bottom-5 right-5 z-60 animate-in fade-in slide-in-from-bottom-5">
            <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
              toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
              'bg-slate-900 text-white border-slate-700'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <AuthModal
          isOpen={true}
          isFullScreen={true}
          onClose={() => {}}
          onSuccessLogin={handleSuccessLogin}
          onRegisterCompany={handleRegisterCompany}
          onResetPassword={handleResetPassword}
          companies={companies}
          users={users}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast flutuante */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
            toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        currentCompany={currentCompany}
        onLogout={handleLogout}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Supabase Notice Banner se conectado porém sem tabelas criadas ainda */}
      {isSupabaseConfigured() && supabaseTablesReady === false && !dismissedSupabaseBanner && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 shadow-sm border-b border-emerald-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-900/60 rounded text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Supabase Autenticado
              </span>
              <p className="font-medium text-emerald-50">
                Chave validada com sucesso! Para começar a persistir no Supabase, rode o script no <strong>SQL Editor</strong> do painel.
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  const sqlCode = PHP_CODEBASE.find(f => f.path === 'supabase/schema.sql')?.code || '';
                  navigator.clipboard.writeText(sqlCode);
                  showToast('Script SQL copiado! Cole no SQL Editor do Supabase.', 'success');
                }}
                className="px-3 py-1 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-md transition-colors text-xs shadow-xs"
              >
                Copiar Script SQL
              </button>
              <button
                onClick={() => setDismissedSupabaseBanner(true)}
                className="px-2 py-1 text-emerald-200 hover:text-white"
                title="Fechar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 lg:pb-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser.perfil}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingCompaniesCount}
          lowStockCount={lowStockCount}
          openTicketsCount={openTicketsCount}
        />

        {/* Main Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              currentCompany={currentCompany}
              companies={companies}
              users={users}
              products={products}
              movements={movements}
              tickets={tickets}
              onNavigate={setActiveTab}
              onOpenNewMovement={(type: 'entrada' | 'saida') => {
                setStockModalType(type);
                setActiveTab('estoque');
              }}
              onReplenishProduct={(productId: number) => {
                setPreSelectedProductId(productId);
                setStockModalType('entrada');
                setActiveTab('estoque');
              }}
              onRecordMovement={handleRecordMovement}
            />
          )}

          {activeTab === 'produtos' && (
            <ProductsView
              products={products}
              currentRole={currentUser.perfil}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickMove={handleQuickMoveProduct}
            />
          )}

          {activeTab === 'estoque' && (
            <StockMovementsView
              products={products}
              movements={movements}
              currentUser={currentUser}
              onRecordMovement={handleRecordMovement}
              initialModalType={stockModalType}
              onCloseInitialModal={() => setStockModalType(null)}
              preSelectedProductId={preSelectedProductId}
            />
          )}

          {activeTab === 'funcionarios' && (
            <EmployeesView
              users={users}
              currentRole={currentUser.perfil}
              onSaveUser={handleSaveUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsView
              tickets={
                currentUser.perfil === 'admin'
                  ? tickets
                  : tickets.filter(t => (currentCompany?.id && t.empresa_id === currentCompany.id) || t.usuario_id === currentUser.id)
              }
              currentUser={currentUser}
              currentCompany={currentCompany}
              onOpenTicket={handleOpenTicket}
              onReplyTicket={handleReplyTicket}
              onUpdateStatus={handleUpdateTicketStatus}
              onRateTicket={handleRateTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsView
              currentCompany={currentCompany}
              onSaveSettings={handleSaveCompanySettings}
            />
          )}

          {activeTab === 'admin-empresas' && (
            <AdminCompaniesView
              companies={companies}
              onUpdateStatus={handleUpdateCompanyStatus}
              products={products}
              tickets={tickets}
              onReplyTicket={handleReplyTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              currentUser={currentUser}
              users={users}
              onSwitchAdmin={(newAdmin) => {
                setCurrentUser(newAdmin);
                localStorage.setItem('gestao_saas_user', JSON.stringify(newAdmin));
              }}
              onDeleteAdmin={handleDeleteUser}
              onSaveUser={handleSaveUser}
              onNavigateToTickets={() => setActiveTab('tickets')}
              onClearAllTestData={handleClearAllTestData}
            />
          )}

          {activeTab === 'codigo' && currentUser.perfil === 'admin' && (
            <PhpBackendViewer />
          )}
          {activeTab === 'codigo' && currentUser.perfil !== 'admin' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold">
                !
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Acesso Restrito</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                A visualização e exportação da infraestrutura técnica do back-end é reservada exclusivamente para a equipe de desenvolvimento e administração global da plataforma SaaS.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Voltar ao Dashboard da Empresa
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Autenticação / Cadastro de Empresa / Recuperação de Senha */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        onRegisterCompany={handleRegisterCompany}
        onResetPassword={handleResetPassword}
        companies={companies}
        users={users}
      />

      {/* Menu de Navegação Lateral Móvel (Slide-over Drawer) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentUser.perfil}
        currentUser={currentUser}
        currentCompany={currentCompany}
        pendingCount={pendingCompaniesCount}
        lowStockCount={lowStockCount}
        openTicketsCount={openTicketsCount}
        onLogout={() => setIsAuthModalOpen(true)}
      />

      {/* Barra de Navegação Rápida Inferior para Celular */}
      <MobileBottomBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentUser.perfil}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        lowStockCount={lowStockCount}
        openTicketsCount={openTicketsCount}
      />
    </div>
  );
}
