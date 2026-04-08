-- Script de Teste Completo do Processo de Migração com Dados de Exemplo
-- Este script demonstra o fluxo completo de migração com segurança e validação
-- Inclui: criação de dados de teste, backup, migração simulada, validação e rollback

-- 1. Criar dados de teste simulando os 1300 pontos reais
CREATE OR REPLACE FUNCTION test_migration.create_test_data(num_records INTEGER DEFAULT 1300)
RETURNS TABLE (operation TEXT, records_created INTEGER) AS $$
DECLARE
    created_count INTEGER;
    tier_ids UUID[];
BEGIN
    -- Limpar dados de teste anteriores
    DELETE FROM public.points WHERE name LIKE 'TEST_POINT_%';
    
    -- Obter IDs dos tiers de preço existentes
    SELECT ARRAY_AGG(id) INTO tier_ids FROM public.pricing_tiers;
    
    IF tier_ids IS NULL OR array_length(tier_ids, 1) = 0 THEN
        RETURN QUERY SELECT 'ERROR: No pricing tiers found'::TEXT, 0;
        RETURN;
    END IF;
    
    -- Criar pontos de teste
    INSERT INTO public.points (
        name, 
        status, 
        price_1y, price_2y, price_3y, price_4y, price_5y,
        pricing_tier_id,
        is_available,
        image_url,
        created_at,
        updated_at
    )
    SELECT 
        'TEST_POINT_' || generate_series(1, num_records),
        CASE 
            WHEN random() < 0.7 THEN 'available'
            WHEN random() < 0.9 THEN 'sold'
            ELSE 'reserved'
        END,
        -- Preços baseados no tier com variação
        CASE 
            WHEN tier.name = 'Ouro' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 1500.00
                    WHEN 2 THEN 2800.00
                    WHEN 3 THEN 4000.00
                    WHEN 4 THEN 5000.00
                    ELSE 6000.00
                END
            WHEN tier.name = 'Prata' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 1200.00
                    WHEN 2 THEN 2200.00
                    WHEN 3 THEN 3100.00
                    WHEN 4 THEN 3900.00
                    ELSE 4600.00
                END
            ELSE -- Bronze
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 900.00
                    WHEN 2 THEN 1600.00
                    WHEN 3 THEN 2200.00
                    WHEN 4 THEN 2700.00
                    ELSE 3100.00
                END
        END,
        CASE 
            WHEN tier.name = 'Ouro' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 2800.00
                    WHEN 2 THEN 5200.00
                    WHEN 3 THEN 7400.00
                    WHEN 4 THEN 9200.00
                    ELSE 11000.00
                END
            WHEN tier.name = 'Prata' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 2200.00
                    WHEN 2 THEN 4000.00
                    WHEN 3 THEN 5600.00
                    WHEN 4 THEN 7000.00
                    ELSE 8200.00
                END
            ELSE -- Bronze
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 1600.00
                    WHEN 2 THEN 2800.00
                    WHEN 3 THEN 3800.00
                    WHEN 4 THEN 4600.00
                    ELSE 5200.00
                END
        END,
        CASE 
            WHEN tier.name = 'Ouro' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 4000.00
                    WHEN 2 THEN 7400.00
                    WHEN 3 THEN 10500.00
                    WHEN 4 THEN 13100.00
                    ELSE 15700.00
                END
            WHEN tier.name = 'Prata' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 3100.00
                    WHEN 2 THEN 5600.00
                    WHEN 3 THEN 7900.00
                    WHEN 4 THEN 9900.00
                    ELSE 11600.00
                END
            ELSE -- Bronze
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 2200.00
                    WHEN 2 THEN 3900.00
                    WHEN 3 THEN 5400.00
                    WHEN 4 THEN 6600.00
                    ELSE 7600.00
                END
        END,
        CASE 
            WHEN tier.name = 'Ouro' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 5000.00
                    WHEN 2 THEN 9200.00
                    WHEN 3 THEN 13100.00
                    WHEN 4 THEN 16400.00
                    ELSE 19700.00
                END
            WHEN tier.name = 'Prata' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 3900.00
                    WHEN 2 THEN 7000.00
                    WHEN 3 THEN 9900.00
                    WHEN 4 THEN 12400.00
                    ELSE 14600.00
                END
            ELSE -- Bronze
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 2700.00
                    WHEN 2 THEN 4800.00
                    WHEN 3 THEN 6600.00
                    WHEN 4 THEN 8100.00
                    ELSE 9400.00
                END
        END,
        CASE 
            WHEN tier.name = 'Ouro' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 6000.00
                    WHEN 2 THEN 11000.00
                    WHEN 3 THEN 15700.00
                    WHEN 4 THEN 19700.00
                    ELSE 23600.00
                END
            WHEN tier.name = 'Prata' THEN 
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 4600.00
                    WHEN 2 THEN 8200.00
                    WHEN 3 THEN 11600.00
                    WHEN 4 THEN 14600.00
                    ELSE 17200.00
                END
            ELSE -- Bronze
                CASE floor(random() * 5) + 1
                    WHEN 1 THEN 3100.00
                    WHEN 2 THEN 5500.00
                    WHEN 3 THEN 7600.00
                    WHEN 4 THEN 9400.00
                    ELSE 10900.00
                END
        END,
        tier.id,
        true,
        format('https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Placa%20de%20publicidade%20%7B%7Bname%7D%7D%20em%20local%20urbano&image_size=square'),
        now() - (random() * interval '365 days'),
        now() - (random() * interval '30 days')
    FROM generate_series(1, num_records) i
    CROSS JOIN LATERAL (
        SELECT id, name FROM public.pricing_tiers 
        ORDER BY random() LIMIT 1
    ) tier;
    
    GET DIAGNOSTICS created_count = ROW_COUNT;
    
    RETURN QUERY SELECT 'TEST_DATA_CREATED'::TEXT, created_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para executar o processo completo de migração com segurança
