UPDATE public.points 
SET pricing_tier_id = (SELECT id FROM public.pricing_tiers WHERE name = 'Bronze' LIMIT 1)
WHERE pricing_tier_id IS NULL;