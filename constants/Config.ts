// ⚠️ IMPORTANTE: En producción, la API key NO debe estar en el código del cliente
// Debe manejarse a través de un backend seguro o variables de entorno del servidor
// Esto es solo para desarrollo/POC

export const Config = {
  // Gemini API Key - Solo para desarrollo
  GEMINI_API_KEY: 'AIzaSyCKQCggT2GbmPvfAM3AHfb7Q039T4Cs2W0',
  
  // Supabase Configuration
  SUPABASE_URL: 'https://ympeatyjqhtxgntvhly.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGVhdHlnanFodHhnbnR2aGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTY5NzIsImV4cCI6MjA2Njk5Mjk3Mn0.BCFkWYr0Bt6SPN_ojJ_J_JTac3rjWwg5TKgGSkkjqX8',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcGVhdHlnanFodHhnbnR2aGx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQxNjk3MiwiZXhwIjoyMDY2OTkyOTcyfQ.H3CoHCMlQThgwZja47Yknbe1iavovnc5PKLKdpBxxio',
  
  // Configuración de la app
  APP_NAME: 'Yester.ai',
  VERSION: '1.0.0',
  
  // Configuración de AI
  DEFAULT_MODEL: 'gemini-2.5-flash',
  IMAGE_MODEL: 'gemini-2.0-flash-preview-image-generation',
  
  // Límites
  MAX_EVENTS_PER_REQUEST: 5,
  REQUEST_TIMEOUT: 30000, // 30 segundos
  
  // Configuración de caché
  CACHE_DURATION_HOURS: 24 * 7, // 1 semana
  MAX_CACHE_SIZE: 100, // Máximo entradas en caché local
}; 