SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'expire_old_reservations';