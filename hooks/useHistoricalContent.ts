import { Config } from '@/constants/Config';
import { debugSupabase } from '@/services/debugSupabase';
import { createGeminiService, GenerationParams, HistoricalEvent } from '@/services/geminiService';
import { supabaseService } from '@/services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseHistoricalContentResult {
  events: HistoricalEvent[];
  isLoading: boolean;
  showSkeleton: boolean;
  error: string | null;
  generateContent: (params: GenerationParams) => Promise<void>;
  clearError: () => void;
  cancelGeneration: () => void;
  cacheStats?: { local: number; global: number; totalUsage: number };
}

// Cache local para evitar regenerar el mismo contenido
const contentCache = new Map<string, HistoricalEvent[]>();

// Storage helpers para persistir cache con AsyncStorage
const CACHE_STORAGE_KEY = 'yester-ai-content-cache';

const loadCacheFromStorage = async (): Promise<void> => {
  try {
    const storedCache = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (storedCache) {
      const parsedCache = JSON.parse(storedCache);
      Object.entries(parsedCache).forEach(([key, value]) => {
        contentCache.set(key, value as HistoricalEvent[]);
      });
      console.log('💾 Cache local cargado desde AsyncStorage');
    }
  } catch (error) {
    console.warn('Could not load cache from storage:', error);
  }
};

const saveCacheToStorage = async (): Promise<void> => {
  try {
    const cacheObject = Object.fromEntries(contentCache);
    await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
    console.log('💾 Cache local guardado en AsyncStorage');
  } catch (error) {
    console.warn('Could not save cache to storage:', error);
  }
};

