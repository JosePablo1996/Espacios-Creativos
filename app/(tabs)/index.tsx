import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Animated,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DoorOpen, Users, Shield, Search, Filter, Star, Wifi, Monitor, Zap, Sparkles, ArrowRight, Clock, MapPin, Crown } from 'lucide-react-native';

type Room = Database['public']['Tables']['rooms']['Row'];

// Breakpoints para responsive design
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// Componente separado para la tarjeta de sala en formato lista
const RoomListItem = ({ 
  item, 
  index, 
  isMobile, 
  isTablet, 
  isDesktop, 
  onPress 
}: { 
  item: Room; 
  index: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  onPress: (room: Room) => void;
}) => {
  const [cardSlideAnim] = useState(new Animated.Value(50));
  const [cardFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const getRoomFeatures = (roomName: string) => {
    const features = [];
    const maxFeatures = isMobile ? 2 : 3;
    
    if (roomName.includes('A') || roomName.toLowerCase().includes('pequeña')) {
      features.push({ icon: Monitor, label: 'Proyector 4K', color: '#00FFFF' });
      features.push({ icon: Wifi, label: 'Wi-Fi 5G', color: '#00FF87' });
      if (!isMobile) features.push({ icon: Zap, label: 'Energía', color: '#FFB800' });
    } else if (roomName.includes('B') || roomName.toLowerCase().includes('mediana')) {
      features.push({ icon: Monitor, label: 'Pizarra HD', color: '#00FFFF' });
      features.push({ icon: Zap, label: 'Energía', color: '#FFB800' });
      if (!isMobile) features.push({ icon: Sparkles, label: 'Premium', color: '#00FF87' });
    } else {
      features.push({ icon: Star, label: 'Sonido 3D', color: '#00FFFF' });
      features.push({ icon: Sparkles, label: 'Premium', color: '#00FF87' });
      if (!isMobile) features.push({ icon: Users, label: 'Capacidad', color: '#FFB800' });
    }
    return features.slice(0, maxFeatures);
  };

  const features = getRoomFeatures(item.name);

  return (
    <Animated.View 
      style={[
        styles.roomListItem,
        isDesktop && styles.roomListItemDesktop,
        isTablet && styles.roomListItemTablet,
        {
          opacity: cardFadeAnim,
          transform: [{ translateY: cardSlideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.roomListItemTouchable}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        {/* Icono de la sala */}
        <View style={[
          styles.roomListIcon,
          isDesktop && styles.roomListIconDesktop
        ]}>
          <DoorOpen size={isMobile ? 24 : isDesktop ? 28 : 26} color="#E50914" />
          <View style={styles.iconGlow} />
        </View>

        {/* Información de la sala */}
        <View style={styles.roomListInfo}>
          <View style={styles.roomListHeader}>
            <View style={styles.roomListTitleSection}>
              <Text style={[
                styles.roomListName,
                isMobile && styles.roomListNameMobile,
                isDesktop && styles.roomListNameDesktop,
                isTablet && styles.roomListNameTablet
              ]}>
                {item.name}
              </Text>
              <Text style={[
                styles.roomListDescription,
                isMobile && styles.roomListDescriptionMobile,
                isDesktop && styles.roomListDescriptionDesktop
              ]}>
                {item.description}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={isMobile ? 14 : 16} color="#FFB800" fill="#FFB800" />
              <Text style={[
                styles.ratingText,
                isMobile && styles.ratingTextMobile
              ]}>
                4.8
              </Text>
            </View>
          </View>

          {/* Características */}
          <View style={styles.roomListFeatures}>
            {features.map((feature, featureIndex) => {
              const IconComponent = feature.icon;
              return (
                <View key={featureIndex} style={[
                  styles.featureTag, 
                  isDesktop && styles.featureTagDesktop,
                ]}>
                  <IconComponent size={isMobile ? 12 : isDesktop ? 14 : 13} color={feature.color} />
                  <Text style={[
                    styles.featureTagText,
                    isMobile && styles.featureTagTextMobile,
                    isDesktop && styles.featureTagTextDesktop,
                    { color: feature.color }
                  ]}>
                    {feature.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Footer de la lista */}
          <View style={styles.roomListFooter}>
            <View style={styles.capacityInfo}>
              <View style={[
                styles.capacityBadge,
                isDesktop && styles.capacityBadgeDesktop
              ]}>
                <Users size={isMobile ? 14 : isDesktop ? 16 : 15} color="#00FFFF" />
                <Text style={[
                  styles.capacityText,
                  isMobile && styles.capacityTextMobile,
                  isDesktop && styles.capacityTextDesktop
                ]}>
                  {item.capacity} personas
                </Text>
              </View>
              <View style={[
                styles.availabilityBadge,
                isDesktop && styles.availabilityBadgeDesktop
              ]}>
                <View style={[styles.availableDot, { backgroundColor: '#00FF87' }]} />
                <Text style={[
                  styles.availableText,
                  isMobile && styles.availableTextMobile,
                  isDesktop && styles.availableTextDesktop
                ]}>
                  Disponible
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.reserveButton,
                isMobile && styles.reserveButtonMobile,
                isDesktop && styles.reserveButtonDesktop
              ]}
              onPress={() => onPress(item)}
            >
              <Text style={[
                styles.reserveButtonText,
                isMobile && styles.reserveButtonTextMobile,
                isDesktop && styles.reserveButtonTextDesktop
              ]}>
                Reservar
              </Text>
              <ArrowRight size={isMobile ? 14 : isDesktop ? 16 : 15} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Detectar tipo de dispositivo
  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Animaciones de entrada
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

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      router.replace('/(auth)');
      return;
    }
    
    loadRooms();
  }, [user, isReady]);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las salas');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoomPress = (room: Room) => {
    if (!isReady) return;
    
    router.push({
      pathname: '/room/[id]',
      params: { id: room.id, name: room.name }
    });
  };

  const handleAdminPress = () => {
    if (!isReady) return;
    
    router.push('/admin/bookings');
  };

  // Render item para lista
  const renderRoomListItem = ({ item, index }: { item: Room; index: number }) => (
    <RoomListItem
      item={item}
      index={index}
      isMobile={isMobile}
      isTablet={isTablet}
      isDesktop={isDesktop}
      onPress={handleRoomPress}
    />
  );

  if (!isReady || loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Cargando espacios...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      {/* Header estilo Netflix */}
      <Animated.View 
        style={[
          styles.headerSection,
          isDesktop && styles.headerSectionDesktop,
          isTablet && styles.headerSectionTablet,
          isMobile && styles.headerSectionMobile,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Logo y título CENTRADO */}
        <View style={[
          styles.headerCentered,
          isDesktop && styles.headerCenteredDesktop
        ]}>
          <View style={[
            styles.logoCentered,
            isDesktop && styles.logoCenteredDesktop
          ]}>
            <DoorOpen size={isDesktop ? 32 : 36} color="#E50914" />
          </View>
          <View style={styles.titleCentered}>
            <Text style={[
              styles.mainTitleCentered,
              isMobile && styles.mainTitleCenteredMobile,
              isDesktop && styles.mainTitleCenteredDesktop,
              isTablet && styles.mainTitleCenteredTablet
            ]}>
              Espacios Creativos
            </Text>
            <Text style={[
              styles.mainSubtitleCentered,
              isMobile && styles.mainSubtitleCenteredMobile,
              isDesktop && styles.mainSubtitleCenteredDesktop,
              isTablet && styles.mainSubtitleCenteredTablet
            ]}>
              Reserva tu espacio ideal
            </Text>
          </View>
        </View>

        {/* Barra de búsqueda compacta */}
        <View style={[
          styles.searchContainerCompact,
          isDesktop && styles.searchContainerCompactDesktop,
          isTablet && styles.searchContainerCompactTablet
        ]}>
          <View style={[
            styles.searchInputContainerCompact,
            isDesktop && styles.searchInputContainerCompactDesktop,
            isTablet && styles.searchInputContainerCompactTablet
          ]}>
            <Search size={isMobile ? 18 : isDesktop ? 20 : 19} color="#E50914" />
            <TextInput
              style={[
                styles.searchInputCompact,
                isMobile && styles.searchInputCompactMobile,
                isDesktop && styles.searchInputCompactDesktop,
                isTablet && styles.searchInputCompactTablet
              ]}
              placeholder="Buscar salas..."
              placeholderTextColor="#8C8C8C"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[
            styles.filterButtonCompact,
            isMobile && styles.filterButtonCompactMobile,
            isDesktop && styles.filterButtonCompactDesktop,
            isTablet && styles.filterButtonCompactTablet
          ]}>
            <Filter size={isMobile ? 18 : isDesktop ? 20 : 19} color="#E50914" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Contenido principal */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          isDesktop && styles.scrollViewContentDesktop,
          isTablet && styles.scrollViewContentTablet
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card principal */}
        <Animated.View 
          style={[
            styles.mainCard,
            isDesktop && styles.mainCardDesktop,
            isTablet && styles.mainCardTablet,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.cardDecoration} />
          
          <View style={[
            styles.cardHeader,
            isDesktop && styles.cardHeaderDesktop
          ]}>
            <Text style={[
              styles.cardMainTitle,
              isMobile && styles.cardMainTitleMobile,
              isDesktop && styles.cardMainTitleDesktop,
              isTablet && styles.cardMainTitleTablet
            ]}>
              <DoorOpen size={isMobile ? 20 : isDesktop ? 22 : 21} color="#E50914" style={styles.titleIcon} />
              Salas Disponibles
            </Text>
            <Text style={[
              styles.cardSubtitle,
              isMobile && styles.cardSubtitleMobile,
              isDesktop && styles.cardSubtitleDesktop,
              isTablet && styles.cardSubtitleTablet
            ]}>
              Encuentra el espacio perfecto para tu próxima reunión
            </Text>
          </View>

          <View style={styles.cardContent}>
            {/* Descripción de la app */}
            <View style={[
              styles.descriptionSection,
              isDesktop && styles.descriptionSectionDesktop
            ]}>
              <Text style={[
                styles.appDescription,
                isDesktop && styles.appDescriptionDesktop
              ]}>
                "Transforma tus reuniones en experiencias extraordinarias. Nuestros espacios están diseñados para inspirar creatividad y productividad."
              </Text>
              
              <View style={styles.featuresList}>
                <View style={styles.iconText}>
                  <Clock size={isDesktop ? 16 : 16} color="#00FFFF" style={styles.featureIcon} />
                  <Text style={[styles.featureItemText, isDesktop && styles.featureItemTextDesktop]}>Reserva rápida y sencilla</Text>
                </View>
                <View style={styles.iconText}>
                  <MapPin size={isDesktop ? 16 : 16} color="#00FF87" style={styles.featureIcon} />
                  <Text style={[styles.featureItemText, isDesktop && styles.featureItemTextDesktop]}>Ubicaciones estratégicas</Text>
                </View>
                <View style={styles.iconText}>
                  <Sparkles size={isDesktop ? 16 : 16} color="#FFB800" style={styles.featureIcon} />
                  <Text style={[styles.featureItemText, isDesktop && styles.featureItemTextDesktop]}>Tecnología de última generación</Text>
                </View>
              </View>
            </View>

            {/* Banner de administrador */}
            {isAdmin && (
              <TouchableOpacity
                style={[
                  styles.adminBanner,
                  isMobile && styles.adminBannerMobile,
                  isDesktop && styles.adminBannerDesktop,
                  isTablet && styles.adminBannerTablet
                ]}
                onPress={handleAdminPress}
              >
                <View style={[
                  styles.adminIconContainer,
                  isDesktop && styles.adminIconContainerDesktop
                ]}>
                  <Crown size={isMobile ? 18 : isDesktop ? 20 : 19} color="#FFB800" />
                </View>
                <View style={styles.adminBannerContent}>
                  <Text style={[
                    styles.adminBannerTitle,
                    isMobile && styles.adminBannerTitleMobile,
                    isDesktop && styles.adminBannerTitleDesktop,
                    isTablet && styles.adminBannerTitleTablet
                  ]}>
                    Panel de Administrador
                  </Text>
                  <Text style={[
                    styles.adminBannerSubtitle,
                    isMobile && styles.adminBannerSubtitleMobile,
                    isDesktop && styles.adminBannerSubtitleDesktop,
                    isTablet && styles.adminBannerSubtitleTablet
                  ]}>
                    Gestiona todas las reservas del sistema
                  </Text>
                </View>
                <ArrowRight size={isMobile ? 16 : isDesktop ? 18 : 17} color="#FFB800" />
              </TouchableOpacity>
            )}

            {/* Estadísticas */}
            <View style={[
              styles.statsContainer,
              isMobile && styles.statsContainerMobile,
              isDesktop && styles.statsContainerDesktop,
              isTablet && styles.statsContainerTablet
            ]}>
              <View style={styles.statItem}>
                <Text style={[
                  styles.statNumber,
                  isMobile && styles.statNumberMobile,
                  isDesktop && styles.statNumberDesktop,
                  isTablet && styles.statNumberTablet
                ]}>
                  {rooms.length}
                </Text>
                <Text style={[
                  styles.statLabel,
                  isMobile && styles.statLabelMobile,
                  isDesktop && styles.statLabelDesktop,
                  isTablet && styles.statLabelTablet
                ]}>
                  Salas Totales
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[
                  styles.statNumber,
                  isMobile && styles.statNumberMobile,
                  isDesktop && styles.statNumberDesktop,
                  isTablet && styles.statNumberTablet
                ]}>
                  {rooms.filter(r => r.capacity > 10).length}
                </Text>
                <Text style={[
                  styles.statLabel,
                  isMobile && styles.statLabelMobile,
                  isDesktop && styles.statLabelDesktop,
                  isTablet && styles.statLabelTablet
                ]}>
                  Salas Grandes
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[
                  styles.statNumber,
                  isMobile && styles.statNumberMobile,
                  isDesktop && styles.statNumberDesktop,
                  isTablet && styles.statNumberTablet
                ]}>
                  {rooms.filter(r => r.capacity <= 10).length}
                </Text>
                <Text style={[
                  styles.statLabel,
                  isMobile && styles.statLabelMobile,
                  isDesktop && styles.statLabelDesktop,
                  isTablet && styles.statLabelTablet
                ]}>
                  Salas Pequeñas
                </Text>
              </View>
            </View>

            {/* Header de lista */}
            <View style={[
              styles.listHeader,
              isDesktop && styles.listHeaderDesktop
            ]}>
              <Text style={[
                styles.listTitle,
                isMobile && styles.listTitleMobile,
                isDesktop && styles.listTitleDesktop,
                isTablet && styles.listTitleTablet
              ]}>
                Nuestros Espacios
              </Text>
              <Text style={[
                styles.roomCount,
                isMobile && styles.roomCountMobile,
                isDesktop && styles.roomCountDesktop,
                isTablet && styles.roomCountTablet
              ]}>
                {filteredRooms.length} encontradas
              </Text>
            </View>

            {/* LISTA de salas (en lugar de grid) */}
            <FlatList
              data={filteredRooms}
              renderItem={renderRoomListItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={[
                styles.listContainer,
                isDesktop && styles.listContainerDesktop,
                isTablet && styles.listContainerTablet
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={[
                  styles.emptyState,
                  isDesktop && styles.emptyStateDesktop,
                  isTablet && styles.emptyStateTablet
                ]}>
                  <DoorOpen size={isDesktop ? 60 : isTablet ? 50 : 40} color="#8C8C8C" />
                  <Text style={[
                    styles.emptyTitle,
                    isDesktop && styles.emptyTitleDesktop,
                    isTablet && styles.emptyTitleTablet
                  ]}>
                    No hay salas disponibles
                  </Text>
                  <Text style={[
                    styles.emptySubtitle,
                    isDesktop && styles.emptySubtitleDesktop,
                    isTablet && styles.emptySubtitleTablet
                  ]}>
                    {searchQuery ? 'Ajusta tu búsqueda' : 'Vuelve más tarde'}
                  </Text>
                </View>
              }
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  scrollViewContentDesktop: {
    paddingHorizontal: 0,
  },
  scrollViewContentTablet: {
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#00FF87',
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // Header Styles - Estilo Netflix CON TÍTULO CENTRADO
  headerSection: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerSectionDesktop: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerSectionTablet: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerSectionMobile: {
    paddingTop: 50,
  },
  
  // Header Centrado
  headerCentered: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerCenteredDesktop: {
    marginBottom: 12,
  },
  logoCentered: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E50914',
    marginBottom: 8,
  },
  logoCenteredDesktop: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  titleCentered: {
    alignItems: 'center',
  },
  mainTitleCentered: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E50914',
    marginBottom: 4,
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  mainTitleCenteredMobile: {
    fontSize: 18,
  },
  mainTitleCenteredDesktop: {
    fontSize: 24,
  },
  mainTitleCenteredTablet: {
    fontSize: 22,
  },
  mainSubtitleCentered: {
    fontSize: 14,
    color: '#00FF87',
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  mainSubtitleCenteredMobile: {
    fontSize: 12,
  },
  mainSubtitleCenteredDesktop: {
    fontSize: 16,
  },
  mainSubtitleCenteredTablet: {
    fontSize: 14,
  },

  // Search Styles Compact
  searchContainerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainerCompactDesktop: {
    gap: 12,
  },
  searchContainerCompactTablet: {
    gap: 10,
  },
  searchInputContainerCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  searchInputContainerCompactDesktop: {
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInputContainerCompactTablet: {
    paddingVertical: 9,
    borderRadius: 11,
  },
  searchInputCompact: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  searchInputCompactMobile: {
    fontSize: 13,
  },
  searchInputCompactDesktop: {
    fontSize: 14,
  },
  searchInputCompactTablet: {
    fontSize: 13,
  },
  clearText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  filterButtonCompactMobile: {
    width: 38,
    height: 38,
  },
  filterButtonCompactDesktop: {
    width: 44,
    height: 44,
    borderRadius: 11,
  },
  filterButtonCompactTablet: {
    width: 42,
    height: 42,
  },

  // Main Card Styles
  mainCard: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  mainCardDesktop: {
    margin: 20,
  },
  mainCardTablet: {
    margin: 16,
  },
  cardDecoration: {
    height: 4,
    backgroundColor: '#E50914',
  },
  cardHeader: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  cardHeaderDesktop: {
    padding: 24,
    paddingBottom: 16,
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardMainTitleMobile: {
    fontSize: 16,
  },
  cardMainTitleDesktop: {
    fontSize: 20,
  },
  cardMainTitleTablet: {
    fontSize: 18,
  },
  titleIcon: {
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#00FF87',
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardSubtitleMobile: {
    fontSize: 12,
  },
  cardSubtitleDesktop: {
    fontSize: 14,
  },
  cardSubtitleTablet: {
    fontSize: 13,
  },
  cardContent: {
    padding: 4,
    paddingBottom: 20,
  },

  // Description Section
  descriptionSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    margin: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  descriptionSectionDesktop: {
    padding: 20,
    margin: 16,
  },
  appDescription: {
    textAlign: 'center',
    color: '#FFFFFF',
    lineHeight: 20,
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  appDescriptionDesktop: {
    fontSize: 14,
    lineHeight: 22,
  },
  featuresList: {
    gap: 10,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 10,
  },
  featureItemText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  featureItemTextDesktop: {
    fontSize: 14,
  },

  // Admin Banner
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    margin: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  adminBannerMobile: {
    marginHorizontal: 12,
    padding: 12,
  },
  adminBannerDesktop: {
    marginHorizontal: 16,
    padding: 18,
  },
  adminBannerTablet: {
    marginHorizontal: 12,
    padding: 16,
  },
  adminIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminIconContainerDesktop: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  adminBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB800',
    marginBottom: 2,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  adminBannerTitleMobile: {
    fontSize: 13,
  },
  adminBannerTitleDesktop: {
    fontSize: 16,
  },
  adminBannerTitleTablet: {
    fontSize: 15,
  },
  adminBannerSubtitle: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '500',
  },
  adminBannerSubtitleMobile: {
    fontSize: 11,
  },
  adminBannerSubtitleDesktop: {
    fontSize: 13,
  },
  adminBannerSubtitleTablet: {
    fontSize: 12,
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    margin: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  statsContainerMobile: {
    marginHorizontal: 12,
    padding: 14,
  },
  statsContainerDesktop: {
    marginHorizontal: 16,
    padding: 20,
  },
  statsContainerTablet: {
    marginHorizontal: 12,
    padding: 18,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00FF87',
    marginBottom: 4,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statNumberMobile: {
    fontSize: 18,
  },
  statNumberDesktop: {
    fontSize: 24,
  },
  statNumberTablet: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 11,
    color: '#00FFFF',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  statLabelMobile: {
    fontSize: 10,
  },
  statLabelDesktop: {
    fontSize: 12,
  },
  statLabelTablet: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#404040',
  },

  // List Header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  listHeaderDesktop: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E50914',
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  listTitleMobile: {
    fontSize: 15,
  },
  listTitleDesktop: {
    fontSize: 18,
  },
  listTitleTablet: {
    fontSize: 17,
  },
  roomCount: {
    fontSize: 12,
    color: '#00FF87',
    fontWeight: '700',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  roomCountMobile: {
    fontSize: 11,
  },
  roomCountDesktop: {
    fontSize: 13,
  },
  roomCountTablet: {
    fontSize: 12,
  },

  // List Container (en lugar de grid)
  listContainer: {
    paddingHorizontal: 8,
  },
  listContainerDesktop: {
    paddingHorizontal: 12,
  },
  listContainerTablet: {
    paddingHorizontal: 10,
  },

  // Room List Item Styles
  roomListItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    margin: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  roomListItemDesktop: {
    margin: 8,
    marginBottom: 10,
    borderRadius: 14,
  },
  roomListItemTablet: {
    margin: 6,
    marginBottom: 8,
    borderRadius: 12,
  },
  roomListItemTouchable: {
    flexDirection: 'row',
    padding: 12,
  },
  roomListIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  roomListIconDesktop: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  iconGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: '#E50914',
    opacity: 0.1,
    borderRadius: 10,
  },
  roomListInfo: {
    flex: 1,
  },
  roomListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomListTitleSection: {
    flex: 1,
    marginRight: 8,
  },
  roomListName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  roomListNameMobile: {
    fontSize: 15,
  },
  roomListNameDesktop: {
    fontSize: 17,
  },
  roomListNameTablet: {
    fontSize: 16,
  },
  roomListDescription: {
    fontSize: 13,
    color: '#8C8C8C',
    lineHeight: 18,
  },
  roomListDescriptionMobile: {
    fontSize: 12,
    lineHeight: 16,
  },
  roomListDescriptionDesktop: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB800',
    marginLeft: 3,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  ratingTextMobile: {
    fontSize: 10,
  },
  roomListFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureTagDesktop: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureTagTextMobile: {
    fontSize: 9,
  },
  featureTagTextDesktop: {
    fontSize: 11,
  },
  roomListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityBadgeDesktop: {
    marginBottom: 0,
  },
  capacityText: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '700',
    marginLeft: 4,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  capacityTextMobile: {
    fontSize: 11,
  },
  capacityTextDesktop: {
    fontSize: 13,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#00FF87',
  },
  availabilityBadgeDesktop: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00FF87',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  availableTextMobile: {
    fontSize: 10,
  },
  availableTextDesktop: {
    fontSize: 12,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  reserveButtonMobile: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  reserveButtonDesktop: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reserveButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  reserveButtonTextMobile: {
    fontSize: 11,
  },
  reserveButtonTextDesktop: {
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 30,
    marginVertical: 20,
  },
  emptyStateDesktop: {
    padding: 40,
  },
  emptyStateTablet: {
    padding: 35,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E50914',
    marginTop: 12,
    marginBottom: 6,
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  emptyTitleDesktop: {
    fontSize: 16,
  },
  emptyTitleTablet: {
    fontSize: 15,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8C8C8C',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtitleDesktop: {
    fontSize: 13,
  },
  emptySubtitleTablet: {
    fontSize: 12,
  },

  // Footer
  footerSection: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  footerText: {
    fontSize: 11,
    color: '#00FF87',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});