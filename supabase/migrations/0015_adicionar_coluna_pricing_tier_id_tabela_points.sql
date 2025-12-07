ALTER TABLE IF EXISTS public.points
  ADD COLUMN IF NOT EXISTS pricing_tier_id UUID REFERENCES public.pricing_tiers(id);