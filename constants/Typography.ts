import { TextStyle } from 'react-native';

// Base letter spacing (-5%)
const LETTER_SPACING = -0.05;

// Typography constants with Bricolage Grotesque and -5% letter spacing
export const Typography = {
  // Headers
  heroTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 24 * LETTER_SPACING,
    lineHeight: 32,
  } as TextStyle,

  secondaryTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 20 * LETTER_SPACING,
    lineHeight: 28,
  } as TextStyle,

  // Body text
  heroText: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 16 * LETTER_SPACING,
    lineHeight: 24,
  } as TextStyle,

  secondaryText: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 15 * LETTER_SPACING,
    lineHeight: 22,
  } as TextStyle,

  // Buttons
  pillButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 16 * LETTER_SPACING,
  } as TextStyle,

  navButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 16 * LETTER_SPACING,
  } as TextStyle,

  cancelButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 16 * LETTER_SPACING,
  } as TextStyle,

  selectButtonText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 16 * LETTER_SPACING,
  } as TextStyle,

  // Profile
  profileInitial: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 14 * LETTER_SPACING,
  } as TextStyle,

  // Year Selector
  selectedYearText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 80,
    fontWeight: '700' as const,
    letterSpacing: 80 * LETTER_SPACING,
    lineHeight: 80,
  } as TextStyle,

  unselectedYearText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 70,
    fontWeight: '700' as const,
    letterSpacing: 70 * LETTER_SPACING,
    lineHeight: 70,
  } as TextStyle,

  // Selectors
  selectorTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 24 * LETTER_SPACING,
    lineHeight: 32,
  } as TextStyle,

  selectorItem: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 18 * LETTER_SPACING,
    lineHeight: 24,
  } as TextStyle,
}; 