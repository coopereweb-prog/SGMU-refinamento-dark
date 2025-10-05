SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'points' AND column_name = 'pricing_tier_id';