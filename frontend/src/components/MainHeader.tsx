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
    minHeight: 72,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomColor: colors.surfaceContainerHigh,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    boxShadow: '0 3px 0 rgba(1, 45, 29, 0.03)',
  },
  logoutButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  logoutIcon: {
    width: 26,
    height: 26,
  },
});
