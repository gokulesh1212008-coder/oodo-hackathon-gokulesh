-- ==============================================================================
-- BRIGHTLOOP SUBSCRIPTION MANAGEMENT SYSTEM
-- COMPLETE PRODUCTION SECURITY & RBAC SCHEMA MIGRATION
-- Migration Version: 20261031_brightloop_security_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'canceled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('succeeded', 'pending', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'customer',
    company_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AUDIT LOGS TABLE (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COMPANY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Brightloop Technologies Pvt. Ltd.',
    gstin TEXT NOT NULL DEFAULT '29AABCB1234C1Z5',
    business_email TEXT NOT NULL DEFAULT 'hello@brightloop.in',
    support_phone TEXT NOT NULL DEFAULT '+91 80 4567 8900',
    business_address TEXT NOT NULL DEFAULT '12th Floor, Orion Tower, Residency Road, Bengaluru, Karnataka 560025',
    invoice_prefix TEXT NOT NULL DEFAULT 'INV-',
    tax_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 18.00 CHECK (tax_rate_percent >= 0 AND tax_rate_percent <= 100),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'Software',
    variants_count INTEGER NOT NULL DEFAULT 1 CHECK (variants_count >= 1),
    price_inr NUMERIC(12,2) NOT NULL CHECK (price_inr >= 0),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    billing_interval TEXT NOT NULL DEFAULT 'Monthly' CHECK (billing_interval IN ('Monthly', 'Yearly')),
    price_inr NUMERIC(12,2) NOT NULL CHECK (price_inr >= 0),
    color TEXT NOT NULL DEFAULT '#6559e8',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    plan_name TEXT NOT NULL DEFAULT 'Starter',
    revenue_inr NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (revenue_inr >= 0),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused')),
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    color TEXT NOT NULL DEFAULT 'violet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type public.discount_type NOT NULL,
    amount_value NUMERIC(12,2) NOT NULL CHECK (amount_value > 0),
    max_uses INTEGER NOT NULL DEFAULT 100 CHECK (max_uses > 0),
    current_uses INTEGER NOT NULL DEFAULT 0 CHECK (current_uses >= 0 AND current_uses <= max_uses),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal_inr NUMERIC(12,2) NOT NULL CHECK (subtotal_inr >= 0),
    tax_inr NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_inr >= 0),
    total_inr NUMERIC(12,2) NOT NULL CHECK (total_inr >= 0),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Declined', 'Expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    next_billing_date DATE,
    status public.subscription_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    subtotal_inr NUMERIC(12,2) NOT NULL CHECK (subtotal_inr >= 0),
    tax_inr NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_inr >= 0),
    discount_inr NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_inr >= 0),
    total_inr NUMERIC(12,2) NOT NULL CHECK (total_inr >= 0),
    balance_due_inr NUMERIC(12,2) NOT NULL CHECK (balance_due_inr >= 0),
    status public.invoice_status NOT NULL DEFAULT 'draft',
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number TEXT NOT NULL UNIQUE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    amount_inr NUMERIC(12,2) NOT NULL CHECK (amount_inr > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Credit card', 'Bank transfer', 'Net banking')),
    status public.payment_status NOT NULL DEFAULT 'succeeded',
    idempotency_key TEXT UNIQUE,
    gateway_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- PRIVILEGED HELPER FUNCTIONS (SECURITY DEFINER with safe search_path)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'customer'::public.user_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.current_user_role() = 'admin'::public.user_role;
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.current_user_role() IN ('admin'::public.user_role, 'staff'::public.user_role);
$$;

-- Helper to check if current user is owner of a customer record
CREATE OR REPLACE FUNCTION public.is_customer_owner(p_customer_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.id = p_customer_id
          AND (c.profile_id = auth.uid() OR c.email = (auth.jwt() ->> 'email'))
    );
$$;

-- Function to record audit logs securely
CREATE OR REPLACE FUNCTION public.record_audit(
    p_action TEXT,
    p_entity_name TEXT,
    p_entity_id TEXT,
    p_changes JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_email TEXT;
    v_actor_role TEXT;
BEGIN
    SELECT email, role::text INTO v_actor_email, v_actor_role FROM public.profiles WHERE id = auth.uid();
    INSERT INTO public.audit_logs (
        actor_id, actor_email, actor_role, action, entity_name, entity_id, changes
    ) VALUES (
        auth.uid(), v_actor_email, v_actor_role, p_action, p_entity_name, p_entity_id, p_changes
    );
END;
$$;

-- Function to automatically handle new Auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_role public.user_role := 'customer';
    v_name TEXT;
    v_company TEXT;
BEGIN
    -- First registered user can optionally become admin if desired, otherwise default to customer
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        v_role := 'admin';
    END IF;

    v_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    v_company := COALESCE(new.raw_user_meta_data->>'company', 'Individual');

    INSERT INTO public.profiles (id, email, full_name, role, company_name)
    VALUES (new.id, new.email, v_name, v_role, v_company)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    -- If customer record exists with this email, link profile_id
    UPDATE public.customers
    SET profile_id = new.id
    WHERE email = new.email AND profile_id IS NULL;

    RETURN new;
END;
$$;

-- Trigger on auth.users (if supabase auth is active)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to recalculate invoice balance and status upon payment
CREATE OR REPLACE FUNCTION public.handle_payment_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total_paid NUMERIC(12,2);
    v_invoice_total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(amount_inr), 0) INTO v_total_paid
    FROM public.payments
    WHERE invoice_id = new.invoice_id AND status = 'succeeded';

    SELECT total_inr INTO v_invoice_total
    FROM public.invoices
    WHERE id = new.invoice_id;

    UPDATE public.invoices
    SET balance_due_inr = GREATEST(0, v_invoice_total - v_total_paid),
        status = CASE 
            WHEN (v_invoice_total - v_total_paid) <= 0 THEN 'paid'::public.invoice_status
            ELSE 'sent'::public.invoice_status
        END,
        updated_at = now()
    WHERE id = new.invoice_id;

    -- Audit log
    PERFORM public.record_audit('PAYMENT_RECORDED', 'payments', new.id::text, jsonb_build_object('amount', new.amount_inr, 'invoice_id', new.invoice_id));

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_success ON public.payments;
CREATE TRIGGER on_payment_success
    AFTER INSERT ON public.payments
    FOR EACH ROW
    WHEN (new.status = 'succeeded')
    EXECUTE FUNCTION public.handle_payment_received();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_own_or_staff" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_staff_or_admin());

CREATE POLICY "profiles_update_self_no_role_escalation" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        -- Prevent users from escalating their own role
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- AUDIT LOGS POLICIES (Append-only by system, read by admin only)
-- ------------------------------------------------------------------------------
CREATE POLICY "audit_logs_select_admin_only" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- Disallow manual INSERT/UPDATE/DELETE from client APIs
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;

-- ------------------------------------------------------------------------------
-- COMPANY SETTINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "company_settings_select_authenticated" ON public.company_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "company_settings_modify_admin_only" ON public.company_settings
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PRODUCTS & PLANS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "products_select_active_or_staff" ON public.products
    FOR SELECT USING (status = 'Active' OR public.is_staff_or_admin());

CREATE POLICY "products_modify_admin_only" ON public.products
    FOR ALL USING (public.is_admin());

CREATE POLICY "plans_select_active_or_staff" ON public.subscription_plans
    FOR SELECT USING (status = 'Active' OR public.is_staff_or_admin());

CREATE POLICY "plans_modify_admin_only" ON public.subscription_plans
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- CUSTOMERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "customers_select_scoped" ON public.customers
    FOR SELECT USING (
        public.is_staff_or_admin() 
        OR profile_id = auth.uid() 
        OR email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "customers_insert_staff_or_self" ON public.customers
    FOR INSERT WITH CHECK (
        public.is_staff_or_admin()
        OR (auth.uid() IS NOT NULL AND profile_id = auth.uid())
    );

CREATE POLICY "customers_update_staff_or_admin" ON public.customers
    FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "customers_delete_admin_only" ON public.customers
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- DISCOUNTS POLICIES (Admin only to manage; Authenticated can view active)
-- ------------------------------------------------------------------------------
CREATE POLICY "discounts_select_active" ON public.discounts
    FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "discounts_modify_admin_only" ON public.discounts
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- QUOTATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "quotations_select_scoped" ON public.quotations
    FOR SELECT USING (
        public.is_staff_or_admin() 
        OR public.is_customer_owner(customer_id)
    );

CREATE POLICY "quotations_modify_staff_or_admin" ON public.quotations
    FOR ALL USING (public.is_staff_or_admin());

-- ------------------------------------------------------------------------------
-- SUBSCRIPTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "subscriptions_select_scoped" ON public.subscriptions
    FOR SELECT USING (
        public.is_staff_or_admin() 
        OR public.is_customer_owner(customer_id)
    );

CREATE POLICY "subscriptions_modify_staff_or_admin" ON public.subscriptions
    FOR ALL USING (public.is_staff_or_admin());

-- ------------------------------------------------------------------------------
-- INVOICES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "invoices_select_scoped" ON public.invoices
    FOR SELECT USING (
        public.is_staff_or_admin() 
        OR public.is_customer_owner(customer_id)
    );

CREATE POLICY "invoices_insert_staff_or_admin" ON public.invoices
    FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "invoices_update_staff_or_admin" ON public.invoices
    FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "invoices_delete_admin_only" ON public.invoices
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PAYMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "payments_select_scoped" ON public.payments
    FOR SELECT USING (
        public.is_staff_or_admin() 
        OR public.is_customer_owner(customer_id)
    );

CREATE POLICY "payments_insert_scoped" ON public.payments
    FOR INSERT WITH CHECK (
        public.is_staff_or_admin() 
        OR public.is_customer_owner(customer_id)
    );

CREATE POLICY "payments_modify_admin_only" ON public.payments
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "payments_delete_admin_only" ON public.payments
    FOR DELETE USING (public.is_admin());

-- ==============================================================================
-- STARTER SEED DATA
-- ==============================================================================
INSERT INTO public.company_settings (id, company_name, gstin, business_email, support_phone, business_address)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Brightloop Technologies Pvt. Ltd.',
    '29AABCB1234C1Z5',
    'hello@brightloop.in',
    '+91 80 4567 8900',
    '12th Floor, Orion Tower, Residency Road, Bengaluru, Karnataka 560025'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subscription_plans (name, billing_interval, price_inr, color)
VALUES
    ('Starter', 'Monthly', 12900, '#f0a35b'),
    ('Growth', 'Monthly', 24800, '#6559e8'),
    ('Scale', 'Monthly', 48000, '#2bb7a7'),
    ('Enterprise', 'Yearly', 240000, '#b7bdc9')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.discounts (code, discount_type, amount_value, max_uses, current_uses, valid_until, is_active)
VALUES
    ('WELCOME20', 'percentage', 20.00, 100, 84, now() + interval '30 days', true),
    ('ANNUAL10', 'percentage', 10.00, 50, 32, now() + interval '60 days', true),
    ('LAUNCH500', 'fixed', 500.00, 100, 100, now() - interval '1 day', false)
ON CONFLICT (code) DO NOTHING;

-- Seed default customers
INSERT INTO public.customers (name, company, email, plan_name, revenue_inr, status, joined_date, color)
VALUES
    ('Rohan Mehta', 'Mehta & Co.', 'rohan@mehta.co', 'Scale', 124000, 'Active', '2024-09-12', 'violet'),
    ('Ananya Iyer', 'Iyer Studios', 'ananya@iyerstudios.in', 'Growth', 86400, 'Active', '2024-09-04', 'orange'),
    ('Arjun Nair', 'Nair Logistics', 'arjun@nairlogistics.com', 'Enterprise', 248000, 'Active', '2024-08-28', 'teal'),
    ('Neha Kapoor', 'Kapoor Retail', 'neha@kapoorretail.in', 'Starter', 38700, 'Paused', '2024-08-19', 'blue'),
    ('Vikram Shah', 'Shah & Sons', 'vikram@shahandsons.in', 'Growth', 72200, 'Active', '2024-08-07', 'pink')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- REVERSIBLE MIGRATION (ROLLBACK INSTRUCTIONS)
-- ==============================================================================
/*
To roll back this migration:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_payment_success ON public.payments;
DROP FUNCTION IF EXISTS public.handle_payment_received();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.record_audit(text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.is_customer_owner(uuid);
DROP FUNCTION IF EXISTS public.is_staff_or_admin();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.current_user_role();
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.quotations CASCADE;
DROP TABLE IF EXISTS public.discounts CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.company_settings CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.discount_type;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.invoice_status;
DROP TYPE IF EXISTS public.subscription_status;
DROP TYPE IF EXISTS public.user_role;
*/

