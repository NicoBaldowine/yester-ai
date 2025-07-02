import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height: screenHeight } = Dimensions.get('window');

export function SkeletonLoader() {
  const insets = useSafeAreaInsets();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const SkeletonBox = ({ 
    width: boxWidth, 
    height: boxHeight, 
    borderRadius = 8,
    style = {} 
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
  }) => (
    <View
      style={[
        styles.skeletonBox,
        {
          width: boxWidth,
          height: boxHeight,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Image Skeleton - Edge to edge */}
      <SkeletonBox 
        width="100%" 
        height={screenHeight * 0.35 + insets.top} 
        borderRadius={0}
        style={styles.heroImageSkeleton}
      />
      
      {/* Content Card Skeleton */}
      <View style={styles.contentCard}>
        {/* Hero Title */}
        <SkeletonBox width="85%" height={32} style={styles.heroTitle} />
        
        {/* Hero Content Lines */}
        <SkeletonBox width="100%" height={18} style={styles.contentLine} />
        <SkeletonBox width="95%" height={18} style={styles.contentLine} />
        <SkeletonBox width="80%" height={18} style={styles.contentLine} />
      </View>

      {/* Secondary Events Skeleton */}
      <View style={styles.secondaryContainer}>
        {[1, 2].map((index) => (
          <View key={index} style={styles.secondaryEvent}>
            {/* Secondary Event Title */}
            <SkeletonBox width="75%" height={24} style={styles.secondaryTitle} />
            
            {/* Secondary Event Image */}
            <SkeletonBox width="100%" height={180} borderRadius={12} style={styles.secondaryImage} />
            
            {/* Secondary Event Content */}
            <SkeletonBox width="100%" height={16} style={styles.secondaryContentLine} />
            <SkeletonBox width="90%" height={16} style={styles.secondaryContentLine} />
            <SkeletonBox width="70%" height={16} style={styles.secondaryContentLine} />
          </View>
        ))}
      </View>

      {/* Navigation Buttons Skeleton */}
      <View style={styles.navigationSkeleton}>
        <SkeletonBox width="48%" height={56} borderRadius={25} />
        <SkeletonBox width="48%" height={56} borderRadius={25} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImageSkeleton: {
    position: 'relative',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -50, // Overlap like real content
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    zIndex: 1,
  },
  heroTitle: {
    marginBottom: 16,
  },
  contentLine: {
    marginBottom: 8,
  },
  secondaryContainer: {
    paddingHorizontal: 24,
    gap: 32,
    marginBottom: 32,
  },
  secondaryEvent: {
    gap: 12,
  },
  secondaryTitle: {
    marginBottom: 4,
  },
  secondaryImage: {
    marginBottom: 8,
  },
  secondaryContentLine: {
    marginBottom: 4,
  },
  navigationSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  skeletonBox: {
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: '30%',
  },
}); 