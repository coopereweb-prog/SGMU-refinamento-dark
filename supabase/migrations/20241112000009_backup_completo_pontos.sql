-- Script de Backup Completo dos Dados de Pontos
-- Este script cria um backup completo de todos os pontos cadastrados antes de qualquer modificação
-- Inclui: estrutura da tabela, dados, relacionamentos e metadados

-- Criar schema de backup se não existir
CREATE SCHEMA IF NOT EXISTS backup_points;

-- Criar tabela de backup com timestamp
CREATE TABLE IF NOT EXISTS backup_points.points_backup_$(date +%Y%m%d_%H%M%S) AS
SELECT 
    p.*,
    now() as backup_created_at,
    '$(whoami)' as backup_created_by
FROM public.points p;

-- Criar índices para performance nas consultas de backup
CREATE INDEX IF NOT EXISTS idx_backup_points_id ON backup_points.points_backup_$(date +%Y%m%d_%H%M%S) (id);
CREATE INDEX IF NOT EXISTS idx_backup_points_name ON backup_points.points_backup_$(date +%Y%m%d_%H%M%S) (name);
CREATE INDEX IF NOT EXISTS idx_backup_points_status ON backup_points.points_backup_$(date +%Y%m%d_%H%M%S) (status);

-- Verificar quantidade de registros no backup
SELECT 
    COUNT(*) as total_registros_backup,
    MIN(created_at) as data_mais_antiga,
    MAX(created_at) as data_mais_recente,
    COUNT(DISTINCT status) as total_status_diferentes
FROM backup_points.points_backup_$(date +%Y%m%d_%H%M%S);

-- Criar tabela de log de backup
CREATE TABLE IF NOT EXISTS backup_points.backup_log (
    id SERIAL PRIMARY KEY,
    backup_table_name TEXT NOT NULL,
    backup_timestamp TIMESTAMPTZ DEFAULT now(),
    total_records INTEGER NOT NULL,
    backup_type TEXT NOT NULL, -- 'FULL', 'INCREMENTAL', 'SCHEMA_ONLY'
    created_by TEXT NOT NULL,
    notes TEXT,
    checksum TEXT -- Para validação de integridade
);

-- Registrar o backup no log
INSERT INTO backup_points.backup_log (backup_table_name, total_records, backup_type, created_by, notes)
SELECT 
    'points_backup_$(date +%Y%m%d_%H%M%S)',
    COUNT(*),
    'FULL',
    '$(whoami)',
    'Backup completo antes de migração'
FROM backup_points.points_backup_$(date +%Y%m%d_%H%M%S);

-- Gerar checksum para validação
UPDATE backup_points.backup_log 
SET checksum = md5(array_agg(md5((p.*)::text))::text)
FROM backup_points.points_backup_$(date +%Y%m%d_%H%M%S) p
WHERE backup_points.backup_log.backup_table_name = 'points_backup_$(date +%Y%m%d_%H%M%S)'
GROUP BY backup_points.backup_log.id;

-- Criar arquivo SQL de backup para exportação externa
\copy (SELECT * FROM backup_points.points_backup_$(date +%Y%m%d_%H%M%S)) TO 'backup_points_$(date +%Y%m%d_%H%M%S).csv' WITH CSV HEADER;

-- Criar backup da estrutura
CREATE TABLE IF NOT EXISTS backup_points.points_structure_backup_$(date +%Y%m%d_%H%M%S) AS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'points'
ORDER BY ordinal_position;

-- Verificar integridade do backup comparando com dados originais
SELECT 
    'BACKUP' as source,
    COUNT(*) as total_records,
    COUNT(DISTINCT status) as distinct_status,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count,
    COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
    COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_count
FROM backup_points.points_backup_$(date +%Y%m%d_%H%M%S)
UNION ALL
SELECT 
    'ORIGINAL' as source,
    COUNT(*) as total_records,
    COUNT(DISTINCT status) as distinct_status,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count,
    COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
    COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_count
FROM public.points;