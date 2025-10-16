import { Tabs } from 'expo-router';
import { Clapperboard, Calendar, User, Crown, Home, List, Info, Sparkles, Menu, X, Heart, AlertTriangle, Plus, Mail, User as UserIcon, LogOut, Smartphone, Monitor, Tablet } from 'lucide-react-native';
import { StyleSheet, View, Platform, Dimensions, Text, TouchableOpacity, Modal, Image, Animated, ScrollView } from 'react-native';
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

// CORRECCIÓN: Definir las rutas válidas como constantes
const validRoutes = {
  index: '/',
  bookings: '/(tabs)/bookings',
  profile: '/(tabs)/profile',
  about: '/(tabs)/about',
  'error-404': '/not-found-test'
} as const;

type ValidRouteKey = keyof typeof validRoutes;

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const router = useRouter();
  const { user, profile, isAdmin, signOut } = useAuth();

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;
  const infoModalAnim = useRef(new Animated.Value(0)).current;
  const avatarModalAnim = useRef(new Animated.Value(0)).current;
  const logoutConfirmAnim = useRef(new Animated.Value(0)).current;
  
  // Animaciones para las opciones del menú móvil - OPTIMIZADAS
  const mobileOptionAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;
  const mobileExtraOptionAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current; // Para Error 404, Info y Cerrar Sesión
  
  // Inicializar optionAnims después de que menuItems esté definido
  const optionAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  // Para tablets y teléfonos, usar menú desplegable, para desktop usar FAB
  const useDrawerMenu = !isDesktop;

  // Referencias para controlar las animaciones
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  // Limpiar animaciones al desmontar
  useEffect(() => {
    return () => {
      animationRefs.current.forEach(animation => animation.stop());
    };
  }, []);

  useEffect(() => {
    if (menuVisible) {
      // Detener animaciones previas
      animationRefs.current.forEach(animation => animation.stop());
      animationRefs.current = [];

      // Animación de entrada del menú móvil - OPTIMIZADA
      const slideAnimation = Animated.parallel([
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
      ]);

      animationRefs.current.push(slideAnimation);
      slideAnimation.start();

      // Animaciones escalonadas para las opciones del menú móvil - OPTIMIZADAS
      mobileOptionAnims.forEach((anim, index) => {
        const optionAnimation = Animated.sequence([
          Animated.delay(150 + (index * 60)), // Menos delay para mayor fluidez
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 250, // Duración más corta
              useNativeDriver: true,
            })
          ])
        ]);
        
        animationRefs.current.push(optionAnimation);
        optionAnimation.start();
      });

      // Animación para las opciones extra (Error 404, Info y Cerrar Sesión) - OPTIMIZADA
      mobileExtraOptionAnims.forEach((anim, index) => {
        const extraOptionAnimation = Animated.sequence([
          Animated.delay(150 + ((menuItems.length + index) * 60)),
          Animated.timing(anim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          })
        ]);

        animationRefs.current.push(extraOptionAnimation);
        extraOptionAnimation.start();
      });

    } else {
      // Reset animaciones cuando se cierra
      fadeAnim.setValue(0);
      slideAnim.setValue(-width);
      
      // Reset animaciones de opciones móviles
      mobileOptionAnims.forEach(anim => {
        anim.setValue(0);
      });
      mobileExtraOptionAnims.forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [menuVisible]);

  useEffect(() => {
    if (fabMenuVisible) {
      // Nueva animación de apertura del FAB menu - OPTIMIZADA
      const fabOpenAnimation = Animated.parallel([
        Animated.spring(fabScaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(fabRotateAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        })
      ]);

      fabOpenAnimation.start();

      // Nuevas animaciones escalonadas para las opciones - efecto de onda OPTIMIZADO
      optionAnims.forEach((anim, index) => {
        const optionAnimation = Animated.sequence([
          Animated.delay(index * 80), // Menos delay
          Animated.timing(anim, {
            toValue: 1,
            duration: 200, // Más rápido
            useNativeDriver: true,
          })
        ]);
        optionAnimation.start();
      });
    } else {
      // Nueva animación de cierre del FAB menu - OPTIMIZADA
      const fabCloseAnimation = Animated.parallel([
        Animated.timing(fabScaleAnim, {
          toValue: 0,
          duration: 150, // Más rápido
          useNativeDriver: true,
        }),
        Animated.timing(fabRotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]);

      fabCloseAnimation.start();

      // Cierre rápido de todas las opciones - OPTIMIZADO
      optionAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 100, // Más rápido
          delay: index * 20, // Menos delay
          useNativeDriver: true,
        }).start();
      });
    }
  }, [fabMenuVisible]);

  // Efecto para animar el modal de información
  useEffect(() => {
    if (infoModalVisible) {
      Animated.timing(infoModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(infoModalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [infoModalVisible]);

  // Efecto para animar el modal del avatar
  useEffect(() => {
    if (avatarModalVisible) {
      Animated.timing(avatarModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(avatarModalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [avatarModalVisible]);

  // Efecto para animar el modal de confirmación de cierre de sesión
  useEffect(() => {
    if (logoutConfirmVisible) {
      Animated.timing(logoutConfirmAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(logoutConfirmAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [logoutConfirmVisible]);

  const closeMenu = () => {
    // Detener animaciones previas
    animationRefs.current.forEach(animation => animation.stop());
    animationRefs.current = [];

    // Animaciones de cierre para opciones móviles - OPTIMIZADAS
    mobileOptionAnims.forEach((anim, index) => {
      const closeAnimation = Animated.timing(anim, {
        toValue: 0,
        duration: 120, // Más rápido
        delay: index * 20, // Menos delay
        useNativeDriver: true,
      });
      animationRefs.current.push(closeAnimation);
      closeAnimation.start();
    });

    mobileExtraOptionAnims.forEach((anim, index) => {
      const closeAnimation = Animated.timing(anim, {
        toValue: 0,
        duration: 120,
        delay: (menuItems.length * 20) + (index * 20),
        useNativeDriver: true,
      });
      animationRefs.current.push(closeAnimation);
      closeAnimation.start();
    });

    const closeMenuAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120, // Más rápido
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200, // Más rápido
        useNativeDriver: true,
      })
    ]);

    animationRefs.current.push(closeMenuAnimation);
    closeMenuAnimation.start(() => {
      setMenuVisible(false);
    });
  };

  const toggleFabMenu = () => {
    setFabMenuVisible(!fabMenuVisible);
  };

  const openInfoModal = () => {
    if (isDesktop) {
      setFabMenuVisible(false);
    } else {
      closeMenu();
    }
    setInfoModalVisible(true);
  };

  const closeInfoModal = () => {
    setInfoModalVisible(false);
  };

  const openAvatarModal = () => {
    closeMenu();
    setAvatarModalVisible(true);
  };

  const closeAvatarModal = () => {
    setAvatarModalVisible(false);
  };

  const openLogoutConfirm = () => {
    if (isDesktop) {
      setFabMenuVisible(false);
    } else {
      closeMenu();
    }
    setLogoutConfirmVisible(true);
  };

  const closeLogoutConfirm = () => {
    setLogoutConfirmVisible(false);
  };

  // CORRECCIÓN: Función de navegación mejorada para TypeScript
  const handleMenuPress = (screenName: string) => {
    closeMenu();
    
    // CORRECCIÓN: Usar el objeto de rutas válidas
    const route = validRoutes[screenName as ValidRouteKey];
    if (route) {
      router.push(route);
    }
  };

  // CORRECCIÓN: Función de navegación FAB mejorada para TypeScript
  const handleFabMenuPress = (screenName: string) => {
    setFabMenuVisible(false);
    
    // CORRECCIÓN: Usar el objeto de rutas válidas
    const route = validRoutes[screenName as ValidRouteKey];
    if (route) {
      router.push(route);
    }
  };

  // Función para manejar cierre de sesión
  const handleLogout = async () => {
    closeLogoutConfirm();
    
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para separar nombre y apellido
  const getUserNameParts = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      // Tomar todo excepto el último elemento como nombre
      const firstName = parts.slice(0, -1).join(' ');
      // El último elemento como apellido
      const lastName = parts[parts.length - 1];
      return { firstName, lastName };
    } else {
      // Si solo hay una palabra, usarla como nombre
      return { firstName: fullName, lastName: '' };
    }
  };

  const userName = profile?.full_name || 'Jose Pablo Miranda Quintanilla';
  const userEmail = profile?.email || user?.email || 'jmirandaquintanilla@gmail.com';
  const { firstName, lastName } = getUserNameParts(userName);

  // Modal del Avatar (solo para móvil) - MEJORADO con diseño premium
  const AvatarModal = () => (
    <Modal
      visible={avatarModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={closeAvatarModal}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeAvatarModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: avatarModalAnim
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.modalContentContainer}
            onPress={closeAvatarModal}
          >
            <Animated.View 
              style={[
                styles.avatarModalContent,
                {
                  transform: [
                    {
                      scale: avatarModalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }
                  ],
                  opacity: avatarModalAnim
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.avatarModalCloseButton}
                onPress={closeAvatarModal}
              >
                <View style={styles.avatarModalCloseBackground}>
                  <X size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Header del Modal del Avatar - MEJORADO */}
              <View style={styles.avatarModalHeader}>
                <View style={styles.avatarModalImageContainer}>
                  <View style={styles.avatarModalImageGlow} />
                  <Image 
                    source={userAvatar} 
                    style={styles.avatarModalImage}
                    onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
                  />
                  <View style={styles.avatarModalOnlineStatus} />
                </View>
                <Text style={styles.avatarModalTitle}>Perfil de Usuario</Text>
                <Text style={styles.avatarModalSubtitle}>Información personal</Text>
              </View>

              {/* Contenido del Modal del Avatar - MEJORADO */}
              <View style={styles.avatarModalBody}>
                {/* Información del Nombre Completo */}
                <View style={styles.avatarInfoSection}>
                  <View style={[styles.avatarInfoIconContainer, { backgroundColor: 'rgba(0, 255, 135, 0.1)' }]}>
                    <UserIcon size={24} color="#00FF87" />
                  </View>
                  <View style={styles.avatarInfoTextContainer}>
                    <Text style={styles.avatarInfoLabel}>Nombre Completo</Text>
                    <Text style={[styles.avatarInfoValue, styles.neonTextGreen]}>{userName}</Text>
                  </View>
                </View>

                {/* Separador decorativo */}
                <View style={styles.avatarSectionDivider} />

                {/* Información del Correo Electrónico */}
                <View style={styles.avatarInfoSection}>
                  <View style={[styles.avatarInfoIconContainer, { backgroundColor: 'rgba(0, 255, 255, 0.1)' }]}>
                    <Mail size={24} color="#00FFFF" />
                  </View>
                  <View style={styles.avatarInfoTextContainer}>
                    <Text style={styles.avatarInfoLabel}>Correo Electrónico</Text>
                    <Text style={[styles.avatarInfoValue, styles.neonTextCyan]}>{userEmail}</Text>
                  </View>
                </View>
              </View>

              {/* Footer del Modal del Avatar - MEJORADO con leyenda del desarrollador */}
              <View style={styles.avatarModalFooter}>
                <View style={styles.avatarFooterContent}>
                  <View style={styles.avatarFooterHeartContainer}>
                    <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                  </View>
                  <Text style={styles.avatarModalFooterText}>
                    Desarrollado con ♥️ por{"\n"}
                    <Text style={styles.avatarModalDeveloper}>Jose Pablo Miranda Quintanilla</Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  // Modal de Información del Sistema
  const InfoModal = () => (
    <Modal
      visible={infoModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={closeInfoModal}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeInfoModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: infoModalAnim
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.modalContentContainer}
            onPress={closeInfoModal}
          >
            <Animated.View 
              style={[
                styles.infoModalContent,
                {
                  transform: [
                    {
                      scale: infoModalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }
                  ],
                  opacity: infoModalAnim
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.infoModalCloseButton}
                onPress={closeInfoModal}
              >
                <View style={styles.infoModalCloseBackground}>
                  <X size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Header del Modal */}
              <View style={styles.infoModalHeader}>
                <View style={styles.infoModalIconContainer}>
                  <Info size={32} color="#00FFFF" />
                </View>
                <Text style={styles.infoModalTitle}>Información del Sistema</Text>
                <Text style={styles.infoModalSubtitle}>Detalles técnicos de la aplicación</Text>
              </View>

              {/* Contenido del Modal */}
              <View style={styles.infoModalBody}>
                <View style={styles.infoItem}>
                  <View style={styles.infoItemLeft}>
                    <Text style={styles.infoItemLabel}>Versión de la App</Text>
                  </View>
                  <View style={styles.infoItemRight}>
                    <View style={[styles.infoBadge, { backgroundColor: 'rgba(0, 255, 135, 0.1)', borderColor: '#00FF87' }]}>
                      <Text style={[styles.infoBadgeText, { color: '#00FF87' }]}>v2.1.0</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoItemLeft}>
                    <Text style={styles.infoItemLabel}>Número de Build</Text>
                  </View>
                  <View style={styles.infoItemRight}>
                    <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 184, 0, 0.1)', borderColor: '#FFB800' }]}>
                      <Text style={[styles.infoBadgeText, { color: '#FFB800' }]}>Build 347</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Footer del Modal */}
              <View style={styles.infoModalFooter}>
                <View style={styles.footerHeartContainer}>
                  <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                </View>
                <Text style={styles.infoModalFooterText}>
                  Desarrollado con pasión por{"\n"}
                  <Text style={styles.infoModalDeveloper}>Jose Pablo Miranda Quintanilla</Text>
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  // Modal de Confirmación de Cierre de Sesión
  const LogoutConfirmModal = () => (
    <Modal
      visible={logoutConfirmVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={closeLogoutConfirm}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeLogoutConfirm}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: logoutConfirmAnim
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.modalContentContainer}
            onPress={closeLogoutConfirm}
          >
            <Animated.View 
              style={[
                styles.logoutConfirmContent,
                {
                  transform: [
                    {
                      scale: logoutConfirmAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }
                  ],
                  opacity: logoutConfirmAnim
                }
              ]}
            >
              {/* Icono de advertencia */}
              <View style={styles.logoutIconContainer}>
                <AlertTriangle size={48} color="#FFB800" />
              </View>

              {/* Título y mensaje */}
              <Text style={styles.logoutConfirmTitle}>¿Cerrar Sesión?</Text>
              <Text style={styles.logoutConfirmMessage}>
                Estás a punto de cerrar tu sesión. ¿Estás seguro de que quieres continuar?
              </Text>

              {/* Botones de acción */}
              <View style={styles.logoutButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.logoutButton, styles.cancelButton]}
                  onPress={closeLogoutConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.logoutButton, styles.confirmButton]}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <LogOut size={18} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

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
              {/* Header del menú MEJORADO con avatar e información del usuario */}
              <View style={styles.menuHeader}>
                {/* Fondo gradiente mejorado */}
                <View style={styles.headerBackground} />
                
                <View style={styles.userProfileSection}>
                  {/* Avatar MEJORADO con efecto neomórfico - Ahora es clickeable */}
                  <TouchableOpacity 
                    style={styles.avatarContainer}
                    onPress={openAvatarModal}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarBackground} />
                    <Image 
                      source={userAvatar} 
                      style={styles.avatarImage}
                      onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
                    />
                    {/* Badge de estado en línea */}
                    <View style={styles.onlineStatus} />
                    {/* Efecto de brillo en el avatar */}
                    <View style={styles.avatarGlow} />
                  </TouchableOpacity>

                  {/* Información del usuario MEJORADA - Nombre y apellido en líneas separadas */}
                  <View style={styles.userInfo}>
                    {/* Nombre y apellido en líneas separadas */}
                    <View style={styles.userNameContainer}>
                      <UserIcon size={16} color="#00FF87" style={styles.userNameIcon} />
                      <View style={styles.nameLinesContainer}>
                        <Text style={[styles.firstName, styles.neonTextGreen]} numberOfLines={1}>
                          {firstName}
                        </Text>
                        {lastName ? (
                          <Text style={[styles.lastName, styles.neonTextCyan]} numberOfLines={1}>
                            {lastName}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    
                    {/* Correo electrónico CON COLOR NEÓN */}
                    <View style={styles.userEmailContainer}>
                      <Mail size={14} color="#FFB800" style={styles.userEmailIcon} />
                      <Text style={[styles.userEmail, styles.neonTextYellow]} numberOfLines={1}>
                        {userEmail}
                      </Text>
                    </View>

                    {/* Estado en línea */}
                    <View style={styles.userStatusContainer}>
                      <View style={styles.statusIndicator}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>En línea</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Botón de cerrar MEJORADO */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeMenu}
                >
                  <View style={styles.closeButtonBackground}>
                    <X size={20} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* ScrollView para las opciones del menú en móviles/tablets */}
              <ScrollView 
                style={styles.menuScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuScrollContent}
              >
                <View style={styles.menuItems}>
                  <Text style={styles.menuSectionTitle}>NAVEGACIÓN</Text>
                  
                  {/* Items principales con animaciones OPTIMIZADAS */}
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Animated.View
                        key={item.name}
                        style={[
                          styles.menuItem,
                          {
                            transform: [
                              { 
                                translateX: mobileOptionAnims[index].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-30, 0] // Menos desplazamiento para mejor performance
                                })
                              }
                            ],
                            opacity: mobileOptionAnims[index]
                          }
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.menuItemTouchable}
                          onPress={() => handleMenuPress(item.name)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.menuIconContainer, { borderColor: item.color }]}>
                            <IconComponent size={22} color={item.color} />
                          </View>
                          <Text style={[styles.menuItemText, { color: item.color }]}>{item.title}</Text>
                          <View style={[styles.menuItemGlow, { backgroundColor: `${item.color}30` }]} />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}

                  {/* Separador */}
                  <View style={styles.menuDivider} />

                  {/* Opción de Información del Sistema - SOLO para móvil/tablet con animación OPTIMIZADA */}
                  <Animated.View
                    style={[
                      styles.menuItem,
                      {
                        transform: [
                          { 
                            translateX: mobileExtraOptionAnims[0].interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 0]
                            })
                          }
                        ],
                        opacity: mobileExtraOptionAnims[0]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.menuItemTouchable}
                      onPress={openInfoModal}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.menuIconContainer, { borderColor: '#00FFFF' }]}>
                        <Info size={22} color="#00FFFF" />
                      </View>
                      <Text style={[styles.menuItemText, { color: '#00FFFF' }]}>Información del Sistema</Text>
                      <View style={[styles.menuItemGlow, { backgroundColor: '#00FFFF30' }]} />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Opción de Error 404 - SOLO para móvil/tablet con animación OPTIMIZADA */}
                  <Animated.View
                    style={[
                      styles.menuItem,
                      {
                        transform: [
                          { 
                            translateX: mobileExtraOptionAnims[1].interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 0]
                            })
                          }
                        ],
                        opacity: mobileExtraOptionAnims[1]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.menuItemTouchable}
                      onPress={() => handleMenuPress('error-404')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.menuIconContainer, { borderColor: '#FF6B9D' }]}>
                        <AlertTriangle size={22} color="#FF6B9D" />
                      </View>
                      <Text style={[styles.menuItemText, { color: '#FF6B9D' }]}>Error 404</Text>
                      <View style={[styles.menuItemGlow, { backgroundColor: '#FF6B9D30' }]} />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Opción de Cerrar Sesión - SOLO para móvil/tablet con animación OPTIMIZADA */}
                  <Animated.View
                    style={[
                      styles.menuItem,
                      {
                        transform: [
                          { 
                            translateX: mobileExtraOptionAnims[2].interpolate({
                              inputRange: [0, 1],
                              outputRange: [-30, 0]
                            })
                          }
                        ],
                        opacity: mobileExtraOptionAnims[2]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.menuItemTouchable}
                      onPress={openLogoutConfirm}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.menuIconContainer, { borderColor: '#FF4444' }]}>
                        <LogOut size={22} color="#FF4444" />
                      </View>
                      <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Cerrar Sesión</Text>
                      <View style={[styles.menuItemGlow, { backgroundColor: '#FF444430' }]} />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </ScrollView>

              {/* Footer del menú MEJORADO con efecto glass y leyenda en color neón */}
              <View style={styles.menuFooter}>
                <View style={styles.footerGlassEffect} />
                <View style={styles.footerContent}>
                  <View style={styles.heartContainer}>
                    <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                  </View>
                  <Text style={styles.watermarkText}>
                    Desarrollado con pasión por{"\n"}
                    <Text style={styles.developerName}>Jose Pablo Miranda Quintanilla</Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  // FAB Menu para Desktop - OPTIMIZADO con textos a la derecha
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
                  outputRange: ['0deg', '135deg']
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

      {/* Opciones del FAB Menu - OPTIMIZADAS con textos a la derecha */}
      {menuItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Animated.View
            key={item.name}
            style={[
              styles.fabOption,
              {
                bottom: 120 + (index * 85),
                transform: [
                  { 
                    scale: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  },
                  { 
                    translateY: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0] // Menos desplazamiento
                    })
                  },
                  {
                    translateX: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-15, 0] // Cambiado a negativo para mover a la izquierda
                    })
                  }
                ],
                opacity: optionAnims[index]
              }
            ]}
          >
            {/* Label a la izquierda del botón */}
            <Animated.View 
              style={[
                styles.fabOptionLabelRight,
                {
                  opacity: optionAnims[index],
                  transform: [
                    {
                      translateX: optionAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0] // Cambiado para animación desde la derecha
                      })
                    }
                  ]
                }
              ]}
            >
              <Text style={[styles.fabOptionText, { color: item.color }]}>{item.title}</Text>
              <View style={[styles.fabOptionLabelArrowRight, { borderRightColor: item.color }]} />
            </Animated.View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.fabOptionButton, { 
                backgroundColor: item.color,
              }]}
              onPress={() => handleFabMenuPress(item.name)}
              activeOpacity={0.7}
            >
              <IconComponent size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Opción de Información del Sistema en FAB Menu para Desktop con texto a la derecha */}
      <Animated.View
        style={[
          styles.fabOption,
          {
            bottom: 120 + (menuItems.length * 85),
            transform: [
              { 
                scale: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1]
                })
              },
              { 
                translateY: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              },
              {
                translateX: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-15, 0] // Cambiado a negativo
                })
              }
            ],
            opacity: optionAnims[0]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.fabOptionLabelRight,
            {
              opacity: optionAnims[0],
              transform: [
                {
                  translateX: optionAnims[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={[styles.fabOptionText, { color: '#00FFFF' }]}>Información</Text>
          <View style={[styles.fabOptionLabelArrowRight, { borderRightColor: '#00FFFF' }]} />
        </Animated.View>

        <TouchableOpacity
          style={[styles.fabOptionButton, { 
            backgroundColor: '#00FFFF',
          }]}
          onPress={openInfoModal}
          activeOpacity={0.7}
        >
          <Info size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Opción de Cerrar Sesión en FAB Menu para Desktop con texto a la derecha */}
      <Animated.View
        style={[
          styles.fabOption,
          {
            bottom: 120 + ((menuItems.length + 1) * 85),
            transform: [
              { 
                scale: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1]
                })
              },
              { 
                translateY: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              },
              {
                translateX: optionAnims[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-15, 0] // Cambiado a negativo
                })
              }
            ],
            opacity: optionAnims[0]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.fabOptionLabelRight,
            {
              opacity: optionAnims[0],
              transform: [
                {
                  translateX: optionAnims[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={[styles.fabOptionText, { color: '#FF4444' }]}>Cerrar Sesión</Text>
          <View style={[styles.fabOptionLabelArrowRight, { borderRightColor: '#FF4444' }]} />
        </Animated.View>

        <TouchableOpacity
          style={[styles.fabOptionButton, { 
            backgroundColor: '#FF4444',
          }]}
          onPress={openLogoutConfirm}
          activeOpacity={0.7}
        >
          <LogOut size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Eliminamos completamente las Tabs de navegación para todas las versiones */}
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Ocultamos completamente la tab bar en todas las versiones
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="bookings" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="about" />
      </Tabs>

      {/* Botón de menú hamburguesa para móvil y tablet */}
      {useDrawerMenu && (
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerBackground}>
            <Menu size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Renderizar el menú desplegable para móvil y tablet */}
      {useDrawerMenu && <DrawerMenu />}

      {/* Renderizar el FAB menu para desktop */}
      {isDesktop && <FabMenu />}

      {/* Modales */}
      <InfoModal />
      {isMobile && <AvatarModal />}
      <LogoutConfirmModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  // Estilos del botón hamburguesa
  hamburgerButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 20,
    zIndex: 1000,
  },
  hamburgerBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Estilos del modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos del drawer menu
  drawerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Platform.OS === 'web' ? 400 : Math.min(400, width * 0.85),
    backgroundColor: '#0A0A0A',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  // Header del menú MEJORADO
  menuHeader: {
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 135, 0.05)',
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarBackground: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: 'rgba(0, 255, 135, 0.2)',
    borderRadius: 50,
    opacity: 0.6,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#00FF87',
  },
  avatarGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 135, 0.3)',
    opacity: 0.8,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF87',
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userNameIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  nameLinesContainer: {
    flex: 1,
  },
  firstName: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  lastName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  userEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userEmailIcon: {
    marginRight: 6,
  },
  userEmail: {
    fontSize: 14,
    flex: 1,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 135, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF87',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#00FF87',
    fontWeight: '600',
  },
  // Estilos de texto neón MEJORADOS - AGREGADO COLOR AMARILLO NEÓN
  neonTextGreen: {
    color: '#00FF87',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontWeight: 'bold',
  },
  neonTextCyan: {
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontWeight: '600',
  },
  neonTextYellow: {
    color: '#FFB800',
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 40,
    right: 20,
    zIndex: 10,
  },
  closeButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // ScrollView del menú
  menuScrollView: {
    flex: 1,
  },
  menuScrollContent: {
    paddingBottom: 20,
  },
  menuItems: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 20,
    marginLeft: 15,
    letterSpacing: 1.5,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
  },
  menuItemGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    opacity: 0.3,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  // Footer del menú MEJORADO
  menuFooter: {
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  footerGlassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartContainer: {
    marginRight: 12,
  },
  watermarkText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
    lineHeight: 16,
  },
  developerName: {
    color: '#FF6B9D',
    fontWeight: '600',
    fontSize: 13,
  },
  // Estilos del FAB Menu
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
    backgroundColor: '#00FF87',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF87',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fabButtonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 135, 0.3)',
    opacity: 0.8,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  fabOption: {
    position: 'absolute',
    right: 40,
    zIndex: 1001,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabOptionLabelRight: {
    position: 'absolute',
    right: 75,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabOptionText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  fabOptionLabelArrowRight: {
    position: 'absolute',
    right: -6,
    top: '50%',
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 6,
    marginTop: -6,
  },
  fabOptionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Estilos del Modal de Información MEJORADOS
  infoModalContent: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    padding: 0,
    width: Platform.OS === 'web' ? 500 : Math.min(500, width * 0.9),
    maxHeight: Platform.OS === 'web' ? '80%' : '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 30,
    overflow: 'hidden',
  },
  infoModalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  infoModalCloseBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoModalHeader: {
    paddingVertical: 30,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  infoModalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  infoModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  infoModalBody: {
    padding: 30,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoItemLeft: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  infoItemRight: {
    marginLeft: 15,
  },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoModalFooter: {
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
  },
  footerHeartContainer: {
    marginBottom: 12,
  },
  infoModalFooterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoModalDeveloper: {
    color: '#FF6B9D',
    fontWeight: '600',
    fontSize: 13,
  },
  // Estilos del Modal del Avatar MEJORADOS - DISEÑO PREMIUM
  avatarModalContent: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    padding: 0,
    width: Platform.OS === 'web' ? 420 : Math.min(420, width * 0.88),
    maxHeight: Platform.OS === 'web' ? '75%' : '80%',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 135, 0.2)',
    shadowColor: '#00FF87',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 30,
    overflow: 'hidden',
  },
  avatarModalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  avatarModalCloseBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarModalHeader: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 135, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 135, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarModalImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarModalImageGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 255, 135, 0.15)',
    opacity: 0.6,
  },
  avatarModalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 135, 0.8)',
  },
  avatarModalOnlineStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00FF87',
    borderWidth: 3,
    borderColor: '#0A0A0A',
    shadowColor: '#00FF87',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00FF87',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 135, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 0.5,
  },
  avatarModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  avatarModalBody: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  // Estilos MEJORADOS para la información del avatar
  avatarInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarInfoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarInfoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarInfoLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  avatarInfoValue: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  avatarSectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  avatarModalFooter: {
    paddingVertical: 28,
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 157, 0.2)',
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    alignItems: 'center',
  },
  avatarFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFooterHeartContainer: {
    marginRight: 12,
  },
  avatarModalFooterText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  avatarModalDeveloper: {
    color: '#FF6B9D',
    fontWeight: '600',
    fontSize: 14,
    textShadowColor: 'rgba(255, 107, 157, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  // Estilos del Modal de Confirmación de Cierre de Sesión
  logoutConfirmContent: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 400,
    padding: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  logoutConfirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutConfirmMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  logoutButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});