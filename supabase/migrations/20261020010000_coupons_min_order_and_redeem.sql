-- Coupons completion migration
-- 1) Adds coupons.min_order_amount (the admin Coupons page + checkout
--    validation support a minimum order value; the column never existed).
-- 2) Adds public.redeem_coupon(code): an atomic, SECURITY DEFINER counter
--    increment used after a successful paid order. Coupon rows are only
--    writable by admins under RLS, so customers cannot bump used_count
--    directly — this function is the safe redemption path.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE everywhere.

ALTER TABLE public.coupons
    ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated INT;
BEGIN
    UPDATE public.coupons
       SET used_count = COALESCE(used_count, 0) + 1,
           updated_at = NOW()
     WHERE code = UPPER(TRIM(p_code))
       AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit);
    GET DIAGNOSTICS updated = ROW_COUNT;
    RETURN updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT) TO anon, authenticated;
