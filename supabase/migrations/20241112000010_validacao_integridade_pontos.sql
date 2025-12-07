-- Script de Validação de Integridade dos Dados de Pontos
-- Este script verifica a consistência dos dados após migração/manutenção
-- Inclui: validação de estrutura, relacionamentos, tipos de dados e integridade referencial

-- 1. Validação de Estrutura da Tabela
CREATE OR REPLACE FUNCTION validate_points_structure()
RETURNS TABLE (validation_type TEXT, status TEXT, details TEXT) AS $$
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'points'
    ) THEN
        RETURN QUERY SELECT 'TABLE_EXISTS'::TEXT, 'FAILED'::TEXT, 'Tabela public.points não existe'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar colunas obrigatórias
    RETURN QUERY
    SELECT 
        'REQUIRED_COLUMNS'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Colunas obrigatórias faltantes: ' || STRING_AGG(column_name, ', ')
    FROM (
        SELECT unnest(ARRAY['id', 'name', 'status', 'created_at', 'updated_at']) as column_name
        EXCEPT
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'points'
    ) missing_columns;
    
    -- Verificar tipos de dados
    RETURN QUERY
    SELECT 
        'COLUMN_TYPES'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Colunas com tipos incorretos: ' || STRING_AGG(
            column_name || ' (esperado: ' || expected_type || ', atual: ' || data_type || ')',
            ', '
        )
    FROM (
        SELECT 'id'::TEXT as column_name, 'uuid'::TEXT as expected_type
        UNION ALL SELECT 'name', 'text'
        UNION ALL SELECT 'status', 'text'
        UNION ALL SELECT 'created_at', 'timestamp with time zone'
        UNION ALL SELECT 'updated_at', 'timestamp with time zone'
    ) expected
    JOIN information_schema.columns actual 
        ON actual.table_schema = 'public' AND actual.table_name = 'points' 
        AND actual.column_name = expected.column_name
    WHERE actual.data_type != expected.expected_type;
    
    -- Verificar constraints de status
    RETURN QUERY
    SELECT 
        'STATUS_CONSTRAINTS'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Constraints de status válidos'
    FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%points_status%' 
    AND check_clause LIKE '%available%sold%reserved%';
END;
$$ LANGUAGE plpgsql;

