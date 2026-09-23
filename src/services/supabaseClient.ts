import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Company, User, Product, StockMovement, Ticket } from '../types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Normaliza removendo /rest/v1 ou barras no final caso o usuário tenha colado a URL da API REST
const supabaseUrl = rawUrl
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20
  );
};

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
};

// ==========================================
// FUNÇÕES DE SINCRONIZAÇÃO COM SUPABASE
// ==========================================

// Helper para tratar erros do PostgREST sem disparar console.error quando tabelas ainda não foram criadas
function handleSupabaseError(context: string, error: any) {
  if (error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
    // Tabela ainda não foi criada no Supabase pelo usuário - comportamento esperado antes de rodar o schema.sql
    console.info(`[Supabase Informação] Tabela ainda não inicializada (${context}). Execute o script SQL no Supabase.`);
    return;
  }
  console.warn(`[Supabase Aviso] ${context}:`, error?.message || error);
}

export async function checkSupabaseTablesExist(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('empresas').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return false;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchSupabaseCompanies(): Promise<Company[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('empresas').select('*').order('id', { ascending: true });
  if (error) {
    handleSupabaseError('empresas', error);
    return null;
  }
  return data as Company[];
}

export async function saveSupabaseCompany(company: Partial<Company>): Promise<Company | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('empresas').upsert(company).select().single();
  if (error) {
    handleSupabaseError('salvar empresa', error);
    return null;
  }
  return data as Company;
}

export async function fetchSupabaseUsers(): Promise<User[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('usuarios').select('*').order('id', { ascending: true });
  if (error) {
    handleSupabaseError('usuarios', error);
    return null;
  }
  return data as User[];
}

export async function saveSupabaseUser(user: Partial<User>): Promise<User | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('usuarios').upsert(user).select().single();
  if (error) {
    handleSupabaseError('salvar usuario', error);
    return null;
  }
  return data as User;
}

export async function fetchSupabaseProducts(): Promise<Product[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('produtos').select('*').order('id', { ascending: true });
  if (error) {
    handleSupabaseError('produtos', error);
    return null;
  }
  return data as Product[];
}

export async function saveSupabaseProduct(prod: Partial<Product>): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('produtos').upsert(prod).select().single();
  if (error) {
    handleSupabaseError('salvar produto', error);
    return null;
  }
  return data as Product;
}

export async function saveSupabaseStockMovement(mov: Partial<StockMovement>, updatedProduct?: Product): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error: movError } = await sb.from('movimentacoes_estoque').insert(mov);
  if (movError) {
    handleSupabaseError('inserir movimentacao', movError);
    return false;
  }
  if (updatedProduct) {
    await sb.from('produtos').update({
      estoque_atual: updatedProduct.estoque_atual,
      updated_at: new Date().toISOString()
    }).eq('id', updatedProduct.id);
  }
  return true;
}

export async function fetchSupabaseTickets(): Promise<Ticket[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('tickets').select('*').order('id', { ascending: false });
  if (error) {
    handleSupabaseError('tickets', error);
    return null;
  }
  return data as Ticket[];
}

export async function saveSupabaseTicket(ticket: Partial<Ticket>): Promise<Ticket | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('tickets').upsert(ticket).select().single();
  if (error) {
    handleSupabaseError('salvar ticket', error);
    return null;
  }
  return data as Ticket;
}

export async function deleteSupabaseTicket(ticketId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('tickets').delete().eq('id', ticketId);
  if (error) {
    handleSupabaseError('excluir ticket', error);
    return false;
  }
  return true;
}

export async function deleteSupabaseUser(userId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('usuarios').delete().eq('id', userId);
  if (error) {
    handleSupabaseError('excluir usuario', error);
    return false;
  }
  return true;
}
