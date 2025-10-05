SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'cancel_order_and_release_points';