-- 2. Validação de Dados
CREATE OR REPLACE FUNCTION validate_points_data()
RETURNS TABLE (validation_type TEXT, status TEXT, details TEXT, record_count BIGINT) AS $$
BEGIN
    -- Verificar registros duplicados por nome
    RETURN QUERY
    SELECT 
        'DUPLICATE_NAMES'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Nomes duplicados encontrados: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM (
        SELECT name, COUNT(*) as cnt
        FROM public.points
        GROUP BY name
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Verificar status inválidos
    RETURN QUERY
    SELECT 
        'INVALID_STATUS'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Status inválidos encontrados: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points
    WHERE status NOT IN ('available', 'sold', 'reserved');
    
    -- Verificar preços negativos ou nulos
    RETURN QUERY
    SELECT 
        'INVALID_PRICES'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Preços inválidos (negativos ou nulos): ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points
    WHERE (price_1y IS NOT NULL AND price_1y < 0)
       OR (price_2y IS NOT NULL AND price_2y < 0)
       OR (price_3y IS NOT NULL AND price_3y < 0)
       OR (price_4y IS NOT NULL AND price_4y < 0)
       OR (price_5y IS NOT NULL AND price_5y < 0);
    
    -- Verificar datas futuras
    RETURN QUERY
    SELECT 
        'FUTURE_DATES'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Datas futuras encontradas: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points
    WHERE created_at > now() + INTERVAL '1 day'
       OR updated_at > now() + INTERVAL '1 day';
    
    -- Verificar consistência de timestamps
    RETURN QUERY
    SELECT 
        'TIMESTAMP_CONSISTENCY'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Registros com updated_at < created_at: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points
    WHERE updated_at < created_at;
END;
$$ LANGUAGE plpgsql;

-- 3. Validação de Relacionamentos
CREATE OR REPLACE FUNCTION validate_points_relationships()
RETURNS TABLE (validation_type TEXT, status TEXT, details TEXT, record_count BIGINT) AS $$
BEGIN
    -- Verificar relacionamentos com pricing_tiers
    RETURN QUERY
    SELECT 
        'PRICING_TIER_RELATIONSHIP'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Pontos com pricing_tier_id inválido: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points p
    LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
    WHERE p.pricing_tier_id IS NOT NULL AND pt.id IS NULL;
    
    -- Verificar pontos órfãos (sem tier quando deveriam ter)
    RETURN QUERY
    SELECT 
        'ORPHANED_POINTS'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'WARNING' END,
        'Pontos sem tier de preço: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM public.points
    WHERE pricing_tier_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Validação de Integridade Referencial
CREATE OR REPLACE FUNCTION validate_referential_integrity()
RETURNS TABLE (validation_type TEXT, status TEXT, details TEXT, record_count BIGINT) AS $$
BEGIN
    -- Verificar FK constraints
    RETURN QUERY
    SELECT 
        'FOREIGN_KEY_CONSTRAINTS'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASSED' ELSE 'FAILED' END,
        'Constraints FK válidas: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'points'
    AND constraint_type = 'FOREIGN KEY';
    
    -- Verificar índices
    RETURN QUERY
    SELECT 
        'INDEX_COVERAGE'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'PASSED' ELSE 'WARNING' END,
        'Índices encontrados: ' || COUNT(*)::TEXT,
        COUNT(*)::BIGINT
    FROM information_schema.statistics 
    WHERE table_schema = 'public' AND table_name = 'points';
END;
$$ LANGUAGE plpgsql;

-- 5. Função Principal de Validação
CREATE OR REPLACE FUNCTION comprehensive_points_validation()
RETURNS TABLE (validation_category TEXT, validation_type TEXT, status TEXT, details TEXT, record_count BIGINT, timestamp TIMESTAMPTZ) AS $$
BEGIN
    -- Estrutura
    RETURN QUERY
    SELECT 'STRUCTURE'::TEXT, validation_type, status, details, record_count, now()
    FROM validate_points_structure();
    
    -- Dados
    RETURN QUERY
    SELECT 'DATA'::TEXT, validation_type, status, details, record_count, now()
    FROM validate_points_data();
    
    -- Relacionamentos
    RETURN QUERY
    SELECT 'RELATIONSHIPS'::TEXT, validation_type, status, details, record_count, now()
    FROM validate_points_relationships();
    
    -- Integridade Referencial
    RETURN QUERY
    SELECT 'REFERENTIAL_INTEGRITY'::TEXT, validation_type, status, details, record_count, now()
    FROM validate_referential_integrity();
    
    -- Resumo geral
    RETURN QUERY
    SELECT 
        'SUMMARY'::TEXT,
        'OVERALL_STATUS'::TEXT,
        CASE 
            WHEN COUNT(CASE WHEN status = 'FAILED' THEN 1 END) = 0 THEN 'PASSED'
            ELSE 'FAILED'
        END,
        'Total de validações: ' || COUNT(*)::TEXT || ', Falhas: ' || COUNT(CASE WHEN status = 'FAILED' THEN 1 END)::TEXT,
        COUNT(*)::BIGINT,
        now()
    FROM (
        SELECT validation_type, status FROM validate_points_structure()
        UNION ALL
        SELECT validation_type, status FROM validate_points_data()
        UNION ALL
        SELECT validation_type, status FROM validate_points_relationships()
        UNION ALL
        SELECT validation_type, status FROM validate_referential_integrity()
    ) all_validations;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar tabela de log de validações
CREATE TABLE IF NOT EXISTS validation_log (
    id SERIAL PRIMARY KEY,
    validation_category TEXT NOT NULL,
    validation_type TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT,
    record_count BIGINT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    migration_version TEXT,
    executed_by TEXT DEFAULT current_user
);

-- 7. Função para registrar validações
CREATE OR REPLACE FUNCTION log_validation_results(migration_version TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    validation_count INTEGER;
BEGIN
    INSERT INTO validation_log (validation_category, validation_type, status, details, record_count, migration_version)
    SELECT validation_category, validation_type, status, details, record_count, migration_version
    FROM comprehensive_points_validation();
    
    GET DIAGNOSTICS validation_count = ROW_COUNT;
    RETURN validation_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para gerar relatório de validação
CREATE OR REPLACE FUNCTION generate_validation_report()
RETURNS TABLE (report_line TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT '=== RELATÓRIO DE VALIDAÇÃO DE INTEGRIDADE DOS DADOS DE PONTOS ==='::TEXT
    UNION ALL
    SELECT 'Data e Hora: ' || now()::TEXT
    UNION ALL
    SELECT 'Total de Pontos: ' || (SELECT COUNT(*) FROM public.points)::TEXT
    UNION ALL
    SELECT '----------------------------------------'::TEXT
    UNION ALL
    SELECT 'Categoria: ' || validation_category || ' | Tipo: ' || validation_type || ' | Status: ' || status || ' | Detalhes: ' || COALESCE(details, 'N/A')
    FROM validation_log
    WHERE timestamp > now() - INTERVAL '1 hour'
    ORDER BY timestamp DESC, validation_category, validation_type
    UNION ALL
    SELECT '----------------------------------------'::TEXT
    UNION ALL
    SELECT 'Resumo: ' || 
        (SELECT COUNT(*)::TEXT || ' validações executadas, ' ||
                COUNT(CASE WHEN status = 'PASSED' THEN 1 END)::TEXT || ' aprovadas, ' ||
                COUNT(CASE WHEN status = 'FAILED' THEN 1 END)::TEXT || ' falhas, ' ||
                COUNT(CASE WHEN status = 'WARNING' THEN 1 END)::TEXT || ' avisos'
         FROM validation_log WHERE timestamp > now() - INTERVAL '1 hour')::TEXT;
END;
$$ LANGUAGE plpgsql;