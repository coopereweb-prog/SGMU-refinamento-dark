SELECT 
    p.id,
    p.name,
    COUNT(pt.tag_id) as tag_count,
    STRING_AGG(t.name, ', ') as tag_names
FROM public.points p
LEFT JOIN public.point_tags pt ON p.id = pt.point_id
LEFT JOIN public.tags t ON pt.tag_id = t.id
GROUP BY p.id, p.name
ORDER BY p.name;