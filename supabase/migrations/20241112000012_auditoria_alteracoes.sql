-- Sistema de Auditoria e Log Detalhado de Alterações
-- Este script cria um sistema completo de rastreamento de todas as alterações nos dados de pontos
-- Inclui: triggers de auditoria, histórico de alterações, e relatórios detalhados

-- 1. Criar schema de auditoria
CREATE SCHEMA IF NOT EXISTS audit_points;

-- 2. Tabela de log de alterações
CREATE TABLE IF NOT EXISTS audit_points.change_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now(),
    session_id TEXT,
    application_name TEXT,
    client_ip INET,
    user_agent TEXT,
    transaction_id BIGINT,
    migration_version TEXT,
    notes TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_change_log_table_name ON audit_points.change_log (table_name);
CREATE INDEX IF NOT EXISTS idx_change_log_record_id ON audit_points.change_log (record_id);
CREATE INDEX IF NOT EXISTS idx_change_log_changed_at ON audit_points.change_log (changed_at);
CREATE INDEX IF NOT EXISTS idx_change_log_operation_type ON audit_points.change_log (operation_type);
CREATE INDEX IF NOT EXISTS idx_change_log_changed_by ON audit_points.change_log (changed_by);

-- 3. Tabela de resumo de alterações por período
CREATE TABLE IF NOT EXISTS audit_points.change_summary (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    record_count BIGINT NOT NULL,
    first_change TIMESTAMPTZ NOT NULL,
    last_change TIMESTAMPTZ NOT NULL,
    summary_period TEXT NOT NULL, -- 'HOUR', 'DAY', 'WEEK', 'MONTH'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Função para capturar informações da sessão
CREATE OR REPLACE FUNCTION audit_points.get_session_info()
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'session_id', pg_backend_pid()::TEXT,
        'application_name', current_setting('application.name', true),
        'client_ip', inet_client_addr(),
        'user_agent', current_setting('request.user_agent', true),
        'transaction_id', txid_current(),
        'migration_version', current_setting('migration.version', true)
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Função de auditoria genérica
CREATE OR REPLACE FUNCTION audit_points.audit_changes()
RETURNS TRIGGER AS $$
DECLARE
    session_info JSONB;
    old_data_json JSONB;
    new_data_json JSONB;
    operation_text TEXT;
BEGIN
    -- Obter informações da sessão
    session_info := audit_points.get_session_info();
    
    -- Determinar tipo de operação
    IF TG_OP = 'INSERT' THEN
        operation_text := 'INSERT';
        old_data_json := NULL;
        new_data_json := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        operation_text := 'UPDATE';
        old_data_json := to_jsonb(OLD);
        new_data_json := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        operation_text := 'DELETE';
        old_data_json := to_jsonb(OLD);
        new_data_json := NULL;
    ELSE
        operation_text := TG_OP;
        old_data_json := to_jsonb(OLD);
        new_data_json := to_jsonb(NEW);
    END IF;
    
    -- Registrar alteração
    INSERT INTO audit_points.change_log (
        table_name,
        operation_type,
        record_id,
        old_data,
        new_data,
        changed_by,
        changed_at,
        session_id,
        application_name,
        client_ip,
        user_agent,
        transaction_id,
        migration_version,
        notes
    ) VALUES (
        TG_TABLE_NAME,
        operation_text,
        COALESCE(NEW.id, OLD.id),
        old_data_json,
        new_data_json,
        current_user,
        now(),
        session_info->>'session_id',
        session_info->>'application_name',
        (session_info->>'client_ip')::INET,
        session_info->>'user_agent',
        (session_info->>'transaction_id')::BIGINT,
        session_info->>'migration_version',
        'Alteração registrada automaticamente'
    );
    
    -- Retornar o registro apropriado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers de auditoria para tabela points
DROP TRIGGER IF EXISTS audit_points_changes ON public.points;
CREATE TRIGGER audit_points_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.points
    FOR EACH ROW
    EXECUTE FUNCTION audit_points.audit_changes();

-- 7. Função para gerar relatório de alterações por período
CREATE OR REPLACE FUNCTION audit_points.generate_change_report(
    start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '24 hours',
    end_date TIMESTAMPTZ DEFAULT now(),
    table_filter TEXT DEFAULT 'points',
    user_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    report_section TEXT,
    detail_line TEXT,
    record_count BIGINT,
    timestamp_info TIMESTAMPTZ
) AS $$
BEGIN
    -- Cabeçalho
    RETURN QUERY
    SELECT 'HEADER'::TEXT, 
           format('Relatório de Alterações - Período: %s a %s', start_date::TEXT, end_date::TEXT)::TEXT,
           0::BIGINT, now();
    
    -- Resumo por operação
    RETURN QUERY
    SELECT 'SUMMARY_BY_OPERATION'::TEXT,
           format('%s: %s registros', operation_type, record_count)::TEXT,
           record_count,
           now()
    FROM (
        SELECT operation_type, COUNT(*) as record_count
        FROM audit_points.change_log
        WHERE changed_at BETWEEN start_date AND end_date
        AND (table_filter IS NULL OR table_name = table_filter)
        GROUP BY operation_type
    ) operation_summary;
    
    -- Resumo por usuário
    RETURN QUERY
    SELECT 'SUMMARY_BY_USER'::TEXT,
           format('%s: %s operações', changed_by, record_count)::TEXT,
           record_count,
           now()
    FROM (
        SELECT changed_by, COUNT(*) as record_count
        FROM audit_points.change_log
        WHERE changed_at BETWEEN start_date AND end_date
        AND (table_filter IS NULL OR table_name = table_filter)
        AND (user_filter IS NULL OR changed_by = user_filter)
        GROUP BY changed_by
    ) user_summary;
    
    -- Top 10 registros mais alterados
    RETURN QUERY
    SELECT 'TOP_MODIFIED_RECORDS'::TEXT,
           format('Registro %s: %s alterações', record_id::TEXT, modification_count::TEXT)::TEXT,
           modification_count,
           max_changed_at
    FROM (
        SELECT record_id, COUNT(*) as modification_count, MAX(changed_at) as max_changed_at
        FROM audit_points.change_log
        WHERE changed_at BETWEEN start_date AND end_date
        AND (table_filter IS NULL OR table_name = table_filter)
        GROUP BY record_id
        ORDER BY modification_count DESC
        LIMIT 10
    ) top_modified;
    
    -- Alterações recentes
    RETURN QUERY
    SELECT 'RECENT_CHANGES'::TEXT,
           format('%s em %s por %s', operation_type, changed_at::TEXT, changed_by)::TEXT,
           1::BIGINT,
           changed_at
    FROM audit_points.change_log
    WHERE changed_at BETWEEN start_date AND end_date
    AND (table_filter IS NULL OR table_name = table_filter)
    ORDER BY changed_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para detalhar alterações de um registro específico
CREATE OR REPLACE FUNCTION audit_points.get_record_change_history(
    target_record_id UUID,
    table_name_filter TEXT DEFAULT 'points'
)
RETURNS TABLE (
    change_id BIGINT,
    operation_type TEXT,
    changed_at TIMESTAMPTZ,
    changed_by TEXT,
    field_changes TEXT,
    old_values TEXT,
    new_values TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.operation_type,
        cl.changed_at,
        cl.changed_by,
        CASE 
            WHEN cl.operation_type = 'INSERT' THEN 'Novo registro criado'
            WHEN cl.operation_type = 'DELETE' THEN 'Registro removido'
            ELSE (
                SELECT string_agg(key || ': ' || 
                    CASE 
                        WHEN old_data->key IS NULL THEN 'NULL → ' || (new_data->key)::TEXT
                        WHEN new_data->key IS NULL THEN (old_data->key)::TEXT || ' → NULL'
                        ELSE (old_data->key)::TEXT || ' → ' || (new_data->key)::TEXT
                    END, ', ')
                FROM jsonb_object_keys(cl.new_data) key
                WHERE cl.old_data IS NULL OR cl.old_data->key IS DISTINCT FROM cl.new_data->key
            )
        END as field_changes,
        CASE 
            WHEN cl.old_data IS NULL THEN 'N/A'
            ELSE cl.old_data::TEXT
        END as old_values,
        CASE 
            WHEN cl.new_data IS NULL THEN 'N/A'
            ELSE cl.new_data::TEXT
        END as new_values
    FROM audit_points.change_log cl
    WHERE cl.record_id = target_record_id
    AND cl.table_name = table_name_filter
    ORDER BY cl.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para consolidar alterações (criar sumários)
CREATE OR REPLACE FUNCTION audit_points.consolidate_changes(
    summary_period TEXT DEFAULT 'DAY'
)
RETURNS INTEGER AS $$
DECLARE
    consolidated_count INTEGER;
    period_start TIMESTAMPTZ;
    period_end TIMESTAMPTZ;
BEGIN
    -- Determinar período baseado no tipo de sumário
    CASE summary_period
        WHEN 'HOUR' THEN
            period_start := date_trunc('hour', now() - interval '1 hour');
            period_end := date_trunc('hour', now());
        WHEN 'DAY' THEN
            period_start := date_trunc('day', now() - interval '1 day');
            period_end := date_trunc('day', now());
        WHEN 'WEEK' THEN
            period_start := date_trunc('week', now() - interval '1 week');
            period_end := date_trunc('week', now());
        WHEN 'MONTH' THEN
            period_start := date_trunc('month', now() - interval '1 month');
            period_end := date_trunc('month', now());
        ELSE
            period_start := date_trunc('day', now() - interval '1 day');
            period_end := date_trunc('day', now());
    END CASE;
    
    -- Inserir sumários consolidados
    INSERT INTO audit_points.change_summary (
        table_name,
        operation_type,
        changed_by,
        record_count,
        first_change,
        last_change,
        summary_period
    )
    SELECT 
        table_name,
        operation_type,
        changed_by,
        COUNT(*) as record_count,
        MIN(changed_at) as first_change,
        MAX(changed_at) as last_change,
        summary_period
    FROM audit_points.change_log
    WHERE changed_at BETWEEN period_start AND period_end
    GROUP BY table_name, operation_type, changed_by, summary_period;
    
    GET DIAGNOSTICS consolidated_count = ROW_COUNT;
    RETURN consolidated_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Função para limpar logs antigos (mantendo últimos 30 dias por padrão)
CREATE OR REPLACE FUNCTION audit_points.cleanup_old_logs(
    retention_days INTEGER DEFAULT 30
)
RETURNS TABLE (deleted_records BIGINT, retention_period TEXT) AS $$
DECLARE
    deleted_count BIGINT;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := now() - interval '1 day' * retention_days;
    
    -- Deletar logs antigos
    DELETE FROM audit_points.change_log
    WHERE changed_at < cutoff_date
    RETURNING id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN QUERY SELECT deleted_count, format('%s dias', retention_days)::TEXT;
END;
$$ LANGUAGE plpgsql;