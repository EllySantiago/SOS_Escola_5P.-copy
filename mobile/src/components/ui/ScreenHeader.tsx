import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/components/Logo';
import { colors } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export default function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityLabel="Voltar"
      >
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.logoArea}>
        <Logo size={80} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 14,
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: colors.grayDark },
});
