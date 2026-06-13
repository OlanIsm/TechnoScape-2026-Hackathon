import { Image, Pressable, StyleSheet, View } from 'react-native-web';
import logoutIcon from '../assets/black_logout_icon.svg';
import { colors } from '../theme';
import { BrandMark } from './BrandMark';

type MainHeaderProps = {
  onLogoutPress: () => void;
};

export function MainHeader({ onLogoutPress }: MainHeaderProps) {
  return (
    <View style={styles.header}>
      <BrandMark size={34} />
      <Pressable
        accessibilityLabel="Keluar"
        accessibilityRole="button"
        onPress={onLogoutPress}
        style={styles.logoutButton}
      >
        <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: logoutIcon }} style={styles.logoutIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 66,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  logoutButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
});
