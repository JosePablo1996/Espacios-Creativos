import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { signUp } = useAuth();
  const router = useRouter();

  const getResponsiveFontSize = (baseSize: number) => {
    const scale = Math.min(width / 375, height / 812);
    return Math.round(baseSize * scale);
  };

  const getResponsivePadding = (basePadding: number) => {
    const scale = Math.min(width / 375, 1.2);
    return Math.round(basePadding * scale);
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Puedes iniciar sesión ahora.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#141414',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: getResponsivePadding(24),
      paddingTop: height * 0.05,
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(40),
    },
    iconContainer: {
      width: width * 0.20,
      height: width * 0.20,
      borderRadius: width * 0.10,
      backgroundColor: 'rgba(229, 9, 20, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsivePadding(20),
      borderWidth: 3,
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: getResponsiveFontSize(36),
      fontWeight: '900',
      color: '#E50914',
      marginBottom: getResponsivePadding(8),
      textShadowColor: '#E50914',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: getResponsiveFontSize(16),
      color: '#00FF87',
      fontWeight: '600',
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      letterSpacing: 0.5,
    },
    form: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: getResponsivePadding(20),
    },
    label: {
      fontSize: getResponsiveFontSize(14),
      fontWeight: '700',
      color: '#00FFFF',
      marginBottom: getResponsivePadding(10),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderWidth: 2,
      borderColor: '#2A2A2A',
      borderRadius: 12,
      paddingHorizontal: getResponsivePadding(16),
    },
    input: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '500',
      paddingVertical: getResponsivePadding(16),
      paddingLeft: getResponsivePadding(12),
    },
    inputIcon: {
      marginRight: getResponsivePadding(8),
    },
    passwordToggle: {
      padding: getResponsivePadding(8),
    },
    button: {
      backgroundColor: '#E50914',
      borderRadius: 12,
      padding: getResponsivePadding(18),
      alignItems: 'center',
      marginTop: getResponsivePadding(16),
      borderWidth: 2,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '800',
      marginLeft: getResponsivePadding(8),
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: getResponsivePadding(28),
      paddingTop: getResponsivePadding(20),
      borderTopWidth: 1,
      borderTopColor: '#2A2A2A',
    },
    footerText: {
      fontSize: getResponsiveFontSize(14),
      color: '#8C8C8C',
      fontWeight: '500',
    },
    link: {
      fontSize: getResponsiveFontSize(14),
      color: '#00FF87',
      fontWeight: '700',
      marginLeft: getResponsivePadding(4),
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={getResponsiveFontSize(32)} color="#E50914" />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a Espacios Creativos</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputContainer}>
                <User 
                  size={getResponsiveFontSize(20)} 
                  color="#8C8C8C" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Pérez"
                  placeholderTextColor="#8C8C8C"
                  value={fullName}
                  onChangeText={setFullName}
                  autoComplete="name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputContainer}>
                <Mail 
                  size={getResponsiveFontSize(20)} 
                  color="#8C8C8C" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#8C8C8C"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock 
                  size={getResponsiveFontSize(20)} 
                  color="#8C8C8C" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8C8C8C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={getResponsiveFontSize(20)} color="#8C8C8C" />
                  ) : (
                    <Eye size={getResponsiveFontSize(20)} color="#8C8C8C" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock 
                  size={getResponsiveFontSize(20)} 
                  color="#8C8C8C" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8C8C8C"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={getResponsiveFontSize(20)} color="#8C8C8C" />
                  ) : (
                    <Eye size={getResponsiveFontSize(20)} color="#8C8C8C" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <UserPlus size={getResponsiveFontSize(20)} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.link}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}