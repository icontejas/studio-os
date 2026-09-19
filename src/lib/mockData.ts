import {
  Business,
  Client,
  Project,
  Shoot,
  Service,
  PackageItem,
  Quotation,
  Invoice,
  Payment,
  Expense,
  Task,
  Deliverable,
  FollowUp,
  NotificationItem,
  ProjectMessage
} from '../types/database';

export const INITIAL_BUSINESS: Business = {
  id: 'b-icontejas-001',
  name: 'IconTejas Studio',
  brand_name: 'ICONTEJAS',
  tagline: 'CINEMATOGRAPHY · FILMS · CREATIVE',
  logo_url: '',
  phone: '+91 98765 43210',
  email: 'tejassatikosare277@gmail.com',
  website: 'https://icontejas.com',
  address: 'Dighori, Nagpur, Maharashtra, India',
  gstin: '',
  upi_id: 'tejassatikosare277@okicici',
  bank_details: {
    bank_name: 'Post Bank',
    account_number: '50200012345678',
    ifsc: 'IPOS0000001',
    account_holder: 'Tejas Satikosare'
  },
  currency: 'INR',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_SHOOTS: Shoot[] = [];
export const INITIAL_QUOTATIONS: Quotation[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_DELIVERABLES: Deliverable[] = [];
export const INITIAL_FOLLOWUPS: FollowUp[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_MESSAGES: ProjectMessage[] = [];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's-01',
    business_id: 'b-icontejas-001',
    name: 'Car Delivery Basic',
    description: '1-hour cinematic delivery shoot + 1 edited 4K reel',
    default_price: 7000,
    category: 'Videography',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's-02',
    business_id: 'b-icontejas-001',
    name: 'Car Delivery Standard',
    description: '2-hour shoot + 2 reels + 15 edited photographs + sound design',
    default_price: 12000,
    category: 'Videography',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's-03',
    business_id: 'b-icontejas-001',
    name: 'Car Delivery Premium',
    description: '3-hour shoot + 3 reels + 30 graded photos + Drone footage',
    default_price: 20000,
    category: 'Videography',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's-04',
    business_id: 'b-icontejas-001',
    name: 'Instagram Reel (Standalone)',
    description: 'High-impact 30s 4K vertical reel with custom sound design',
    default_price: 2500,
    category: 'Videography',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's-05',
    business_id: 'b-icontejas-001',
    name: 'Cinematic Photography',
    description: '25 graded high-resolution photographs',
    default_price: 3500,
    category: 'Photography',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's-06',
    business_id: 'b-icontejas-001',
    name: 'Drone 4K Coverage',
    description: 'Licensed aerial cinematography & location establishing shots',
    default_price: 6000,
    category: 'Aerial',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-01',
    business_id: 'b-icontejas-001',
    name: 'PREMIUM CAR DELIVERY',
    description: 'The ultimate luxury automotive delivery film package',
    price: 20000,
    features: [
      '2-3 hour on-location shoot',
      '3 High-impact 4K vertical reels',
      '30 Edited and color-graded photographs',
      'Cinematic delivery master video (16:9 4K)',
      'Licensed 4K drone footage'
    ],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pkg-02',
    business_id: 'b-icontejas-001',
    name: 'COMMERCIAL SHOWROOM CAMPAIGN',
    description: 'Multi-car digital ad campaign package for luxury dealerships',
    price: 35000,
    features: [
      'Full day shoot (up to 3 vehicles)',
      '1 Flagship dealership promotional commercial (60s)',
      '5 Social media reels (30s each)',
      '50 High-res editorial showroom images',
      'Sound design & commercial music licensing included'
    ],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
