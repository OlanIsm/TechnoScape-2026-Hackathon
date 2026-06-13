import { StyleSheet, View, type ViewStyle } from 'react-native-web';
import { colors } from '../theme';

type BrandMarkProps = {
  size?: number;
  style?: ViewStyle;
};

export function BrandMark({ size = 56, style }: BrandMarkProps) {
  const scale = size / 56;

  return (
    <View style={[styles.canvas, { height: size, width: size }, style]} accessibilityElementsHidden>
      <View
        style={[
          styles.leaf,
          styles.leafLeft,
          {
            borderBottomLeftRadius: 24 * scale,
            borderBottomRightRadius: 4 * scale,
            borderTopLeftRadius: 24 * scale,
            borderTopRightRadius: 24 * scale,
            height: 38 * scale,
            left: 8 * scale,
            top: 8 * scale,
            width: 24 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafRight,
          {
            borderBottomLeftRadius: 24 * scale,
            borderBottomRightRadius: 4 * scale,
            borderTopLeftRadius: 24 * scale,
            borderTopRightRadius: 24 * scale,
            height: 38 * scale,
            right: 8 * scale,
            top: 8 * scale,
            width: 24 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            borderRadius: 2 * scale,
            bottom: 4 * scale,
            height: 24 * scale,
            left: 27 * scale,
            width: 3 * scale,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
  },
  leaf: {
    position: 'absolute',
  },
  leafLeft: {
    backgroundColor: colors.secondaryFixedDim,
    transform: [{ rotate: '-34deg' }],
  },
  leafRight: {
    backgroundColor: colors.secondary,
    transform: [{ rotate: '34deg' }],
  },
  stem: {
    position: 'absolute',
    backgroundColor: colors.primaryContainer,
  },
});
