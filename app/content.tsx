import { ProfileScreen } from '@/components/ProfileScreen';
import { RegionSelector } from '@/components/RegionSelector';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { TopicSelector } from '@/components/TopicSelector';
import { YearSelector } from '@/components/YearSelector';
import { Typography } from '@/constants/Typography';
import { useHistoricalContent } from '@/hooks/useHistoricalContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

// Storage keys para persistencia
const STORAGE_KEYS = {
  YEAR: 'yester-ai-last-year',
  REGION: 'yester-ai-last-region', 
  TOPIC: 'yester-ai-last-topic',
};

// Función para cargar estado persistido
const loadPersistedState = async () => {
  try {
    const [savedYear, savedRegion, savedTopic] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.YEAR),
      AsyncStorage.getItem(STORAGE_KEYS.REGION),
      AsyncStorage.getItem(STORAGE_KEYS.TOPIC),
    ]);

    return {
      year: savedYear ? parseInt(savedYear, 10) : 2024, // Default a 2024 en lugar de 2025
      region: savedRegion || 'Americas',
      topic: savedTopic || 'History',
    };
  } catch (error) {
    console.warn('Error loading persisted state:', error);
    return {
      year: 2024, // Default a 2024
      region: 'Americas', 
      topic: 'History',
    };
  }
};

// Función para guardar estado
const saveState = async (key: string, value: string | number) => {
  try {
    await AsyncStorage.setItem(key, value.toString());
  } catch (error) {
    console.warn('Error saving state:', error);
  }
};

