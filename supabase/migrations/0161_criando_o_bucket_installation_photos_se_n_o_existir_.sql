INSERT INTO storage.buckets (id, name, public)
VALUES ('installation-photos', 'installation-photos', true)
ON CONFLICT (id) DO NOTHING;