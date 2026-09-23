import { Company, User, Product, StockMovement, Ticket } from './types';

// Empresa e Usuários Iniciais: VAZIO
// O sistema inicia totalmente limpo sem nenhum dado pré-existente
export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_USERS: User[] = [];

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
