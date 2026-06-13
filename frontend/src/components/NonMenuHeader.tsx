import { Image, Pressable, StyleSheet, Text, View } from 'react-native-web';
import backIcon from '../assets/back_button.svg';
import { colors, fonts } from '../theme';

type NonMenuHeaderProps = {
  onBackPress: () => void;
  title: string;
};

export function NonMenuHeader({ onBackPress, title }: NonMenuHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Kembali"
        accessibilityRole="button"
        onPress={onBackPress}
        style={styles.backButton}
      >
        <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: backIcon }} style={styles.backIcon} />
      </Pressable>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 76,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    gap: 14,
    paddingHorizontal: 18,
  },
  backButton: {
    width: 34,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  title: {
    color: colors.primary,
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 34,
  },
});
