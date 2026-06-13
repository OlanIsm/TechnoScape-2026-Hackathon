import { Image, StyleSheet, type ImageStyle } from 'react-native-web';
import blackLogo from '../assets/black_volumemate_icon.svg';
import whiteLogo from '../assets/white_volumemate_icon.svg';

type BrandMarkProps = {
  size?: number;
  style?: ImageStyle;
  tone?: 'black' | 'white';
};

const logoRatio = 561 / 141;

export function BrandMark({ size = 34, style, tone = 'black' }: BrandMarkProps) {
  return (
    <Image
      accessibilityLabel="VolumeMate"
      resizeMode="contain"
      source={{ uri: tone === 'white' ? whiteLogo : blackLogo }}
      style={[styles.logo, { height: size, width: size * logoRatio }, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
