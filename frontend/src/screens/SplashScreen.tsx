import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../theme';

const FIELD_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvv0kAEzQ7zILxcZjdlB5hmaSboVOFojy64mtXPHA7-16aiLfHOTMy_rSgSUe2vUo__hboxA6fX4EwWPLzqjQZ9WGivW8hHm4irhfseiSiZvLSy5EJAGnI99e24zTv5Qa7iaH_Hpe8DazIjsQOrojj2GnabWK181fJKVFPvqkHgVkm8hrUcZW5qEtDhvjExy5W1zIqb-EJeLAnv7ZRAKwum2dNdleSMvtUokpnKHUKweDfrI5i1XSCFeyQldAQlY06hGJnC6szb1s';

const patternDots = Array.from({ length: 56 }, (_, index) => index);
const cardShadow = {
  boxShadow: '0 12px 24px rgba(8, 28, 21, 0.14)',
} as unknown as ViewStyle;
const buttonShadow = {
  boxShadow: '0 12px 24px rgba(8, 28, 21, 0.16)',
} as unknown as ViewStyle;

type SplashScreenProps = {
  onStartPress?: () => void;
};

export function SplashScreen({ onStartPress }: SplashScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <ImageBackground source={{ uri: FIELD_IMAGE_URI }} style={styles.imageLayer}>
        <View style={styles.imageScrim} />
      </ImageBackground>

      <View style={styles.patternLayer}>
        {patternDots.map((dot) => (
          <View key={dot} style={styles.patternDot} />
        ))}
      </View>

      <View style={[styles.content, { minHeight: height }]}>
        <View style={styles.brandBlock}>
          <View style={styles.logoCard}>
            <View style={styles.logoTint} />
            <BrandMark size={42} />
          </View>

          <Text style={styles.tagline}>Smart Procurement for Koperasi</Text>
        </View>

        <View style={styles.actionBlock}>
          <Pressable
            accessibilityRole="button"
            onPress={onStartPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isPressed) && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Mulai</Text>
          <Text style={styles.primaryButtonIcon}>-&gt;</Text>
          </Pressable>

          <Text style={styles.footer}>(c) 2026 Koperasi Digital Indonesia</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primaryContainer,
    overflow: 'hidden',
    position: 'relative',
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  imageScrim: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    opacity: 0.58,
  },
  patternLayer: {
    ...StyleSheet.absoluteFillObject,
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    opacity: 0.24,
    padding: 18,
  },
  patternDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.secondaryFixed,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
    position: 'relative',
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  logoCard: {
    width: 228,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(225, 227, 228, 0.28)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
    ...cardShadow,
  },
  logoTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.secondaryFixed,
    opacity: 0.18,
  },
  tagline: {
    color: colors.onPrimaryMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 250,
    textAlign: 'center',
  },
  actionBlock: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    ...buttonShadow,
  },
  primaryButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: colors.primaryContainer,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  primaryButtonIcon: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  footer: {
    color: colors.onPrimarySubtle,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 24,
    textAlign: 'center',
  },
});
