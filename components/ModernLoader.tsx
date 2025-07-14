import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

interface ModernLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function ModernLoader({ size = 64, color = '#000000', style }: ModernLoaderProps) {
  const animatedValues = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;
  
  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100), // Stagger the animations
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    // Start all animations
    animations.forEach(animation => animation.start());
    
    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);
  
  const barWidth = size * 0.08;
  const barHeight = size * 0.4;
  const spacing = size * 0.04;
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={styles.barsContainer}>
        {animatedValues.map((animatedValue, index) => {
          const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
          });
          
          const opacity = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: color,
                  marginHorizontal: spacing / 2,
                  transform: [{ scaleY: scale }],
                  opacity: opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 2,
  },
}); 