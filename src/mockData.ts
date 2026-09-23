import { Company, User, Product, StockMovement, Ticket } from './types';

// Os 2 Administradores Globais do SaaS
export const ADMIN_1: User = {
  id: 1,
  empresa_id: 0,
  nome: 'Messias (Admin Principal)',
  email: 'messiasmdesa463@gmail.com',
  senha: 'admin',
  perfil: 'admin',
  cargo: 'Super Administrador 1',
  departamento: 'Diretoria Executiva SaaS',
  ativo: true,
  created_at: '2025-01-01 00:00:00'
};

export const ADMIN_2: User = {
  id: 2,
  empresa_id: 0,
  nome: 'Administrador SaaS 2',
  email: 'admin@saas.com.br',
  senha: 'admin',
  perfil: 'admin',
  cargo: 'Super Administrador 2',
  departamento: 'Suporte Técnico & Atendimento',
  ativo: true,
  created_at: '2025-01-01 00:00:00'
};

export const DEFAULT_ADMIN_USER: User = ADMIN_1;

export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_USERS: User[] = [ADMIN_1, ADMIN_2];

// Catálogo de Produtos Inicial: VAZIO
// Novos produtos adicionados pelo usuário serão salvos e exibidos dinamicamente
export const INITIAL_PRODUCTS: Product[] = [];

// Histórico de Movimentações de Estoque Inicial: VAZIO
export const INITIAL_MOVEMENTS: StockMovement[] = [];

// Central de Tickets de Suporte Inicial: VAZIO
export const INITIAL_TICKETS: Ticket[] = [];

// Aliases para manter compatibilidade com componentes existentes
export const MOCK_COMPANIES = INITIAL_COMPANIES;
export const MOCK_USERS = INITIAL_USERS;
export const MOCK_PRODUCTS = INITIAL_PRODUCTS;
export const MOCK_MOVEMENTS = INITIAL_MOVEMENTS;
export const MOCK_TICKETS = INITIAL_TICKETS;
