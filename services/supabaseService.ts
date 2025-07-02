import { Config } from '@/constants/Config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GenerationParams, HistoricalEvent } from './geminiService';

interface HistoricalContentRow {
  id: string;
  year: number;
  region: string;
  topic: string;
  events: HistoricalEvent[];
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      Config.SUPABASE_URL,
      Config.SUPABASE_ANON_KEY
    );
  }

  // Test de conectividad silencioso
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('historical_content')
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      return false;
    }
  }

  // Obtener contenido desde Supabase
  async getHistoricalContent(params: GenerationParams): Promise<HistoricalEvent[] | null> {
    try {
      const { data, error } = await this.supabase
        .from('historical_content')
        .select('*')
        .eq('year', params.year)
        .eq('region', params.region)
        .eq('topic', params.topic)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw error;
      }

      if (data) {
        console.log('🎯 Contenido encontrado en Supabase');
        await this.incrementUsageCount(data.id);
        return data.events as HistoricalEvent[];
      }

      return null;
    } catch (error) {
      return null; // Fallo silencioso
    }
  }

  // Guardar contenido en Supabase
  async saveHistoricalContent(
    params: GenerationParams, 
    events: HistoricalEvent[]
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('historical_content')
        .upsert({
          year: params.year,
          region: params.region,
          topic: params.topic,
          events: events,
          usage_count: 1
        }, {
          onConflict: 'year,region,topic'
        });

      if (error) throw error;
      console.log('✅ Guardado en Supabase');
      return true;
    } catch (error) {
      return false; // Fallo silencioso
    }
  }

  // Incrementar contador de uso
  private async incrementUsageCount(contentId: string): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('increment_usage_count', {
        content_id: contentId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn('⚠️ Error incrementando contador:', error);
    }
  }

  // Obtener estadísticas de uso
  async getUsageStats(): Promise<{ totalContent: number; totalUsage: number } | null> {
    try {
      const { data, error } = await this.supabase
        .from('historical_content')
        .select('usage_count');

      if (error) return null;

      const totalContent = data.length;
      const totalUsage = data.reduce((sum, row) => sum + row.usage_count, 0);

      return { totalContent, totalUsage };
    } catch (error) {
      return null;
    }
  }

  // Método para limpiar contenido antiguo (opcional)
  async cleanOldContent(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { count, error } = await this.supabase
        .from('historical_content')
        .delete({ count: 'exact' })
        .lt('updated_at', cutoffDate.toISOString())
        .eq('usage_count', 0); // Solo eliminar contenido no usado

      if (error) throw error;

      const deletedCount = count || 0;
      console.log(`🧹 Limpiado ${deletedCount} entradas antiguas de Supabase`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error limpiando contenido antiguo:', error);
      return 0;
    }
  }

  // Buscar contenido similar (para recomendaciones futuras)
  async findSimilarContent(
    params: GenerationParams, 
    limit: number = 5
  ): Promise<HistoricalContentRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('historical_content')
        .select('*')
        .or(`region.eq.${params.region},topic.eq.${params.topic}`)
        .neq('year', params.year)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error buscando contenido similar:', error);
      return [];
    }
  }
}

// Singleton instance
export const supabaseService = new SupabaseService(); 