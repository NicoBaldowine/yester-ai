import { Typography } from '@/constants/Typography';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BookOpen,
    Cpu,
    Landmark,
    Microscope,
    Music,
    Palette,
    Scale,
    Trophy
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopicSelectorProps {
  visible: boolean;
  currentTopic: string;
  onClose: () => void;
  onSelect: (topic: string) => void;
}

interface TopicItem {
  name: string;
  icon: React.ComponentType<any>;
}

const topics: TopicItem[] = [
  { name: 'History', icon: Landmark },
  { name: 'Music', icon: Music },
  { name: 'Art', icon: Palette },
  { name: 'Science', icon: Microscope },
  { name: 'Sports', icon: Trophy },
  { name: 'Technology', icon: Cpu },
  { name: 'Politics', icon: Scale },
  { name: 'Literature', icon: BookOpen },
];

export function TopicSelector({ visible, currentTopic, onClose, onSelect }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState(currentTopic);
  const insets = useSafeAreaInsets();

  // Reset selected topic when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedTopic(currentTopic);
    }
  }, [visible, currentTopic]);

  const handleTopicPress = (topicName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTopic(topicName);
  };

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(selectedTopic);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const renderTopicBox = (topic: TopicItem, index: number) => {
    const isSelected = topic.name === selectedTopic;
    const IconComponent = topic.icon;
    
    return (
      <TouchableOpacity
        key={topic.name}
        style={[
          styles.topicBox,
          isSelected && styles.selectedTopicBox
        ]}
        onPress={() => handleTopicPress(topic.name)}
        activeOpacity={0.7}
      >
        <View style={styles.topicContent}>
          <IconComponent 
            size={32} 
            color={isSelected ? '#000000' : '#666666'} 
          />
          <Text style={[
            styles.topicText,
            isSelected && styles.selectedTopicText
          ]}>
            {topic.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < topics.length; i += 2) {
      const row = (
        <View key={i} style={styles.gridRow}>
          {renderTopicBox(topics[i], i)}
          {topics[i + 1] && renderTopicBox(topics[i + 1], i + 1)}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { 
            paddingTop: insets.top + 80, 
            paddingBottom: insets.bottom + 120 
          }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Grid of Topics */}
          <View style={styles.grid}>
            {renderGrid()}
          </View>
        </ScrollView>

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={[styles.topGradient, { height: 120 + insets.top }]}
          pointerEvents="none"
        />

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={[styles.bottomGradient, { height: 120 + insets.bottom }]}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  grid: {
    flex: 1,
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  topicBox: {
    flex: 1,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedTopicBox: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  topicContent: {
    alignItems: 'center',
    gap: 8,
  },
  topicText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 16 * -0.05,
  },
  selectedTopicText: {
    color: '#000000',
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