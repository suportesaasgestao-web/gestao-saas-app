import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Company, User, Product, StockMovement, Ticket, CompanyStatus } from '../types';
import { 
  MOCK_COMPANIES, 
  MOCK_USERS, 
  MOCK_PRODUCTS, 
  MOCK_MOVEMENTS, 
  MOCK_TICKETS 
} from '../mockData';

// Inicializar Firestore (banco limpo sem injeção de dados falsos)
export async function initializeFirestoreDatabase(): Promise<void> {
  // O banco permanece 100% limpo até que o usuário cadastre sua própria empresa
}

// Listeners em tempo real
export function subscribeCompanies(callback: (companies: Company[]) => void) {
  return onSnapshot(collection(db, 'companies'), (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(d => d.data() as Company);
      data.sort((a, b) => a.id - b.id);
      callback(data);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('Erro na escuta de empresas:', err);
  });
}

export function subscribeUsers(callback: (users: User[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(d => d.data() as User);
      data.sort((a, b) => a.id - b.id);
      callback(data);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('Erro na escuta de usuários:', err);
  });
}

export function subscribeProducts(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'products'), (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(d => d.data() as Product);
      data.sort((a, b) => b.id - a.id);
      callback(data);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('Erro na escuta de produtos:', err);
  });
}

export function subscribeMovements(callback: (movements: StockMovement[]) => void) {
  return onSnapshot(collection(db, 'movements'), (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(d => d.data() as StockMovement);
      data.sort((a, b) => b.id - a.id);
      callback(data);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('Erro na escuta de estoque:', err);
  });
}

export function subscribeTickets(callback: (tickets: Ticket[]) => void) {
  return onSnapshot(collection(db, 'tickets'), (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs.map(d => d.data() as Ticket);
      data.sort((a, b) => b.id - a.id);
      callback(data);
    } else {
      callback([]);
    }
  }, (err) => {
    console.error('Erro na escuta de tickets:', err);
  });
}

// Operações de persistência no Firestore
export async function dbSaveProduct(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', String(product.id)), product, { merge: true });
}

export async function dbDeleteProduct(productId: number): Promise<void> {
  await deleteDoc(doc(db, 'products', String(productId)));
}

export async function dbSaveStockMovement(movement: StockMovement, updatedProduct: Product): Promise<void> {
  await setDoc(doc(db, 'movements', String(movement.id)), movement);
  await setDoc(doc(db, 'products', String(updatedProduct.id)), updatedProduct, { merge: true });
}

export async function dbSaveUser(user: User): Promise<void> {
  await setDoc(doc(db, 'users', String(user.id)), user, { merge: true });
}

export async function dbGetUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(item => item.data() as User);
}

export async function dbUpdateCompany(company: Company): Promise<void> {
  await setDoc(doc(db, 'companies', String(company.id)), company, { merge: true });
}

export async function dbUpdateCompanyStatus(companyId: number, status: CompanyStatus): Promise<void> {
  await updateDoc(doc(db, 'companies', String(companyId)), {
    status,
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
}

export async function dbSaveTicket(ticket: Ticket): Promise<void> {
  await setDoc(doc(db, 'tickets', String(ticket.id)), ticket, { merge: true });
}
