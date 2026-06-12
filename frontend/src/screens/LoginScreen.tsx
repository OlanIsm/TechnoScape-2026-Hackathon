import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../theme';

type LoginScreenProps = {
  onAdminLogin?: () => void;
  onKoperasiLogin?: () => void;
  onRegisterPress?: () => void;
  onSupplierLogin?: () => void;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function LoginScreen({
  onAdminLogin,
  onKoperasiLogin,
  onRegisterPress,
  onSupplierLogin,
}: LoginScreenProps) {
  const { height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [notice, setNotice] = useState('');

  const handleLogin = () => {
    const loginCode = email.trim();

    if (loginCode === '1') {
      onKoperasiLogin?.();
      return;
    }

    if (loginCode === '2') {
      onSupplierLogin?.();
      return;
    }

    if (loginCode === '3') {
      onAdminLogin?.();
      return;
    }

    setNotice('Masukkan email dummy 1 untuk Koperasi, 2 untuk Supplier, atau 3 untuk Admin.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <BrandMark size={38} />
            </View>
            <Text style={styles.brand}>VolumeMate</Text>
            <Text style={styles.subtitle}>Solusi Pengadaan Agrikultur Modern</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email atau Gmail</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  accessibilityLabel="Email atau Gmail"
                  autoCapitalize="none"
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="masukkan@email.anda"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  accessibilityLabel="Password"
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!isPasswordVisible}
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                  accessibilityRole="button"
                  onPress={() => setIsPasswordVisible((current) => !current)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{isPasswordVisible ? 'Tutup' : 'Lihat'}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="link"
              onPress={() => setNotice('Fitur lupa password belum tersedia.')}
              style={styles.forgotLink}
            >
              <Text style={styles.linkText}>Lupa Password?</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Masuk</Text>
            </Pressable>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setNotice('Login Google dummy untuk sementara.')}
            style={styles.googleButton}
          >
            <View style={styles.googleMark}>
              <Text style={styles.googleMarkText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Lanjutkan dengan Google</Text>
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <Pressable accessibilityRole="link" onPress={onRegisterPress}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  page: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 24,
    gap: 24,
    ...cardShadow,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 32,
    marginBottom: 8,
  },
  brand: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 8,
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
  inputWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 12,
  },
  inputIcon: {
    width: 22,
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  eyeText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  notice: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  googleButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
  },
  googleMark: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkText: {
    color: colors.errorRed,
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '700',
  },
  googleButtonText: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: -8,
  },
  registerText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  registerLink: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