export function useHistoricalContent(): UseHistoricalContentResult {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<string>('');
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cacheStats, setCacheStats] = useState<{ local: number; global: number; totalUsage: number }>();
  const [initialParams, setInitialParams] = useState<GenerationParams | null>(null);
  
  // Crear instancia del servicio de Gemini (solo una vez)
  const geminiService = useRef(createGeminiService(Config.GEMINI_API_KEY));
  
  // Debounce timer
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  // Skeleton timer - para mostrar skeleton por mínimo tiempo
  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  // Cancelation flag
  const cancelationRef = useRef<boolean>(false);

  // Cargar cache al inicializar
  useEffect(() => {
    const initializeCache = async () => {
      await loadCacheFromStorage();
      
      // Probar conectividad a Supabase
      const isConnected = await supabaseService.testConnection();
      if (!isConnected) {
        // Test simplificado sin logs molestos
        await debugSupabase.testConnection();
      }
      
      setCacheLoaded(true);
      await loadCacheStats();
    };
    
    initializeCache();
  }, []);

  // Efecto para cargar contenido cacheado automáticamente cuando esté listo
  useEffect(() => {
    if (cacheLoaded && initialParams) {
      const cacheKey = getCacheKey(initialParams);
      const cachedEvents = contentCache.get(cacheKey);
      
      if (cachedEvents && cachedEvents.length > 0) {
        console.log('⚡ Cargando contenido cacheado automáticamente para:', cacheKey);
        setEvents(cachedEvents);
        setLastParams(cacheKey);
      }
    }
  }, [cacheLoaded, initialParams]);

  // Cargar estadísticas de cache
  const loadCacheStats = async () => {
    try {
      const localCount = contentCache.size;
      
      let globalStats = null;
      try {
        globalStats = await supabaseService.getUsageStats();
      } catch (supabaseError) {
        // Fallo silencioso
      }
      
      setCacheStats({
        local: localCount,
        global: globalStats?.totalContent || 0,
        totalUsage: globalStats?.totalUsage || 0
      });
    } catch (error) {
      // Fallo silencioso
    }
  };

  // Generar cache key para los parámetros
  const getCacheKey = useCallback((params: GenerationParams): string => {
    return `${params.year}-${params.region}-${params.topic}`;
  }, []);

  const generateContent = useCallback(async (params: GenerationParams) => {
    // Guardar parámetros iniciales para carga automática
    if (!initialParams) {
      setInitialParams(params);
    }
    
    // Esperar a que el cache esté cargado
    if (!cacheLoaded) return;

    const cacheKey = getCacheKey(params);
    
    // Si es la misma consulta que la anterior, no hacer nada
    if (lastParams === cacheKey) {
      return;
    }

    // Clear previous debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce para evitar llamadas múltiples rápidas
    debounceTimer.current = setTimeout(async () => {
      // NO activar skeleton inmediatamente - solo en cache hits
      
      // Timer mínimo para skeleton (400ms) - solo se usará si hay cache hit
      const minSkeletonTime = new Promise<void>(resolve => {
        skeletonTimer.current = setTimeout(resolve, 400) as ReturnType<typeof setTimeout>;
      });

      // NIVEL 1: Verificar cache local primero (INSTANTÁNEO)
      const cachedEvents = contentCache.get(cacheKey);
      if (cachedEvents) {
        console.log('⚡ Usando contenido del cache LOCAL para:', cacheKey);
        
        // ACTIVAR skeleton solo aquí (cache hit local)
        setShowSkeleton(true);
        
        // Esperar tiempo mínimo de skeleton
        await minSkeletonTime;
        
        // Check if cancelled
        if (cancelationRef.current) {
          setShowSkeleton(false);
          return;
        }
        
        setEvents(cachedEvents);
        setLastParams(cacheKey);
        setShowSkeleton(false);
        return;
      }

      // Si ya estamos cargando, no hacer nada
      if (isLoading) return;

      // Para Supabase y AI, usar isLoading (no skeleton)
      setIsLoading(true);
      setError(null);
      setLastParams(cacheKey);
      cancelationRef.current = false; // Reset cancellation flag

      try {
        // NIVEL 2: Verificar Supabase (RÁPIDO - 2-3 segundos)
        let supabaseEvents: HistoricalEvent[] | null = null;
        try {
          supabaseEvents = await supabaseService.getHistoricalContent(params);
        } catch (supabaseError) {
          // Fallo silencioso
        }
        
        if (supabaseEvents && supabaseEvents.length > 0) {
          console.log('🎯 Contenido encontrado en Supabase! Cargando...');
          
          // ACTIVAR skeleton solo aquí (cache hit Supabase)
          setShowSkeleton(true);
          setIsLoading(false); // Apagar isLoading para mostrar skeleton
          
          // Esperar tiempo mínimo de skeleton
          await minSkeletonTime;
          
          // Check if cancelled before setting results
          if (cancelationRef.current) {
            console.log('🚫 Operation was cancelled, not setting results');
            setIsLoading(false);
            setShowSkeleton(false);
            return;
          }
          
          // Guardar en cache local para próxima vez
          contentCache.set(cacheKey, supabaseEvents);
          await saveCacheToStorage();
          setEvents(supabaseEvents);
          setShowSkeleton(false);
          await loadCacheStats(); // Actualizar stats
          return;
        }

        // NIVEL 3: Generar con Gemini AI (LENTO - 10-15 segundos)
        // Mantener isLoading=true, NO usar skeleton para generación nueva
        console.log('🤖 Generando contenido nuevo con AI para:', params);
        
        // Usar modo premium que intenta AI para todos los eventos
        let aiEvents: HistoricalEvent[];
        try {
          console.log('🌟 Modo PREMIUM: intentando generar imágenes hermosas para todos los eventos...');
          aiEvents = await geminiService.current.generatePremiumHistoricalEvents(params);
          console.log('✅ Generado contenido premium exitosamente');
        } catch (premiumError) {
          console.log('⚠️ Falló modo premium, usando fallbacks optimizados...');
          // Fallback a modo optimizado con imágenes premium inteligentes
          aiEvents = await geminiService.current.generateOptimizedHistoricalEvents(params);
          console.log('✅ Generado contenido con fallbacks premium');
        }
        
        if (aiEvents.length === 0) {
          throw new Error('No se pudieron generar eventos históricos');
        }

        console.log(`✅ Generados ${aiEvents.length} eventos históricos con AI`);
        
        // Check if cancelled before setting results
        if (cancelationRef.current) {
          console.log('🚫 Operation was cancelled, not setting results');
          setIsLoading(false);
          setShowSkeleton(false);
          return;
        }
        
        // Guardar en AMBOS caches (local y Supabase)
        contentCache.set(cacheKey, aiEvents);
        
        // Guardar local (siempre)
        await saveCacheToStorage();
        
        // Guardar en Supabase (si está disponible)
        try {
          await supabaseService.saveHistoricalContent(params, aiEvents);
          console.log('✅ Contenido guardado en Supabase');
        } catch (supabaseError) {
          // Fallo silencioso - no necesitamos saber si falla
        }
        
        // NO usar skeleton para AI generation, solo mostrar contenido
        setEvents(aiEvents);
        await loadCacheStats(); // Actualizar stats
        
      } catch (err) {
        console.error('❌ Error generando contenido:', err);
        
        // Establecer mensaje de error amigable
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`No se pudo generar contenido: ${errorMessage}`);
        
        // Fallback: usar datos dummy en caso de error
        const fallbackEvents = getFallbackEvents(params);
        contentCache.set(cacheKey, fallbackEvents);
        await saveCacheToStorage();
        setEvents(fallbackEvents);
        
      } finally {
        setIsLoading(false); // Solo apagar isLoading
      }
    }, 300); // 300ms debounce
  }, [getCacheKey, lastParams, isLoading, cacheLoaded, initialParams]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelGeneration = useCallback(() => {
    // Cancel any ongoing operation
    cancelationRef.current = true;
    
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = undefined;
    }
    
    // Clear skeleton timer
    if (skeletonTimer.current) {
      clearTimeout(skeletonTimer.current);
      skeletonTimer.current = undefined;
    }
    
    // Reset loading state
    setIsLoading(false);
    setShowSkeleton(false);
    setError(null);
    
    console.log('🚫 Generation cancelled by user');
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (skeletonTimer.current) {
        clearTimeout(skeletonTimer.current);
      }
    };
  }, []);

  return {
    events,
    isLoading,
    showSkeleton,
    error,
    generateContent,
    clearError,
    cancelGeneration,
    cacheStats,
  };
}

