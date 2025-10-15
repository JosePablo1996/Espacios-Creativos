import { useState, useEffect, useRef } from 'react';
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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, User, Check, AlertCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const { signIn } = useAuth();
  const router = useRouter();

  // Referencias para animaciones
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Validaciones
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Ingresa un correo electrónico válido';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'La contraseña es requerida';
        } else if (value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres';
        }
        break;
    }
    
    return error;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación en tiempo real después de un pequeño delay
    setTimeout(() => {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }, 500);
  };

  // Calcular progreso de validación
  const calculateValidationProgress = () => {
    let progress = 0;
    const totalFields = 2;
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      progress += 50;
    }
    
    // Contraseña
    if (formData.password.length >= 6) {
      progress += 50;
    }
    
    return progress;
  };

  // Animar progreso
  useEffect(() => {
    const progress = calculateValidationProgress();
    setValidationProgress(progress);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [formData]);

  const handleLogin = async () => {
    // Validación final antes de enviar
    const finalErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(finalErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(finalErrors).some(error => error !== '');
    if (hasErrors) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    // Verificar progreso de validación
    if (validationProgress < 100) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email.trim(), formData.password);
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    if (validationProgress < 25) return '#E50914';
    if (validationProgress < 50) return '#FFA500';
    if (validationProgress < 75) return '#FFD700';
    return '#00FF87';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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
    validationProgress: {
      marginBottom: getResponsivePadding(20),
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: getResponsivePadding(8),
    },
    progressText: {
      fontSize: getResponsiveFontSize(12),
      fontWeight: '600',
      color: '#8C8C8C',
    },
    progressBar: {
      height: getResponsiveValue(6),
      backgroundColor: '#333',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: getProgressColor(),
      borderRadius: 3,
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
      borderColor: errors.email ? '#E50914' : '#333',
      borderRadius: 14,
      paddingHorizontal: getResponsivePadding(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    inputContainerError: {
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
    errorText: {
      fontSize: getResponsiveFontSize(12),
      color: '#E50914',
      fontWeight: '600',
      marginTop: getResponsivePadding(6),
      marginLeft: getResponsivePadding(4),
    },
    button: {
      backgroundColor: '#E50914',
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
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#1A1A1A',
      borderRadius: 20,
      padding: getResponsivePadding(28),
      margin: getResponsivePadding(20),
      borderWidth: 2,
      borderColor: '#00FF87',
      shadowColor: '#00FF87',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 16,
      alignItems: 'center',
    },
    modalIcon: {
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      backgroundColor: 'rgba(0, 255, 135, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsivePadding(20),
      borderWidth: 3,
      borderColor: '#00FF87',
    },
    modalTitle: {
      fontSize: getResponsiveFontSize(24),
      fontWeight: '900',
      color: '#00FF87',
      textAlign: 'center',
      marginBottom: getResponsivePadding(12),
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    modalText: {
      fontSize: getResponsiveFontSize(16),
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: getResponsivePadding(24),
      lineHeight: getResponsiveFontSize(22),
    },
    modalButton: {
      backgroundColor: '#00FF87',
      borderRadius: 14,
      padding: getResponsivePadding(16),
      paddingHorizontal: getResponsivePadding(32),
      borderWidth: 2,
      borderColor: '#FFFFFF',
      shadowColor: '#00FF87',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    modalButtonText: {
      color: '#141414',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '800',
      textAlign: 'center',
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
  });

  const requirements = [
    { key: 'email', text: 'Email válido', met: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) },
    { key: 'password', text: 'Mínimo 6 caracteres', met: formData.password.length >= 6 },
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
            
            {/* Barra de progreso de validación */}
            <View style={styles.validationProgress}>
              <View style={styles.progressLabel}>
                <Text style={styles.progressText}>Completado del formulario</Text>
                <Text style={styles.progressText}>{validationProgress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { width: progressWidth }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
                <Mail 
                  size={getResponsiveFontSize(20)} 
                  color={errors.email ? '#E50914' : '#8C8C8C'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#8C8C8C"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AlertCircle size={getResponsiveFontSize(14)} color="#E50914" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                <Lock 
                  size={getResponsiveFontSize(20)} 
                  color={errors.password ? '#E50914' : '#8C8C8C'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8C8C8C"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
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
              {errors.password ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AlertCircle size={getResponsiveFontSize(14)} color="#E50914" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.requirements}>
              {requirements.map((req) => (
                <View key={req.key} style={styles.requirement}>
                  <Check 
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
              style={[styles.button, (loading || validationProgress < 100) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading || validationProgress < 100}
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

      {/* Modal de éxito */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Check size={getResponsiveFontSize(40)} color="#00FF87" />
              </View>
              
              <Text style={styles.modalTitle}>¡Sesión Iniciada Exitosamente!</Text>
              
              <Text style={styles.modalText}>
                Bienvenido de nuevo a Espacios Creativos.{'\n\n'}
                Tu sesión ha sido iniciada correctamente. Ahora puedes acceder a todas las funcionalidades de la plataforma.
              </Text>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.modalButtonText}>Continuar al Sistema</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}