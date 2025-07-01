import { Typography } from '@/constants/Typography';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 70;

interface RegionSelectorProps {
  visible: boolean;
  currentRegion: string;
  onClose: () => void;
  onSelect: (region: string) => void;
}

interface RegionItem {
  name: string;
  index: number;
}

const continentalRegions = ['Global', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];

const topCountries = [
  'United States', 'China', 'United Kingdom', 'Germany', 'France', 
  'Japan', 'India', 'Italy', 'Brazil', 'Canada', 
  'Russia', 'Spain', 'Australia', 'South Korea', 'Mexico',
  'Netherlands', 'Turkey', 'Saudi Arabia', 'Chile', 'Argentina'
];

// Combine all regions and countries into one array
const allRegions = [...continentalRegions, ...topCountries];

export function RegionSelector({ visible, currentRegion, onClose, onSelect }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Create regions array with index
  const regions: RegionItem[] = allRegions.map((region, index) => ({
    name: region,
    index: index
  }));

  // Simple item layout for FlatList
  const getItemLayout = (data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  useEffect(() => {
    if (visible) {
      // Keep the currently selected region when reopening
      setTimeout(() => {
        const targetRegion = selectedRegion;
        const currentIndex = regions.findIndex(item => item.name === targetRegion);
        if (currentIndex !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: currentIndex,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const regionItem = regions[index];
    
    if (regionItem && regionItem.name !== selectedRegion) {
      setSelectedRegion(regionItem.name);
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

  const renderRegion = ({ item }: { item: RegionItem }) => {
    const isSelected = item.name === selectedRegion;
    
    return (
      <View style={styles.regionContainer}>
        <Text style={[
          styles.regionText,
          isSelected ? styles.selectedRegionText : styles.unselectedRegionText
        ]}>
          {item.name}
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: RegionItem) => item.name;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Center selection indicator */}
        <View style={styles.centerIndicator} />
        
        <FlatList
          ref={flatListRef}
          data={regions}
          renderItem={renderRegion}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          style={styles.flatList}
          contentContainerStyle={[styles.flatListContent, { 
            paddingTop: screenHeight / 2 - ITEM_HEIGHT / 2 + insets.top,
            paddingBottom: screenHeight / 2 - ITEM_HEIGHT / 2 + insets.bottom,
          }]}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={8}
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
        />

        {/* Top Gradient - Edge-to-edge behind Dynamic Island */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={[styles.topGradient, { height: 150 + insets.top }]}
          pointerEvents="none"
        />

        {/* Bottom Gradient - Edge-to-edge below home indicator */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={[styles.bottomGradient, { height: 150 + insets.bottom }]}
          pointerEvents="none"
        />

        {/* Floating Cancel Button with Blur/Glass Effect */}
        <BlurView intensity={20} tint="light" style={[styles.cancelButton, { bottom: 40 + insets.bottom }]}>
          <TouchableOpacity
            style={styles.cancelButtonTouchable}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Floating Select Button - Right */}
        <TouchableOpacity
          style={[styles.selectButton, { bottom: 40 + insets.bottom }]}
          onPress={handleSelect}
          activeOpacity={0.8}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    // Dynamic padding handled inline
  },
  regionContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedRegionText: {
    fontSize: 60,
    letterSpacing: 60 * -0.05, // -5% letter spacing
    color: '#000000',
    lineHeight: 60,
  },
  unselectedRegionText: {
    fontSize: 50,
    letterSpacing: 50 * -0.05, // -5% letter spacing
    color: '#CCCCCC',
    lineHeight: 50,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
  cancelButton: {
    position: 'absolute',
    left: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 10,
  },
  cancelButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.cancelButtonText,
    color: '#1A1A1A',
  },
  selectButton: {
    position: 'absolute',
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
    ...Typography.selectButtonText,
    color: '#FFFFFF',
  },
}); 