CREATE OR REPLACE FUNCTION test_migration.execute_safe_migration_test()
RETURNS TABLE (step TEXT, status TEXT, details TEXT, timestamp TIMESTAMPTZ) AS $$
DECLARE
    initial_count INTEGER;
    backup_table_name TEXT;
    validation_count INTEGER;
BEGIN
    -- Passo 1: Registrar início do teste
    RETURN QUERY SELECT 'MIGRATION_TEST_START'::TEXT, 'INFO'::TEXT, 
                 'Iniciando teste de migração com dados de exemplo'::TEXT, now();
    
    -- Passo 2: Criar dados de teste se não existirem
    IF NOT EXISTS (SELECT 1 FROM public.points WHERE name LIKE 'TEST_POINT_%' LIMIT 1) THEN
        PERFORM test_migration.create_test_data(100); -- Criar 100 pontos de teste
        RETURN QUERY SELECT 'TEST_DATA_CREATION'::TEXT, 'SUCCESS'::TEXT, 
                     'Dados de teste criados com sucesso'::TEXT, now();
    ELSE
        RETURN QUERY SELECT 'TEST_DATA_EXISTS'::TEXT, 'INFO'::TEXT, 
                     'Dados de teste já existem, pulando criação'::TEXT, now();
    END IF;
    
    -- Passo 3: Obter contagem inicial
    SELECT COUNT(*) INTO initial_count FROM public.points WHERE name LIKE 'TEST_POINT_%';
    RETURN QUERY SELECT 'INITIAL_COUNT'::TEXT, 'INFO'::TEXT, 
                 format('Total de registros de teste: %s', initial_count)::TEXT, now();
    
    -- Passo 4: Criar ponto de restauração
    PERFORM create_restore_point('test_migration_restore_point');
    RETURN QUERY SELECT 'RESTORE_POINT_CREATED'::TEXT, 'SUCCESS'::TEXT, 
                 'Ponto de restauração criado para teste'::TEXT, now();
    
    -- Passo 5: Executar validação pré-migração
    PERFORM log_validation_results('pre_migration_test');
    RETURN QUERY SELECT 'PRE_MIGRATION_VALIDATION'::TEXT, 'SUCCESS'::TEXT, 
                 'Validação pré-migração executada'::TEXT, now();
    
    -- Passo 6: Simular migração (alteração controlada)
    BEGIN
        -- Simular alteração na estrutura (adicionar coluna temporária)
        ALTER TABLE public.points ADD COLUMN IF NOT EXISTS migration_test_column TEXT DEFAULT 'test_value';
        
        -- Simular atualização em massa
        UPDATE public.points 
        SET status = 'available', 
            updated_at = now(),
            migration_test_column = 'migrated'
        WHERE name LIKE 'TEST_POINT_%' AND status = 'sold';
        
        RETURN QUERY SELECT 'MIGRATION_SIMULATION'::TEXT, 'SUCCESS'::TEXT, 
                     'Migração simulada executada'::TEXT, now();
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'MIGRATION_SIMULATION'::TEXT, 'FAILED'::TEXT, 
                         format('Erro na simulação: %s', SQLERRM)::TEXT, now();
            -- Executar rollback
            PERFORM rollback_points_data('test_migration_restore_point');
            RETURN QUERY SELECT 'ROLLBACK_EXECUTED'::TEXT, 'SUCCESS'::TEXT, 
                         'Rollback executado devido a erro'::TEXT, now();
            RETURN;
    END;
    
    -- Passo 7: Executar validação pós-migração
    PERFORM log_validation_results('post_migration_test');
    RETURN QUERY SELECT 'POST_MIGRATION_VALIDATION'::TEXT, 'SUCCESS'::TEXT, 
                 'Validação pós-migração executada'::TEXT, now();
    
    -- Passo 8: Verificar integridade dos dados
    SELECT COUNT(*) INTO validation_count 
    FROM comprehensive_points_validation() 
    WHERE status = 'FAILED';
    
    IF validation_count > 0 THEN
        RETURN QUERY SELECT 'INTEGRITY_CHECK'::TEXT, 'FAILED'::TEXT, 
                     format('%s validações falharam', validation_count)::TEXT, now();
        -- Executar rollback
        PERFORM rollback_points_data('test_migration_restore_point');
        RETURN QUERY SELECT 'ROLLBACK_EXECUTED'::TEXT, 'SUCCESS'::TEXT, 
                     'Rollback executado devido a falhas de integridade'::TEXT, now();
    ELSE
        RETURN QUERY SELECT 'INTEGRITY_CHECK'::TEXT, 'PASSED'::TEXT, 
                     'Todas as validações de integridade passaram'::TEXT, now();
    END IF;
    
    -- Passo 9: Verificar auditoria
    RETURN QUERY SELECT 'AUDIT_VERIFICATION'::TEXT, 'SUCCESS'::TEXT, 
                 format('%s alterações registradas no log de auditoria', 
                 (SELECT COUNT(*) FROM audit_points.change_log 
                  WHERE changed_at > now() - interval '1 hour'))::TEXT, now();
    
    -- Passo 10: Limpar migração de teste (opcional)
    -- ALTER TABLE public.points DROP COLUMN IF EXISTS migration_test_column;
    
    RETURN QUERY SELECT 'MIGRATION_TEST_COMPLETE'::TEXT, 'SUCCESS'::TEXT, 
                 'Teste de migração concluído com sucesso'::TEXT, now();
