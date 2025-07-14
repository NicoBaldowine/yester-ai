import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

interface ModernLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function ModernLoader({ size = 64, color = '#000000', style }: ModernLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Rotation animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // Scale pulse animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );
    
    spinAnimation.start();
    scaleAnimation.start();
    
    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const dotSize = size * 0.15;
  const radius = size * 0.35;
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View 
        style={[
          styles.loader,
          {
            width: size,
            height: size,
            transform: [{ rotate: spin }, { scale: scaleValue }],
          },
        ]}
      >
        {/* Create 8 dots in a circle */}
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * 45) * Math.PI / 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: color,
                  opacity: 0.2 + (index * 0.1),
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
              ]}
            />
          );
        })}
        
        {/* Center dot */}
        <View
          style={[
            styles.centerDot,
            {
              width: dotSize * 0.8,
              height: dotSize * 0.8,
              borderRadius: dotSize * 0.4,
              backgroundColor: color,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
  },
  centerDot: {
    position: 'absolute',
    opacity: 0.6,
  },
}); 