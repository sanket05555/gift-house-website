-- Migration: 002_orders_and_analytics.sql
-- Description: Create orders table and apply RLS policies

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    customer_name text not null,
    customer_phone text null,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null,
    category_name text null,
    unit_price numeric not null default 0,
    quantity integer not null default 1,
    total_price numeric not null default 0,
    delivery_location text not null,
    required_delivery_date date not null,
    special_instructions text null,
    status text not null default 'whatsapp_pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    whatsapp_opened_at timestamptz null,
    confirmed_at timestamptz null,
    completed_at timestamptz null,
    cancelled_at timestamptz null
);

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous customers) to insert orders
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
TO public, anon
WITH CHECK (true);

-- Allow admins to read all orders using the existing is_admin helper
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin());

-- Allow admins to update orders
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- Allow admins to delete orders (optional, but good for cleanup)
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
USING (public.is_admin());
