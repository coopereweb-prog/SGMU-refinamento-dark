-- Adicionar coluna is_available se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'points' AND column_name = 'is_available'
    ) THEN
        ALTER TABLE public.points ADD COLUMN is_available BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna is_available adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna is_available já existe';
    END IF;
END $$;

-- Adicionar coluna image_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'points' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.points ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna image_url já existe';
    END IF;
END $$;