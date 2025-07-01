import { RegionSelector } from '@/components/RegionSelector';
import { TopicSelector } from '@/components/TopicSelector';
import { YearSelector } from '@/components/YearSelector';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Event {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  isPrimary: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function ContentScreen() {
  const insets = useSafeAreaInsets();
  
  // Default values for home screen
  const [year, setYear] = useState(1990);
  const [topic, setTopic] = useState('History');
  const [region, setRegion] = useState('America');

  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  // Expanded mock data - will be replaced with AI-generated content
  const events: Event[] = [
    {
      id: '1',
      title: 'Germany Reunification',
      content: '🏛️ After 45 years of separation, on October 3rd, 1990, the two Germanys became one again.\n\nThe Berlin Wall, which for decades had divided not only a country but entire families, was no longer there.\n\n🌍 In the streets, thousands of people celebrated waving flags.\n🎉 The air smelled of hope.\n⚡ Songs sounded that mixed tears, hugs and future.\n\nThe Cold War was coming to an end, and Berlin, once again a capital, was preparing for a new era.\n\nThis historic moment marked the end of a divided Europe and the beginning of a new chapter in world history.',
      imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop',
      isPrimary: true
    },
    {
      id: '2',
      title: 'Hubble Space Telescope Launch',
      content: '🚀 NASA launches the Hubble Space Telescope, revolutionizing our understanding of the universe with unprecedented clarity and detail.\n\nThis incredible achievement opened new windows to the cosmos, allowing scientists to observe distant galaxies, nebulae, and stellar phenomena with extraordinary precision.\n\n✨ The telescope would go on to capture some of the most breathtaking images of space ever seen by humanity.',
      imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=300&fit=crop',
      isPrimary: false
    },
    {
      id: '3',
      title: 'World Wide Web Created',
      content: '💻 Tim Berners-Lee creates the World Wide Web at CERN, laying the foundation for the modern internet as we know it today.\n\nThis groundbreaking invention would transform global communication, commerce, and access to information in ways that were previously unimaginable.\n\n🌐 The first website went live, marking the beginning of the digital revolution that would reshape society.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop',
      isPrimary: false
    },
    {
      id: '4',
      title: 'Nelson Mandela Released',
      content: '✊ Nelson Mandela is released from prison after 27 years of imprisonment, marking a crucial moment in the fight against apartheid in South Africa.\n\nHis release signaled the beginning of the end of apartheid and the start of negotiations for a democratic South Africa.\n\n🕊️ This moment inspired people around the world and became a symbol of perseverance and the triumph of justice over oppression.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=300&fit=crop',
      isPrimary: false
    },
    {
      id: '5',
      title: 'Iraqi Invasion of Kuwait',
      content: '⚔️ Iraq invades Kuwait, leading to the Gulf War and significant changes in Middle Eastern geopolitics.\n\nThis conflict would draw international intervention and reshape alliances in the region.\n\n🛡️ The response from the international community demonstrated the importance of collective security in the post-Cold War era.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=300&fit=crop',
      isPrimary: false
    },
    {
      id: '6',
      title: 'Microsoft Windows 3.0 Released',
      content: '💾 Microsoft releases Windows 3.0, which becomes the first commercially successful version of Windows.\n\nThis operating system would revolutionize personal computing and establish Microsoft as a dominant force in the software industry.\n\n🖥️ The graphical user interface made computers more accessible to everyday users, changing how people interact with technology.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop',
      isPrimary: false
    }
  ];

  const primaryEvent = events.find(e => e.isPrimary);
  const secondaryEvents = events.filter(e => !e.isPrimary);

  const handleYearChange = (direction: 'next' | 'previous') => {
    const newYear = direction === 'next' ? year + 1 : year - 1;
    if (newYear >= 0 && newYear <= 2025) {
      setYear(newYear);
    }
  };

  const handleYearSelect = (newYear: number) => {
    setYear(newYear);
    setShowYearSelector(false);
  };

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    setShowTopicSelector(false);
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setShowRegionSelector(false);
  };

  return (
    <View style={styles.container}>
      {/* Sticky Profile Button - Top */}
      <BlurView intensity={20} tint="light" style={[styles.stickyProfileButton, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.profileTouchable} 
          activeOpacity={0.8}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={styles.profileInitial}>N</Text>
        </TouchableOpacity>
      </BlurView>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Full Width Hero Image - covers from very top edge-to-edge */}
        {primaryEvent && (
          <View style={styles.heroContainer}>
            <Image source={{ uri: primaryEvent.imageUrl }} style={[styles.heroImage, { height: 450 + insets.top }]} />
            
            {/* Content over image with safe area consideration */}
            <View style={[styles.heroContent, { paddingTop: 24 + insets.top }]}>
              <Text style={styles.heroTitle}>{primaryEvent.title}</Text>
              <Text style={styles.heroText}>{primaryEvent.content}</Text>
            </View>
          </View>
        )}

        {/* Secondary Events */}
        <View style={styles.secondaryEventsContainer}>
          {secondaryEvents.map((event, index) => (
            <View key={event.id} style={styles.secondaryEventContainer}>
              <Text style={styles.secondaryTitle}>{event.title}</Text>
              <Image source={{ uri: event.imageUrl }} style={styles.secondaryImage} />
              <Text style={styles.secondaryText}>{event.content}</Text>
            </View>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, year <= 0 && styles.navButtonDisabled]}
            onPress={() => handleYearChange('previous')}
            disabled={year <= 0}
          >
            <Text style={[styles.navButtonText, year <= 0 && styles.navButtonTextDisabled]}>
              Previous Year
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, year >= 2025 && styles.navButtonDisabled]}
            onPress={() => handleYearChange('next')}
            disabled={year >= 2025}
          >
            <Text style={[styles.navButtonText, year >= 2025 && styles.navButtonTextDisabled]}>
              Next Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for floating buttons */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Horizontal Floating Pill Buttons with Haptics - respecting safe areas */}
      <View style={[styles.floatingButtons, { bottom: 40 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowYearSelector(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.pillButtonText}>{year}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowTopicSelector(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.pillButtonText}>{topic}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowRegionSelector(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.pillButtonText}>{region}</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Modals */}
      <YearSelector
        visible={showYearSelector}
        currentYear={year}
        onClose={() => setShowYearSelector(false)}
        onSelect={handleYearSelect}
      />
      
      <TopicSelector
        visible={showTopicSelector}
        currentTopic={topic}
        onClose={() => setShowTopicSelector(false)}
        onSelect={handleTopicChange}
      />
      
      <RegionSelector
        visible={showRegionSelector}
        currentRegion={region}
        onClose={() => setShowRegionSelector(false)}
        onSelect={handleRegionChange}
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
    fontSize: 14,
    fontWeight: '600',
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
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 12,
  },
  heroText: {
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  secondaryImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  secondaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  navButtonDisabled: {
    backgroundColor: '#F1F3F4',
    borderColor: '#E8EAED',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  navButtonTextDisabled: {
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 