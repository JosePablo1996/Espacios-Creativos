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
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Sparkles, 
  Shield, 
  CheckCircle, 
  X,
  AlertCircle,
  Check
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const { signUp } = useAuth();
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
      case 'fullName':
        if (!value.trim()) {
          error = 'El nombre completo es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'El nombre solo puede contener letras y espacios';
        }
        break;
        
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
        } else if (value.length < 8) {
          error = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Debe contener al menos una minúscula';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Debe contener al menos una mayúscula';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Debe contener al menos un número';
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          error = 'Debe contener al menos un carácter especial (@$!%*?&)';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
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
    const totalFields = 4;
    
    // Nombre completo
    if (formData.fullName.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.fullName)) {
      progress += 25;
    }
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      progress += 25;
    }
    
    // Contraseña
    if (formData.password.length >= 8 && 
        /(?=.*[a-z])/.test(formData.password) &&
        /(?=.*[A-Z])/.test(formData.password) &&
        /(?=.*\d)/.test(formData.password) &&
        /(?=.*[@$!%*?&])/.test(formData.password)) {
      progress += 25;
    }
    
    // Confirmar contraseña
    if (formData.confirmPassword === formData.password && formData.confirmPassword.length > 0) {
      progress += 25;
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

  const handleRegister = async () => {
    // Validación final antes de enviar
    const finalErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      fullName: validateField('fullName', formData.fullName),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword)
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
      await signUp(formData.email.trim(), formData.password, formData.fullName.trim());
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, color: '#8C8C8C', text: '', level: 0 };
    
    let strength = 0;
    let color = '#E50914';
    let text = 'Débil';
    let level = 1;

    // Longitud
    if (pass.length >= 8) strength += 25;
    
    // Minúsculas
    if (/(?=.*[a-z])/.test(pass)) strength += 25;
    
    // Mayúsculas
    if (/(?=.*[A-Z])/.test(pass)) strength += 25;
    
    // Números y caracteres especiales
    if (/(?=.*\d)/.test(pass)) strength += 12.5;
    if (/(?=.*[@$!%*?&])/.test(pass)) strength += 12.5;

    // Determinar nivel y color
    if (strength >= 75) {
      color = '#00FF87';
      text = 'Fuerte';
      level = 3;
    } else if (strength >= 50) {
      color = '#FFA500';
      text = 'Media';
      level = 2;
    } else {
      color = '#E50914';
      text = 'Débil';
      level = 1;
    }

    return { strength, color, text, level };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
      borderColor: errors.fullName ? '#E50914' : '#333',
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
  });

  const requirements = [
    { key: 'length', text: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { key: 'lowercase', text: 'Una letra minúscula', met: /(?=.*[a-z])/.test(formData.password) },
    { key: 'uppercase', text: 'Una letra mayúscula', met: /(?=.*[A-Z])/.test(formData.password) },
    { key: 'number', text: 'Un número', met: /(?=.*\d)/.test(formData.password) },
    { key: 'special', text: 'Un carácter especial (@$!%*?&)', met: /(?=.*[@$!%*?&])/.test(formData.password) },
    { key: 'match', text: 'Las contraseñas coinciden', met: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
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
              <Text style={styles.label}>Nombre completo</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputContainerError]}>
                <User 
                  size={getResponsiveFontSize(20)} 
                  color={errors.fullName ? '#E50914' : '#8C8C8C'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Pérez"
                  placeholderTextColor="#8C8C8C"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  autoComplete="name"
                  autoCapitalize="words"
                />
              </View>
              {errors.fullName ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AlertCircle size={getResponsiveFontSize(14)} color="#E50914" />
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                </View>
              ) : null}
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
              {errors.password ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AlertCircle size={getResponsiveFontSize(14)} color="#E50914" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : null}
              
              {formData.password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${passwordStrength.strength}%` }]} />
                  </View>
                  <Text style={styles.strengthText}>
                    {passwordStrength.text} {passwordStrength.text && '•'} {formData.password.length} caracteres
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
                <Lock 
                  size={getResponsiveFontSize(20)} 
                  color={errors.confirmPassword ? '#E50914' : '#8C8C8C'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8C8C8C"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
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
              {errors.confirmPassword ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AlertCircle size={getResponsiveFontSize(14)} color="#E50914" />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              ) : null}
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
              style={[styles.button, (loading || validationProgress < 100) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading || validationProgress < 100}
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
              
              <Text style={styles.modalTitle}>¡Cuenta Creada Exitosamente!</Text>
              
              <Text style={styles.modalText}>
                Tu cuenta ha sido creada exitosamente. Bienvenido a Espacios Creativos.{'\n\n'}
                Ahora puedes iniciar sesión y comenzar a explorar todas las funcionalidades.
              </Text>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace('/(auth)/login');
                }}
              >
                <Text style={styles.modalButtonText}>Continuar al Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}