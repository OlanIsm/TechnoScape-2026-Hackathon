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
  const [fertilizer, setFertilizer] = useState('Urea');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [notice, setNotice] = useState('');

  const estimatedPricePerKg = useMemo(() => {
    const numericTotal = Number(totalPrice || 0);
    const numericQuantity = Number(quantity || 0);

    if (!numericTotal || !numericQuantity) {
      return 'Isi jumlah dan total untuk estimasi.';
    }

    return `Estimasi Rp ${Math.round(numericTotal / numericQuantity).toLocaleString('id-ID')} /kg`;
  }, [quantity, totalPrice]);

  const saveTransaction = async () => {
    if (!quantity || !supplier || !date || !totalPrice) {
      setNotice('Semua field wajib diisi.');
      window.setTimeout(() => setNotice(''), 2600);
      return;
    }

    try {
      setNotice('Menyimpan transaksi...');
      await api.recordTransaction({
        jenisPupuk: fertilizer,
        quantity: Number(quantity),
        supplierName: supplier,
        tanggal: date,
        totalPrice: Number(totalPrice),
      });
      setNotice('Transaksi manual berhasil disimpan!');
      setQuantity('');
      setSupplier('');
      setDate('');
      setTotalPrice('');
      window.setTimeout(() => setNotice(''), 2600);
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Gagal menyimpan transaksi.'));
      window.setTimeout(() => setNotice(''), 3500);
    }
  };

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
            <Text style={styles.title}>Catat Transaksi Manual</Text>
            <Text style={styles.subtitle}>
              Masukkan detail pengadaan pupuk untuk dicatat dalam log koperasi.
            </Text>
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
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

            <Field
              label="Nama Supplier"
              onChangeText={setSupplier}
              placeholder="Masukkan nama supplier"
              value={supplier}
            />

            <Field label="Tanggal Transaksi" onChangeText={setDate} placeholder="2026-10-15" value={date} />

            <Field
              inputMode="numeric"
              label="Total Harga (Rp)"
              onChangeText={setTotalPrice}
              placeholder="0"
              prefix="Rp"
              value={totalPrice}
            />

            <View style={styles.summaryBox}>
              <View>
                <Text style={styles.summaryLabel}>Ringkasan</Text>
                <Text style={styles.summaryValue}>{fertilizer} dari {supplier || 'supplier belum diisi'}</Text>
              </View>
              <Text style={styles.summaryHint}>{estimatedPricePerKg}</Text>
            </View>

            <Pressable accessibilityRole="button" onPress={saveTransaction} style={styles.saveButton}>
              <View style={styles.saveIcon}>
                <View style={styles.saveIconTop} />
                <View style={styles.saveIconLine} />
              </View>
              <Text style={styles.saveText}>Simpan Transaksi</Text>
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
};

function Field({ inputMode = 'text', label, onChangeText, placeholder, prefix, value }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          accessibilityLabel={label}
          inputMode={inputMode}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          style={[styles.input, prefix ? styles.inputWithPrefix : undefined]}
          value={value}
        />
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
});
