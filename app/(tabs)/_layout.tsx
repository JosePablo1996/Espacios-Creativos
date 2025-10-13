import { Tabs } from 'expo-router';
import { Clapperboard, Calendar, User, Crown, Home, List, Info, Sparkles, Menu, X, Heart, AlertTriangle, Plus } from 'lucide-react-native';
import { StyleSheet, View, Platform, Dimensions, Text, TouchableOpacity, Modal, Image, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

// Importar la imagen del avatar
const userAvatar = require('@/assets/images/user-avatar.jpg');

const { width, height } = Dimensions.get('window');

// Mover menuItems fuera del componente para que esté disponible desde el inicio
const menuItems = [
  { name: 'index', title: 'Inicio', icon: Home, color: '#00FF87' },
  { name: 'bookings', title: 'Mi Lista', icon: List, color: '#00FFFF' },
  { name: 'profile', title: 'Perfil', icon: User, color: '#FFB800' },
  { name: 'about', title: 'Acerca de', icon: Sparkles, color: '#FF6B9D' },
];

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;
  
  // Inicializar optionAnims después de que menuItems esté definido
  const optionAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const isMobile = width < 768;

  // Para tablets y teléfonos, usar menú desplegable
  const useDrawerMenu = !isLargeScreen;

  useEffect(() => {
    if (menuVisible) {
      // Animación de entrada del menú móvil
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animaciones cuando se cierra
      fadeAnim.setValue(0);
      slideAnim.setValue(-width);
    }
  }, [menuVisible]);

  useEffect(() => {
    if (fabMenuVisible) {
      // Animación de apertura del FAB menu
      Animated.parallel([
        Animated.spring(fabScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(fabRotateAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();

      // Animaciones escalonadas para las opciones
      optionAnims.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * 80,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Animación de cierre del FAB menu
      Animated.parallel([
        Animated.spring(fabScaleAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(fabRotateAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();

      // Reset animaciones de opciones
      optionAnims.forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [fabMenuVisible]);

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const toggleFabMenu = () => {
    setFabMenuVisible(!fabMenuVisible);
  };

  const getResponsiveSize = (baseSize: number) => {
    const scale = Math.min(width / 375, 1.2);
    return Math.round(baseSize * scale);
  };

  const getResponsivePadding = (basePadding: number) => {
    const scale = Math.min(width / 375, 1.1);
    return Math.round(basePadding * scale);
  };

  const handleMenuPress = (screenName: string) => {
    closeMenu();
    
    if (screenName === 'index') {
      router.push('/');
    } else if (screenName === 'error-404') {
      // Navegar directamente a una ruta que no existe
      router.push('/not-found-test' as any);
    } else {
      router.push(`/(tabs)/${screenName}` as any);
    }
  };

  const handleFabMenuPress = (screenName: string) => {
    setFabMenuVisible(false);
    
    if (screenName === 'index') {
      router.push('/');
    } else {
      router.push(`/(tabs)/${screenName}` as any);
    }
  };

  const DrawerMenu = () => (
    <Modal
      visible={menuVisible}
      animationType="none"
      transparent={true}
      onRequestClose={closeMenu}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeMenu}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={{ flex: 1 }}
            onPress={closeMenu}
          >
            <Animated.View 
              style={[
                styles.drawerContent,
                {
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              {/* Header del menú con avatar e información del usuario */}
              <View style={styles.menuHeader}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={userAvatar} 
                    style={styles.avatarImage}
                    onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
                  />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {profile?.full_name || 'Jose Pablo Miranda Quintanilla'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {profile?.email || user?.email || 'jmirandaquintanilla@gmail.com'}
                  </Text>
                  {isAdmin && (
                    <View style={styles.adminBadge}>
                      <Crown size={14} color="#FFD700" />
                      <Text style={styles.adminBadgeText}>Administrador</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeMenu}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Items del menú */}
              <View style={styles.menuItems}>
                <Text style={styles.menuSectionTitle}>NAVEGACIÓN</Text>
                
                {/* Items principales */}
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.menuItem}
                      onPress={() => handleMenuPress(item.name)}
                    >
                      <View style={[styles.menuIconContainer, { borderColor: item.color }]}>
                        <IconComponent size={22} color={item.color} />
                      </View>
                      <Text style={[styles.menuItemText, { color: item.color }]}>{item.title}</Text>
                      <View style={[styles.menuItemGlow, { backgroundColor: `${item.color}30` }]} />
                    </TouchableOpacity>
                  );
                })}

                {/* Separador */}
                <View style={styles.menuDivider} />

                {/* Opción de Error 404 - SOLO para móvil/tablet */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('error-404')}
                >
                  <View style={[styles.menuIconContainer, { borderColor: '#E50914' }]}>
                    <AlertTriangle size={22} color="#E50914" />
                  </View>
                  <Text style={[styles.menuItemText, { color: '#E50914' }]}>Error 404</Text>
                  <View style={[styles.menuItemGlow, { backgroundColor: '#E5091430' }]} />
                </TouchableOpacity>
                
                {/* Separador */}
                <View style={styles.menuDivider} />
                
                {/* Información adicional */}
                <View style={styles.menuInfoSection}>
                  <Text style={styles.menuInfoTitle}>INFORMACIÓN</Text>
                  <View style={styles.menuInfoItem}>
                    <Text style={styles.menuInfoLabel}>Versión</Text>
                    <Text style={styles.menuInfoValue}>2.1.0</Text>
                  </View>
                  <View style={styles.menuInfoItem}>
                    <Text style={styles.menuInfoLabel}>Estado</Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>En línea</Text>
                    </View>
                  </View>
                  <View style={styles.menuInfoItem}>
                    <Text style={styles.menuInfoLabel}>Dispositivo</Text>
                    <Text style={[styles.menuInfoValue, { 
                      color: isMobile ? '#FFB800' : isTablet ? '#00FFFF' : '#00FF87' 
                    }]}>
                      {isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Desktop'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer del menú con la leyenda */}
              <View style={styles.menuFooter}>
                <View style={styles.heartContainer}>
                  <Heart size={14} color="#E50914" fill="#E50914" />
                </View>
                <Text style={styles.watermarkText}>
                  Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  // FAB Menu para Desktop
  const FabMenu = () => (
    <>
      {/* Botón FAB Principal */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={toggleFabMenu}
        activeOpacity={0.8}
      >
        <Animated.View 
          style={[
            styles.fabButtonInner,
            {
              transform: [
                { scale: fabScaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })},
                { rotate: fabRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg']
                })}
              ]
            }
          ]}
        >
          <Plus size={28} color="#FFFFFF" />
          <View style={styles.fabButtonGlow} />
        </Animated.View>
      </TouchableOpacity>

      {/* Overlay para cerrar al tocar fuera */}
      {fabMenuVisible && (
        <TouchableOpacity 
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabMenuVisible(false)}
        />
      )}

      {/* Opciones del FAB Menu */}
      {menuItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Animated.View
            key={item.name}
            style={[
              styles.fabOption,
              {
                bottom: 120 + (index * 80),
                transform: [
                  { scale: optionAnims[index] },
                  { translateY: optionAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })}
                ],
                opacity: optionAnims[index]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.fabOptionButton, { backgroundColor: item.color }]}
              onPress={() => handleFabMenuPress(item.name)}
            >
              <IconComponent size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.fabOptionLabel}>
              <Text style={styles.fabOptionText}>{item.title}</Text>
              <View style={[styles.fabOptionLabelArrow, { borderTopColor: item.color }]} />
            </View>
          </Animated.View>
        );
      })}
    </>
  );

  // Si es una pantalla grande, usar FAB menu en lugar de tabs
  if (!useDrawerMenu) {
    return (
      <>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Ocultar la tab bar normal
          }}
        >
          {menuItems.map((item) => (
            <Tabs.Screen key={item.name} name={item.name} />
          ))}
          
          {/* Tab de Error 404 - COMPLETAMENTE OCULTA en desktop */}
          <Tabs.Screen
            name="not-found-test"
            options={{
              href: null,
              title: 'Error 404',
            }}
          />
        </Tabs>

        {/* FAB Menu para Desktop */}
        <FabMenu />
      </>
    );
  }

  // Para tablets y teléfonos, usar botón de menú desplegable (sin cambios)
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        {menuItems.map((item) => (
          <Tabs.Screen key={item.name} name={item.name} />
        ))}
        <Tabs.Screen
          name="not-found-test"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Botón flotante del menú */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <View style={styles.menuButtonInner}>
          <Menu size={24} color="#FFFFFF" />
          <View style={styles.menuButtonGlow} />
        </View>
      </TouchableOpacity>

      {/* Menú desplegable con opción Error 404 */}
      <DrawerMenu />
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos existentes para móvil/tablet...
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    paddingTop: 10,
    paddingHorizontal: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.98)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 2,
    borderTopColor: 'rgba(229, 9, 20, 0.5)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(229, 9, 20, 0.3)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(229, 9, 20, 0.3)',
    shadowColor: '#E50914',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Nuevos estilos para FAB Menu en Desktop
  fabButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    zIndex: 1000,
  },
  fabButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  fabButtonGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 38,
    backgroundColor: '#E50914',
    opacity: 0.4,
    zIndex: -1,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  fabOption: {
    position: 'absolute',
    right: 50,
    zIndex: 1001,
    alignItems: 'center',
    flexDirection: 'row-reverse',
  },
  fabOptionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabOptionLabel: {
    marginRight: 15,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fabOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  fabOptionLabelArrow: {
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopWidth: 6,
    borderTopColor: 'rgba(20, 20, 20, 0.95)',
    transform: [{ translateY: -3 }],
  },

  // Estilos existentes para el menú móvil/tablet...
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContent: {
    width: width * 0.85,
    maxWidth: 400,
    height: '100%',
    backgroundColor: '#1A1A1A',
    borderRightWidth: 3,
    borderRightColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
  },
  menuHeader: {
    backgroundColor: '#141414',
    padding: 25,
    paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarImage: {
    width: 65,
    height: 65,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#4ecdc4',
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#00FF87',
    marginBottom: 8,
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  menuItems: {
    flex: 1,
    paddingVertical: 20,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    marginBottom: 15,
    marginHorizontal: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    position: 'relative',
  },
  menuIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuItemGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    zIndex: -1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 20,
    marginHorizontal: 25,
  },
  menuInfoSection: {
    paddingHorizontal: 25,
  },
  menuInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB800',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  menuInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  menuInfoLabel: {
    fontSize: 14,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  menuInfoValue: {
    fontSize: 14,
    color: '#00FF87',
    fontWeight: '700',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF87',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF87',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#00FF87',
    fontWeight: '700',
  },
  menuFooter: {
    padding: 25,
    paddingBottom: 30,
    backgroundColor: '#141414',
    borderTopWidth: 2,
    borderTopColor: '#2A2A2A',
    alignItems: 'center',
  },
  heartContainer: {
    marginBottom: 8,
  },
  watermarkText: {
    fontSize: 12,
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#4ecdc4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontStyle: 'italic',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  menuButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    position: 'relative',
  },
  menuButtonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    backgroundColor: '#E50914',
    opacity: 0.3,
    zIndex: -1,
  },
});