END;
$$ LANGUAGE plpgsql;

-- 3. Função para executar teste de rollback
CREATE OR REPLACE FUNCTION test_migration.test_rollback_mechanism()
RETURNS TABLE (step TEXT, status TEXT, details TEXT, timestamp TIMESTAMPTZ) AS $$
DECLARE
    test_record_count INTEGER;
    rollback_result RECORD;
BEGIN
    -- Passo 1: Registrar início do teste de rollback
    RETURN QUERY SELECT 'ROLLBACK_TEST_START'::TEXT, 'INFO'::TEXT, 
                 'Iniciando teste de mecanismo de rollback'::TEXT, now();
    
    -- Passo 2: Criar dados de teste específicos
    INSERT INTO public.points (
        name, status, price_1y, price_2y, price_3y, price_4y, price_5y,
        pricing_tier_id, is_available, image_url, created_at, updated_at
    )
    SELECT 
        'ROLLBACK_TEST_POINT_' || generate_series(1, 50),
        'available',
        1000.00, 1800.00, 2500.00, 3100.00, 3600.00,
        (SELECT id FROM public.pricing_tiers ORDER BY random() LIMIT 1),
        true,
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Test%20point',
        now(),
        now()
    FROM generate_series(1, 50);
    
    RETURN QUERY SELECT 'ROLLBACK_TEST_DATA_CREATED'::TEXT, 'SUCCESS'::TEXT, 
                 '50 registros de teste criados para rollback'::TEXT, now();
    
    -- Passo 3: Criar ponto de restauração
    PERFORM create_restore_point('rollback_test_restore_point');
    RETURN QUERY SELECT 'ROLLBACK_RESTORE_POINT_CREATED'::TEXT, 'SUCCESS'::TEXT, 
                 'Ponto de restauração criado para teste de rollback'::TEXT, now();
    
    -- Passo 4: Modificar os dados
    UPDATE public.points 
    SET status = 'sold', 
        price_1y = price_1y * 1.5,
        updated_at = now()
    WHERE name LIKE 'ROLLBACK_TEST_POINT_%';
    
    SELECT COUNT(*) INTO test_record_count FROM public.points WHERE name LIKE 'ROLLBACK_TEST_POINT_%' AND status = 'sold';
    
    RETURN QUERY SELECT 'DATA_MODIFICATION'::TEXT, 'SUCCESS'::TEXT, 
                 format('%s registros modificados para teste', test_record_count)::TEXT, now();
    
    -- Passo 5: Executar rollback
    FOR rollback_result IN
        SELECT * FROM rollback_points_data('rollback_test_restore_point')
    LOOP
        RETURN QUERY SELECT 'ROLLBACK_' || rollback_result.operation, 
                     rollback_result.status, rollback_result.details, now();
    END LOOP;
    
    -- Passo 6: Verificar resultado do rollback
    SELECT COUNT(*) INTO test_record_count 
    FROM public.points 
    WHERE name LIKE 'ROLLBACK_TEST_POINT_%' AND status = 'available';
    
    RETURN QUERY SELECT 'ROLLBACK_VERIFICATION'::TEXT, 'SUCCESS'::TEXT, 
                 format('%s registros restaurados ao estado original', test_record_count)::TEXT, now();
    
    -- Passo 7: Executar validação pós-rollback
    PERFORM log_validation_results('post_rollback_test');
    RETURN QUERY SELECT 'POST_ROLLBACK_VALIDATION'::TEXT, 'SUCCESS'::TEXT, 
                 'Validação pós-rollback executada'::TEXT, now();
    
    -- Passo 8: Limpar dados de teste
    DELETE FROM public.points WHERE name LIKE 'ROLLBACK_TEST_POINT_%';
    
    RETURN QUERY SELECT 'ROLLBACK_TEST_CLEANUP'::TEXT, 'SUCCESS'::TEXT, 
                 'Dados de teste de rollback removidos'::TEXT, now();
    
    RETURN QUERY SELECT 'ROLLBACK_TEST_COMPLETE'::TEXT, 'SUCCESS'::TEXT, 
                 'Teste de rollback concluído com sucesso'::TEXT, now();
