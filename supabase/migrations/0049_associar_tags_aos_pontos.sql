-- Associar tags aleatórias aos pontos para teste
INSERT INTO public.point_tags (point_id, tag_id)
SELECT 
    p.id,
    t.id
FROM public.points p
CROSS JOIN public.tags t
WHERE t.name IN ('Alta Visibilidade', 'Centro', 'Avenida Principal')
    AND p.id NOT IN (
        SELECT point_id FROM public.point_tags WHERE tag_id = t.id
    )
LIMIT 20;