/**
 * Datos de fallback PREMIUM con sistema inteligente de imágenes
 */
function getFallbackEvents(params: GenerationParams): HistoricalEvent[] {
  const getPremiumFallbackImage = (index: number, title: string): string => {
    const lowerTitle = title.toLowerCase();
    
    // NIVEL 1: Detección específica de eventos
    const specificEvents: { [key: string]: string } = {
      'operación desert shield': 'https://images.unsplash.com/photo-1551778056-0b3b6e0e5e68?w=800&h=400&fit=crop',
      'desert shield': 'https://images.unsplash.com/photo-1551778056-0b3b6e0e5e68?w=800&h=400&fit=crop',
      'gulf war': 'https://images.unsplash.com/photo-1551778056-0b3b6e0e5e68?w=800&h=400&fit=crop',
      'ada': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
      'americans with disabilities': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
      'berlin wall': 'https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop',
      'muro de berlín': 'https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop',
      'reunificación alemana': 'https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop',
      'nelson mandela': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
      'mandela release': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
      'hubble': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
      'space telescope': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
    };

    for (const [keyword, image] of Object.entries(specificEvents)) {
      if (lowerTitle.includes(keyword)) {
        return image;
      }
    }

    // NIVEL 2: Detección por región + tópico con variaciones por índice
    const regionTopicCombos: { [key: string]: string[] } = {
      'americas-history': [
        'https://images.unsplash.com/photo-1551778056-0b3b6e0e5e68?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop'
      ],
      'europe-history': [
        'https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c735?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=400&fit=crop'
      ],
      'asia-history': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&h=400&fit=crop'
      ],
      'africa-history': [
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551100264-4f0bbec7a0b3?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop'
      ],
      'oceania-history': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1540428296511-5c57adcc2a8b?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=400&fit=crop'
      ],
      'science': [
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800&h=400&fit=crop'
      ]
    };

    const regionKey = `${params.region.toLowerCase()}-${params.topic.toLowerCase()}`;
    const topicKey = params.topic.toLowerCase();
    
    if (regionTopicCombos[regionKey]) {
      const images = regionTopicCombos[regionKey];
      return images[index % images.length];
    }
    
    if (regionTopicCombos[topicKey]) {
      const images = regionTopicCombos[topicKey];
      return images[index % images.length];
    }

    // NIVEL 3: Por década con contexto
    const decadeImages: { [key: string]: string[] } = {
      '1990s': [
        'https://images.unsplash.com/photo-1551778056-0b3b6e0e5e68?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1509623862505-9848ac2b6c22?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
      ],
      '2000s': [
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800&h=400&fit=crop'
      ],
      '2010s': [
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=400&fit=crop'
      ],
    };

    const decade = `${Math.floor(params.year / 10) * 10}s`;
    if (decadeImages[decade]) {
      const images = decadeImages[decade];
      return images[index % images.length];
    }

    // NIVEL 4: Fallback general
    const generalImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c735?w=800&h=400&fit=crop'
    ];
    
    return generalImages[index % generalImages.length];
  };

  return [
    {
      id: 'fallback-1',
      title: `Major Event in ${params.region} ${params.year}`,
      content: `This is a significant ${params.topic.toLowerCase()} event that occurred in ${params.region} during ${params.year}. Due to connectivity issues, we're showing placeholder content. Please try again when connected.`,
      fullContent: `This is a significant ${params.topic.toLowerCase()} event that occurred in ${params.region} during ${params.year}. Due to connectivity issues, we're showing placeholder content. Please try again when connected.`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(0, `Major Event in ${params.region} ${params.year}`),
      isPrimary: true,
    },
    {
      id: 'fallback-2',
      title: `Secondary Event ${params.year}`,
      content: `Another important development in ${params.topic.toLowerCase()} from ${params.year}.`,
      fullContent: `Another important development in ${params.topic.toLowerCase()} from ${params.year}.`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(1, `Secondary Event ${params.year}`),
      isPrimary: false,
    },
    {
      id: 'fallback-3',
      title: `Cultural Development ${params.year}`,
      content: `A cultural or social development that shaped ${params.region} in ${params.year}.`,
      fullContent: `A cultural or social development that shaped ${params.region} in ${params.year}.`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(2, `Cultural Development ${params.year}`),
      isPrimary: false,
    },
  ];
} 