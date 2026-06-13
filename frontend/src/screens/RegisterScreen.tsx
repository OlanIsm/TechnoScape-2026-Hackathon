import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { api } from '../services/api';
import { colors, fonts } from '../theme';

type RegisterScreenProps = {
  onBackPress?: () => void;
  onLoginPress?: () => void;
};

type Role = 'koperasi' | 'supplier';
type RegisterStep = 0 | 1 | 2;

const steps = [
  { id: 0, label: 'Akun' },
  { id: 1, label: 'Organisasi' },
  { id: 2, label: 'Dokumen' },
] as const;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function RegisterScreen({ onBackPress, onLoginPress }: RegisterScreenProps) {
  const { height } = useWindowDimensions();
  const [step, setStep] = useState<RegisterStep>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('koperasi');
  const [organizationName, setOrganizationName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ktpFileName, setKtpFileName] = useState('');
  const [legalFileName, setLegalFileName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [notice, setNotice] = useState('');

  const canContinueAccount = name.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 8;
  const canContinueOrganization =
    organizationName.trim().length > 0 &&
    responsibleName.trim().length > 0 &&
    address.trim().length > 0 &&
    phone.trim().length > 0;
  const canRegister = canContinueAccount && canContinueOrganization && ktpFileName && legalFileName && acceptedTerms;

  const goBack = () => {
    setNotice('');
    if (step > 0) {
      setStep((current) => (current - 1) as RegisterStep);
      return;
    }

    onBackPress?.();
  };

  const goNext = () => {
    if (step === 0 && !canContinueAccount) {
      setNotice('Lengkapi nama, email, dan kata sandi minimal 8 karakter.');
      return;
    }

    if (step === 1 && !canContinueOrganization) {
      setNotice('Lengkapi seluruh data organisasi terlebih dahulu.');
      return;
    }

    setNotice('');
    setStep((current) => (current + 1) as RegisterStep);
  };

  const submitRegistration = async () => {
    if (!canRegister) {
      setNotice('Unggah dokumen, lengkapi data, dan setujui syarat layanan.');
      return;
    }

    try {
      setNotice('Mendaftarkan akun...');
      await api.register({
        acceptedTerms,
        address: address.trim(),
        documentName: legalFileName,
        email: email.trim(),
        ktpName: ktpFileName,
        name: name.trim(),
        organizationName: organizationName.trim(),
        password,
        phone: phone.trim(),
        responsibleName: responsibleName.trim(),
        role,
      });
      setNotice('Registrasi berhasil dikirim. Silakan tunggu persetujuan admin.');
      window.setTimeout(() => onLoginPress?.(), 1600);
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Registrasi gagal. Email mungkin sudah terdaftar.'));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </Pressable>
          <BrandMark size={28} />
          <View style={styles.topSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <StepProgress currentStep={step} />

          {step === 0 ? (
            <AccountStep
              email={email}
              name={name}
              onEmailChange={setEmail}
              onNameChange={setName}
              onPasswordChange={setPassword}
              onRoleChange={setRole}
              password={password}
              role={role}
            />
          ) : null}

          {step === 1 ? (
            <OrganizationStep
              address={address}
              onAddressChange={setAddress}
              onOrganizationNameChange={setOrganizationName}
              onPhoneChange={setPhone}
              onResponsibleNameChange={setResponsibleName}
              organizationName={organizationName}
              phone={phone}
              responsibleName={responsibleName}
            />
          ) : null}

          {step === 2 ? (
            <DocumentStep
              acceptedTerms={acceptedTerms}
              ktpFileName={ktpFileName}
              legalFileName={legalFileName}
              onKtpUpload={() => setKtpFileName('foto_ktp_penanggung_jawab.jpg')}
              onLegalUpload={() => setLegalFileName('dokumen_legalitas_usaha.pdf')}
              onToggleTerms={() => setAcceptedTerms((current) => !current)}
            />
          ) : null}

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <View style={styles.footerActions}>
            {step < 2 ? (
              <Pressable
                accessibilityRole="button"
                onPress={goNext}
                style={[
                  styles.primaryButton,
                  step === 0 && !canContinueAccount && styles.primaryButtonDisabled,
                  step === 1 && !canContinueOrganization && styles.primaryButtonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>Lanjutkan</Text>
                <Text style={styles.primaryButtonArrow}>-&gt;</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={submitRegistration}
                style={[styles.primaryButton, !canRegister && styles.primaryButtonDisabled]}
              >
                <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
                <Text style={styles.primaryButtonArrow}>-&gt;</Text>
              </Pressable>
            )}

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <Pressable accessibilityRole="link" onPress={onLoginPress}>
                <Text style={styles.loginLink}>Masuk di sini</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function StepProgress({ currentStep }: { currentStep: RegisterStep }) {
  return (
    <View style={styles.progress}>
      <View style={styles.progressLine} />
      <View style={[styles.progressFill, { width: `${currentStep * 50}%` }]} />
      {steps.map((item) => {
        const isDone = item.id < currentStep;
        const isActive = item.id === currentStep;

        return (
          <View key={item.id} style={styles.stepItem}>
            <View style={[styles.stepCircle, (isDone || isActive) && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, (isDone || isActive) && styles.stepNumberActive]}>
                {isDone ? 'v' : item.id + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, (isDone || isActive) && styles.stepLabelActive]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function AccountStep({
  email,
  name,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onRoleChange,
  password,
  role,
}: {
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: Role) => void;
  password: string;
  role: Role;
}) {
  return (
    <>
      <ScreenHeader
        subtitle="Buat akun untuk mengakses pengadaan kolektif VolumeMate."
        title="Buat Akun Baru"
      />

      <View style={styles.form}>
        <Field label="Nama Lengkap" onChangeText={onNameChange} placeholder="Budi Santoso" value={name} />
        <Field
          autoCapitalize="none"
          inputMode="email"
          label="Alamat Email (Gmail)"
          onChangeText={onEmailChange}
          placeholder="contoh@gmail.com"
          value={email}
        />
        <Field
          label="Kata Sandi"
          onChangeText={onPasswordChange}
          placeholder="Minimal 8 karakter"
          secureTextEntry
          value={password}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Peran Anda</Text>
          <View style={styles.roleGrid}>
            <RoleOption
              description="Kelola pembelian dan pool bersama"
              isSelected={role === 'koperasi'}
              label="Koperasi"
              marker="K"
              onPress={() => onRoleChange('koperasi')}
            />
            <RoleOption
              description="Terima proposal pembelian"
              isSelected={role === 'supplier'}
              label="Pemasok"
              marker="S"
              onPress={() => onRoleChange('supplier')}
            />
          </View>
        </View>
      </View>
    </>
  );
}

function OrganizationStep({
  address,
  onAddressChange,
  onOrganizationNameChange,
  onPhoneChange,
  onResponsibleNameChange,
  organizationName,
  phone,
  responsibleName,
}: {
  address: string;
  onAddressChange: (value: string) => void;
  onOrganizationNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onResponsibleNameChange: (value: string) => void;
  organizationName: string;
  phone: string;
  responsibleName: string;
}) {
  return (
    <>
      <ScreenHeader
        subtitle="Lengkapi detail organisasi atau badan usaha Anda untuk proses verifikasi."
        title="Data Organisasi"
      />

      <View style={styles.form}>
        <Field
          icon="#"
          label="Nama Organisasi/Koperasi"
          onChangeText={onOrganizationNameChange}
          placeholder="Contoh: Koperasi Tani Makmur"
          value={organizationName}
        />
        <Field
          icon="@"
          label="Nama Penanggung Jawab"
          onChangeText={onResponsibleNameChange}
          placeholder="Nama lengkap sesuai KTP"
          value={responsibleName}
        />
        <Field
          icon="^"
          label="Alamat Lengkap"
          multiline
          onChangeText={onAddressChange}
          placeholder="Masukkan alamat lengkap operasional..."
          value={address}
        />
        <Field
          icon="+62"
          inputMode="numeric"
          label="Nomor Telepon/WhatsApp"
          onChangeText={onPhoneChange}
          placeholder="81234567890"
          value={phone}
        />
      </View>
    </>
  );
}

function DocumentStep({
  acceptedTerms,
  ktpFileName,
  legalFileName,
  onKtpUpload,
  onLegalUpload,
  onToggleTerms,
}: {
  acceptedTerms: boolean;
  ktpFileName: string;
  legalFileName: string;
  onKtpUpload: () => void;
  onLegalUpload: () => void;
  onToggleTerms: () => void;
}) {
  return (
    <>
      <ScreenHeader
        subtitle="Unggah dokumen identitas dan legalitas organisasi Anda untuk proses verifikasi admin."
        title="Verifikasi Dokumen"
      />

      <View style={styles.form}>
        <UploadBox
          fileName={ktpFileName}
          helperText="Format: JPG, PNG. Maks 5MB"
          label="Foto KTP Penanggung Jawab"
          onPress={onKtpUpload}
          title="Klik untuk unggah foto"
        />
        <UploadBox
          fileName={legalFileName}
          helperText="Format: PDF. Maks 10MB"
          label="Dokumen Legalitas (PDF)"
          onPress={onLegalUpload}
          title="Klik untuk unggah dokumen"
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={onToggleTerms}
          style={styles.termsRow}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            <Text style={styles.checkboxText}>{acceptedTerms ? 'v' : ''}</Text>
          </View>
          <Text style={styles.termsText}>Saya menyetujui Syarat dan Ketentuan serta Kebijakan Privasi VolumeMate.</Text>
        </Pressable>
      </View>
    </>
  );
}

function ScreenHeader({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function Field({
  autoCapitalize,
  icon,
  inputMode,
  label,
  multiline = false,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: string;
  inputMode?: 'email' | 'numeric' | 'text';
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline]}>
        {icon ? <Text style={styles.inputIcon}>{icon}</Text> : null}
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          inputMode={inputMode}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          secureTextEntry={secureTextEntry}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
        />
      </View>
    </View>
  );
}

function UploadBox({
  fileName,
  helperText,
  label,
  onPress,
  title,
}: {
  fileName: string;
  helperText: string;
  label: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.uploadBox}>
        <View style={styles.uploadIcon}>
          <Text style={styles.uploadIconText}>{fileName ? 'v' : '+'}</Text>
        </View>
        <Text style={styles.uploadTitle}>{fileName || title}</Text>
        <Text style={styles.uploadHelper}>{fileName ? 'Dokumen dummy siap dikirim untuk demo.' : helperText}</Text>
      </Pressable>
    </View>
  );
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
        <Text style={[styles.roleMarkerText, isSelected && styles.roleMarkerTextSelected]}>{marker}</Text>
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
    minHeight: 58,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  topSpacer: {
    width: 44,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  progress: {
    minHeight: 58,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    left: 26,
    right: 26,
    top: 17,
    height: 2,
    backgroundColor: colors.surfaceVariant,
  },
  progressFill: {
    position: 'absolute',
    left: 26,
    top: 17,
    height: 2,
    backgroundColor: colors.primary,
  },
  stepItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 5,
    minWidth: 66,
  },
  stepCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 17,
    borderWidth: 1,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  stepNumberActive: {
    color: colors.onPrimary,
  },
  stepLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  form: {
    gap: 15,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.35,
    lineHeight: 15,
  },
  inputWrap: {
    minHeight: 50,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputWrapMultiline: {
    alignItems: 'flex-start',
    minHeight: 74,
    paddingTop: 10,
  },
  inputIcon: {
    minWidth: 24,
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: 8,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 48,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 60,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    borderWidth: 1,
    gap: 7,
    padding: 12,
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(174, 238, 203, 0.2)',
    borderColor: colors.primary,
  },
  roleMarker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
  },
  roleMarkerSelected: {
    backgroundColor: colors.primary,
  },
  roleMarkerText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '800',
  },
  roleMarkerTextSelected: {
    color: colors.onPrimary,
  },
  roleLabel: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
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
  uploadBox: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 9,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  uploadIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 18,
  },
  uploadIconText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  uploadTitle: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  uploadHelper: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  termsText: {
    flex: 1,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  footerActions: {
    gap: 14,
    marginTop: 24,
    paddingBottom: 18,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    backgroundColor: colors.primary,
    borderRadius: 8,
    boxShadow: '0 6px 14px rgba(27, 67, 50, 0.16)',
  },
  primaryButtonDisabled: {
    opacity: 0.58,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.45,
    lineHeight: 16,
  },
  primaryButtonArrow: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  loginLink: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
});
