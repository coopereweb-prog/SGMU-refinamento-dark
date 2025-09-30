ALTER TABLE public.profiles
ADD COLUMN document_type TEXT,
ADD COLUMN document_number TEXT,
ADD COLUMN trade_name TEXT,
ADD COLUMN legal_name TEXT,
ADD COLUMN address_street TEXT,
ADD COLUMN address_number TEXT,
ADD COLUMN address_complement TEXT,
ADD COLUMN address_neighborhood TEXT,
ADD COLUMN address_city TEXT,
ADD COLUMN address_state TEXT,
ADD COLUMN address_zip_code TEXT,
ADD COLUMN signatory_name TEXT,
ADD COLUMN signatory_cpf TEXT;