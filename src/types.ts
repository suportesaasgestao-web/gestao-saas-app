export type UserRole = 'admin' | 'dono' | 'gerente' | 'funcionario';

export type CompanyStatus = 'pendente' | 'aprovada' | 'rejeitada' | 'suspensa';

export interface Company {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  status: CompanyStatus;
  logo_url?: string;
  banner_url?: string;
  cor_tema?: string;
  created_at: string;
  updated_at?: string;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'admin-empresas' 
  | 'produtos' 
  | 'estoque' 
  | 'funcionarios' 
  | 'tickets' 
  | 'configuracoes' 
  | 'codigo';

export interface User {
  id: number;
  empresa_id: number | null;
  nome: string;
  email: string;
  senha?: string;
  cnpj?: string;
  cargo?: string;
  departamento?: string;
  perfil: UserRole;
  ativo: boolean;
  ultimo_acesso?: string;
  created_at: string;
}

export interface Product {
  id: number;
  empresa_id: number;
  nome: string;
  sku: string;
  codigo_barras?: string;
  categoria: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  unidade_medida: string; // UN, KG, CX, LT, etc.
  localizacao?: string;
  foto_url?: string;
  ativo: boolean;
  created_at: string;
}

export type MovementType = 'entrada' | 'saida' | 'ajuste' | 'devolucao';

export interface StockMovement {
  id: number;
  empresa_id: number;
  produto_id: number;
  produto_nome?: string;
  produto_sku?: string;
  tipo: MovementType;
  quantidade: number;
  saldo_anterior: number;
  saldo_posterior: number;
  motivo: string;
  documento_ref?: string; // NF, Pedido, etc.
  usuario_id: number;
  usuario_nome?: string;
  valor_unitario?: number;
  created_at: string;
}

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido' | 'fechado';

export interface TicketMessage {
  id: number;
  ticket_id: number;
  usuario_id: number;
  usuario_nome: string;
  usuario_perfil: UserRole;
  mensagem: string;
  created_at: string;
}

export interface TicketEvaluation {
  nota: number; // 1 a 5 estrelas
  comentario?: string;
  avaliado_em: string;
  avaliado_por_nome: string;
}

export interface Ticket {
  id: number;
  empresa_id: number;
  empresa_nome?: string;
  usuario_id: number;
  usuario_nome: string;
  atendente_id?: number;
  atendente_nome?: string;
  fechado_por_id?: number;
  fechado_por_nome?: string;
  fechado_em?: string;
  avaliacao?: TicketEvaluation;
  titulo: string;
  categoria: 'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente';
  prioridade: TicketPriority;
  status: TicketStatus;
  descricao: string;
  mensagens: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export interface PasswordResetToken {
  id: number;
  email: string;
  token: string;
  expira_em: string;
  usado: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalProdutos: number;
  valorTotalEstoque: number;
  itensEstoqueCritico: number;
  movimentacoesMes: number;
  ticketsAbertos: number;
  totalEmpresas?: number;
  empresasPendentes?: number;
  totalUsuarios?: number;
}
