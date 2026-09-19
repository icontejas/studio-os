-- ==========================================================
-- StudioOS — Supabase Database Schema
-- Creative Business OS for Freelancers & Studios
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Freelancer profile linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'owner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUSINESSES (Workspace / Studio entity)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'IconTejas Studio',
    brand_name TEXT DEFAULT 'ICONTEJAS',
    tagline TEXT DEFAULT 'CINEMATOGRAPHY · FILMS · CREATIVE',
    logo_url TEXT,
    phone TEXT DEFAULT '+91 98765 43210',
    email TEXT DEFAULT 'contact@icontejas.com',
    website TEXT DEFAULT 'https://icontejas.com',
    address TEXT DEFAULT 'Studio 402, Creative Hub, Gurgaon, Haryana, India',
    gstin TEXT,
    upi_id TEXT DEFAULT 'icontejas@upi',
    bank_details JSONB DEFAULT '{"bank_name": "HDFC Bank", "account_number": "50200012345678", "ifsc": "HDFC0001234", "account_holder": "Tejas Studio"}'::jsonb,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    company TEXT,
    billing_address TEXT,
    gstin TEXT,
    notes TEXT,
    portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    source TEXT DEFAULT 'Instagram',
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL DEFAULT 'Automotive Promo',
    status TEXT NOT NULL DEFAULT 'BOOKED' CHECK (status IN (
        'LEAD', 'QUOTED', 'BOOKED', 'SHOOTING', 'EDITING', 'REVIEW', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    )),
    shoot_date DATE,
    start_time TIME,
    location TEXT,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    advance_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SHOOTS
CREATE TABLE IF NOT EXISTS public.shoots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    shoot_date DATE NOT NULL,
    start_time TIME DEFAULT '10:00',
    end_time TIME DEFAULT '14:00',
    location TEXT NOT NULL,
    shoot_type TEXT NOT NULL DEFAULT 'Car Delivery',
    notes TEXT,
    amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled', 'Rescheduled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    category TEXT DEFAULT 'Videography',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PACKAGES
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    quotation_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN (
        'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'
    )),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valid_until DATE,
    payment_terms TEXT DEFAULT '50% advance required to confirm booking. Balance due on final delivery. Quote valid for 7 days.',
    notes TEXT,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUOTATION ITEMS
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN (
        'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'
    )),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    payment_terms TEXT DEFAULT 'Payment due within 7 days of invoice date. Please mention invoice number in payment reference.',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN (
        'UPI', 'BANK_TRANSFER', 'CASH', 'CARD', 'OTHER'
    )),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Fuel', 'Travel', 'Assistant', 'Equipment', 'Parking', 'Food', 'Software', 'Other'
    )),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    due_date DATE,
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DELIVERABLES
CREATE TABLE IF NOT EXISTS public.deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Video' CHECK (type IN ('Video', 'Reel', 'Photo Gallery', 'Raw Footage', 'Document', 'Other')),
    status TEXT NOT NULL DEFAULT 'PROCESSING' CHECK (status IN (
        'PROCESSING', 'READY_FOR_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DELIVERED'
    )),
    file_url TEXT,
    preview_url TEXT,
    notes TEXT,
    revision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. FOLLOWUPS
CREATE TABLE IF NOT EXISTS public.followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    scheduled_for DATE NOT NULL,
    type TEXT NOT NULL DEFAULT 'PAYMENT' CHECK (type IN ('PAYMENT', 'QUOTATION', 'GENERAL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'COMPLETED', 'DISMISSED')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PROJECT MESSAGES (Client portal communication)
CREATE TABLE IF NOT EXISTS public.project_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('freelancer', 'client')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_clients_business ON public.clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_portal_token ON public.clients(portal_token);
CREATE INDEX IF NOT EXISTS idx_projects_business ON public.projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_shoots_business ON public.shoots(business_id);
CREATE INDEX IF NOT EXISTS idx_shoots_date ON public.shoots(shoot_date);
CREATE INDEX IF NOT EXISTS idx_quotations_business ON public.quotations(business_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON public.quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business ON public.notifications(business_id, read);

-- ==========================================================
-- AUTOMATIC BALANCE & STATUS CALCULATION TRIGGERS
-- ==========================================================
CREATE OR REPLACE FUNCTION public.recalculate_invoice_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
    v_total_paid NUMERIC(12, 2);
    v_total NUMERIC(12, 2);
    v_due_date DATE;
    v_new_status TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_invoice_id := OLD.invoice_id;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid FROM public.payments WHERE invoice_id = v_invoice_id;
    SELECT total, due_date INTO v_total, v_due_date FROM public.invoices WHERE id = v_invoice_id;

    IF v_total_paid >= v_total THEN
        v_new_status := 'PAID';
    ELSIF v_total_paid > 0 THEN
        v_new_status := 'PARTIALLY_PAID';
    ELSIF v_due_date < CURRENT_DATE THEN
        v_new_status := 'OVERDUE';
    ELSE
        v_new_status := 'SENT';
    END IF;

    UPDATE public.invoices
    SET paid_amount = v_total_paid,
        balance = GREATEST(0, v_total - v_total_paid),
        status = v_new_status,
        updated_at = NOW()
    WHERE id = v_invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_recalculate_invoice_payment ON public.payments;
CREATE TRIGGER trigger_recalculate_invoice_payment
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.recalculate_invoice_balance();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user owns the business
CREATE OR REPLACE FUNCTION public.user_owns_business(b_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = b_id AND owner_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read/write their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Businesses: Owner can manage their businesses
CREATE POLICY "Users can manage own business" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

-- Standard Business entities RLS policies
CREATE POLICY "Manage clients" ON public.clients
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage leads" ON public.leads
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage projects" ON public.projects
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage shoots" ON public.shoots
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage services" ON public.services
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage packages" ON public.packages
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage quotations" ON public.quotations
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage quotation items" ON public.quotation_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.quotations q
        WHERE q.id = quotation_items.quotation_id AND public.user_owns_business(q.business_id)
    ));

CREATE POLICY "Manage invoices" ON public.invoices
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage invoice items" ON public.invoice_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.invoices i
        WHERE i.id = invoice_items.invoice_id AND public.user_owns_business(i.business_id)
    ));

CREATE POLICY "Manage payments" ON public.payments
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage expenses" ON public.expenses
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage tasks" ON public.tasks
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage deliverables" ON public.deliverables
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage followups" ON public.followups
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage notifications" ON public.notifications
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage project messages" ON public.project_messages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_messages.project_id AND public.user_owns_business(p.business_id)
    ));
