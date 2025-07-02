import { Config } from '@/constants/Config';
import { createClient } from '@supabase/supabase-js';

// Debug menos ruidoso de Supabase
export const debugSupabase = {
  
  // Test simplificado y silencioso
  async testConnection(): Promise<boolean> {
    try {
      const supabase = createClient(
        Config.SUPABASE_URL,
        Config.SUPABASE_ANON_KEY
      );
      
      // Test silencioso
      const { error } = await supabase
        .from('historical_content')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        // Solo mostrar error una vez al inicio
        console.log('📱 Supabase no disponible - usando cache local');
        return false;
      }
      
      console.log('✅ Supabase conectado exitosamente');
      return true;
      
    } catch (error) {
      console.log('📱 Supabase no disponible - usando cache local');
      return false;
    }
  }
};

// Para usar en la consola del browser
if (typeof window !== 'undefined') {
  (window as any).debugSupabase = debugSupabase;
} 