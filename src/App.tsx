import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  MOCK_COMPANIES, 
  MOCK_USERS, 
  MOCK_PRODUCTS, 
  MOCK_MOVEMENTS, 
  MOCK_TICKETS 
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
  dbGetUsers,
  dbUpdateCompany,
  dbUpdateCompanyStatus,
  dbSaveTicket
} from './services/firestoreService';

const PRIMARY_ADMIN_EMAIL = 'messiasmdesa463@gmail.com';

export default function App() {
  // Estado das Coleções de Dados do Sistema
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [movements, setMovements] = useState<StockMovement[]>(MOCK_MOVEMENTS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Sessão do Usuário Conectado (restaurada de sessão ou null se vazio)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gestao_saas_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [currentCompany, setCurrentCompany] = useState<Company | null>(() => {
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
  const [language, setLanguage] = useState<'pt-BR' | 'en' | 'es'>(() => {
    const saved = localStorage.getItem('gestao_saas_language');
    return saved === 'en' || saved === 'es' ? saved : 'pt-BR';
  });

  const handleLanguageChange = (nextLanguage: 'pt-BR' | 'en' | 'es') => {
    setLanguage(nextLanguage);
    localStorage.setItem('gestao_saas_language', nextLanguage);
    showToast('Idioma atualizado com sucesso.', 'success');
  };

  // Gatilhos de Movimentação Rápida de Estoque
  const [stockModalType, setStockModalType] = useState<'entrada' | 'saida' | null>(null);
  const [preSelectedProductId, setPreSelectedProductId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const primaryAdminProfilePromise = React.useRef<Promise<User | null> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const ensurePrimaryAdminProfile = async (firebaseUser: FirebaseUser, knownUsers: User[]): Promise<User | null> => {
    if (firebaseUser.email?.toLowerCase() !== PRIMARY_ADMIN_EMAIL) return null;
    if (primaryAdminProfilePromise.current) return primaryAdminProfilePromise.current;

    primaryAdminProfilePromise.current = (async () => {
      const persistedUsers = await dbGetUsers();
      const allKnownUsers = [...knownUsers, ...persistedUsers.filter(persisted => !knownUsers.some(known => known.id === persisted.id))];
      const existing = allKnownUsers.find(user => user.uid === firebaseUser.uid || user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL);
      const adminProfile: User = {
        id: existing?.id ?? (allKnownUsers.length > 0 ? Math.max(...allKnownUsers.map(user => user.id)) + 1 : 1),
        empresa_id: null,
        nome: existing?.nome || firebaseUser.displayName || 'Administrador principal',
        email: PRIMARY_ADMIN_EMAIL,
        uid: firebaseUser.uid,
        perfil: 'admin',
        cargo: existing?.cargo || 'Administrador principal',
        departamento: existing?.departamento || 'Administração',
        ativo: true,
        created_at: existing?.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      await dbSaveUser(adminProfile);
      setUsers(previous => {
        const withoutDuplicate = previous.filter(user => user.id !== adminProfile.id && user.uid !== firebaseUser.uid && user.email.toLowerCase() !== PRIMARY_ADMIN_EMAIL);
        return [...withoutDuplicate, adminProfile];
      });
      return adminProfile;
    })().catch(error => {
      primaryAdminProfilePromise.current = null;
      throw error;
    });

    return primaryAdminProfilePromise.current;
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
          // Atualiza a empresa corrente ativa com os dados sincronizados
          setCurrentCompany(prev => {
            if (!prev) return null;
            return data.find(c => c.id === prev.id) || prev;
          });
        });

        unsubUsers = subscribeUsers((data) => {
          setUsers(data);
          setCurrentUser(prev => {
            if (!prev) return null;
            return data.find(u => u.id === prev.id) || prev;
          });
        });

        unsubProducts = subscribeProducts((data) => setProducts(data));
        unsubMovements = subscribeMovements((data) => setMovements(data));
        unsubTickets = subscribeTickets((data) => setTickets(data));
      } catch (err) {
        console.warn('Erro ao conectar listeners Firestore:', err);
      }
    };

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        void (async () => {
          await setupFirestore();
          if (firebaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL) {
            const adminProfile = await ensurePrimaryAdminProfile(firebaseUser, users);
            if (adminProfile) {
              setCurrentUser(adminProfile);
              setCurrentCompany(null);
              localStorage.setItem('gestao_saas_user', JSON.stringify(adminProfile));
              localStorage.removeItem('gestao_saas_company');
            }
          }
        })().catch(error => {
          console.error('Erro ao restaurar perfil autenticado:', error);
        });
      }
    });

    return () => {
      unsubCompanies?.();
      unsubUsers?.();
      unsubProducts?.();
      unsubMovements?.();
      unsubTickets?.();
      unsubAuth();
    };
  }, []);

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
      showToast('Produto atualizado com sucesso no Firebase!', 'success');
      
      try {
        await dbSaveProduct(updated);
      } catch (err) {
        console.error('Erro ao salvar produto no Firestore:', err);
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
      showToast('Produto cadastrado com sucesso no Firebase!', 'success');
      
      try {
        await dbSaveProduct(newProd);
      } catch (err) {
        console.error('Erro ao cadastrar produto no Firestore:', err);
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
    showToast(`Movimentação de ${movement.tipo.toUpperCase()} persistida no Firebase! Novo saldo: ${saldoPosterior}`, 'success');

    // Persistência assíncrona no Firestore
    dbSaveStockMovement(newMov, updatedProduct).catch(err => {
      console.error('Erro ao registrar movimentação no Firestore:', err);
    });

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
      showToast('Dados do colaborador atualizados no Firebase!', 'success');
      try {
        await dbSaveUser(updated);
      } catch (err) {
        console.error('Erro ao atualizar usuário no Firestore:', err);
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
      showToast('Novo colaborador cadastrado com sucesso no Firebase!', 'success');
      try {
        await dbSaveUser(newUser);
      } catch (err) {
        console.error('Erro ao cadastrar usuário no Firestore:', err);
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
      empresa_id: currentCompany?.id || 1,
      empresa_nome: currentCompany?.nome_fantasia || 'Empresa',
      usuario_id: currentUser?.id || 1,
      usuario_nome: currentUser?.nome || 'Usuário',
      atendente_id: 2,
      atendente_nome: ticketData.atendente_nome || 'Mariana Costa (Suporte Técnico Especializado)',
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
    showToast(`Chamado #${newTicketId} aberto com sucesso no Firebase!`, 'success');
    try {
      await dbSaveTicket(newTicket);
    } catch (err) {
      console.error('Erro ao abrir ticket no Firestore:', err);
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
    showToast('Identidade visual e dados da empresa salvos no Firebase!', 'success');
    try {
      await dbUpdateCompany(nextComp);
    } catch (err) {
      console.error('Erro ao atualizar dados da empresa no Firestore:', err);
    }
  };

  // Cadastrar Nova Empresa (Formulário do AuthModal)
  const handleRegisterCompany = async (companyData: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    nome_dono: string;
    email_dono: string;
    senha_dono: string;
  }): Promise<{ success: boolean; message: string }> => {
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
      status: 'pendente',
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
      cnpj: companyData.cnpj,
      uid: '',
      perfil: companyData.email_dono.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL ? 'admin' : 'dono',
      cargo: 'Diretor / Fundador',
      departamento: 'Diretoria Geral',
      ativo: true,
      created_at: now
    };

    try {
      const credential = await createUserWithEmailAndPassword(auth, companyData.email_dono, companyData.senha_dono);
      const authenticatedOwner = { ...newOwner, uid: credential.user.uid };
      setCompanies(prev => [newComp, ...prev]);
      setUsers(prev => [authenticatedOwner, ...prev]);
      await dbUpdateCompany(newComp);
      await dbSaveUser(authenticatedOwner);
      await signOut(auth);
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Não foi possível criar a conta.' };
    }

    return { 
      success: true, 
      message: `Empresa "${companyData.nome_fantasia}" cadastrada com sucesso! Você foi redirecionado para o login. Insira sua senha para acessar.` 
    };
  };

  // Redefinição de senha solicitada pelo usuário (código de 15 minutos verificado)
  const handleResetPassword = async (emailOrCnpj: string): Promise<{ success: boolean; message: string }> => {
    const email = emailOrCnpj.trim();
    if (!email.includes('@')) {
      return { success: false, message: 'Informe o e-mail cadastrado para receber o link seguro de redefinição.' };
    }
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Enviamos um link seguro de redefinição para seu e-mail.' };
  };

  const handleAuthenticate = async (identifier: string, password: string): Promise<{ user: User; company: Company | null }> => {
    if (!identifier.includes('@')) {
      throw new Error('Use o e-mail cadastrado para entrar. O login por CNPJ será disponibilizado após a autenticação centralizada.');
    }
    const credential = await signInWithEmailAndPassword(auth, identifier, password);
    const storedUser = users.find(item => item.uid === credential.user.uid || item.email.toLowerCase() === credential.user.email?.toLowerCase());
    const user = credential.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL
      ? await ensurePrimaryAdminProfile(credential.user, users)
      : storedUser;
    const normalizedUser = user && credential.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL
      ? { ...user, uid: credential.user.uid, perfil: 'admin' as UserRole }
      : user;
    if (!normalizedUser) {
      await signOut(auth);
      throw new Error('Conta autenticada, mas perfil de acesso não encontrado.');
    }
    const company = normalizedUser.empresa_id ? companies.find(item => item.id === normalizedUser.empresa_id) || null : null;
    if (company && (company.status === 'rejeitada' || company.status === 'suspensa')) {
      await signOut(auth);
      throw new Error(`Acesso bloqueado: o status da empresa é ${company.status.toUpperCase()}.`);
    }
    return { user: normalizedUser, company };
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
    signOut(auth).catch(err => console.error('Erro ao encerrar sessão Firebase:', err));
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
          onAuthenticate={handleAuthenticate}
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
        onSwitchUser={handleSwitchRole}
        onOpenCodeExplorer={() => setActiveTab('codigo')}
        onLogout={handleLogout}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Faixa de Status do Banco de Dados Firebase */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Banco de Dados Ativo:</span>
            <span className="text-amber-300 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 text-[11px]">
              Firebase Cloud Firestore
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              • Sincronização em tempo real & Multi-Tenant persistente
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-medium text-[11px]">Conectado</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 lg:pb-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser.perfil}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingCompaniesCount}
          lowStockCount={lowStockCount}
          openTicketsCount={openTicketsCount}
          language={language}
        />

        {/* Main Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              currentCompany={currentCompany}
              companies={companies}
              products={products}
              movements={movements}
              tickets={tickets}
              onNavigate={setActiveTab}
              onOpenNewMovement={(type: 'entrada' | 'saida') => {
                setStockModalType(type);
                setActiveTab('estoque');
              }}
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
              tickets={tickets}
              currentUser={currentUser}
              onOpenTicket={handleOpenTicket}
              onReplyTicket={handleReplyTicket}
              onUpdateStatus={handleUpdateTicketStatus}
              onRateTicket={handleRateTicket}
            />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsView
              currentCompany={currentCompany}
              onSaveSettings={handleSaveCompanySettings}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          )}

          {activeTab === 'admin-empresas' && (
            <AdminCompaniesView
              companies={companies}
              onUpdateStatus={handleUpdateCompanyStatus}
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
        onAuthenticate={handleAuthenticate}
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
