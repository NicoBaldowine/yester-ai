// ⚠️ IMPORTANTE: En producción, la API key NO debe estar en el código del cliente
// Debe manejarse a través de un backend seguro o variables de entorno del servidor
// Esto es solo para desarrollo/POC

export const Config = {
  // Gemini API Key - Solo para desarrollo
  GEMINI_API_KEY: 'AIzaSyCKQCggT2GbmPvfAM3AHfb7Q039T4Cs2W0',
  
  // Configuración de la app
  APP_NAME: 'Yester.ai',
  VERSION: '1.0.0',
  
  // Configuración de AI
  DEFAULT_MODEL: 'gemini-2.5-flash',
  IMAGE_MODEL: 'gemini-2.0-flash-preview-image-generation',
  
  // Límites
  MAX_EVENTS_PER_REQUEST: 5,
  REQUEST_TIMEOUT: 30000, // 30 segundos
}; 