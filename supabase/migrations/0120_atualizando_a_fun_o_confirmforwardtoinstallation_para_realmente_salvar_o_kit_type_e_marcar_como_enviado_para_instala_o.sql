-- Atualizar a função no código para salvar no banco
-- Mas como é JavaScript, não preciso de SQL aqui, apenas confirmar que as colunas foram adicionadas
SELECT * FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('kit_type', 'installation_sent', 'installation_sent_at');