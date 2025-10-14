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
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Sparkles, Shield, CheckCircle } from 'lucide-react-native';

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
  const [scaleAnim] = useState(new Animated.Value(0.8));
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

  const getResponsiveValue = (baseValue: number) => {
    const scale = Math.min(width / 375, height / 812);
    return Math.round(baseValue * scale);
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
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada exitosamente. Bienvenido a Espacios Creativos.',
        [{ text: 'Continuar', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, color: '#8C8C8C', text: '' };
    if (pass.length < 6) return { strength: 33, color: '#E50914', text: 'Débil' };
    if (pass.length < 8) return { strength: 66, color: '#FFA500', text: 'Media' };
    return { strength: 100, color: '#00FF87', text: 'Fuerte' };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
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
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#141414',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: getResponsivePadding(24),
      paddingTop: height * 0.06,
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(36),
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(20),
    },
    iconContainer: {
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      backgroundColor: 'rgba(229, 9, 20, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: getResponsivePadding(12),
      borderWidth: 3,
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
    },
    sparkleIcon: {
      position: 'absolute',
      top: -getResponsiveValue(10),
      right: -getResponsiveValue(10),
    },
    titleContainer: {
      alignItems: 'flex-start',
    },
    title: {
      fontSize: getResponsiveFontSize(36),
      fontWeight: '900',
      color: '#E50914',
      textShadowColor: '#E50914',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
      letterSpacing: 1.2,
      marginBottom: getResponsivePadding(4),
    },
    subtitle: {
      fontSize: getResponsiveFontSize(16),
      color: '#00FF87',
      fontWeight: '600',
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      letterSpacing: 0.8,
    },
    form: {
      width: '100%',
      backgroundColor: 'rgba(26, 26, 26, 0.8)',
      borderRadius: 20,
      padding: getResponsivePadding(28),
      borderWidth: 1,
      borderColor: '#333',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    formTitle: {
      fontSize: getResponsiveFontSize(20),
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: getResponsivePadding(24),
      textAlign: 'center',
      textShadowColor: '#FFFFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    inputGroup: {
      marginBottom: getResponsivePadding(18),
    },
    label: {
      fontSize: getResponsiveFontSize(14),
      fontWeight: '700',
      color: '#00FFFF',
      marginBottom: getResponsivePadding(8),
      textTransform: 'uppercase',
      letterSpacing: 1,
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderWidth: 2,
      borderColor: '#333',
      borderRadius: 14,
      paddingHorizontal: getResponsivePadding(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    inputContainerFocused: {
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOpacity: 0.3,
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
      marginRight: getResponsivePadding(10),
    },
    passwordToggle: {
      padding: getResponsivePadding(8),
      marginLeft: getResponsivePadding(4),
    },
    passwordStrength: {
      marginTop: getResponsivePadding(8),
    },
    strengthBar: {
      height: getResponsiveValue(4),
      backgroundColor: '#333',
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: getResponsivePadding(4),
    },
    strengthFill: {
      height: '100%',
      backgroundColor: passwordStrength.color,
      borderRadius: 2,
    },
    strengthText: {
      fontSize: getResponsiveFontSize(12),
      color: passwordStrength.color,
      fontWeight: '600',
    },
    requirements: {
      marginTop: getResponsivePadding(16),
    },
    requirement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(6),
    },
    requirementText: {
      fontSize: getResponsiveFontSize(12),
      color: '#8C8C8C',
      marginLeft: getResponsivePadding(6),
    },
    requirementMet: {
      color: '#00FF87',
    },
    button: {
      backgroundColor: '#E50914',
      borderRadius: 14,
      padding: getResponsivePadding(18),
      alignItems: 'center',
      marginTop: getResponsivePadding(20),
      borderWidth: 2,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '800',
      marginLeft: getResponsivePadding(8),
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      letterSpacing: 0.5,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: getResponsivePadding(24),
      paddingTop: getResponsivePadding(20),
      borderTopWidth: 1,
      borderTopColor: '#333',
    },
    footerText: {
      fontSize: getResponsiveFontSize(14),
      color: '#8C8C8C',
      fontWeight: '500',
    },
    link: {
      fontSize: getResponsiveFontSize(14),
      color: '#00FFFF',
      fontWeight: '700',
      marginLeft: getResponsivePadding(6),
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      textDecorationLine: 'underline',
    },
    benefits: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: getResponsivePadding(28),
      paddingHorizontal: getResponsivePadding(20),
    },
    benefit: {
      alignItems: 'center',
      flex: 1,
      padding: getResponsivePadding(12),
    },
    benefitIcon: {
      width: getResponsiveValue(48),
      height: getResponsiveValue(48),
      borderRadius: getResponsiveValue(24),
      backgroundColor: 'rgba(0, 255, 135, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsivePadding(8),
      borderWidth: 1,
      borderColor: '#00FF87',
    },
    benefitText: {
      fontSize: getResponsiveFontSize(12),
      color: '#8C8C8C',
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  const requirements = [
    { key: 'length', text: 'Mínimo 6 caracteres', met: password.length >= 6 },
    { key: 'match', text: 'Las contraseñas coinciden', met: password === confirmPassword && confirmPassword.length > 0 },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.backgroundGradient} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.iconContainer}>
                <UserPlus size={getResponsiveFontSize(32)} color="#E50914" />
                <View style={styles.sparkleIcon}>
                  <Sparkles size={getResponsiveFontSize(16)} color="#00FF87" />
                </View>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Crear</Text>
                <Text style={styles.title}>Cuenta</Text>
                <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Registro</Text>
            
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
                  autoCapitalize="words"
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
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${passwordStrength.strength}%` }]} />
                  </View>
                  <Text style={styles.strengthText}>
                    {passwordStrength.text} {passwordStrength.text && '•'} {password.length} caracteres
                  </Text>
                </View>
              )}
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

            <View style={styles.requirements}>
              {requirements.map((req) => (
                <View key={req.key} style={styles.requirement}>
                  <CheckCircle 
                    size={getResponsiveFontSize(14)} 
                    color={req.met ? '#00FF87' : '#8C8C8C'} 
                  />
                  <Text style={[
                    styles.requirementText,
                    req.met && styles.requirementMet
                  ]}>
                    {req.text}
                  </Text>
                </View>
              ))}
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

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <User size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.benefitText}>Perfil Personal</Text>
            </View>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Shield size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.benefitText}>Seguridad</Text>
            </View>
            <View style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Sparkles size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.benefitText}>Innovación</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}