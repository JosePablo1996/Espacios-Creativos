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
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, User } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const { signIn } = useAuth();
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

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
      paddingTop: height * 0.08,
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(40),
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(24),
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
      marginBottom: getResponsivePadding(20),
    },
    label: {
      fontSize: getResponsiveFontSize(14),
      fontWeight: '700',
      color: '#00FFFF',
      marginBottom: getResponsivePadding(10),
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
    button: {
      backgroundColor: 'linear-gradient(135deg, #E50914 0%, #FF6B6B 100%)',
      borderRadius: 14,
      padding: getResponsivePadding(18),
      alignItems: 'center',
      marginTop: getResponsivePadding(12),
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
    buttonGradient: {
      borderRadius: 14,
      overflow: 'hidden',
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
      marginTop: getResponsivePadding(28),
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
    features: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: getResponsivePadding(32),
      paddingHorizontal: getResponsivePadding(20),
    },
    feature: {
      alignItems: 'center',
      flex: 1,
      padding: getResponsivePadding(12),
    },
    featureIcon: {
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
    featureText: {
      fontSize: getResponsiveFontSize(12),
      color: '#8C8C8C',
      fontWeight: '600',
      textAlign: 'center',
    },
  });

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
                <LogIn size={getResponsiveFontSize(32)} color="#E50914" />
                <View style={styles.sparkleIcon}>
                  <Sparkles size={getResponsiveFontSize(16)} color="#00FF87" />
                </View>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Espacios</Text>
                <Text style={styles.title}>Creativos</Text>
                <Text style={styles.subtitle}>Tu portal de innovación</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
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
                  autoComplete="password"
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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LogIn size={getResponsiveFontSize(20)} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.link}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <User size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.featureText}>Perfil Personalizado</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Sparkles size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.featureText}>Innovación</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Lock size={getResponsiveFontSize(20)} color="#00FF87" />
              </View>
              <Text style={styles.featureText}>Seguro</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}