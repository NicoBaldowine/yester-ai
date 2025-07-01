import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 92;

interface RegionSelectorProps {
  visible: boolean;
  currentRegion: string;
  onClose: () => void;
  onSelect: (region: string) => void;
}

const regions = ['Global', 'America', 'Europe', 'Asia', 'Africa', 'Oceania'];

export function RegionSelector({ visible, currentRegion, onClose, onSelect }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // Keep the currently selected region when reopening (this was the main issue)
      // Don't reset to currentRegion prop, use the state selectedRegion
      
      setTimeout(() => {
        const targetRegion = selectedRegion; // Use selectedRegion, not currentRegion
        const currentIndex = regions.indexOf(targetRegion);
        if (currentIndex !== -1 && scrollViewRef.current) {
          const offsetY = currentIndex * ITEM_HEIGHT;
          scrollViewRef.current.scrollTo({ y: offsetY, animated: false });
        }
      }, 100);
    }
  }, [visible]); // Only depend on visible, not currentRegion

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const region = regions[index];
    
    if (region && region !== selectedRegion) {
      setSelectedRegion(region);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selectedRegion);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const renderRegion = (region: string, index: number) => {
    const isSelected = region === selectedRegion;
    
    return (
      <View key={region} style={styles.regionContainer}>
        <Text style={[
          styles.regionText,
          isSelected ? styles.selectedRegionText : styles.unselectedRegionText
        ]}>
          {region}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Center selection indicator */}
        <View style={styles.centerIndicator} />
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
        >
          {regions.map(renderRegion)}
        </ScrollView>

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={styles.topGradient}
          pointerEvents="none"
        />

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Floating Cancel Button - Left */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Floating Select Button - Right */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelect}
          activeOpacity={0.8}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: screenHeight / 2 - ITEM_HEIGHT / 2,
    paddingBottom: screenHeight / 2 - ITEM_HEIGHT / 2,
  },
  regionContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedRegionText: {
    fontSize: 80,
    color: '#000000',
    lineHeight: 80,
  },
  unselectedRegionText: {
    fontSize: 70,
    color: 'rgba(0, 0, 0, 0.2)',
    lineHeight: 70,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
    pointerEvents: 'none',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    zIndex: 10,
  },
  cancelButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  selectButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
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
    zIndex: 10,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 