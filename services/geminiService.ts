import { GoogleGenAI, Modality } from '@google/genai';

export interface HistoricalEvent {
  id: string;
  title: string;
  content: string;
  fullContent: string;
  year: number;
  region: string;
  topic: string;
  imageUrl?: string;
  isPrimary?: boolean;
}

export interface GenerationParams {
  year: number;
  region: string;
  topic: string;
}

export class GeminiService {
  private ai: any;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Genera contenido histórico detallado usando Gemini 2.5 Flash
   */
  async generateHistoricalContent(params: GenerationParams): Promise<HistoricalEvent[]> {
    try {
      const prompt = this.buildHistoricalPrompt(params);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const content = response.text || '';
      return this.parseHistoricalContent(content, params);
      
    } catch (error) {
      console.error('Error generating historical content:', error);
      throw new Error('Failed to generate historical content');
    }
  }

  /**
   * Genera una imagen histórica usando Gemini 2.0 Flash Image Generation
   * MEJORADO: Con mejor manejo de errores y prompts más específicos
   */
  async generateHistoricalImage(event: HistoricalEvent): Promise<string> {
    try {
      const imagePrompt = this.buildImagePrompt(event);
      
      console.log(`🎨 Generando imagen AI para: ${event.title}`);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: imagePrompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          temperature: 0.7, // Más consistente
        },
      });

      // Buscar la parte de imagen en la respuesta
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Convertir base64 a URL de datos
            const imageData = part.inlineData.data;
            console.log(`✅ Imagen AI generada exitosamente para: ${event.title}`);
            return `data:image/png;base64,${imageData}`;
          }
        }
      }
      
      throw new Error('No image generated in response');
      
    } catch (error) {
      console.warn(`⚠️ Error generating AI image for "${event.title}":`, error);
      // Return intelligent fallback instead of basic fallback
      const fallbackUrl = this.getIntelligentFallbackImage(
        { year: event.year, region: event.region, topic: event.topic }, 
        event.title
      );
      console.log(`🔄 Using intelligent fallback image for: ${event.title}`);
      return fallbackUrl;
    }
  }

  /**
   * Genera contenido completo (texto + imagen) para múltiples eventos históricos
   * MEJORADO: Con mejor manejo de errores y timeouts
   */
  async generateCompleteHistoricalEvents(params: GenerationParams): Promise<HistoricalEvent[]> {
    try {
      console.log('📝 Generando contenido histórico...');
      // Paso 1: Generar contenido histórico
      const events = await this.generateHistoricalContent(params);
      
      if (events.length === 0) {
        throw new Error('No se pudieron generar eventos históricos');
      }

      // Paso 2: Intentar generar imagen AI solo para el evento principal
      if (events.length > 0) {
        try {
          // Timeout para generación de imagen (15 segundos max)
          const imagePromise = this.generateHistoricalImage(events[0]);
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 15000)
          );
          
          const imageUrl = await Promise.race([imagePromise, timeoutPromise]);
          events[0].imageUrl = imageUrl;
          events[0].isPrimary = true;
          console.log('🎨 Imagen AI generada para evento principal');
        } catch (error) {
          console.warn('⚠️ Falló imagen AI para evento principal, usando fallback:', error);
          events[0].imageUrl = this.getIntelligentFallbackImage(params, events[0].title);
          events[0].isPrimary = true;
        }
        
        // Agregar imágenes de fallback inteligentes para eventos secundarios
        for (let i = 1; i < events.length; i++) {
          events[i].imageUrl = this.getIntelligentFallbackImage(params, events[i].title);
          events[i].isPrimary = false;
        }
      }
      
      return events;
      
    } catch (error) {
      console.error('Error generating complete historical events:', error);
      throw new Error('Failed to generate complete historical events');
    }
  }

  /**
   * PREMIUM: Genera 3 eventos con imágenes hermosas (AI + fallbacks premium)
   */
  async generatePremiumHistoricalEvents(params: GenerationParams): Promise<HistoricalEvent[]> {
    try {
      console.log('🌟 Modo PREMIUM: generando contenido con imágenes hermosas para los 3 eventos');
      
      // Paso 1: Generar contenido histórico
      const events = await this.generateHistoricalContent(params);
      
      if (events.length === 0) {
        throw new Error('No se pudieron generar eventos históricos');
      }

      // Paso 2: Intentar generar imágenes AI para TODOS los eventos (con timeouts cortos)
      console.log('🎨 Generando imágenes premium para todos los eventos...');
      
      const imagePromises = events.map(async (event, index) => {
        try {
          // Timeout más corto para eventos secundarios (10s vs 15s para el principal)
          const timeout = index === 0 ? 15000 : 10000;
          
          const imagePromise = this.generateHistoricalImage(event);
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          );
          
          const imageUrl = await Promise.race([imagePromise, timeoutPromise]);
          console.log(`✅ Imagen AI generada para evento ${index + 1}: ${event.title}`);
          return imageUrl;
        } catch (error) {
          console.log(`🔄 Usando fallback premium para evento ${index + 1}: ${event.title}`);
          return this.getPremiumFallbackImage(params, event.title, index);
        }
      });

      // Esperar todas las imágenes (AI o fallback premium)
      const imageUrls = await Promise.all(imagePromises);
      
      // Asignar imágenes y marcadores
      events.forEach((event, index) => {
        event.imageUrl = imageUrls[index];
        event.isPrimary = index === 0;
      });
      
      console.log(`🌟 Generados ${events.length} eventos con imágenes premium`);
      return events;
      
    } catch (error) {
      console.error('Error generating premium historical events:', error);
      throw new Error('Failed to generate premium historical events');
    }
  }

  /**
   * OPTIMIZADO: Genera solo 3 eventos rápidamente con fallbacks inteligentes
   */
  async generateOptimizedHistoricalEvents(params: GenerationParams): Promise<HistoricalEvent[]> {
    try {
      console.log('⚡ Modo OPTIMIZADO: generando con fallbacks inteligentes');
      
      // Paso 1: Generar contenido histórico optimizado (solo 3 eventos)
      const events = await this.generateOptimizedHistoricalContent(params);
      
      if (events.length === 0) {
        throw new Error('No se pudieron generar eventos históricos');
      }

      // Paso 2: Agregar imágenes de fallback inteligentes para todos los eventos
      events.forEach((event, index) => {
        event.imageUrl = this.getPremiumFallbackImage(params, event.title, index);
        event.isPrimary = index === 0; // Solo el primero es primario
      });
      
      console.log(`⚡ Generados ${events.length} eventos optimizados`);
      return events;
      
    } catch (error) {
      console.error('Error generating optimized historical events:', error);
      throw new Error('Failed to generate optimized historical events');
    }
  }

  /**
   * OPTIMIZADO: Genera solo 3 eventos históricos para mejor performance
   */
  async generateOptimizedHistoricalContent(params: GenerationParams): Promise<HistoricalEvent[]> {
    try {
      const prompt = this.buildOptimizedHistoricalPrompt(params);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const content = response.text || '';
      return this.parseHistoricalContent(content, params);
      
    } catch (error) {
      console.error('Error generating optimized historical content:', error);
      throw new Error('Failed to generate optimized historical content');
    }
  }

  /**
   * Construye el prompt para generar contenido histórico (AHORA SOLO 3 EVENTOS)
   */
  private buildHistoricalPrompt(params: GenerationParams): string {
    const { year, region, topic } = params;
    
    return `
Act as an expert historian. Generate EXACTLY 3 most significant historical events from ${year} 
in the ${region} region related to ${topic}.

SPECIFIC INSTRUCTIONS:
- ONLY 3 EVENTS - the most impactful ones of the year
- The first event must be the MOST IMPORTANT and influential of the year
- Include relevant emojis at the start of each description
- Use an engaging and narrative tone
- Each event should be 100-120 words (detailed but concise)
- ALWAYS respond in ENGLISH

Response format:
EVENT_1:
Title: [most important and engaging title]
Content: [detailed description with emojis, compelling narrative]

EVENT_2:
Title: [second most important title]
Content: [detailed content with historical impact]

EVENT_3:
Title: [third most important title]
Content: [detailed content showing significance]

Focus ONLY on the 3 MOST historically significant and impactful events of ${year} in ${region}.
Ensure maximum historical accuracy and compelling storytelling.
`;
  }

  /**
   * OPTIMIZADO: Construye el prompt para generar solo 3 eventos (más rápido)
   */
  private buildOptimizedHistoricalPrompt(params: GenerationParams): string {
    const { year, region, topic } = params;
    
    return `
Act as an expert historian. Generate EXACTLY 3 significant historical events from ${year} 
in the ${region} region related to ${topic}.

SPECIFIC INSTRUCTIONS:
- ONLY 3 EVENTS (no more)
- The first event must be the MOST IMPORTANT of the year
- Include relevant emojis at the start of each description
- Use an engaging and narrative tone
- Each event should be 80-120 words (concise)
- ALWAYS respond in ENGLISH

Response format:
EVENT_1:
Title: [concise and engaging title]
Content: [detailed description with emojis]

EVENT_2:
Title: [title]
Content: [detailed content]

EVENT_3:
Title: [title]
Content: [detailed content]

Ensure events are historically accurate and relevant to ${year} in ${region}.
Focus on the 3 MOST impactful events of the year.
`;
  }

  /**
   * Construye el prompt para generar imágenes históricas MEJORADO
   */
  private buildImagePrompt(event: HistoricalEvent): string {
    // Extraer contexto específico del evento
    const eventSummary = event.content.slice(0, 200); // Primeras 200 palabras
    const decade = Math.floor(event.year / 10) * 10;
    
    return `
Create a historically accurate, high-quality image representing: "${event.title}" from ${event.year}.

Context: ${eventSummary}

Image requirements:
- Style: Realistic historical photograph or realistic artistic representation
- Era: ${decade}s aesthetic and visual style
- Region: ${event.region} cultural and geographical context
- Subject: ${event.topic} theme
- Mood: Historically significant, respectful, and dramatic
- Quality: High resolution, detailed, professional composition
- Colors: Period-appropriate color palette for ${event.year}
- Avoid: Modern elements, inappropriate anachronisms, offensive content

Focus on capturing the historical importance and atmosphere of this ${event.year} event in ${event.region}.
`;
  }

  /**
   * Parsea el contenido generado por Gemini en eventos estructurados
   */
  private parseHistoricalContent(content: string, params: GenerationParams): HistoricalEvent[] {
    const events: HistoricalEvent[] = [];
    const eventBlocks = content.split('EVENT_').filter(block => block.trim().length > 0);
    
    eventBlocks.forEach((block, index) => {
      const lines = block.split('\n').filter(line => line.trim().length > 0);
      let title = '';
      let eventContent = '';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('Title:')) {
          title = trimmedLine.replace('Title:', '').trim();
        } else if (trimmedLine.includes('Content:')) {
          eventContent = trimmedLine.replace('Content:', '').trim();
        }
      });
      
      if (title && eventContent) {
        events.push({
          id: `${params.year}-${index + 1}`,
          title,
          content: eventContent,
          fullContent: eventContent,
          year: params.year,
          region: params.region,
          topic: params.topic,
          isPrimary: index === 0, // El primer evento es el principal
        });
      }
    });
    
    return events;
  }

  /**
   * Obtiene una imagen de fallback basada en el tema
   */
  private getFallbackImage(topic: string): string {
    const fallbackImages = {
      'History': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=300&fit=crop',
      'Science': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=300&fit=crop',
      'Art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=300&fit=crop',
      'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=300&fit=crop',
    };
    
    return fallbackImages[topic as keyof typeof fallbackImages] || fallbackImages.History;
  }

  /**
   * SISTEMA INTELIGENTE DE IMÁGENES FALLBACK - EXPANDIDO Y MEJORADO
   * Progresión: Palabras clave específicas > Combinación región-tema > Década contextualizada > Fallback general
   */
  private getIntelligentFallbackImage(params: GenerationParams, eventTitle: string): string {
    const { year, region, topic } = params;
    const titleKeywords = eventTitle.toLowerCase();
    
    // NIVEL 1: Palabras clave específicas y eventos históricos conocidos
    if (titleKeywords.includes('war') || titleKeywords.includes('conflict') || titleKeywords.includes('battle')) {
      return year >= 1990 ? 
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop' : // Modern conflict
        'https://images.unsplash.com/photo-1627908295637-e871c1ad93b8?w=800&h=400&fit=crop'; // Historical war
    }
    
    if (titleKeywords.includes('election') || titleKeywords.includes('vote') || titleKeywords.includes('democracy') || titleKeywords.includes('president')) {
      return region === 'America' ? 
        'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop' : // US politics
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop'; // International politics
    }
    
    if (titleKeywords.includes('space') || titleKeywords.includes('satellite') || titleKeywords.includes('rocket') || titleKeywords.includes('nasa')) {
      return year >= 1960 ? 
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop' : // Modern space
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop'; // Early space era
    }
    
    if (titleKeywords.includes('technology') || titleKeywords.includes('computer') || titleKeywords.includes('internet') || titleKeywords.includes('software')) {
      return year >= 1990 ? 
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop' : // Modern tech
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'; // Vintage tech
    }
    
    if (titleKeywords.includes('berlin') || titleKeywords.includes('wall') || titleKeywords.includes('reunification') || titleKeywords.includes('germany')) {
      return 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('soviet') || titleKeywords.includes('ussr') || titleKeywords.includes('russia') || titleKeywords.includes('moscow')) {
      return 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('economic') || titleKeywords.includes('economy') || titleKeywords.includes('financial') || titleKeywords.includes('market')) {
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('environmental') || titleKeywords.includes('climate') || titleKeywords.includes('disaster') || titleKeywords.includes('earthquake')) {
      return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('medical') || titleKeywords.includes('disease') || titleKeywords.includes('health') || titleKeywords.includes('aids')) {
      return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('music') || titleKeywords.includes('concert') || titleKeywords.includes('album') || titleKeywords.includes('song')) {
      return year >= 1980 ? 
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop' : // Modern music
        'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&h=400&fit=crop'; // Classic music
    }
    
    if (titleKeywords.includes('sport') || titleKeywords.includes('olympic') || titleKeywords.includes('championship') || titleKeywords.includes('world cup')) {
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop';
    }
    
    if (titleKeywords.includes('art') || titleKeywords.includes('museum') || titleKeywords.includes('painting') || titleKeywords.includes('exhibition')) {
      return 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop';
    }

    // NIVEL 2: Combinaciones de región y tema
    const regionTopicImages = {
      'America-History': [
        'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // US Capitol
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // American city
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', // American flag
      ],
      'Europe-History': [
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop', // European architecture
        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop', // European city
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop', // European culture
      ],
      'Asia-History': [
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=400&fit=crop', // Asian landscape
        'https://images.unsplash.com/photo-1542931287-023b922fa89b?w=800&h=400&fit=crop', // Asian city
        'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=400&fit=crop', // Asian culture
      ],
      'Africa-History': [
        'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop', // African landscape
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop', // African city
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', // African culture
      ],
      'Global-Science': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Laboratory
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', // Space/Earth
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop', // Medical science
      ]
    };

    const regionTopicKey = `${region}-${topic}` as keyof typeof regionTopicImages;
    const regionTopicSet = regionTopicImages[regionTopicKey];
    if (regionTopicSet) {
      // Usar hash del año para selección consistente
      const index = year % regionTopicSet.length;
      return regionTopicSet[index];
    }

    // NIVEL 3: Imágenes por década con contexto mejorado
    const getContextualDecadeImage = (year: number, region: string, topic: string): string => {
      const decadeBase = Math.floor(year / 10) * 10;
      
      if (year >= 2020) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'; // Digital era
      if (year >= 2010) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop'; // Social media era
      if (year >= 2000) return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'; // Millennium
      if (year >= 1990) {
        if (region === 'America') return 'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop';
        if (region === 'Europe') return 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop';
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'; // 90s general
      }
      if (year >= 1980) return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop'; // 80s
      if (year >= 1970) return 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'; // 70s
      if (year >= 1960) return 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop'; // 60s space age
      if (year >= 1950) return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'; // 50s prosperity
      if (year >= 1940) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'; // 40s wartime
      if (year >= 1900) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'; // Early 20th century
      return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop'; // Historical default
    };

    // NIVEL 4: Fallbacks por región y tema
    const regionImages = {
      'Global': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
      'America': 'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop',
      'Europe': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop',
      'Asia': 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=400&fit=crop',
      'Africa': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop',
      'Oceania': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    };

    const topicImages = {
      'History': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      'Science': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      'Art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
      'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
    };

         // Prioridad final: Década contextual > Región > Tema > Fallback histórico
     return getContextualDecadeImage(year, region, topic) ||
            regionImages[region as keyof typeof regionImages] || 
            topicImages[topic as keyof typeof topicImages] || 
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop';
  }

  /**
   * SISTEMA PREMIUM DE IMÁGENES FALLBACK - Para máxima calidad visual
   * Incluye variación por índice de evento para evitar repetición
   */
  private getPremiumFallbackImage(params: GenerationParams, eventTitle: string, eventIndex: number): string {
    const { year, region, topic } = params;
    const titleKeywords = eventTitle.toLowerCase();
    
    // NIVEL 1: Eventos específicos con múltiples variaciones por índice
    const getSpecificEventImages = (): string[] => {
      if (titleKeywords.includes('war') || titleKeywords.includes('conflict') || titleKeywords.includes('battle')) {
        return [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', // War memorial
          'https://images.unsplash.com/photo-1627908295637-e871c1ad93b8?w=800&h=400&fit=crop', // Historical conflict
          'https://images.unsplash.com/photo-1574454146206-9e2a69e4feec?w=800&h=400&fit=crop'  // Military equipment
        ];
      }
      
      if (titleKeywords.includes('operation') && titleKeywords.includes('desert')) {
        return [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', // Desert Storm
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // US military
          'https://images.unsplash.com/photo-1627908295637-e871c1ad93b8?w=800&h=400&fit=crop'  // Military operation
        ];
      }
      
      if (titleKeywords.includes('ada') || titleKeywords.includes('disabilities') || titleKeywords.includes('civil rights')) {
        return [
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop', // Government building
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // Capitol/politics
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'  // Social progress
        ];
      }
      
      if (titleKeywords.includes('election') || titleKeywords.includes('vote') || titleKeywords.includes('democracy') || titleKeywords.includes('president')) {
        return region === 'America' ? [
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // US Capitol
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop', // White House
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'  // American city
        ] : [
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop', // International politics
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop', // European parliament
          'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop'  // Government buildings
        ];
      }
      
      if (titleKeywords.includes('space') || titleKeywords.includes('satellite') || titleKeywords.includes('rocket') || titleKeywords.includes('nasa')) {
        return [
          'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', // Earth from space
          'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop', // Space mission
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'  // NASA/technology
        ];
      }
      
      if (titleKeywords.includes('technology') || titleKeywords.includes('computer') || titleKeywords.includes('internet') || titleKeywords.includes('software')) {
        return year >= 1990 ? [
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop', // Modern tech
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Lab/computers
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'  // Tech city
        ] : [
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // Vintage tech
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Early computers
          'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop'  // Scientific era
        ];
      }
      
      if (titleKeywords.includes('berlin') || titleKeywords.includes('wall') || titleKeywords.includes('reunification') || titleKeywords.includes('germany')) {
        return [
          'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop', // Berlin
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop', // German architecture
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'  // European history
        ];
      }
      
      if (titleKeywords.includes('economic') || titleKeywords.includes('economy') || titleKeywords.includes('financial') || titleKeywords.includes('market')) {
        return [
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop', // Financial district
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // Business city
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop'  // Economic center
        ];
      }
      
      return [];
    };

    // Intentar obtener imágenes específicas primero
    const specificImages = getSpecificEventImages();
    if (specificImages.length > 0) {
      return specificImages[eventIndex % specificImages.length];
    }

    // NIVEL 2: Combinaciones región-tema-año con múltiples opciones
    const getPremiumRegionTopicImages = (): string[] => {
      const key = `${region}-${topic}`;
      const decade = Math.floor(year / 10) * 10;
      
      const imageCollections: { [key: string]: string[] } = {
        'America-History': decade >= 1990 ? [
          'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop', // US Capitol
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // American city
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'  // American flag
        ] : [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', // Historical America
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop', // Vintage America
          'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop'  // American heritage
        ],
        
        'Europe-History': [
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop', // European architecture
          'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop', // European city
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'  // European culture
        ],
        
        'Global-Science': [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Laboratory
          'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', // Space/Earth
          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop'  // Medical science
        ],
        
        'America-Science': [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // US lab
          'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop', // NASA/space
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'  // Tech innovation
        ]
      };
      
      return imageCollections[key] || [];
    };

    const regionTopicImages = getPremiumRegionTopicImages();
    if (regionTopicImages.length > 0) {
      return regionTopicImages[eventIndex % regionTopicImages.length];
    }

    // NIVEL 3: Fallback por década-región con variaciones
    const getDecadeRegionImages = (): string[] => {
      if (year >= 1990) {
        const nineties: { [key: string]: string[] } = {
          'America': [
            'https://images.unsplash.com/photo-1564459031751-689edc739817?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop'
          ],
          'Europe': [
            'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'
          ],
          'Global': [
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
          ]
        };
        return nineties[region] || nineties['Global'];
      }
      
      // Fallback para otras décadas
      return [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop'
      ];
    };

    const decadeImages = getDecadeRegionImages();
    return decadeImages[eventIndex % decadeImages.length];
  }

  /**
   * Método de prueba para verificar la conexión con Gemini
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Responde solo "Conexión exitosa" si puedes leer este mensaje.',
      });
      
      return response.text?.includes('Conexión exitosa') || false;
    } catch (error) {
      console.error('Error testing Gemini connection:', error);
      return false;
    }
  }
}

// Note: En React Native, la API key debe pasarse explícitamente
// No usar process.env directamente en el cliente
export const createGeminiService = (apiKey: string) => new GeminiService(apiKey); 