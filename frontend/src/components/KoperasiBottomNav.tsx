import { Image, Pressable, StyleSheet, View } from 'react-native-web';
import auditLogIcon from '../assets/audit_log_icon.svg';
import catatIcon from '../assets/catat_icon.svg';
import collectiveBuyIcon from '../assets/collective_buy_icon.svg';
import homeIcon from '../assets/home_icon.svg';
import { colors } from '../theme';

type KoperasiTab = 'home' | 'collective' | 'record' | 'log';

type KoperasiBottomNavProps = {
  activeTab: KoperasiTab;
  onCollectivePress?: () => void;
  onHomePress?: () => void;
  onLogPress?: () => void;
  onRecordPress?: () => void;
};

const items: Array<{ key: KoperasiTab; label: string }> = [
  { key: 'home', label: 'Beranda' },
  { key: 'collective', label: 'Kolektif' },
  { key: 'record', label: 'Catat' },
  { key: 'log', label: 'Log' },
];

const iconByTab: Record<KoperasiTab, string> = {
  collective: collectiveBuyIcon,
  home: homeIcon,
  log: auditLogIcon,
  record: catatIcon,
};

export function KoperasiBottomNav({
  activeTab,
  onCollectivePress,
  onHomePress,
  onLogPress,
  onRecordPress,
}: KoperasiBottomNavProps) {
  const handlePress = (key: KoperasiTab) => {
    if (key === 'home') {
      onHomePress?.();
    }

    if (key === 'collective') {
      onCollectivePress?.();
    }

    if (key === 'record') {
      onRecordPress?.();
    }

    if (key === 'log') {
      onLogPress?.();
    }
  };

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = item.key === activeTab;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            key={item.key}
            onPress={() => handlePress(item.key)}
            style={styles.navItem}
          >
            {isActive ? <View style={styles.activePill} /> : null}
            <Image
              accessibilityElementsHidden
              resizeMode="contain"
              source={{ uri: iconByTab[item.key] }}
              style={[styles.navIcon, isActive && styles.navIconActive]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    right: 18,
    height: 64,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.secondary,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    boxShadow: '0 8px 15px rgba(96, 76, 49, 0.35)',
  },
  navItem: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    width: 58,
    height: 58,
    backgroundColor: '#e8e2e2',
    borderRadius: 999,
    boxShadow: '0 7px 12px rgba(96, 76, 49, 0.22)',
  },
  navIcon: {
    width: 28,
    height: 28,
  },
  navIconActive: {
    width: 30,
    height: 30,
  },
});
