import { Typography } from '@/constants/Typography';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 92;

interface TopicSelectorProps {
  visible: boolean;
  currentTopic: string;
  onClose: () => void;
  onSelect: (topic: string) => void;
}

const topics = ['History', 'Music', 'Science', 'Art', 'Sports'];

export function TopicSelector({ visible, currentTopic, onClose, onSelect }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState(currentTopic);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      // Keep the currently selected topic when reopening (this was the main issue)
      // Don't reset to currentTopic prop, use the state selectedTopic
      
      setTimeout(() => {
        const targetTopic = selectedTopic; // Use selectedTopic, not currentTopic
        const currentIndex = topics.indexOf(targetTopic);
        if (currentIndex !== -1 && scrollViewRef.current) {
          const offsetY = currentIndex * ITEM_HEIGHT;
          scrollViewRef.current.scrollTo({ y: offsetY, animated: false });
        }
      }, 100);
    }
  }, [visible]); // Only depend on visible, not currentTopic

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const topic = topics[index];
    
    if (topic && topic !== selectedTopic) {
      setSelectedTopic(topic);
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

  const renderTopic = (topic: string, index: number) => {
    const isSelected = topic === selectedTopic;
    
    return (
      <View key={topic} style={styles.topicContainer}>
        <Text style={[
          styles.topicText,
          isSelected ? styles.selectedTopicText : styles.unselectedTopicText
        ]}>
          {topic}
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
      <View style={styles.container}>
        {/* Center selection indicator */}
        <View style={styles.centerIndicator} />
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, {
            paddingTop: screenHeight / 2 - ITEM_HEIGHT / 2 + insets.top,
            paddingBottom: screenHeight / 2 - ITEM_HEIGHT / 2 + insets.bottom,
          }]}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
        >
          {topics.map(renderTopic)}
        </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Dynamic padding now handled inline
  },
  topicContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicText: {
    textAlign: 'center',
  },
  selectedTopicText: {
    ...Typography.selectedYearText,
    color: '#000000',
  },
  unselectedTopicText: {
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
  cancelButton: {
    position: 'absolute',
    // bottom now dynamic with safe area
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