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
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
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
      paddingTop: height * 0.1,
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(48),
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
      fontSize: getResponsiveFontSize(32),
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
      marginBottom: getResponsivePadding(24),
    },
    label: {
      fontSize: getResponsiveFontSize(14),
      fontWeight: '700',
      color: '#00FFFF',
      marginBottom: getResponsivePadding(12),
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
      marginTop: getResponsivePadding(8),
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
      marginTop: getResponsivePadding(32),
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
      color: '#00FFFF',
      fontWeight: '700',
      marginLeft: getResponsivePadding(4),
      textShadowColor: '#00FFFF',
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
              <LogIn size={getResponsiveFontSize(32)} color="#E50914" />
            </View>
            <Text style={styles.title}>Espacios Creativos</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.form}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}