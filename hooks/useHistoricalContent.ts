import { Config } from '@/constants/Config';
import { createGeminiService, GenerationParams, HistoricalEvent } from '@/services/geminiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseHistoricalContentResult {
  events: HistoricalEvent[];
  isLoading: boolean;
  error: string | null;
  generateContent: (params: GenerationParams) => Promise<void>;
  clearError: () => void;
  cancelGeneration: () => void;
}

// Cache simple para evitar regenerar el mismo contenido
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
      console.log('💾 Cache loaded from AsyncStorage');
    }
  } catch (error) {
    console.warn('Could not load cache from storage:', error);
  }
};

const saveCacheToStorage = async (): Promise<void> => {
  try {
    const cacheObject = Object.fromEntries(contentCache);
    await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
    console.log('💾 Cache saved to AsyncStorage');
  } catch (error) {
    console.warn('Could not save cache to storage:', error);
  }
};

export function useHistoricalContent(): UseHistoricalContentResult {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<string>('');
  const [cacheLoaded, setCacheLoaded] = useState(false);
  
  // Crear instancia del servicio de Gemini (solo una vez)
  const geminiService = useRef(createGeminiService(Config.GEMINI_API_KEY));
  
  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Cancelation flag
  const cancelationRef = useRef<boolean>(false);

  // Cargar cache al inicializar
  useEffect(() => {
    loadCacheFromStorage().then(() => setCacheLoaded(true));
  }, []);

  // Generar cache key para los parámetros
  const getCacheKey = useCallback((params: GenerationParams): string => {
    return `${params.year}-${params.region}-${params.topic}`;
  }, []);

  const generateContent = useCallback(async (params: GenerationParams) => {
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
      // Verificar cache primero
      const cachedEvents = contentCache.get(cacheKey);
      if (cachedEvents) {
        console.log('📦 Usando contenido del cache para:', cacheKey);
        setEvents(cachedEvents);
        setLastParams(cacheKey);
        return;
      }

      // Si ya estamos cargando, no hacer nada
      if (isLoading) return;

      setIsLoading(true);
      setError(null);
      setLastParams(cacheKey);
      cancelationRef.current = false; // Reset cancellation flag

      try {
        console.log('🤖 Generando contenido premium para:', params);
        
        // NUEVO: Usar modo premium que intenta AI para todos los eventos
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

        console.log(`✅ Generados ${aiEvents.length} eventos históricos`);
        
        // Check if cancelled before setting results
        if (cancelationRef.current) {
          console.log('🚫 Operation was cancelled, not setting results');
          return;
        }
        
        // Guardar en cache (memoria y AsyncStorage)
        contentCache.set(cacheKey, aiEvents);
        await saveCacheToStorage();
        setEvents(aiEvents);
        
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
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  }, [getCacheKey, lastParams, isLoading, cacheLoaded]);

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
    
    // Reset loading state
    setIsLoading(false);
    setError(null);
    
    console.log('🚫 Generation cancelled by user');
  }, []);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    events,
    isLoading,
    error,
    generateContent,
    clearError,
    cancelGeneration,
  };
}

/**
 * Datos de fallback PREMIUM con sistema inteligente de imágenes
 */
function getFallbackEvents(params: GenerationParams): HistoricalEvent[] {
  const getPremiumFallbackImage = (index: number, title: string): string => {
    const titleKeywords = title.toLowerCase();
    
    // Eventos específicos para 1990s
    if (params.year >= 1990 && params.year <= 2000) {
      if (titleKeywords.includes('events') && index === 0) {
        return params.region === 'America' ? 
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop' : // US Capitol
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop';   // European architecture
      }
      
      if (titleKeywords.includes('historic') && index === 1) {
        return params.topic === 'History' ? 
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop' : // Historical document
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';   // Science lab
      }
      
      if (titleKeywords.includes('development') && index === 2) {
        return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'; // Technology/progress
      }
    }
    
    // Imágenes premium por región-tema-índice
    const premiumCollections = {
      'History-America': [
        'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // US Capitol
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // American city
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'  // American history
      ],
      'History-Europe': [
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop', // European architecture
        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop', // European city
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'  // European culture
      ],
      'History-Global': [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop', // Global history
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', // World view
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'  // Global progress
      ],
      'Science-Global': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Laboratory
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', // Space science
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop'  // Medical science
      ],
      'default': [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop', // Historical default
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop', // Cultural heritage
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'  // Human achievement
      ]
    };

    const key = `${params.topic}-${params.region}` as keyof typeof premiumCollections;
    const imageSet = premiumCollections[key] || premiumCollections.default;
    return imageSet[index] || imageSet[0];
  };

  const fallbackEvents: HistoricalEvent[] = [
    {
      id: `${params.year}-fallback-1`,
      title: `Major Events of ${params.year}`,
      content: `🏛️ Explore the most significant events of ${params.year} in ${params.region}.\n\nThis year marked important moments in ${params.topic.toLowerCase()} that defined the course of history.\n\n✨ Content generated while connecting to our enhanced AI services.`,
      fullContent: `Important historical events from ${params.year} in the ${params.region} region, related to ${params.topic}.`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(0, `Major Events of ${params.year}`),
      isPrimary: true,
    },
    {
      id: `${params.year}-fallback-2`,
      title: `Secondary Historic Event`,
      content: `📚 Another important event from ${params.year}.\n\nThis event also had a significant impact on the history of ${params.region}.`,
      fullContent: `Secondary event from ${params.year}`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(1, `Secondary Historic Event`),
      isPrimary: false,
    },
    {
      id: `${params.year}-fallback-3`,
      title: `Noteworthy Development`,
      content: `🌟 A third relevant event from ${params.year}.\n\nCompletes the historical view of this important year.`,
      fullContent: `Third secondary event from ${params.year}`,
      year: params.year,
      region: params.region,
      topic: params.topic,
      imageUrl: getPremiumFallbackImage(2, `Noteworthy Development`),
      isPrimary: false,
    },
  ];

  return fallbackEvents;
} 