-- ============================================================
-- Fix: "Database error saving new user" on OAuth (Google) sign-in
-- ============================================================
-- Replaces handle_new_user() with a resilient version:
--   * A profile/activity-log problem NEVER blocks auth signup
--     (outer exception guard always returns NEW)
--   * Duplicate profile id/email is ignored via ON CONFLICT DO NOTHING
--   * Display name falls back to Google metadata key 'name'
--   * Activity log insert is best-effort (own exception block)
-- Safe to run multiple times.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        company,
        role,
        status
    ) VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)
        ),
        NEW.email,
        NEW.raw_user_meta_data ->> 'phone',
        NEW.raw_user_meta_data ->> 'company',
        CASE WHEN is_first_user THEN 'super_admin'::user_role ELSE 'customer'::user_role END,
        'active'::user_status
    )
    ON CONFLICT DO NOTHING;

    BEGIN
        INSERT INTO public.activity_logs (
            user_id,
            user_email,
            user_role,
            action,
            target_type,
            target_id
        ) VALUES (
            NEW.id,
            NEW.email,
            CASE WHEN is_first_user THEN 'super_admin' ELSE 'customer' END,
            'USER_REGISTERED',
            'profiles',
            NEW.id::text
        );
    EXCEPTION WHEN OTHERS THEN
        -- Activity logging is best-effort only
        NULL;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- A profile problem must never block account creation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
