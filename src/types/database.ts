// ==========================================================
// StudioOS — TypeScript Database Models & Enums
// ==========================================================

export type ProjectStatus =
  | 'LEAD'
  | 'QUOTED'
  | 'BOOKED'
  | 'SHOOTING'
  | 'EDITING'
  | 'REVIEW'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ShootType =
  | 'Car Delivery'
  | 'Automotive Promo'
  | 'Brand Promo'
  | 'Instagram Reel'
  | 'Wedding / Pre-Wedding'
  | 'Fashion / Lookbook'
  | 'Corporate'
  | 'Event'
  | 'Real Estate'
  | 'Music Video'
  | 'Commercial Ad'
  | 'Photography'
  | 'Drone'
  | 'Other'
  | (string & {});

export type ShootStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'OTHER';

export type ExpenseCategory =
  | 'Fuel'
  | 'Travel'
  | 'Assistant'
  | 'Equipment'
  | 'Parking'
  | 'Food'
  | 'Software'
  | 'Other';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DeliverableType = 'Video' | 'Reel' | 'Photo Gallery' | 'Raw Footage' | 'Document' | 'Other';

export type DeliverableStatus =
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'DELIVERED';

export type FollowUpType = 'PAYMENT' | 'QUOTATION' | 'GENERAL';

export type FollowUpStatus = 'PENDING' | 'SENT' | 'COMPLETED' | 'DISMISSED';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc: string;
  account_holder: string;
}

export interface Business {
  id: string;
  owner_id?: string;
  name: string;
  brand_name: string;
  tagline: string;
  logo_url?: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  gstin?: string;
  upi_id: string;
  bank_details: BankDetails;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  billing_address?: string;
  gstin?: string;
  notes?: string;
  portal_token: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  client_id?: string;
  title: string;
  source: string;
  estimated_value: number;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  business_id: string;
  client_id: string;
  title: string;
  description?: string;
  project_type: ShootType | string;
  status: ProjectStatus;
  shoot_date?: string;
  start_time?: string;
  location?: string;
  total_amount: number;
  advance_amount: number;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  client?: Client;
}

export interface Shoot {
  id: string;
  business_id: string;
  project_id?: string;
  client_id: string;
  title: string;
  shoot_date: string;
  start_time: string;
  end_time: string;
  location: string;
  shoot_type: ShootType;
  notes?: string;
  amount: number;
  status: ShootStatus;
  created_at: string;
  updated_at: string;
  // Joins
  client?: Client;
  project?: Project;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  default_price: number;
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  service_id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  business_id: string;
  client_id: string;
  project_id?: string;
  quotation_number: string;
  status: QuotationStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  valid_until?: string;
  payment_terms?: string;
  notes?: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  // Joins
  client?: Client;
  project?: Project;
  items?: QuotationItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  client_id: string;
  project_id?: string;
  quotation_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  client?: Client;
  project?: Project;
  items?: InvoiceItem[];
}

export interface Payment {
  id: string;
  business_id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
  // Joins
  client?: Client;
  invoice?: Invoice;
}

export interface Expense {
  id: string;
  business_id: string;
  project_id?: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string;
  receipt_url?: string;
  created_at: string;
  // Joins
  project?: Project;
}

export interface Task {
  id: string;
  business_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  business_id: string;
  project_id: string;
  name: string;
  type: DeliverableType;
  status: DeliverableStatus;
  file_url?: string;
  preview_url?: string;
  notes?: string;
  revision_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  business_id: string;
  client_id: string;
  quotation_id?: string;
  invoice_id?: string;
  scheduled_for: string;
  type: FollowUpType;
  status: FollowUpStatus;
  message: string;
  created_at: string;
  // Joins
  client?: Client;
  invoice?: Invoice;
  quotation?: Quotation;
}

export interface NotificationItem {
  id: string;
  business_id: string;
  type: string;
  title: string;
  description: string;
  reference_id?: string;
  read: boolean;
  created_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_type: 'freelancer' | 'client';
  sender_name: string;
  message: string;
  created_at: string;
}
