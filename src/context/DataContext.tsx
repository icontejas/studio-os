import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  Client,
  Project,
  Shoot,
  Quotation,
  Invoice,
  Payment,
  Expense,
  Task,
  Deliverable,
  FollowUp,
  NotificationItem,
  Service,
  PackageItem,
  ProjectMessage
} from '../types/database';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_SHOOTS,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_TASKS,
  INITIAL_DELIVERABLES,
  INITIAL_FOLLOWUPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_MESSAGES
} from '../lib/mockData';

interface DataContextType {
  clients: Client[];
  projects: Project[];
  shoots: Shoot[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  tasks: Task[];
  deliverables: Deliverable[];
  followups: FollowUp[];
  notifications: NotificationItem[];
  services: Service[];
  packages: PackageItem[];
  messages: ProjectMessage[];
  loadingData: boolean;

  // CRUD
  addClient: (c: Omit<Client, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'portal_token'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addProject: (p: Omit<Project, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addShoot: (s: Omit<Shoot, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<Shoot>;
  updateShoot: (id: string, updates: Partial<Shoot>) => Promise<void>;
  deleteShoot: (id: string) => Promise<void>;

  addQuotation: (q: Omit<Quotation, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<Quotation>;
  updateQuotation: (id: string, updates: Partial<Quotation>) => Promise<void>;
  acceptQuotation: (id: string) => Promise<void>;
  convertQuotationToInvoice: (quotationId: string) => Promise<Invoice | null>;
  deleteQuotation: (id: string) => Promise<void>;

  addInvoice: (inv: Omit<Invoice, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  recordPayment: (payment: Omit<Payment, 'id' | 'business_id' | 'created_at'>) => Promise<void>;

  addExpense: (e: Omit<Expense, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addTask: (t: Omit<Task, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addDeliverable: (d: Omit<Deliverable, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDeliverableStatus: (id: string, status: Deliverable['status']) => Promise<void>;
  requestDeliverableRevision: (id: string, revisionNotes: string) => Promise<void>;

  addFollowUp: (f: Omit<FollowUp, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  dismissFollowUp: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addMessage: (msg: Omit<ProjectMessage, 'id' | 'created_at'>) => Promise<void>;

  // Financial aggregates
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  activeShootsCount: number;

  clearAllData: () => void;
  migrateLegacyData: () => boolean;
  refreshFromSupabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business, user } = useAuth();
  const [loadingData, setLoadingData] = useState(false);

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('studioos_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('studioos_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [shoots, setShoots] = useState<Shoot[]>(() => {
    const saved = localStorage.getItem('studioos_shoots');
    return saved ? JSON.parse(saved) : INITIAL_SHOOTS;
  });
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('studioos_quotations');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('studioos_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('studioos_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('studioos_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('studioos_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    const saved = localStorage.getItem('studioos_deliverables');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERABLES;
  });
  const [followups, setFollowups] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('studioos_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('studioos_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('studioos_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });
  const [packages, setPackages] = useState<PackageItem[]>(() => {
    const saved = localStorage.getItem('studioos_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });
  const [messages, setMessages] = useState<ProjectMessage[]>(() => {
    const saved = localStorage.getItem('studioos_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Fetch from Supabase when user is authenticated with Supabase
  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    setLoadingData(true);
    try {
      const bId = business?.id;

      const [
        clientsRes,
        projectsRes,
        shootsRes,
        quotesRes,
        invoicesRes,
        paymentsRes,
        expensesRes,
        tasksRes,
        deliverablesRes,
        notificationsRes,
        servicesRes,
        packagesRes
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('shoots').select('*').order('shoot_date', { ascending: true }),
        supabase.from('quotations').select('*, quotation_items(*)').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*, invoice_items(*)').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('deliverables').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('name'),
        supabase.from('packages').select('*').order('price')
      ]);

      if (clientsRes.data && clientsRes.data.length > 0) setClients(clientsRes.data);
      if (projectsRes.data && projectsRes.data.length > 0) setProjects(projectsRes.data);
      if (shootsRes.data && shootsRes.data.length > 0) setShoots(shootsRes.data);
      if (quotesRes.data && quotesRes.data.length > 0) {
        setQuotations(quotesRes.data.map((q: any) => ({ ...q, items: q.quotation_items || [] })));
      }
      if (invoicesRes.data && invoicesRes.data.length > 0) {
        setInvoices(invoicesRes.data.map((inv: any) => ({ ...inv, items: inv.invoice_items || [] })));
      }
      if (paymentsRes.data && paymentsRes.data.length > 0) setPayments(paymentsRes.data);
      if (expensesRes.data && expensesRes.data.length > 0) setExpenses(expensesRes.data);
      if (tasksRes.data && tasksRes.data.length > 0) setTasks(tasksRes.data);
      if (deliverablesRes.data && deliverablesRes.data.length > 0) setDeliverables(deliverablesRes.data);
      if (notificationsRes.data && notificationsRes.data.length > 0) setNotifications(notificationsRes.data);
      if (servicesRes.data && servicesRes.data.length > 0) setServices(servicesRes.data);
      if (packagesRes.data && packagesRes.data.length > 0) setPackages(packagesRes.data);
    } catch (err) {
      console.warn('Supabase fetch error, fallback active:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      refreshFromSupabase();
    }
  }, [user]);

  // Clients
  const addClient = async (c: Omit<Client, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'portal_token'>): Promise<Client> => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    const portalToken = `portal-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...c, business_id: bId, portal_token: portalToken }])
          .select()
          .single();

        if (!error && data) {
          setClients(prev => [data, ...prev]);
          return data;
        }
      } catch (e) {
        console.warn('Supabase insert failed:', e);
      }
    }

    const newClient: Client = {
      ...c,
      id: `c-${Date.now()}`,
      business_id: bId,
      portal_token: portalToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').update(updates).eq('id', id);
    }
  };

  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').delete().eq('id', id);
    }
  };

  // Projects
  const addProject = async (p: Omit<Project, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([{ ...p, business_id: bId }])
          .select()
          .single();

        if (!error && data) {
          setProjects(prev => [data, ...prev]);
          return data;
        }
      } catch (e) {
        console.warn('Supabase project insert error:', e);
      }
    }

    const newProj: Project = {
      ...p,
      id: `p-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').update(updates).eq('id', id);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').delete().eq('id', id);
    }
  };

  // Shoots
  const addShoot = async (s: Omit<Shoot, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Shoot> => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('shoots')
          .insert([{ ...s, business_id: bId }])
          .select()
          .single();

        if (!error && data) {
          setShoots(prev => [data, ...prev]);
          return data;
        }
      } catch (e) {
        console.warn('Supabase shoot insert error:', e);
      }
    }

    const newShoot: Shoot = {
      ...s,
      id: `sh-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setShoots(prev => [newShoot, ...prev]);
    return newShoot;
  };

  const updateShoot = async (id: string, updates: Partial<Shoot>) => {
    setShoots(prev => prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('shoots').update(updates).eq('id', id);
    }
  };

  const deleteShoot = async (id: string) => {
    setShoots(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('shoots').delete().eq('id', id);
    }
  };

  // Quotations
  const addQuotation = async (q: Omit<Quotation, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Quotation> => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      try {
        const { items: quoteItems, ...qFields } = q as any;
        const { data: qData, error } = await supabase
          .from('quotations')
          .insert([{ ...qFields, business_id: bId }])
          .select()
          .single();

        if (!error && qData) {
          if (quoteItems && quoteItems.length > 0) {
            const formattedItems = quoteItems.map((it: any) => ({
              quotation_id: qData.id,
              description: it.description,
              quantity: it.quantity,
              rate: it.rate,
              amount: it.amount
            }));
            await supabase.from('quotation_items').insert(formattedItems);
          }
          const completeQ = { ...qData, items: quoteItems || [] };
          setQuotations(prev => [completeQ, ...prev]);
          return completeQ;
        }
      } catch (e) {
        console.warn('Supabase quotation insert error:', e);
      }
    }

    const newQ: Quotation = {
      ...q,
      id: `q-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setQuotations(prev => [newQ, ...prev]);
    return newQ;
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('quotations').update(updates).eq('id', id);
    }
  };

  const acceptQuotation = async (id: string) => {
    const now = new Date().toISOString();
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'ACCEPTED', accepted_at: now, updated_at: now } : q));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('quotations').update({ status: 'ACCEPTED', accepted_at: now }).eq('id', id);
    }
  };

  const convertQuotationToInvoice = async (quotationId: string): Promise<Invoice | null> => {
    const q = quotations.find(item => item.id === quotationId);
    if (!q) return null;

    const nextInvNum = `INV-${100 + invoices.length + 1}`;
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: invData, error } = await supabase
          .from('invoices')
          .insert([{
            business_id: bId,
            client_id: q.client_id,
            project_id: q.project_id,
            quotation_id: q.id,
            invoice_number: nextInvNum,
            status: 'SENT',
            subtotal: q.subtotal,
            discount: q.discount,
            tax: q.tax,
            total: q.total,
            paid_amount: 0,
            balance: q.total,
            due_date: dueDate.toISOString().split('T')[0],
            payment_terms: q.payment_terms || 'Payment due within 7 days of invoice date.'
          }])
          .select()
          .single();

        if (!error && invData) {
          if (q.items && q.items.length > 0) {
            const formattedItems = q.items.map(it => ({
              invoice_id: invData.id,
              description: it.description,
              quantity: it.quantity,
              rate: it.rate,
              amount: it.amount
            }));
            await supabase.from('invoice_items').insert(formattedItems);
          }
          const completeInv = { ...invData, items: q.items || [] };
          setInvoices(prev => [completeInv, ...prev]);
          return completeInv;
        }
      } catch (e) {
        console.warn('Supabase invoice convert error:', e);
      }
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      business_id: bId,
      client_id: q.client_id,
      project_id: q.project_id,
      quotation_id: q.id,
      invoice_number: nextInvNum,
      status: 'SENT',
      subtotal: q.subtotal,
      discount: q.discount,
      tax: q.tax,
      total: q.total,
      paid_amount: 0,
      balance: q.total,
      due_date: dueDate.toISOString().split('T')[0],
      payment_terms: q.payment_terms || 'Payment due within 7 days of invoice date.',
      notes: q.notes || `Generated from ${q.quotation_number}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: q.items ? q.items.map(item => ({
        id: `ii-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        invoice_id: `inv-${Date.now()}`,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      })) : []
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const deleteQuotation = async (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('quotations').delete().eq('id', id);
    }
  };

  // Invoices & Payments
  const addInvoice = async (inv: Omit<Invoice, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Invoice> => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      try {
        const { items: invItems, ...invFields } = inv as any;
        const { data: invData, error } = await supabase
          .from('invoices')
          .insert([{ ...invFields, business_id: bId }])
          .select()
          .single();

        if (!error && invData) {
          if (invItems && invItems.length > 0) {
            const formatted = invItems.map((it: any) => ({
              invoice_id: invData.id,
              description: it.description,
              quantity: it.quantity,
              rate: it.rate,
              amount: it.amount
            }));
            await supabase.from('invoice_items').insert(formatted);
          }
          const complete = { ...invData, items: invItems || [] };
          setInvoices(prev => [complete, ...prev]);
          return complete;
        }
      } catch (e) {
        console.warn('Supabase invoice insert error:', e);
      }
    }

    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      business_id: bId,
      balance: inv.total - (inv.paid_amount || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const total = updates.total !== undefined ? updates.total : inv.total;
        const paid_amount = updates.paid_amount !== undefined ? updates.paid_amount : inv.paid_amount;
        const balance = Math.max(0, total - paid_amount);
        let status = updates.status || inv.status;
        if (balance === 0) status = 'PAID';
        else if (paid_amount > 0) status = 'PARTIALLY_PAID';

        return { ...inv, ...updates, total, paid_amount, balance, status, updated_at: new Date().toISOString() };
      }
      return inv;
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('invoices').update(updates).eq('id', id);
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('invoices').delete().eq('id', id);
    }
  };

