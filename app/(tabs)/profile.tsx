import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Crown, Star, Calendar, Phone, CreditCard, Settings, X } from 'lucide-react-native';
import { useState } from 'react';

// Importar la imagen correctamente
const userAvatar = require('@/assets/images/user-avatar.jpg');

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export default function ProfileScreen() {
  const { user, profile, isAdmin } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

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

  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#141414',
    },
    header: {
      padding: getResponsivePadding(isDesktop ? 32 : 16),
      paddingTop: isDesktop ? height * 0.04 : height * 0.05,
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderBottomWidth: 1,
      borderBottomColor: '#2A2A2A',
      alignItems: 'center',
    },
    title: {
      fontSize: getResponsiveFontSize(isDesktop ? 36 : 28),
      fontWeight: '900',
      color: '#E50914',
      textShadowColor: '#E50914',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
      letterSpacing: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: getResponsivePadding(isDesktop ? 32 : 16),
      maxWidth: isDesktop ? 1200 : '100%',
      alignSelf: isDesktop ? 'center' : 'stretch',
      width: isDesktop ? '90%' : '100%',
    },
    content: {
      flex: 1,
    },
    profileContainer: {
      backgroundColor: '#1A1A1A',
      borderRadius: isDesktop ? 28 : 22,
      padding: getResponsivePadding(isDesktop ? 40 : 28),
      borderWidth: 3,
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
      marginBottom: getResponsivePadding(20),
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(28),
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(20),
      width: '100%',
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
      borderWidth: 4,
      borderColor: '#4ecdc4',
      shadowColor: '#4ecdc4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 12,
      overflow: 'hidden',
      marginBottom: getResponsivePadding(16),
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
    userInfo: {
      alignItems: 'center',
      width: '100%',
    },
    userName: {
      fontSize: getResponsiveFontSize(isDesktop ? 28 : 22),
      fontWeight: '800',
      color: '#00FF87',
      marginBottom: getResponsivePadding(12),
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E50914',
      paddingHorizontal: getResponsivePadding(16),
      paddingVertical: getResponsivePadding(8),
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    adminBadgeText: {
      color: '#FFF',
      fontSize: getResponsiveFontSize(12),
      fontWeight: '700',
      marginLeft: 6,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    userStats: {
      flexDirection: isTablet ? 'row' : 'row',
      justifyContent: 'space-around',
      backgroundColor: '#2A2A2A',
      borderRadius: 16,
      padding: getResponsivePadding(isDesktop ? 24 : 20),
      borderWidth: 2,
      borderColor: '#404040',
      marginBottom: getResponsivePadding(20),
      gap: isTablet ? 12 : 0,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statIcon: {
      marginBottom: getResponsivePadding(8),
    },
    statText: {
      color: '#00FFFF',
      fontSize: getResponsiveFontSize(isDesktop ? 16 : 13),
      fontWeight: '700',
      textAlign: 'center',
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    infoGrid: {
      marginTop: getResponsivePadding(20),
    },
    sectionTitle: {
      fontSize: getResponsiveFontSize(isDesktop ? 20 : 17),
      fontWeight: '800',
      color: '#FFB800',
      marginBottom: getResponsivePadding(20),
      textTransform: 'uppercase',
      letterSpacing: 1,
      textShadowColor: '#FFB800',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
    },
    infoRows: {
      gap: getResponsivePadding(16),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      padding: getResponsivePadding(isDesktop ? 24 : 18),
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#404040',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    infoIcon: {
      width: isDesktop ? 52 : isTablet ? 48 : width * 0.12,
      height: isDesktop ? 52 : isTablet ? 48 : width * 0.12,
      maxWidth: 52,
      maxHeight: 52,
      minWidth: 40,
      minHeight: 40,
      borderRadius: isDesktop ? 26 : isTablet ? 24 : width * 0.06,
      backgroundColor: '#1F1F1F',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: getResponsivePadding(20),
      borderWidth: 2,
      borderColor: '#FFB800',
      shadowColor: '#FFB800',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: getResponsiveFontSize(isDesktop ? 13 : 11),
      color: '#FFB800',
      marginBottom: 6,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: '#FFB800',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    infoValue: {
      fontSize: getResponsiveFontSize(isDesktop ? 18 : 16),
      fontWeight: '600',
      color: '#00FFFF',
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      flexWrap: 'wrap',
    },
    buttonsContainer: {
      marginTop: getResponsivePadding(28),
      gap: getResponsivePadding(16),
      flexDirection: isTablet ? 'row' : 'column',
    },
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E50914',
      borderRadius: 16,
      padding: getResponsivePadding(isDesktop ? 22 : 18),
      borderWidth: 3,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
      flex: isTablet ? 1 : undefined,
    },
    adminButtonText: {
      color: '#FFF',
      fontSize: getResponsiveFontSize(isDesktop ? 18 : 16),
      fontWeight: '800',
      marginLeft: 12,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    footerSection: {
      padding: getResponsivePadding(isDesktop ? 24 : 18),
      backgroundColor: '#1A1A1A',
      alignItems: 'center',
      borderTopWidth: 2,
      borderTopColor: '#2A2A2A',
      marginTop: getResponsivePadding(24),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#333',
    },
    footerText: {
      fontSize: getResponsiveFontSize(isDesktop ? 16 : 13),
      color: '#00FF87',
      textAlign: 'center',
      fontWeight: '600',
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      fontStyle: 'italic',
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
    <View style={responsiveStyles.container}>
      <View style={responsiveStyles.header}>
        <Text style={responsiveStyles.title}>Mi Perfil</Text>
      </View>

      <ScrollView 
        style={responsiveStyles.content}
        contentContainerStyle={responsiveStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor único con toda la información */}
        <View style={responsiveStyles.profileContainer}>
          
          {/* Header del perfil - Avatar centrado con nombre debajo */}
          <View style={responsiveStyles.profileHeader}>
            <View style={responsiveStyles.avatarContainer}>
              <TouchableOpacity 
                style={responsiveStyles.avatar}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Image 
                  source={userAvatar} 
                  style={responsiveStyles.avatarImage}
                  onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
                />
              </TouchableOpacity>
              <View style={responsiveStyles.userInfo}>
                <Text style={responsiveStyles.userName}>
                  {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                </Text>
                {isAdmin && (
                  <View style={responsiveStyles.adminBadge}>
                    <Crown size={getResponsiveIconSize(16)} color="#FFD700" />
                    <Text style={responsiveStyles.adminBadgeText}>Administrador</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Estadísticas del usuario */}
          <View style={responsiveStyles.userStats}>
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <Star size={getResponsiveIconSize(isDesktop ? 28 : 22)} color="#FFB800" />
              </View>
              <Text style={responsiveStyles.statText}>Premium</Text>
            </View>
            
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <Calendar size={getResponsiveIconSize(isDesktop ? 28 : 22)} color="#00FFFF" />
              </View>
              <Text style={responsiveStyles.statText}>Activo</Text>
            </View>
            
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <CreditCard size={getResponsiveIconSize(isDesktop ? 28 : 22)} color="#00FF87" />
              </View>
              <Text style={responsiveStyles.statText}>Verificado</Text>
            </View>
          </View>

          {/* Información personal mejorada */}
          <View style={responsiveStyles.infoGrid}>
            <Text style={responsiveStyles.sectionTitle}>Información Personal</Text>
            
            <View style={responsiveStyles.infoRows}>
              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <User size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#FFB800" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>NOMBRE COMPLETO</Text>
                  <Text style={responsiveStyles.infoValue}>
                    {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                  </Text>
                </View>
              </View>

              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <Mail size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#00FFFF" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>CORREO ELECTRÓNICO</Text>
                  <Text style={responsiveStyles.infoValue}>
                    {profile?.email || user?.email || 'jmirandaquintanilla@gmail.com'}
                  </Text>
                </View>
              </View>

              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <CreditCard size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#FF6B9D" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>CARNET DE IDENTIDAD</Text>
                  <Text style={responsiveStyles.infoValue}>
                    MQ100216
                  </Text>
                </View>
              </View>

              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <Shield size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#00FF87" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>ROL</Text>
                  <Text style={responsiveStyles.infoValue}>
                    {isAdmin ? 'Administrador' : 'Usuario Premium'}
                  </Text>
                </View>
              </View>

              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <Phone size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#FFB800" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>ESTADO DE CUENTA</Text>
                  <Text style={responsiveStyles.infoValue}>
                    Verificada y Activa
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botones de acción - Solo botón de administrador */}
          <View style={responsiveStyles.buttonsContainer}>
            {isAdmin && (
              <TouchableOpacity
                style={responsiveStyles.adminButton}
                onPress={() => router.push('/admin/bookings')}
              >
                <Crown size={getResponsiveIconSize(isDesktop ? 22 : 18)} color="#FFD700" />
                <Text style={responsiveStyles.adminButtonText}>Panel de Administrador</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer con la leyenda */}
          <View style={responsiveStyles.footerSection}>
            <Text style={responsiveStyles.footerText}>
              Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
            </Text>
          </View>
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
          <View style={responsiveStyles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={responsiveStyles.modalContent}>
                <TouchableOpacity 
                  style={responsiveStyles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={getResponsiveIconSize(20)} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={responsiveStyles.modalAvatar}>
                  <Image 
                    source={userAvatar} 
                    style={responsiveStyles.modalAvatarImage}
                  />
                </View>
                
                <Text style={responsiveStyles.modalUserName}>
                  {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                </Text>
                
                <Text style={responsiveStyles.modalUserEmail}>
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