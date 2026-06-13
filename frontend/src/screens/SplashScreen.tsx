import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, useWindowDimensions, View } from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { colors } from '../theme';

type SplashScreenProps = {
  onStartPress?: () => void;
};

export function SplashScreen({ onStartPress }: SplashScreenProps) {
  const { height } = useWindowDimensions();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onStartPress?.();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [onStartPress]);

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.content}>
        <BrandMark size={54} tone="white" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primaryContainer,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    width: '100%',
  },
});
