// app/(tabs)/about.tsx
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Linking, Alert, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { Shield, Mail, Phone, Heart, Crown, DoorOpen, Users, Clock, Zap, Monitor, Wifi, Video, Calendar, Star, CreditCard, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// Importar la imagen correctamente
const userAvatar = require('@/assets/images/user-avatar.jpg');

const { width, height } = Dimensions.get('window');

export default function AboutScreen() {
  const { user, profile, isAdmin } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  // Detectar tipo de dispositivo
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const getResponsiveFontSize = (baseSize: number) => {
    const scale = Math.min(width / 375, height / 812);
    return Math.round(baseSize * scale);
  };

  const getResponsivePadding = (basePadding: number) => {
    const scale = Math.min(width / 375, 1.2);
    return Math.round(basePadding * scale);
  };

  const getResponsiveIconSize = (baseSize: number) => {
    const scale = Math.min(width / 375, 1.1);
    return Math.round(baseSize * scale);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Soporte Técnico',
      '¿Deseas contactar al soporte técnico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Contactar',
          onPress: () => Linking.openURL('mailto:soporte@espacioscreativos.com'),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#141414',
    },
    header: {
      padding: getResponsivePadding(20),
      paddingTop: height * 0.05,
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderBottomWidth: 1,
      borderBottomColor: '#2A2A2A',
      alignItems: 'center',
    },
    title: {
      fontSize: getResponsiveFontSize(28),
      fontWeight: '900',
      color: '#E50914',
      textShadowColor: '#E50914',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      letterSpacing: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: getResponsivePadding(20),
    },

    // Información Personal
    personalInfoCard: {
      backgroundColor: '#1A1A1A',
      borderRadius: 20,
      padding: getResponsivePadding(24),
      borderWidth: 2,
      borderColor: '#00FF87',
      shadowColor: '#00FF87',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      marginBottom: getResponsivePadding(20),
    },
    sectionTitle: {
      fontSize: getResponsiveFontSize(18),
      fontWeight: '800',
      color: '#FFB800',
      marginBottom: getResponsivePadding(16),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: '#FFB800',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(16),
      backgroundColor: '#2A2A2A',
      padding: getResponsivePadding(16),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#404040',
    },
    infoIcon: {
      width: width * 0.10,
      height: width * 0.10,
      maxWidth: 44,
      maxHeight: 44,
      minWidth: 36,
      minHeight: 36,
      borderRadius: width * 0.05,
      backgroundColor: '#1F1F1F',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: getResponsivePadding(16),
      borderWidth: 2,
      borderColor: '#FFB800',
      shadowColor: '#FFB800',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: getResponsiveFontSize(11),
      color: '#FFB800',
      marginBottom: 4,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      textShadowColor: '#FFB800',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 3,
    },
    infoValue: {
      fontSize: getResponsiveFontSize(15),
      fontWeight: '600',
      color: '#00FFFF',
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      flexWrap: 'wrap',
    },

    // Información de la App
    appInfoCard: {
      backgroundColor: '#1A1A1A',
      borderRadius: 20,
      padding: getResponsivePadding(24),
      borderWidth: 2,
      borderColor: '#00FFFF',
      shadowColor: '#00FFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      marginBottom: getResponsivePadding(20),
    },
    description: {
      fontSize: getResponsiveFontSize(14),
      color: '#FFFFFF',
      lineHeight: 22,
      marginBottom: getResponsivePadding(16),
      textAlign: 'left',
    },
    servicesSection: {
      marginTop: getResponsivePadding(20),
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: getResponsivePadding(16),
    },
    serviceItem: {
      width: '48%',
      backgroundColor: '#2A2A2A',
      borderRadius: 16,
      padding: getResponsivePadding(16),
      alignItems: 'center',
      marginBottom: getResponsivePadding(12),
      borderWidth: 1,
      borderColor: '#404040',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    serviceIconContainer: {
      width: width * 0.12,
      height: width * 0.12,
      borderRadius: width * 0.06,
      backgroundColor: '#1A1A1A',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsivePadding(10),
      borderWidth: 2,
      borderColor: '#00FFFF',
    },
    serviceText: {
      fontSize: getResponsiveFontSize(12),
      color: '#FFFFFF',
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 16,
    },

    // Avatar con foto - MÁS GRANDE EN DESKTOP
    avatarContainer: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(30),
    },
    avatar: {
      width: isDesktop ? width * 0.22 : isTablet ? width * 0.25 : width * 0.32,
      height: isDesktop ? width * 0.22 : isTablet ? width * 0.25 : width * 0.32,
      maxWidth: isDesktop ? 200 : 150,
      maxHeight: isDesktop ? 200 : 150,
      minWidth: isDesktop ? 160 : 120,
      minHeight: isDesktop ? 160 : 120,
      borderRadius: isDesktop ? 100 : isTablet ? 80 : width * 0.16,
      backgroundColor: '#2A2A2A',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#4ecdc4',
      shadowColor: '#4ecdc4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: isDesktop ? 100 : isTablet ? 80 : width * 0.16,
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: isDesktop ? 100 : isTablet ? 80 : width * 0.16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
    },

    // Botón de contacto
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E50914',
      borderRadius: 12,
      padding: getResponsivePadding(16),
      borderWidth: 2,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
      marginBottom: getResponsivePadding(20),
    },
    contactButtonText: {
      color: '#FFF',
      fontSize: getResponsiveFontSize(15),
      fontWeight: '800',
      marginLeft: 10,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },

    // Footer
    footer: {
      alignItems: 'center',
      marginTop: getResponsivePadding(10),
      paddingTop: getResponsivePadding(20),
      borderTopWidth: 1,
      borderTopColor: '#2A2A2A',
    },
    watermark: {
      fontSize: getResponsiveFontSize(12),
      color: '#4ecdc4',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: getResponsivePadding(8),
      fontStyle: 'italic',
    },
    version: {
      fontSize: getResponsiveFontSize(11),
      color: '#FFB800',
      fontWeight: '700',
      marginBottom: getResponsivePadding(8),
    },

    // Estilos del Modal
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalContent: {
      backgroundColor: '#1A1A1A',
      borderRadius: 24,
      padding: getResponsivePadding(32),
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 20,
      maxWidth: '90%',
      maxHeight: '90%',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
      backgroundColor: 'rgba(229, 9, 20, 0.8)',
      borderRadius: 20,
      padding: 8,
      borderWidth: 2,
      borderColor: '#FF6B6B',
    },
    modalAvatar: {
      width: width * 0.6,
      height: width * 0.6,
      maxWidth: 400,
      maxHeight: 400,
      borderRadius: width * 0.3,
      borderWidth: 6,
      borderColor: '#4ecdc4',
      marginBottom: getResponsivePadding(24),
      overflow: 'hidden',
      shadowColor: '#4ecdc4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 15,
    },
    modalAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: width * 0.3,
    },
    modalUserName: {
      fontSize: getResponsiveFontSize(isDesktop ? 32 : 24),
      fontWeight: '900',
      color: '#00FF87',
      textAlign: 'center',
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
      marginBottom: getResponsivePadding(16),
    },
    modalUserEmail: {
      fontSize: getResponsiveFontSize(isDesktop ? 18 : 16),
      color: '#00FFFF',
      textAlign: 'center',
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Acerca de</Text>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar con foto - MÁS GRANDE EN DESKTOP */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Image 
              source={userAvatar} 
              style={styles.avatarImage}
              onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
            />
          </TouchableOpacity>
        </View>

        {/* Información Personal */}
        <View style={styles.personalInfoCard}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <DoorOpen size={getResponsiveIconSize(18)} color="#FFB800" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>NOMBRE COMPLETO</Text>
              <Text style={styles.infoValue}>
                {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Mail size={getResponsiveIconSize(18)} color="#00FFFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>CORREO ELECTRÓNICO</Text>
              <Text style={styles.infoValue}>
                {profile?.email || user?.email || 'jmirandaquintanilla@gmail.com'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Shield size={getResponsiveIconSize(18)} color="#00FF87" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ROL</Text>
              <Text style={styles.infoValue}>
                {isAdmin ? 'Administrador' : 'Usuario Premium'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Phone size={getResponsiveIconSize(18)} color="#FF6B9D" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ESTADO DE CUENTA</Text>
              <Text style={styles.infoValue}>
                Verificada ✓ Activa
              </Text>
            </View>
          </View>

          {/* Nueva fila para el carnet */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <CreditCard size={getResponsiveIconSize(18)} color="#FFB800" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>CARNET DE IDENTIDAD</Text>
              <Text style={styles.infoValue}>
                MQ100216
              </Text>
            </View>
          </View>
        </View>

        {/* Información de la Aplicación */}
        <View style={styles.appInfoCard}>
          <Text style={styles.sectionTitle}>¿Qué es Espacios Creativos?</Text>
          <Text style={styles.description}>
            Espacios Creativos es una plataforma innovadora de reserva de salas y espacios 
            diseñada para transformar tus reuniones en experiencias extraordinarias. 
            Ofrecemos acceso exclusivo a espacios premium equipados con tecnología 
            de última generación para inspirar creatividad y productividad.
          </Text>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>
              Nuestros Servicios
            </Text>
            <Text style={styles.description}>
              Descubre todos los servicios que ofrecemos para hacer de tus reuniones 
              experiencias únicas y productivas.
            </Text>

            <View style={styles.servicesGrid}>
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Calendar size={getResponsiveIconSize(20)} color="#00FFFF" />
                </View>
                <Text style={styles.serviceText}>Reserva Rápida de Salas</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Monitor size={getResponsiveIconSize(20)} color="#FFB800" />
                </View>
                <Text style={styles.serviceText}>Tecnología Avanzada</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Wifi size={getResponsiveIconSize(20)} color="#00FF87" />
                </View>
                <Text style={styles.serviceText}>WiFi de Alta Velocidad</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Video size={getResponsiveIconSize(20)} color="#FF6B9D" />
                </View>
                <Text style={styles.serviceText}>Sistemas Audiovisuales</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Zap size={getResponsiveIconSize(20)} color="#FFD700" />
                </View>
                <Text style={styles.serviceText}>Energía y Conectividad</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Users size={getResponsiveIconSize(20)} color="#4ECDC4" />
                </View>
                <Text style={styles.serviceText}>Espacios Colaborativos</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Clock size={getResponsiveIconSize(20)} color="#9B59B6" />
                </View>
                <Text style={styles.serviceText}>Disponibilidad 24/7</Text>
              </View>
              
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Star size={getResponsiveIconSize(20)} color="#E74C3C" />
                </View>
                <Text style={styles.serviceText}>Experiencia Premium</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botón de Contacto */}
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Mail size={getResponsiveIconSize(18)} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Contactar Soporte</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.version}>
            Versión 2.1.0 • Build 347
          </Text>
          <Text style={styles.watermark}>
            Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
          </Text>
        </View>
      </ScrollView>

      {/* Modal para ver la foto en grande */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={getResponsiveIconSize(20)} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.modalAvatar}>
                  <Image 
                    source={userAvatar} 
                    style={styles.modalAvatarImage}
                  />
                </View>
                
                <Text style={styles.modalUserName}>
                  {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                </Text>
                
                <Text style={styles.modalUserEmail}>
                  {profile?.email || user?.email || 'jmirandaquintanilla@gmail.com'}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}