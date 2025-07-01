import { Typography } from '@/constants/Typography';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileScreen({ visible, onClose }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>N</Text>
              </View>
              <Text style={styles.profileName}>Nico Baldovino</Text>
              <Text style={styles.profileSubtitle}>History Explorer</Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>47</Text>
                <Text style={styles.statLabel}>Years Explored</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Events Discovered</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Favorite Topics</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuItemIcon}>⚙️</Text>
                <Text style={styles.menuItemText}>Settings</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuItemIcon}>📖</Text>
                <Text style={styles.menuItemText}>History</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuItemIcon}>❤️</Text>
                <Text style={styles.menuItemText}>Favorites</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Statistics</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuItemIcon}>💡</Text>
                <Text style={styles.menuItemText}>About Yester</Text>
                <Text style={styles.menuItemChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Yester.ai • Exploring history through time
              </Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>
        </ScrollView>

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={[styles.topGradient, { height: 100 + insets.top }]}
          pointerEvents="none"
        />

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={[styles.bottomGradient, { height: 100 + insets.bottom }]}
          pointerEvents="none"
        />

        {/* Close Button */}
        <BlurView intensity={20} tint="light" style={[styles.closeButton, { top: 40 + insets.top }]}>
          <TouchableOpacity
            style={styles.closeButtonTouchable}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitial: {
    ...Typography.selectedYearText,
    fontSize: 32,
    color: '#FFFFFF',
  },
  profileName: {
    ...Typography.heroTitle,
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileSubtitle: {
    ...Typography.secondaryText,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.heroTitle,
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.secondaryText,
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  menuContainer: {
    gap: 4,
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemText: {
    ...Typography.heroText,
    flex: 1,
    color: '#1A1A1A',
  },
  menuItemChevron: {
    ...Typography.heroText,
    fontSize: 20,
    color: '#C7C7CC',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  footerText: {
    ...Typography.secondaryText,
    color: '#666666',
    marginBottom: 8,
  },
  versionText: {
    ...Typography.secondaryText,
    fontSize: 12,
    color: '#999999',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 10,
  },
  closeButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.cancelButtonText,
    fontSize: 16,
    color: '#1A1A1A',
  },
}); 