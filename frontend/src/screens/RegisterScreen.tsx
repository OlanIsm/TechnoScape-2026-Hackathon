import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../theme';

type RegisterScreenProps = {
  onBackPress?: () => void;
  onLoginPress?: () => void;
};
import { api } from '../services/api';

type Role = 'koperasi' | 'supplier';

const steps = [
  { id: '1', label: 'Akun', isActive: true },
  { id: '2', label: 'Organisasi', isActive: false },
  { id: '3', label: 'Dokumen', isActive: false },
];

export function RegisterScreen({ onBackPress, onLoginPress }: RegisterScreenProps) {
  const { height } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('koperasi');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [notice, setNotice] = useState('');

  const canContinue = name.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 8 && acceptedTerms;

  const handleContinue = async () => {
    if (!canContinue) {
      setNotice('Lengkapi nama, email, kata sandi minimal 8 karakter, dan setujui syarat layanan.');
      return;
    }

    try {
      setNotice('Mendaftarkan akun...');
      await api.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });
      setNotice('Registrasi berhasil! Silakan masuk dengan akun Anda.');
      setTimeout(() => {
        onLoginPress?.();
      }, 1500);
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Registrasi gagal. Email mungkin sudah terdaftar.'));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
            <Text style={styles.backText}>Kembali</Text>
          </Pressable>
          <BrandMark size={28} />
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>
              Lengkapi informasi di bawah ini untuk mendaftar sebagai Koperasi atau Pemasok.
            </Text>
          </View>

          <View style={styles.progress}>
            <View style={styles.progressLine} />
            <View style={styles.progressFill} />
            {steps.map((step) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={[styles.stepCircle, step.isActive && styles.stepCircleActive]}>
                  <Text style={[styles.stepNumber, step.isActive && styles.stepNumberActive]}>
                    {step.id}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, step.isActive && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                accessibilityLabel="Nama Lengkap"
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Budi Santoso"
                placeholderTextColor={colors.outlineVariant}
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Alamat Email (Gmail)</Text>
              <TextInput
                accessibilityLabel="Alamat Email Gmail"
                autoCapitalize="none"
                inputMode="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="contoh@gmail.com"
                placeholderTextColor={colors.outlineVariant}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Kata Sandi</Text>
              <TextInput
                accessibilityLabel="Kata Sandi"
                onChangeText={setPassword}
                placeholder="Minimal 8 karakter"
                placeholderTextColor={colors.outlineVariant}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Peran Anda</Text>
              <View style={styles.roleGrid}>
                <RoleOption
                  description="Kelola pembelian dan pool bersama"
                  isSelected={role === 'koperasi'}
                  label="Manajer Koperasi"
                  marker="K"
                  onPress={() => setRole('koperasi')}
                />
                <RoleOption
                  description="Terima proposal pembelian"
                  isSelected={role === 'supplier'}
                  label="Pemasok"
                  marker="S"
                  onPress={() => setRole('supplier')}
                />
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              onPress={() => setAcceptedTerms((current) => !current)}
              style={styles.termsRow}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                <Text style={styles.checkboxText}>{acceptedTerms ? 'v' : ''}</Text>
              </View>
              <Text style={styles.termsText}>Saya menyetujui Syarat Layanan VolumeMate.</Text>
            </Pressable>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleContinue}
              style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
            >
              <Text style={styles.primaryButtonText}>Lanjutkan</Text>
            </Pressable>
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <Pressable accessibilityRole="link" onPress={onLoginPress}>
                <Text style={styles.loginLink}>Masuk</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type RoleOptionProps = {
  description: string;
  isSelected: boolean;
  label: string;
  marker: string;
  onPress: () => void;
};

function RoleOption({ description, isSelected, label, marker, onPress }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
    >
      <View style={[styles.roleMarker, isSelected && styles.roleMarkerSelected]}>
        <Text style={[styles.roleMarkerText, isSelected && styles.roleMarkerTextSelected]}>
          {marker}
        </Text>
      </View>
      <Text style={styles.roleLabel}>{label}</Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    maxWidth: 430,
    minHeight: 64,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    minWidth: 82,
    minHeight: 44,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  backIcon: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
  },
  backText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  topSpacer: {
    width: 82,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  progress: {
    minHeight: 56,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 16,
    height: 2,
    backgroundColor: colors.surfaceVariant,
  },
  progressFill: {
    position: 'absolute',
    left: 22,
    top: 16,
    width: '33%',
    height: 2,
    backgroundColor: colors.primary,
  },
  stepItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  stepNumberActive: {
    color: colors.onPrimary,
  },
  stepLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  input: {
    minHeight: 48,
    borderColor: colors.outline,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(174, 238, 203, 0.2)',
    borderColor: colors.primary,
  },
  roleMarker: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 17,
  },
  roleMarkerSelected: {
    backgroundColor: colors.primary,
  },
  roleMarkerText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  roleMarkerTextSelected: {
    color: colors.onPrimary,
  },
  roleLabel: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  roleDescription: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outline,
    borderRadius: 6,
    borderWidth: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  footerActions: {
    gap: 14,
    marginTop: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.62,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  loginLink: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