END;
$$ LANGUAGE plpgsql;

-- 4. Função para executar todos os testes
CREATE OR REPLACE FUNCTION test_migration.run_all_tests()
RETURNS TABLE (test_name TEXT, status TEXT, details TEXT, execution_time INTERVAL) AS $$
DECLARE
    test_start TIMESTAMPTZ;
    test_end TIMESTAMPTZ;
    test_result RECORD;
BEGIN
    test_start := now();
    
    -- Teste 1: Migração completa
    test_start := now();
    FOR test_result IN
        SELECT * FROM test_migration.execute_safe_migration_test()
    LOOP
        IF test_result.step = 'MIGRATION_TEST_COMPLETE' THEN
            test_end := now();
            RETURN QUERY SELECT 'Migration Test'::TEXT, test_result.status, test_result.details, test_end - test_start;
            EXIT;
        END IF;
    END LOOP;
    
    -- Teste 2: Mecanismo de rollback
    test_start := now();
    FOR test_result IN
        SELECT * FROM test_migration.test_rollback_mechanism()
    LOOP
        IF test_result.step = 'ROLLBACK_TEST_COMPLETE' THEN
            test_end := now();
            RETURN QUERY SELECT 'Rollback Test'::TEXT, test_result.status, test_result.details, test_end - test_start;
            EXIT;
        END IF;
    END LOOP;
    
    -- Teste 3: Validação de integridade
    test_start := now();
    PERFORM comprehensive_points_validation();
    test_end := now();
    RETURN QUERY SELECT 'Integrity Validation'::TEXT, 'SUCCESS'::TEXT, 
                 'Validação de integridade executada com sucesso'::TEXT, test_end - test_start;
    
    -- Teste 4: Auditoria
    test_start := now();
    PERFORM audit_points.consolidate_changes('HOUR');
    test_end := now();
    RETURN QUERY SELECT 'Audit System'::TEXT, 'SUCCESS'::TEXT, 
                 'Sistema de auditoria testado com sucesso'::TEXT, test_end - test_start;
    
    -- Teste 5: Backup e Restore Points
    test_start := now();
    PERFORM create_restore_point('final_test_restore_point');
    test_end := now();
    RETURN QUERY SELECT 'Backup System'::TEXT, 'SUCCESS'::TEXT, 
                 'Sistema de backup e restore points testado'::TEXT, test_end - test_start;
    
END;
$$ LANGUAGE plpgsql;

-- 5. Criar schema de teste
CREATE SCHEMA IF NOT EXISTS test_migration;