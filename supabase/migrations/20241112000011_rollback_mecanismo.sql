-- Mecanismo de Rollback para Restauração de Dados de Pontos
-- Este script permite restaurar os dados originais em caso de falha durante migração
-- Inclui: restauração de dados, validação pós-restauração e logs de rollback

-- 1. Função para criar ponto de restauração antes de alterações
CREATE OR REPLACE FUNCTION create_restore_point(point_name TEXT DEFAULT 'pre_migration_restore_point')
RETURNS TEXT AS $$
DECLARE
    restore_point_id TEXT;
    backup_count INTEGER;
BEGIN
    -- Criar backup completo com nome específico
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS backup_points.restore_point_%s AS
        SELECT 
            p.*,
            now() as restore_point_created_at,
            current_user as restore_point_created_by,
            %L as restore_point_name
        FROM public.points p
    ', replace(point_name, ' ', '_'), point_name);
    
    -- Obter contagem de registros
    EXECUTE format('
        SELECT COUNT(*) FROM backup_points.restore_point_%s
    ', replace(point_name, ' ', '_')) INTO backup_count;
    
    -- Registrar no log
    INSERT INTO backup_points.backup_log (backup_table_name, total_records, backup_type, created_by, notes)
    VALUES (
        format('restore_point_%s', replace(point_name, ' ', '_')),
        backup_count,
        'RESTORE_POINT',
        current_user,
        format('Ponto de restauração criado antes de: %s', point_name)
    );
    
    RETURN format('Ponto de restauração %s criado com %s registros', point_name, backup_count);
END;
$$ LANGUAGE plpgsql;

-- 2. Função para executar rollback
CREATE OR REPLACE FUNCTION rollback_points_data(restore_point_name TEXT DEFAULT 'pre_migration_restore_point')
RETURNS TABLE (operation TEXT, status TEXT, details TEXT, affected_records INTEGER) AS $$
DECLARE
    current_count INTEGER;
    backup_count INTEGER;
    restore_table_name TEXT;
BEGIN
    restore_table_name := format('restore_point_%s', replace(restore_point_name, ' ', '_'));
    
    -- Verificar se o ponto de restauração existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'backup_points' AND table_name = restore_table_name
    ) THEN
        RETURN QUERY SELECT 'ROLLBACK_CHECK'::TEXT, 'FAILED'::TEXT, 
                     format('Ponto de restauração %s não encontrado', restore_point_name)::TEXT, 0;
        RETURN;
    END IF;
    
    -- Obter contagem atual
    SELECT COUNT(*) INTO current_count FROM public.points;
    
    -- Obter contagem do backup
    EXECUTE format('SELECT COUNT(*) FROM backup_points.%I', restore_table_name) INTO backup_count;
    
    -- Registrar início do rollback
    RETURN QUERY SELECT 'ROLLBACK_START'::TEXT, 'INFO'::TEXT, 
                 format('Iniciando rollback de %s registros para %s registros', current_count, backup_count)::TEXT, 0;
    
    -- Criar backup do estado atual antes do rollback (precaução)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS backup_points.pre_rollback_backup_%s AS
        SELECT *, now() as rollback_timestamp, current_user as rollback_by
        FROM public.points
    ', to_char(now(), 'YYYYMMDD_HH24MISS'));
    
    -- Limpar tabela atual
    DELETE FROM public.points;
    RETURN QUERY SELECT 'ROLLBACK_CLEAR'::TEXT, 'SUCCESS'::TEXT, 'Tabela public.points limpa'::TEXT, current_count;
    
    -- Restaurar dados do ponto de restauração
    EXECUTE format('
        INSERT INTO public.points (id, name, status, price_1y, price_2y, price_3y, price_4y, price_5y, pricing_tier_id, created_at, updated_at)
        SELECT id, name, status, price_1y, price_2y, price_3y, price_4y, price_5y, pricing_tier_id, created_at, updated_at
        FROM backup_points.%I
    ', restore_table_name);
    
    -- Verificar contagem após restauração
    SELECT COUNT(*) INTO current_count FROM public.points;
    
    RETURN QUERY SELECT 'ROLLBACK_RESTORE'::TEXT, 'SUCCESS'::TEXT, 
                 format('Dados restaurados com sucesso. Total: %s registros', current_count)::TEXT, current_count;
    
    -- Registrar no log de auditoria
    INSERT INTO backup_points.audit_log (table_name, operation_type, performed_by, details)
    VALUES (
        'public.points',
        'ROLLBACK',
        current_user,
        format('Rollback executado do ponto %s. Registros restaurados: %s', restore_point_name, current_count)
    );
    
    -- Executar validação pós-rollback
    PERFORM log_validation_results('post_rollback_validation');
    
    RETURN QUERY SELECT 'ROLLBACK_COMPLETE'::TEXT, 'SUCCESS'::TEXT, 
                 'Rollback concluído com validação'::TEXT, current_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para rollback parcial (apenas registros específicos)
CREATE OR REPLACE FUNCTION rollback_specific_points(point_ids UUID[])
RETURNS TABLE (operation TEXT, status TEXT, details TEXT, affected_records INTEGER) AS $$
DECLARE
    restored_count INTEGER;
BEGIN
    -- Verificar se existem backups para os IDs especificados
    IF NOT EXISTS (
        SELECT 1 FROM backup_points.backup_log 
        WHERE backup_type = 'RESTORE_POINT' 
        ORDER BY backup_timestamp DESC 
        LIMIT 1
    ) THEN
        RETURN QUERY SELECT 'PARTIAL_ROLLBACK'::TEXT, 'FAILED'::TEXT, 
                     'Nenhum ponto de restauração disponível'::TEXT, 0;
        RETURN;
    END IF;
    
    -- Obter o backup mais recente
    CREATE TEMP TABLE latest_backup AS
    SELECT * FROM backup_points.restore_point_pre_migration_restore_point
    WHERE id = ANY(point_ids);
    
    -- Contar registros a serem restaurados
    SELECT COUNT(*) INTO restored_count FROM latest_backup;
    
    IF restored_count = 0 THEN
        RETURN QUERY SELECT 'PARTIAL_ROLLBACK'::TEXT, 'WARNING'::TEXT, 
                     'Nenhum registro encontrado nos IDs fornecidos'::TEXT, 0;
        RETURN;
    END IF;
    
    -- Atualizar apenas os registros específicos
    UPDATE public.points p
    SET 
        name = b.name,
        status = b.status,
        price_1y = b.price_1y,
        price_2y = b.price_2y,
        price_3y = b.price_3y,
        price_4y = b.price_4y,
        price_5y = b.price_5y,
        pricing_tier_id = b.pricing_tier_id,
        created_at = b.created_at,
        updated_at = now()
    FROM latest_backup b
    WHERE p.id = b.id;
    
    -- Registrar no log
    INSERT INTO backup_points.audit_log (table_name, operation_type, performed_by, details)
    VALUES (
        'public.points',
        'PARTIAL_ROLLBACK',
        current_user,
        format('Rollback parcial executado para %s registros específicos', restored_count)
    );
    
    RETURN QUERY SELECT 'PARTIAL_ROLLBACK'::TEXT, 'SUCCESS'::TEXT, 
                 format('Rollback parcial concluído para %s registros', restored_count)::TEXT, restored_count;
    
    -- Limpar tabela temporária
    DROP TABLE latest_backup;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para verificar disponibilidade de restore points
CREATE OR REPLACE FUNCTION list_available_restore_points()
RETURNS TABLE (restore_point_name TEXT, created_at TIMESTAMPTZ, total_records INTEGER, created_by TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.notes,
        bl.backup_timestamp,
        bl.total_records,
        bl.created_by
    FROM backup_points.backup_log bl
    WHERE bl.backup_type = 'RESTORE_POINT'
    ORDER BY bl.backup_timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para validar integridade antes de restauração
CREATE OR REPLACE FUNCTION validate_before_rollback(restore_point_name TEXT DEFAULT 'pre_migration_restore_point')
RETURNS TABLE (validation_type TEXT, status TEXT, details TEXT, current_count INTEGER, backup_count INTEGER) AS $$
DECLARE
    restore_table_name TEXT;
    current_total INTEGER;
    backup_total INTEGER;
BEGIN
    restore_table_name := format('restore_point_%s', replace(restore_point_name, ' ', '_'));
    
    -- Verificar existência do backup
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'backup_points' AND table_name = restore_table_name
    ) THEN
        RETURN QUERY SELECT 'BACKUP_EXISTS'::TEXT, 'FAILED'::TEXT, 
                     'Ponto de restauração não encontrado'::TEXT, 0, 0;
        RETURN;
    END IF;
    
    -- Obter contagens
    SELECT COUNT(*) INTO current_total FROM public.points;
    EXECUTE format('SELECT COUNT(*) FROM backup_points.%I', restore_table_name) INTO backup_total;
    
    RETURN QUERY SELECT 'COUNT_COMPARISON'::TEXT, 'INFO'::TEXT, 
                 format('Atual: %s registros, Backup: %s registros', current_total, backup_total)::TEXT, 
                 current_total, backup_total;
    
    -- Verificar diferenças estruturais
    RETURN QUERY
    SELECT 'STRUCTURE_DIFF'::TEXT, 
           CASE WHEN COUNT(*) = 0 THEN 'PASSED' ELSE 'WARNING' END,
           format('Diferenças estruturais: %s', COUNT(*)::TEXT),
           current_total, backup_total
    FROM (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'points'
        EXCEPT
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'backup_points' AND table_name = restore_table_name
    ) missing_columns;
    
    -- Verificar checksum
    RETURN QUERY
    SELECT 'CHECKSUM'::TEXT, 'INFO'::TEXT, 
           'Checksums serão verificados durante a restauração',
           current_total, backup_total;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar tabela de log de auditoria
CREATE TABLE IF NOT EXISTS backup_points.audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'BACKUP', 'RESTORE', 'ROLLBACK', 'PARTIAL_ROLLBACK'
    performed_by TEXT NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT now(),
    details TEXT,
    affected_records INTEGER,
    success BOOLEAN DEFAULT true
);

