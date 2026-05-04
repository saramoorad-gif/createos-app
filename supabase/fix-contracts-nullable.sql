-- Make contracts table columns nullable so template-created drafts work
-- These fields are required for uploaded contracts but not for template drafts

ALTER TABLE public.contracts ALTER COLUMN deal_id DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN creator_id DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN uploaded_by_type DROP NOT NULL;

-- Add a permissive insert policy for agency users creating drafts
CREATE POLICY "Agencies can create contract drafts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by OR uploaded_by IS NULL);

-- Also allow agencies to update their contracts
CREATE POLICY "Agencies can update contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = uploaded_by OR auth.uid() = creator_id);
