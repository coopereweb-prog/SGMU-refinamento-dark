-- Cria um tipo composto para receber os dados do ponto
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'point_input') THEN
        CREATE TYPE public.point_input AS (
            id UUID,
            name TEXT,
            description TEXT,
            latitude NUMERIC,
            longitude NUMERIC,
            pricing_tier_id UUID,
            is_available BOOLEAN,
            image_url TEXT,
            street_name TEXT,
            intersection_name TEXT,
            media_type media_type_enum
        );
    END IF;
END
$$;

-- Função principal para salvar o ponto e suas tags
CREATE OR REPLACE FUNCTION public.save_point_with_tags(
    p_point_data public.point_input,
    p_tag_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_point_id UUID;
    v_tag_id UUID;
BEGIN
    -- 1. INSERT ou UPDATE na tabela points
    IF p_point_data.id IS NULL THEN
        -- INSERT
        INSERT INTO public.points (
            name, description, latitude, longitude, pricing_tier_id, is_available, image_url, street_name, intersection_name, media_type
        )
        VALUES (
            p_point_data.name, p_point_data.description, p_point_data.latitude, p_point_data.longitude, p_point_data.pricing_tier_id, p_point_data.is_available, p_point_data.image_url, p_point_data.street_name, p_point_data.intersection_name, p_point_data.media_type
        )
        RETURNING id INTO v_point_id;
    ELSE
        -- UPDATE
        UPDATE public.points
        SET
            name = p_point_data.name,
            description = p_point_data.description,
            latitude = p_point_data.latitude,
            longitude = p_point_data.longitude,
            pricing_tier_id = p_point_data.pricing_tier_id,
            is_available = p_point_data.is_available,
            image_url = p_point_data.image_url,
            street_name = p_point_data.street_name,
            intersection_name = p_point_data.intersection_name,
            media_type = p_point_data.media_type,
            updated_at = NOW()
        WHERE id = p_point_data.id
        RETURNING id INTO v_point_id;
    END IF;

    -- 2. Gerenciamento de Tags
    -- Remove todas as tags existentes
    DELETE FROM public.point_tags WHERE point_id = v_point_id;

    -- Insere as novas tags
    IF array_length(p_tag_ids, 1) > 0 THEN
        FOREACH v_tag_id IN ARRAY p_tag_ids
        LOOP
            INSERT INTO public.point_tags (point_id, tag_id)
            VALUES (v_point_id, v_tag_id);
        END LOOP;
    END IF;

    RETURN v_point_id;
END;
$$;