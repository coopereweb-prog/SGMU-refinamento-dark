SELECT * FROM create_new_order(
    'Teste Manual',
    'test@example.com',
    '19999999999',
    100.00,
    ARRAY[
        ROW(
            (SELECT id FROM public.points WHERE name LIKE '%Bronze%' LIMIT 1),
            1,
            100.00
        )::order_item_input
    ]
);