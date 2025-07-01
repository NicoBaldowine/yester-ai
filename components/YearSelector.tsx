import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
      // Keep the currently selected year when reopening (this was the main issue)
      // Don't reset to currentYear prop, use the state selectedYear
      
      setTimeout(() => {
        const targetYear = selectedYear; // Use selectedYear, not currentYear
        const currentIndex = years.findIndex(item => item.year === targetYear);
        if (currentIndex !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: currentIndex,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible]); // Only depend on visible, not currentYear

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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Center selection indicator */}
        <View style={styles.centerIndicator} />
        
        <FlatList
          ref={flatListRef}
          data={years}
          renderItem={renderYear}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingTop: screenHeight / 2 - ITEM_HEIGHT / 2,
    paddingBottom: screenHeight / 2 - ITEM_HEIGHT / 2,
  },
  yearContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedYearText: {
    fontSize: 80,
    color: '#000000',
    lineHeight: 80,
  },
  unselectedYearText: {
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