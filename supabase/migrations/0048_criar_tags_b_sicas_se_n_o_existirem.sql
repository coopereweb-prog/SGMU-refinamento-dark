INSERT INTO public.tags (name) 
VALUES 
    ('Alta Visibilidade'),
    ('Centro'),
    ('Avenida Principal'),
    ('Ponto Comercial'),
    ('Escola'),
    ('Praça')
ON CONFLICT (name) DO NOTHING;