export default function ContentScreen() {
  const insets = useSafeAreaInsets();
  
  // Estados iniciales - se cargarán desde AsyncStorage
  const [year, setYear] = useState<number>(2024);
  const [region, setRegion] = useState('Americas');
  const [topic, setTopic] = useState('History');
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showProfileScreen, setShowProfileScreen] = useState(false);

  // Hook para manejar el contenido histórico
  const { 
    events, 
    isLoading, 
    showSkeleton,
    error, 
    generateContent, 
    clearError,
    cancelGeneration,
    cacheStats 
  } = useHistoricalContent();

  // Cargar estado persistido al inicializar
  useEffect(() => {
    const loadInitialState = async () => {
      const persistedState = await loadPersistedState();
      setYear(persistedState.year);
      setRegion(persistedState.region);
      setTopic(persistedState.topic);
      setIsStateLoaded(true);
    };
    
    loadInitialState();
  }, []);

  // Generar contenido cuando cambien los parámetros (solo después de cargar estado)
  useEffect(() => {
    if (!isStateLoaded) return; // Esperar a que se cargue el estado inicial
    
    generateContent({
      year,
      region,
      topic,
    });
  }, [year, region, topic, isStateLoaded]); // Agregamos isStateLoaded a dependencias

  const primaryEvent = events.find(e => e.isPrimary);
  const secondaryEvents = events.filter(e => !e.isPrimary);

  // Handlers actualizados con persistencia
  const handleYearChange = (direction: 'next' | 'previous') => {
    const newYear = direction === 'next' ? year + 1 : year - 1;
    setYear(newYear);
    saveState(STORAGE_KEYS.YEAR, newYear);
  };

  const handleYearSelect = (newYear: number) => {
    setYear(newYear);
    saveState(STORAGE_KEYS.YEAR, newYear);
    setShowYearSelector(false);
  };

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    saveState(STORAGE_KEYS.TOPIC, newTopic);
    setShowTopicSelector(false);
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    saveState(STORAGE_KEYS.REGION, newRegion);
    setShowRegionSelector(false);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowProfileScreen(true);
  };

  // Componente de Loading Premium
  const LoadingScreen = () => {
    const getTopicEmoji = (topic: string) => {
      const emojiMap: { [key: string]: string } = {
        'History': '🏛️',
        'Science': '🔬',
        'Art': '🎨',
        'Music': '🎶',
        'Sports': '⚽'
      };
      return emojiMap[topic] || '🏛️';
    };

    const handleCancel = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cancelGeneration();
    };

    return (
      <View style={styles.loadingScreen}>
        {/* Center Content */}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#000000" style={styles.loader} />
          <Text style={styles.loadingTitle}>
            Yester in {year}{'\n'}exploring {topic} {getTopicEmoji(topic)}{'\n'}of {region}..
          </Text>
        </View>

        {/* Cancel Button - Centered */}
        <View style={[styles.loadingCancelContainer, { bottom: 40 + insets.bottom }]}>
          <BlurView intensity={20} tint="light" style={styles.loadingCancelButton}>
            <TouchableOpacity
              style={styles.loadingCancelButtonTouchable}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.loadingCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    );
  };

  // Componente de Error
  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            clearError();
            generateContent({ year, region, topic });
          }}
        >
          <Text style={styles.retryButtonText}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sticky Profile Button - Top */}
      <BlurView intensity={20} tint="light" style={[styles.stickyProfileButton, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.profileTouchable} 
          activeOpacity={0.8}
          onPress={handleProfilePress}
        >
          <Text style={styles.profileInitial}>N</Text>
        </TouchableOpacity>
      </BlurView>
      
      {/* Mostrar SkeletonLoader cuando showSkeleton es true */}
      {showSkeleton ? (
        <SkeletonLoader />
      ) : isLoading ? (
        <LoadingScreen />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Error Message */}
          <ErrorMessage />

          {/* Full Width Hero Image - covers from very top edge-to-edge */}
          {primaryEvent && (
            <View style={styles.heroContainer}>
              <Image source={{ uri: primaryEvent.imageUrl }} style={[styles.heroImage, { height: screenHeight * 0.35 + insets.top }]} />
              
              {/* Content over image with safe area consideration */}
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{primaryEvent.title}</Text>
                <Text style={styles.heroText}>{primaryEvent.content}</Text>
              </View>
            </View>
          )}

          {/* Evento principal */}
          {primaryEvent && (
            <View>
              {/* Hero event ya se muestra arriba en heroContainer */}
            </View>
          )}

          {/* Eventos secundarios */}
          {secondaryEvents.length > 0 && (
            <View style={styles.secondaryEventsContainer}>
              {secondaryEvents.map((event, index) => (
                <View key={index} style={styles.secondaryEventContainer}>
                  <Text style={styles.secondaryTitle}>{event.title}</Text>
                  <Image source={{ uri: event.imageUrl }} style={styles.secondaryImage} />
                  <Text style={styles.secondaryText}>{event.content}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Mensaje cuando no hay eventos */}
          {events.length === 0 && !isLoading && !showSkeleton && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>
                No hay eventos disponibles para {year} en {region} sobre {topic}
              </Text>
            </View>
          )}

          {/* Navigation Buttons - Glass Pills */}
          <View style={styles.navigationContainer}>
            <BlurView intensity={20} tint="light" style={[styles.navPillButton, (year <= 0 || isLoading) && styles.navPillButtonDisabled]}>
              <TouchableOpacity
                style={styles.navPillButtonTouchable}
                onPress={() => handleYearChange('previous')}
                disabled={year <= 0 || isLoading}
                activeOpacity={0.8}
              >
                <Text style={[styles.navPillButtonText, (year <= 0 || isLoading) && styles.navPillButtonTextDisabled]}>
                  Previous Year
                </Text>
              </TouchableOpacity>
            </BlurView>
            
                      <BlurView intensity={20} tint="light" style={[styles.navPillButton, (year >= 2025 || isLoading) && styles.navPillButtonDisabled]}>
            <TouchableOpacity
              style={styles.navPillButtonTouchable}
              onPress={() => handleYearChange('next')}
              disabled={year >= 2025 || isLoading}
              activeOpacity={0.8}
            >
              <Text style={[styles.navPillButtonText, (year >= 2025 || isLoading) && styles.navPillButtonTextDisabled]}>
                Next Year
              </Text>
            </TouchableOpacity>
          </BlurView>
          </View>

          {/* Bottom spacing for floating buttons */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Bottom Gradient Background - Edge-to-edge below home indicator */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Horizontal Floating Pill Buttons with Haptics - respecting safe areas */}
      <View style={[styles.floatingButtons, { bottom: 10 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.pillButton, isLoading && styles.pillButtonDisabled]}
          onPress={() => {
            if (!isLoading) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowYearSelector(true);
            }
          }}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={[styles.pillButtonText, isLoading && styles.pillButtonTextDisabled]}>
            {year}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.pillButton, isLoading && styles.pillButtonDisabled]}
          onPress={() => {
            if (!isLoading) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowTopicSelector(true);
            }
          }}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={[styles.pillButtonText, isLoading && styles.pillButtonTextDisabled]}>
            {topic}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.pillButton, isLoading && styles.pillButtonDisabled]}
          onPress={() => {
            if (!isLoading) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowRegionSelector(true);
            }
          }}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={[styles.pillButtonText, isLoading && styles.pillButtonTextDisabled]}>
            {region}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Selectors */}
      <YearSelector
        visible={showYearSelector}
        currentYear={year}
        onSelect={handleYearSelect}
        onClose={() => setShowYearSelector(false)}
      />
      
      <TopicSelector
        visible={showTopicSelector}
        currentTopic={topic}
        onSelect={handleTopicChange}
        onClose={() => setShowTopicSelector(false)}
      />
      
      <RegionSelector
        visible={showRegionSelector}
        currentRegion={region}
        onSelect={handleRegionChange}
        onClose={() => setShowRegionSelector(false)}
      />

      {/* Profile Screen */}
      <ProfileScreen
        visible={showProfileScreen}
        onClose={() => setShowProfileScreen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stickyProfileButton: {
    position: 'absolute',
    // top is now dynamic based on safe area insets
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 100, // Always on top
  },
  profileTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    ...Typography.profileInitial,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
    // No marginTop needed - edge-to-edge now handles this
  },
  heroContent: {
    backgroundColor: '#FFFFFF',
    marginTop: -50, // Reduced gap between image and content
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroTitle: {
    ...Typography.heroTitle,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  heroText: {
    ...Typography.heroText,
    color: '#333333',
  },
  secondaryEventsContainer: {
    paddingHorizontal: 24,
    gap: 32,
    marginBottom: 32,
  },
  secondaryEventContainer: {
    gap: 12,
  },
  secondaryTitle: {
    ...Typography.secondaryTitle,
    color: '#1A1A1A',
  },
  secondaryImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  secondaryText: {
    ...Typography.secondaryText,
    color: '#444444',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  navPillButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(128, 128, 128, 0.1)', // Light gray tint for better visibility on white
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  navPillButtonDisabled: {
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  navPillButtonTouchable: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPillButtonText: {
    ...Typography.navButtonText,
    color: '#1A1A1A',
  },
  navPillButtonTextDisabled: {
    ...Typography.navButtonText,
    color: '#9AA0A6',
  },
  bottomSpacing: {
    height: 100, // Space for floating buttons
  },
  floatingButtons: {
    position: 'absolute',
    // bottom is now dynamic based on safe area insets  
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    zIndex: 20, // Above gradient
  },
  pillButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  pillButtonText: {
    ...Typography.pillButtonText,
    color: '#FFFFFF',
  },
  pillButtonDisabled: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pillButtonTextDisabled: {
    ...Typography.pillButtonText,
    color: '#8E8E93',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Edge-to-edge to very bottom
    height: 150 + 34, // Extra height to cover home indicator area + gradient
    zIndex: 10, // Below pills (pills have higher zIndex)
  },
  loadingScreen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF', // Full white background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginBottom: 32,
  },
  loadingTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 22 * -0.05, // -5% letter spacing
    lineHeight: 22 * 1.3, // 130% line height
    textAlign: 'center',
    color: '#000000',
  },
  loadingCancelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 110,
  },
  loadingCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  loadingCancelButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCancelButtonText: {
    ...Typography.cancelButtonText,
    color: '#1A1A1A',
  },
  errorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    ...Typography.errorTitle,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  errorText: {
    ...Typography.errorText,
    color: '#FFFFFF',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.retryButtonText,
    color: '#FFFFFF',
  },

}); 