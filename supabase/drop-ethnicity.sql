-- ═══════════════════════════════════════════════════════════════════
-- DROP ethnicity COLUMN FROM public.profiles
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════

-- ethnicity was added in an early creator-profile migration but is never
-- collected by any form and creates unnecessary GDPR/compliance exposure.
-- Drop it cleanly.

alter table public.profiles drop column if exists ethnicity;
