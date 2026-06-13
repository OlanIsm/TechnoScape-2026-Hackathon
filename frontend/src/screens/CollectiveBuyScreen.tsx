import { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native-web';
import plusIcon from '../assets/plus_icon.svg';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { PoolCard } from '../components/PoolCard';
import { pools, type ProcurementPool } from '../data/pools';
import { colors, fonts } from '../theme';

type CollectiveBuyScreenProps = {
  initialTab?: 'open' | 'mine';
  joinedPoolIds: number[];
  onHomePress: () => void;
  onJoinPoolPress: (pool: ProcurementPool) => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
  onSuccessMessageShown?: () => void;
  successMessage?: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function CollectiveBuyScreen({
  initialTab = 'open',
  joinedPoolIds,
  onHomePress,
  onJoinPoolPress,
  onLogPress,
  onLogoutPress,
  onRecordPress,
  onSuccessMessageShown,
  successMessage = '',
}: CollectiveBuyScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>(initialTab);
  const [notice, setNotice] = useState(successMessage);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    setNotice(successMessage);
    const timer = window.setTimeout(() => {
      setNotice('');
      onSuccessMessageShown?.();
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [onSuccessMessageShown, successMessage]);

  const showDummyNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const openPools = pools.filter((pool) => !joinedPoolIds.includes(pool.id));
  const myPools = pools.filter((pool) => joinedPoolIds.includes(pool.id));
  const visiblePools = activeTab === 'open' ? openPools : myPools;

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={onLogoutPress} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          <View style={styles.hero}>
            <Text style={styles.title}>Kolektif Pembelian</Text>
            <Text style={styles.subtitle}>
              Gabung dengan pool lain untuk mencapai target volume dan mendapatkan harga grosir terbaik.
            </Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('open')}
              style={[styles.tabButton, activeTab === 'open' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>Pool Terbuka</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('mine')}
              style={[styles.tabButton, activeTab === 'mine' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>Pool Saya</Text>
            </Pressable>
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.poolList}>
            {visiblePools.length ? (
              visiblePools.map((pool) => (
                <PoolCard key={pool.id} onAction={showDummyNotice} onJoinPress={onJoinPoolPress} pool={pool} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {activeTab === 'open' ? 'Belum ada pool terbuka.' : 'Belum ada pool yang kamu ikuti.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="Buat pool baru"
          accessibilityRole="button"
          onPress={() => showDummyNotice('Form buat pool baru masih dummy untuk sekarang.')}
          style={styles.fab}
        >
          <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: plusIcon }} style={styles.fabIcon} />
        </Pressable>

        <KoperasiBottomNav
          activeTab="collective"
          onHomePress={onHomePress}
          onLogPress={onLogPress}
          onRecordPress={onRecordPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  shell: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingBottom: 72,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceCard,
    ...cardShadow,
  },
  tabText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  tabTextActive: {
    color: colors.primary,
  },
  notice: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryFixedDim,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  poolList: {
    gap: 16,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  emptyText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 82,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    width: 56,
    height: 56,
  },
});
