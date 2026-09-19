-- ==============================================================================
-- Migration 002: Row Level Security (RLS) & Triggers
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_tokens ENABLE ROW LEVEL SECURITY;
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

-- 2. Security Definer Helper: check if authenticated user owns the business
CREATE OR REPLACE FUNCTION public.user_owns_business(b_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = b_id AND owner_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. RLS Policies for Freelancer Workspace Data Isolation
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own business" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Manage clients" ON public.clients
    FOR ALL USING (public.user_owns_business(business_id));

CREATE POLICY "Manage client portal tokens" ON public.client_portal_tokens
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

-- 4. Isolated Client Portal Token Read Access (Clients can only see their own project/quote/deliverable)
CREATE OR REPLACE FUNCTION public.get_client_id_by_token(p_token TEXT)
RETURNS UUID AS $$
    SELECT id FROM public.clients WHERE portal_token = p_token
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 5. Automatic Invoice Balance & Status Recalculation Trigger
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

-- 6. Trigger to automatically initialize Profile and Business workspace on Supabase Auth SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_business_id UUID;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Studio Owner'), 'owner');

    -- Create default business workspace
    INSERT INTO public.businesses (owner_id, name, brand_name, tagline)
    VALUES (NEW.id, 'My Creative Studio', 'STUDIO', 'CINEMATOGRAPHY · FILMS · CREATIVE')
    RETURNING id INTO v_business_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
