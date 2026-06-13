import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type RecordTransactionScreenProps = {
  onCollectivePress: () => void;
  onHomePress: () => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
};

const fertilizerOptions = ['Urea', 'NPK', 'SP-36', 'ZA', 'Organik'];

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function RecordTransactionScreen({
  onCollectivePress,
  onHomePress,
  onLogPress,
  onLogoutPress,
}: RecordTransactionScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [fertilizer, setFertilizer] = useState('Urea');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  // States for distribution (pengeluaran)
  const [buyerName, setBuyerName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [notes, setNotes] = useState('');

  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-calculated total price for distribution
  const computedTotalPriceForDistribution = useMemo(() => {
    const qty = Number(quantity || 0);
    const price = Number(pricePerKg || 0);
    return qty * price;
  }, [quantity, pricePerKg]);

  const estimatedPricePerKg = useMemo(() => {
    if (activeTab === 'pengeluaran') {
      const numericPrice = Number(pricePerKg || 0);
      return `Harga jual: Rp ${numericPrice.toLocaleString('id-ID')} /kg`;
    }

    const numericTotal = Number(totalPrice || 0);
    const numericQuantity = Number(quantity || 0);

    if (!numericTotal || !numericQuantity) {
      return 'Isi jumlah dan total untuk estimasi.';
    }

    return `Estimasi Rp ${Math.round(numericTotal / numericQuantity).toLocaleString('id-ID')} /kg`;
  }, [quantity, totalPrice, pricePerKg, activeTab]);

  const saveTransaction = async () => {
    if (activeTab === 'pemasukan') {
      if (!quantity || !supplier || !date || !totalPrice) {
        setNoticeType('error');
        setNotice('Semua field wajib diisi.');
        window.setTimeout(() => setNotice(''), 2600);
        return;
      }

      try {
        await api.recordTransaction({
          jenisPupuk: fertilizer,
          quantity: Number(quantity),
          supplierName: supplier,
          tanggal: date,
          totalPrice: Number(totalPrice),
        });
        setShowSuccessModal(true);
        setQuantity('');
        setSupplier('');
        setDate('');
        setTotalPrice('');
        window.setTimeout(() => setShowSuccessModal(false), 2600);
      } catch (err: unknown) {
        setNoticeType('error');
        setNotice(getErrorMessage(err, 'Gagal menyimpan transaksi.'));
        window.setTimeout(() => setNotice(''), 3500);
      }
    } else {
      // activeTab === 'pengeluaran'
      if (!quantity || !buyerName || !date || !pricePerKg) {
        setNoticeType('error');
        setNotice('Semua field wajib diisi.');
        window.setTimeout(() => setNotice(''), 2600);
        return;
      }

      try {
        await api.recordDistribution({
          jenisPupuk: fertilizer,
          quantity: Number(quantity),
          buyerName,
          tanggal: date,
          pricePerKg: Number(pricePerKg),
          notes: notes || undefined,
        });
        setShowSuccessModal(true);
        setQuantity('');
        setBuyerName('');
        setDate('');
        setPricePerKg('');
        setNotes('');
        window.setTimeout(() => setShowSuccessModal(false), 2600);
      } catch (err: unknown) {
        setNoticeType('error');
        setNotice(getErrorMessage(err, 'Gagal menyimpan penyaluran.'));
        window.setTimeout(() => setNotice(''), 3500);
      }
    }
  };

  const handleTabChange = (tab: 'pemasukan' | 'pengeluaran') => {
    setActiveTab(tab);
    setQuantity('');
    setSupplier('');
    setDate('');
    setTotalPrice('');
    setBuyerName('');
    setPricePerKg('');
    setNotes('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={onLogoutPress} />

        {showSuccessModal ? (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.checkmarkCircle}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Penyimpanan Berhasil!</Text>
              <Text style={styles.modalDescription}>
                {activeTab === 'pemasukan'
                  ? 'Data transaksi manual telah berhasil disimpan ke database.'
                  : 'Data penyaluran ke petani telah berhasil disimpan ke database.'}
              </Text>
            </View>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          <View style={styles.hero}>
            <Text style={styles.title}>Pencatatan Transaksi</Text>
            <Text style={styles.subtitle}>
              Catat pengadaan pupuk (masuk) atau penyaluran ke petani (keluar).
            </Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleTabChange('pemasukan')}
              style={[styles.tabButton, activeTab === 'pemasukan' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'pemasukan' && styles.tabTextActive]}>Pemasukan (Beli)</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleTabChange('pengeluaran')}
              style={[styles.tabButton, activeTab === 'pengeluaran' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'pengeluaran' && styles.tabTextActive]}>Pengeluaran (Jual)</Text>
            </Pressable>
          </View>

          {notice ? (
            <View
              style={[
                styles.notice,
                noticeType === 'error' && { backgroundColor: '#F8D7DA', borderColor: '#F5C6CB' },
              ]}
            >
              <Text style={[styles.noticeText, noticeType === 'error' && { color: '#721C24' }]}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Jenis Pupuk</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {fertilizerOptions.map((option) => {
                    const isSelected = option === fertilizer;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={option}
                        onPress={() => setFertilizer(option)}
                        style={[styles.chip, isSelected && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <Field
              inputMode="numeric"
              label="Jumlah (kg)"
              onChangeText={setQuantity}
              placeholder="Contoh: 500"
              value={quantity}
            />

            {activeTab === 'pemasukan' ? (
              <>
                <Field
                  label="Nama Supplier"
                  onChangeText={setSupplier}
                  placeholder="Masukkan nama supplier"
                  value={supplier}
                />
                <Field
                  label="Tanggal Transaksi"
                  onChangeText={setDate}
                  placeholder="2026-10-15"
                  value={date}
                  type="date"
                />
                <Field
                  inputMode="numeric"
                  label="Total Harga (Rp)"
                  onChangeText={setTotalPrice}
                  placeholder="0"
                  prefix="Rp"
                  value={totalPrice}
                />
              </>
            ) : (
              <>
                <Field
                  label="Nama Petani/Pembeli"
                  onChangeText={setBuyerName}
                  placeholder="Masukkan nama petani/pembeli"
                  value={buyerName}
                />
                <Field
                  label="Tanggal Penyaluran"
                  onChangeText={setDate}
                  placeholder="2026-10-15"
                  value={date}
                  type="date"
                />
                <Field
                  inputMode="numeric"
                  label="Harga Jual/kg (Rp)"
                  onChangeText={setPricePerKg}
                  placeholder="0"
                  prefix="Rp"
                  value={pricePerKg}
                />
                <Field
                  label="Total Terima (Rp)"
                  onChangeText={() => {}}
                  placeholder="0"
                  prefix="Rp"
                  value={computedTotalPriceForDistribution > 0 ? computedTotalPriceForDistribution.toLocaleString('id-ID') : '0'}
                  readOnly
                />
                <Field
                  label="Catatan (Opsional)"
                  onChangeText={setNotes}
                  placeholder="Contoh: Petani dari Blok B"
                  value={notes}
                />
              </>
            )}

            <View style={styles.summaryBox}>
              <View>
                <Text style={styles.summaryLabel}>Ringkasan</Text>
                {activeTab === 'pemasukan' ? (
                  <Text style={styles.summaryValue}>
                    {fertilizer} dari {supplier || 'supplier belum diisi'}
                  </Text>
                ) : (
                  <Text style={styles.summaryValue}>
                    Penyaluran {fertilizer} ke {buyerName || 'pembeli belum diisi'}
                  </Text>
                )}
              </View>
              <Text style={styles.summaryHint}>{estimatedPricePerKg}</Text>
            </View>

            <Pressable accessibilityRole="button" onPress={saveTransaction} style={styles.saveButton}>
              <View style={styles.saveIcon}>
                <View style={styles.saveIconTop} />
                <View style={styles.saveIconLine} />
              </View>
              <Text style={styles.saveText}>
                {activeTab === 'pemasukan' ? 'Simpan Transaksi Masuk' : 'Simpan Transaksi Keluar'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <KoperasiBottomNav
          activeTab="record"
          onCollectivePress={onCollectivePress}
          onHomePress={onHomePress}
          onLogPress={onLogPress}
        />
      </View>
    </SafeAreaView>
  );
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type FieldProps = {
  inputMode?: 'numeric' | 'text';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  prefix?: string;
  value: string;
  type?: string;
  readOnly?: boolean;
};

function Field({ inputMode = 'text', label, onChangeText, placeholder, prefix, value, type, readOnly }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, readOnly && { backgroundColor: colors.surfaceContainerLow }]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        {type === 'date' ? (
          <input
            type="date"
            value={value}
            disabled={readOnly}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              color: colors.onSurface,
              fontFamily: fonts.body,
              fontSize: '14px',
              height: '46px',
              paddingLeft: '14px',
              paddingRight: '14px',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <TextInput
            accessibilityLabel={label}
            inputMode={inputMode}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.outline}
            style={[styles.input, prefix ? styles.inputWithPrefix : undefined]}
            value={value}
            readOnly={readOnly}
          />
        )}
      </View>
    </View>
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
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 33,
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
    marginBottom: 4,
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
    letterSpacing: 0.3,
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
  formCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.62)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 15,
    padding: 16,
    ...cardShadow,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.45,
    lineHeight: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryFixedDim,
  },
  chipText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  chipTextActive: {
    color: colors.secondary,
  },
  inputWrap: {
    minHeight: 50,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderColor: colors.outlineVariant,
    borderRadius: 9,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...({ outlineWidth: 0 } as any),
  },
  inputWithPrefix: {
    paddingLeft: 8,
  },
  prefix: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 14,
  },
  summaryBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.surfaceVariant,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  summaryLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.45,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 2,
  },
  summaryHint: {
    color: colors.successGreen,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  saveButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    backgroundColor: colors.primary,
    borderRadius: 9,
  },
  saveIcon: {
    width: 17,
    height: 17,
    borderColor: colors.onPrimary,
    borderRadius: 2,
    borderWidth: 2,
    position: 'relative',
  },
  saveIconTop: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    height: 3,
    backgroundColor: colors.onPrimary,
    borderRadius: 1,
  },
  saveIconLine: {
    position: 'absolute',
    left: 3,
    right: 3,
    bottom: 3,
    height: 2,
    backgroundColor: colors.onPrimary,
    borderRadius: 1,
  },
  saveText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#28A745',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.35)',
  },
  checkmarkText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
});
