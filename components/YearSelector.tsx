import { Typography } from '@/constants/Typography';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 92;

interface YearSelectorProps {
  visible: boolean;
  currentYear: number;
  onClose: () => void;
  onSelect: (year: number) => void;
}

interface YearItem {
  year: number;
  index: number;
}

export function YearSelector({ visible, currentYear, onClose, onSelect }: YearSelectorProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Generate years from 2025 down to 0
  const years: YearItem[] = Array.from({ length: 2026 }, (_, i) => ({
    year: 2025 - i,
    index: i
  }));

  // Simple item layout for FlatList
  const getItemLayout = (data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  useEffect(() => {
    if (visible) {
      // Reset to current year when modal opens
      setSelectedYear(currentYear);
      
      setTimeout(() => {
        const targetYear = currentYear; // Use currentYear, not selectedYear
        const currentIndex = years.findIndex(item => item.year === targetYear);
        if (currentIndex !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: currentIndex,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, currentYear]); // Add currentYear to dependencies

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const yearItem = years[index];
    
    if (yearItem && yearItem.year !== selectedYear) {
      setSelectedYear(yearItem.year);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selectedYear);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const renderYear = ({ item }: { item: YearItem }) => {
    const isSelected = item.year === selectedYear;
    
    return (
      <View style={styles.yearContainer}>
        <Text style={[
          styles.yearText,
          isSelected ? styles.selectedYearText : styles.unselectedYearText
        ]}>
          {item.year}
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: YearItem) => item.year.toString();

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
          data={years}
          renderItem={renderYear}
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

        {/* Close Button with X icon - Same style as profile N */}
        <View style={[styles.closeButton, { top: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.closeButtonTouchable}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <X size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

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
    // Dynamic padding now handled inline
  },
  yearContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    textAlign: 'center',
  },
  selectedYearText: {
    ...Typography.selectedYearText,
    color: '#000000',
  },
  unselectedYearText: {
    ...Typography.unselectedYearText,
    color: 'rgba(0, 0, 0, 0.2)',
  },
  topGradient: {
    position: 'absolute',
    top: 0, // Edge-to-edge from very top
    left: 0,
    right: 0,
    // height now dynamic with insets
    zIndex: 2,
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0, // Edge-to-edge to very bottom
    left: 0,
    right: 0,
    // height now dynamic with insets
    zIndex: 2,
    pointerEvents: 'none',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
    zIndex: 100,
  },
  closeButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    position: 'absolute',
    // bottom now dynamic with safe area
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