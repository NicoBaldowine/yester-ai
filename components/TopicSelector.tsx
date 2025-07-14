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
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 70;

interface TopicSelectorProps {
  visible: boolean;
  currentTopic: string;
  onClose: () => void;
  onSelect: (topic: string) => void;
}

interface TopicItem {
  name: string;
  index: number;
}

const topicNames = [
  'History',
  'Music',
  'Art',
  'Science',
  'Sports',
  'Technology',
  'Politics',
  'Literature',
];

export function TopicSelector({ visible, currentTopic, onClose, onSelect }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState(currentTopic);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Create topics array with index
  const topics: TopicItem[] = topicNames.map((topic, index) => ({
    name: topic,
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
      // Reset to current topic when modal opens
      setSelectedTopic(currentTopic);
      
      setTimeout(() => {
        const targetTopic = currentTopic;
        const currentIndex = topics.findIndex(item => item.name === targetTopic);
        if (currentIndex !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: currentIndex,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, currentTopic]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const topicItem = topics[index];
    
    if (topicItem && topicItem.name !== selectedTopic) {
      setSelectedTopic(topicItem.name);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selectedTopic);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const renderTopic = ({ item }: { item: TopicItem }) => {
    const isSelected = item.name === selectedTopic;
    
    return (
      <View style={styles.topicContainer}>
        <Text style={[
          styles.topicText,
          isSelected ? styles.selectedTopicText : styles.unselectedTopicText
        ]}>
          {item.name}
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: TopicItem) => item.name;

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
          data={topics}
          renderItem={renderTopic}
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

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={[styles.topGradient, { height: 150 + insets.top }]}
          pointerEvents="none"
        />

        {/* Bottom Gradient */}
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
          style={[styles.selectButton, { bottom: 10 + insets.bottom }]}
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
  topicContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedTopicText: {
    fontSize: 60,
    letterSpacing: 60 * -0.05,
    color: '#000000',
    lineHeight: 60,
  },
  unselectedTopicText: {
    fontSize: 50,
    letterSpacing: 50 * -0.05,
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