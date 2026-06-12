import { Pressable, StyleSheet, Text, View } from 'react-native-web';
import { colors, fonts } from '../theme';

type KoperasiTab = 'home' | 'collective' | 'record' | 'log';

type KoperasiBottomNavProps = {
  activeTab: KoperasiTab;
  onCollectivePress?: () => void;
  onHomePress?: () => void;
  onRecordPress?: () => void;
};

const items: Array<{ key: KoperasiTab; label: string }> = [
  { key: 'home', label: 'Beranda' },
  { key: 'collective', label: 'Kolektif' },
  { key: 'record', label: 'Catat' },
  { key: 'log', label: 'Log' },
];

export function KoperasiBottomNav({
  activeTab,
  onCollectivePress,
  onHomePress,
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
  };

  return (
    <View style={styles.bottomNav}>
      {items.map((item, index) => {
        const isActive = item.key === activeTab;

        return (
          <Pressable
            accessibilityRole="button"
            key={item.key}
            onPress={() => handlePress(item.key)}
            style={styles.navItem}
          >
            {isActive ? <View style={styles.activePill} /> : null}
            <NavIcon index={index} isActive={isActive} />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type NavIconProps = {
  index: number;
  isActive: boolean;
};

function NavIcon({ index, isActive }: NavIconProps) {
  const color = isActive ? colors.secondary : colors.onSurfaceVariant;

  if (index === 0) {
    return (
      <View style={styles.homeIcon}>
        <View style={[styles.homeRoof, { borderBottomColor: color }]} />
        <View style={[styles.homeBase, { backgroundColor: color }]} />
      </View>
    );
  }

  if (index === 1) {
    return (
      <View style={[styles.collectiveIcon, { borderColor: color }]}>
        <View style={[styles.collectiveDot, { backgroundColor: color, left: 3, top: 5 }]} />
        <View style={[styles.collectiveDot, { backgroundColor: color, right: 3, top: 5 }]} />
        <View style={[styles.collectiveDotLarge, { backgroundColor: color }]} />
      </View>
    );
  }

  if (index === 2) {
    return (
      <View style={styles.noteIcon}>
        <View style={[styles.noteLine, { backgroundColor: color, width: 14 }]} />
        <View style={[styles.noteLine, { backgroundColor: color, width: 10 }]} />
        <View style={[styles.notePencil, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.logIcon, { borderColor: color }]}>
      <View style={[styles.logSlash, { backgroundColor: color }]} />
      <View style={[styles.logLine, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(193, 200, 194, 0.5)',
    borderTopWidth: 1,
    paddingHorizontal: 12,
    boxShadow: '0 -4px 12px rgba(27, 67, 50, 0.05)',
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 5,
    width: 48,
    height: 30,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 999,
    opacity: 0.52,
  },
  homeIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 14,
    height: 11,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  collectiveIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    position: 'relative',
  },
  collectiveDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  collectiveDotLarge: {
    position: 'absolute',
    left: 8,
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noteIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    gap: 3,
  },
  noteLine: {
    height: 2,
    borderRadius: 1,
  },
  notePencil: {
    width: 9,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-35deg' }],
    alignSelf: 'flex-end',
  },
  logIcon: {
    width: 20,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    position: 'relative',
  },
  logSlash: {
    position: 'absolute',
    left: 3,
    top: 6,
    width: 14,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '28deg' }],
  },
  logLine: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  navText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  navTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
