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
          {topics.map(renderTopic)}
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
  topicContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedTopicText: {
    fontSize: 80,
    color: '#000000',
    lineHeight: 80,
  },
  unselectedTopicText: {
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