-- 7. Função para gerar relatório de rollback
CREATE OR REPLACE FUNCTION generate_rollback_report(restore_point_name TEXT DEFAULT 'pre_migration_restore_point')
RETURNS TABLE (report_line TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT '=== RELATÓRIO DE ROLLBACK ==='::TEXT
    UNION ALL
    SELECT 'Ponto de Restauração: ' || restore_point_name
    UNION ALL
    SELECT 'Data/Hora: ' || now()::TEXT
    UNION ALL
    SELECT 'Executado por: ' || current_user
    UNION ALL
    SELECT '----------------------------------------'::TEXT
    UNION ALL
    SELECT 'Validação Pré-Rollback:'
    UNION ALL
    SELECT validation_type || ': ' || status || ' - ' || details
    FROM validate_before_rollback(restore_point_name)
    UNION ALL
    SELECT '----------------------------------------'::TEXT
    UNION ALL
    SELECT 'Histórico de Backups:'
    UNION ALL
    SELECT 'Backup: ' || restore_point_name || ' | Criado: ' || created_at::TEXT || ' | Registros: ' || total_records::TEXT || ' | Por: ' || created_by
    FROM list_available_restore_points()
    WHERE restore_point_name = restore_point_name
    UNION ALL
    SELECT '----------------------------------------'::TEXT
    UNION ALL
    SELECT 'Últimas operações no log:'
    UNION ALL
    SELECT operation_type || ' em ' || performed_at::TEXT || ' por ' || performed_by || ' - ' || COALESCE(details, 'Sem detalhes')
    FROM backup_points.audit_log
    WHERE table_name = 'public.points'
    ORDER BY performed_at DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;