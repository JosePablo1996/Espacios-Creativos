import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, LogOut, Crown, Star, Calendar, Phone, CreditCard } from 'lucide-react-native';

// Importar la imagen correctamente
const userAvatar = require('@/assets/images/user-avatar.jpg');

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

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
      padding: getResponsivePadding(16),
      paddingTop: height * 0.05,
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderBottomWidth: 1,
      borderBottomColor: '#2A2A2A',
      alignItems: 'center',
    },
    title: {
      fontSize: getResponsiveFontSize(26),
      fontWeight: '900',
      color: '#E50914',
      textShadowColor: '#E50914',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      letterSpacing: 0.8,
    },
    scrollContent: {
      flexGrow: 1,
      padding: getResponsivePadding(16),
    },
    content: {
      flex: 1,
    },
    profileContainer: {
      backgroundColor: '#1A1A1A',
      borderRadius: 20,
      padding: getResponsivePadding(24),
      borderWidth: 2,
      borderColor: '#E50914',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
      marginBottom: getResponsivePadding(16),
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(24),
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: getResponsivePadding(16),
    },
    avatar: {
      width: width * 0.25,
      height: width * 0.25,
      maxWidth: 120,
      maxHeight: 120,
      minWidth: 100,
      minHeight: 100,
      borderRadius: width * 0.125,
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
      marginBottom: getResponsivePadding(12),
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: width * 0.125,
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: width * 0.125,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
    },
    userInfo: {
      alignItems: 'center',
    },
    userName: {
      fontSize: getResponsiveFontSize(20),
      fontWeight: '800',
      color: '#00FF87',
      marginBottom: getResponsivePadding(8),
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E50914',
      paddingHorizontal: getResponsivePadding(12),
      paddingVertical: getResponsivePadding(6),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FF6B6B',
      shadowColor: '#E50914',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    adminBadgeText: {
      color: '#FFF',
      fontSize: getResponsiveFontSize(11),
      fontWeight: '700',
      marginLeft: 5,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    userStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#2A2A2A',
      borderRadius: 12,
      padding: getResponsivePadding(16),
      borderWidth: 1,
      borderColor: '#404040',
      marginBottom: getResponsivePadding(16),
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statIcon: {
      marginBottom: getResponsivePadding(6),
    },
    statText: {
      color: '#00FFFF',
      fontSize: getResponsiveFontSize(12),
      fontWeight: '600',
      textAlign: 'center',
    },
    infoGrid: {
      marginTop: getResponsivePadding(16),
    },
    sectionTitle: {
      fontSize: getResponsiveFontSize(16),
      fontWeight: '800',
      color: '#FFB800',
      marginBottom: getResponsivePadding(16),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: '#FFB800',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
    },
    infoRows: {
      gap: getResponsivePadding(12),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      padding: getResponsivePadding(16),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#404040',
    },
    infoIcon: {
      width: width * 0.1,
      height: width * 0.1,
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
    buttonsContainer: {
      marginTop: getResponsivePadding(24),
      gap: getResponsivePadding(12),
    },
    adminButton: {
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
    },
    adminButtonText: {
      color: '#FFF',
      fontSize: getResponsiveFontSize(15),
      fontWeight: '800',
      marginLeft: 10,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#FF3B30',
      borderRadius: 12,
      padding: getResponsivePadding(16),
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    signOutButtonText: {
      color: '#FF3B30',
      fontSize: getResponsiveFontSize(15),
      fontWeight: '800',
      marginLeft: 10,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    footerSection: {
      padding: getResponsivePadding(16),
      backgroundColor: '#1A1A1A',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#2A2A2A',
      marginTop: getResponsivePadding(10),
    },
    footerText: {
      fontSize: getResponsiveFontSize(12),
      color: '#00FF87',
      textAlign: 'center',
      fontWeight: '600',
      textShadowColor: '#00FF87',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={responsiveStyles.container}>
      <View style={responsiveStyles.header}>
        <Text style={responsiveStyles.title}>Perfil</Text>
      </View>

      <ScrollView 
        style={responsiveStyles.content}
        contentContainerStyle={responsiveStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor único con toda la información */}
        <View style={responsiveStyles.profileContainer}>
          
          {/* Header del perfil - Avatar con nombre debajo */}
          <View style={responsiveStyles.profileHeader}>
            <View style={responsiveStyles.avatarContainer}>
              <View style={responsiveStyles.avatar}>
                <Image 
                  source={userAvatar} 
                  style={responsiveStyles.avatarImage}
                  onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
                />
              </View>
              <View style={responsiveStyles.userInfo}>
                <Text style={responsiveStyles.userName}>
                  {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                </Text>
                {isAdmin && (
                  <View style={responsiveStyles.adminBadge}>
                    <Crown size={getResponsiveIconSize(14)} color="#FFD700" />
                    <Text style={responsiveStyles.adminBadgeText}>Administrador</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Estadísticas del usuario - SIN CONFIGURAR */}
          <View style={responsiveStyles.userStats}>
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <Star size={getResponsiveIconSize(20)} color="#FFB800" />
              </View>
              <Text style={responsiveStyles.statText}>Premium</Text>
            </View>
            
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <Calendar size={getResponsiveIconSize(20)} color="#00FFFF" />
              </View>
              <Text style={responsiveStyles.statText}>Activo</Text>
            </View>
            
            <View style={responsiveStyles.statItem}>
              <View style={responsiveStyles.statIcon}>
                <CreditCard size={getResponsiveIconSize(20)} color="#00FF87" />
              </View>
              <Text style={responsiveStyles.statText}>Verificado</Text>
            </View>
          </View>

          {/* Información detallada */}
          <View style={responsiveStyles.infoGrid}>
            <Text style={responsiveStyles.sectionTitle}>Información Personal</Text>
            
            <View style={responsiveStyles.infoRows}>
              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <Mail size={getResponsiveIconSize(18)} color="#FFB800" />
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
                  <Shield size={getResponsiveIconSize(18)} color="#00FFFF" />
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
                  <Phone size={getResponsiveIconSize(18)} color="#00FF87" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>ESTADO DE CUENTA</Text>
                  <Text style={responsiveStyles.infoValue}>
                    Verificada y Activa
                  </Text>
                </View>
              </View>

              {/* Nueva fila para el carnet */}
              <View style={responsiveStyles.infoRow}>
                <View style={responsiveStyles.infoIcon}>
                  <CreditCard size={getResponsiveIconSize(18)} color="#FF6B9D" />
                </View>
                <View style={responsiveStyles.infoContent}>
                  <Text style={responsiveStyles.infoLabel}>CARNET DE IDENTIDAD</Text>
                  <Text style={responsiveStyles.infoValue}>
                    MQ100216
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={responsiveStyles.buttonsContainer}>
            {isAdmin && (
              <TouchableOpacity
                style={responsiveStyles.adminButton}
                onPress={() => router.push('/admin/bookings')}
              >
                <Crown size={getResponsiveIconSize(18)} color="#FFD700" />
                <Text style={responsiveStyles.adminButtonText}>Panel de Administrador</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={responsiveStyles.signOutButton} onPress={handleSignOut}>
              <LogOut size={getResponsiveIconSize(18)} color="#FF3B30" />
              <Text style={responsiveStyles.signOutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Footer con la leyenda */}
          <View style={responsiveStyles.footerSection}>
            <Text style={responsiveStyles.footerText}>
              Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}