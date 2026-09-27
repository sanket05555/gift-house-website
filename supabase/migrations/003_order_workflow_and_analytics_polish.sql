-- Migration: 003_order_workflow_and_analytics_polish.sql
-- Description: Add order status history table

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    status text not null,
    created_at timestamptz not null default now(),
    changed_by uuid references auth.users(id) on delete set null
);

-- Ensure RLS is enabled
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DROP POLICY IF EXISTS "Admins can view order status history" ON public.order_status_history;
CREATE POLICY "Admins can view order status history"
ON public.order_status_history FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert order status history" ON public.order_status_history;
CREATE POLICY "Admins can insert order status history"
ON public.order_status_history FOR INSERT
WITH CHECK (public.is_admin());
