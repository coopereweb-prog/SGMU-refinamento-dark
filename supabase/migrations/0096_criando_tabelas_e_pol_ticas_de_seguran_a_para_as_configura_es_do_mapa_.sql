-- Tabela para configurações globais do mapa
CREATE TABLE public.map_settings (
  id INT PRIMARY KEY DEFAULT 1,
  cluster_count_logic TEXT NOT NULL DEFAULT 'available_only' CHECK (cluster_count_logic IN ('total_points', 'available_only')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para regras por nível de zoom
CREATE TABLE public.map_zoom_rules (
  zoom_level INT PRIMARY KEY CHECK (zoom_level >= 1 AND zoom_level <= 22),
  display_mode TEXT NOT NULL DEFAULT 'cluster' CHECK (display_mode IN ('cluster', 'individual')),
  cluster_radius INT NOT NULL DEFAULT 60,
  min_cluster_size INT NOT NULL DEFAULT 2,
  cluster_styles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar 'updated_at' em map_settings
CREATE TRIGGER handle_updated_at_map_settings
  BEFORE UPDATE ON public.map_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger para atualizar 'updated_at' em map_zoom_rules
CREATE TRIGGER handle_updated_at_map_zoom_rules
  BEFORE UPDATE ON public.map_zoom_rules
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Inserir a linha de configuração padrão
INSERT INTO public.map_settings (id, cluster_count_logic) VALUES (1, 'available_only') ON CONFLICT (id) DO NOTHING;

-- Inserir regras padrão para começar (se a tabela estiver vazia)
INSERT INTO public.map_zoom_rules (zoom_level, display_mode, cluster_radius, min_cluster_size) VALUES
(1, 'cluster', 80, 5), (2, 'cluster', 80, 5), (3, 'cluster', 80, 5),
(4, 'cluster', 80, 5), (5, 'cluster', 80, 5), (6, 'cluster', 70, 4),
(7, 'cluster', 70, 4), (8, 'cluster', 70, 3), (9, 'cluster', 60, 3),
(10, 'cluster', 60, 2), (11, 'cluster', 50, 2), (12, 'cluster', 50, 2),
(13, 'cluster', 40, 2), (14, 'cluster', 40, 2), (15, 'individual', 40, 2),
(16, 'individual', 40, 2), (17, 'individual', 40, 2), (18, 'individual', 40, 2),
(19, 'individual', 40, 2), (20, 'individual', 40, 2), (21, 'individual', 40, 2),
(22, 'individual', 40, 2)
ON CONFLICT (zoom_level) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_zoom_rules ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para map_settings
DROP POLICY IF EXISTS "Public can read map settings" ON public.map_settings;
CREATE POLICY "Public can read map settings" ON public.map_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage map settings" ON public.map_settings;
CREATE POLICY "Admins can manage map settings" ON public.map_settings FOR ALL USING ((get_current_user_role() = 'admin'::text));


-- Políticas de RLS para map_zoom_rules
DROP POLICY IF EXISTS "Public can read map zoom rules" ON public.map_zoom_rules;
CREATE POLICY "Public can read map zoom rules" ON public.map_zoom_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage map zoom rules" ON public.map_zoom_rules;
CREATE POLICY "Admins can manage map zoom rules" ON public.map_zoom_rules FOR ALL USING ((get_current_user_role() = 'admin'::text));