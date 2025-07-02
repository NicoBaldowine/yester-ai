-- ============================================
-- CONFIGURACIÓN COMPLETA DE SUPABASE PARA YESTER.AI
-- ============================================

-- 1. Crear la tabla principal
CREATE TABLE IF NOT EXISTS public.historical_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  region TEXT NOT NULL,
  topic TEXT NOT NULL,
  events JSONB NOT NULL,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índice único para evitar duplicados
  CONSTRAINT unique_content UNIQUE (year, region, topic)
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_historical_content_params 
ON public.historical_content (year, region, topic);

CREATE INDEX IF NOT EXISTS idx_historical_content_usage 
ON public.historical_content (usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_historical_content_created 
ON public.historical_content (created_at DESC);

-- 3. Función para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_usage_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.historical_content 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para limpiar contenido antiguo
CREATE OR REPLACE FUNCTION clean_old_content(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - INTERVAL '1 day' * days_old;
  
  DELETE FROM public.historical_content 
  WHERE updated_at < cutoff_date 
    AND usage_count = 0;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_historical_content_updated_at
  BEFORE UPDATE ON public.historical_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. ¡IMPORTANTE! Configurar RLS (Row Level Security)
-- Deshabilitar RLS para acceso público de lectura/escritura
ALTER TABLE public.historical_content DISABLE ROW LEVEL SECURITY;

-- Si prefieres habilitar RLS con políticas permisivas:
-- ALTER TABLE public.historical_content ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Public read access" ON public.historical_content
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Public insert access" ON public.historical_content
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Public update access" ON public.historical_content
--   FOR UPDATE USING (true);

-- 7. Insertar algunos datos de prueba (opcional)
INSERT INTO public.historical_content (year, region, topic, events) 
VALUES (
  1990,
  'Americas',
  'History',
  '[
    {
      "id": "test-1990-1",
      "title": "Reunificación Alemana",
      "content": "El 3 de octubre de 1990, Alemania se reunifica oficialmente...",
      "fullContent": "El 3 de octubre de 1990, Alemania se reunifica oficialmente tras la caída del Muro de Berlín...",
      "year": 1990,
      "region": "Americas",
      "topic": "History",
      "imageUrl": "https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop",
      "isPrimary": true
    }
  ]'::jsonb
) ON CONFLICT (year, region, topic) DO NOTHING;

-- 8. Verificar que todo funciona
SELECT 
  'Tabla creada correctamente' as status,
  COUNT(*) as total_records
FROM public.historical_content; 