  const recordPayment = async (paymentData: Omit<Payment, 'id' | 'business_id' | 'created_at'>) => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([{ ...paymentData, business_id: bId }])
          .select()
          .single();

        if (!error && data) {
          setPayments(prev => [data, ...prev]);
          refreshFromSupabase();
          return;
        }
      } catch (e) {
        console.warn('Supabase payment insert error:', e);
      }
    }

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);

    setInvoices(prev => prev.map(inv => {
      if (inv.id === paymentData.invoice_id) {
        const newPaid = (inv.paid_amount || 0) + paymentData.amount;
        const newBalance = Math.max(0, inv.total - newPaid);
        const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

        return {
          ...inv,
          paid_amount: newPaid,
          balance: newBalance,
          status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return inv;
    }));
  };

  // Expenses
  const addExpense = async (e: Omit<Expense, 'id' | 'business_id' | 'created_at'>) => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('expenses').insert([{ ...e, business_id: bId }]).select().single();
      if (data) {
        setExpenses(prev => [data, ...prev]);
        return;
      }
    }
    const newExp: Expense = {
      ...e,
      id: `exp-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  // Tasks
  const addTask = async (t: Omit<Task, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('tasks').insert([{ ...t, business_id: bId }]).select().single();
      if (data) {
        setTasks(prev => [data, ...prev]);
        return;
      }
    }
    const newTask: Task = {
      ...t,
      id: `t-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('tasks').update({ status }).eq('id', id);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  };

  // Deliverables
  const addDeliverable = async (d: Omit<Deliverable, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('deliverables').insert([{ ...d, business_id: bId }]).select().single();
      if (data) {
        setDeliverables(prev => [data, ...prev]);
        return;
      }
    }
    const newDel: Deliverable = {
      ...d,
      id: `del-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDeliverables(prev => [newDel, ...prev]);
  };

  const updateDeliverableStatus = async (id: string, status: Deliverable['status']) => {
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, status, updated_at: new Date().toISOString() } : d));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('deliverables').update({ status }).eq('id', id);
    }
  };

  const requestDeliverableRevision = async (id: string, revisionNotes: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'REVISION_REQUESTED',
          revision_notes: revisionNotes,
          updated_at: new Date().toISOString()
        };
      }
      return d;
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('deliverables').update({
        status: 'REVISION_REQUESTED',
        revision_notes: revisionNotes
      }).eq('id', id);
    }
  };

  // Follow-ups & Notifications
  const addFollowUp = async (f: Omit<FollowUp, 'id' | 'business_id' | 'created_at'>) => {
    const bId = business?.id || 'a0000000-0000-0000-0000-000000000001';
    const newF: FollowUp = {
      ...f,
      id: `fu-${Date.now()}`,
      business_id: bId,
      created_at: new Date().toISOString()
    };
    setFollowups(prev => [newF, ...prev]);
  };

  const dismissFollowUp = async (id: string) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'DISMISSED' } : f));
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  };

  const addMessage = async (msg: Omit<ProjectMessage, 'id' | 'created_at'>) => {
    const newMsg: ProjectMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('project_messages').insert([msg]);
    }
  };

  const migrateLegacyData = (): boolean => {
    try {
      const legacyRaw = localStorage.getItem('studioos');
      if (!legacyRaw) return false;
      const legacy = JSON.parse(legacyRaw);

      if (legacy.clients && Array.isArray(legacy.clients)) {
        const importedClients: Client[] = legacy.clients.map((c: any) => ({
          id: `c-legacy-${c.id || Date.now()}`,
          business_id: 'a0000000-0000-0000-0000-000000000001',
          name: c.name || 'Unnamed Client',
          phone: c.phone || '',
          email: c.email || '',
          portal_token: `portal-${(c.name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setClients(prev => [...importedClients, ...prev]);
      }
      return true;
    } catch {
      return false;
    }
  };

  const clearAllData = () => {
    const keys = [
      'studioos_clients',
      'studioos_projects',
      'studioos_shoots',
      'studioos_quotations',
      'studioos_invoices',
      'studioos_payments',
      'studioos_expenses',
      'studioos_tasks',
      'studioos_deliverables',
      'studioos_followups',
      'studioos_notifications',
      'studioos_messages',
      'studioos'
    ];
    keys.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (err) {
        console.error('Failed to clear key', k, err);
      }
    });

    setClients([]);
    setProjects([]);
    setShoots([]);
    setQuotations([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    setTasks([]);
    setDeliverables([]);
    setFollowups([]);
    setNotifications([]);
    setMessages([]);
  };

  // Financial aggregates
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const totalOverdue = invoices
    .filter(inv => inv.status === 'OVERDUE' || (new Date(inv.due_date) < new Date() && inv.balance > 0))
    .reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const activeShootsCount = shoots.filter(s => s.status === 'Upcoming').length;

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        shoots,
        quotations,
        invoices,
        payments,
        expenses,
        tasks,
        deliverables,
        followups,
        notifications,
        services,
        packages,
        messages,
        loadingData,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addShoot,
        updateShoot,
        deleteShoot,
        addQuotation,
        updateQuotation,
        acceptQuotation,
        convertQuotationToInvoice,
        deleteQuotation,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        addExpense,
        deleteExpense,
        addTask,
        updateTaskStatus,
        deleteTask,
        addDeliverable,
        updateDeliverableStatus,
        requestDeliverableRevision,
        addFollowUp,
        dismissFollowUp,
        markNotificationRead,
        addMessage,
        totalRevenue,
        totalCollected,
        totalOutstanding,
        totalOverdue,
        activeShootsCount,
        clearAllData,
        migrateLegacyData,
        refreshFromSupabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
