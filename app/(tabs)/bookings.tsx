import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, Trash2, Heart, Crown, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  rooms: { name: string; description: string };
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const getResponsiveFontSize = (baseSize: number) => {
    const scale = Math.min(width / 375, height / 812);
    return Math.round(baseSize * scale);
  };

  const getResponsivePadding = (basePadding: number) => {
    const scale = Math.min(width / 375, 1.2);
    return Math.round(basePadding * scale);
  };

  // Validación de usuario
  const validateUser = () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return false;
    }
    return true;
  };

  // Validación de datos de reserva
  const validateBookingData = (booking: Booking) => {
    if (!booking.rooms?.name) {
      console.warn('Reserva sin nombre de sala:', booking.id);
      return false;
    }
    if (!booking.start_time || !booking.end_time) {
      console.warn('Reserva sin fechas válidas:', booking.id);
      return false;
    }
    return true;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.replace('/(auth)');
      return;
    }
    
    loadBookings();

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Cambio detectado en tiempo real, recargando bookings...');
          loadBookings();
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mounted]);

  const loadBookings = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('Cargando reservas para usuario:', user.id);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name, description)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      console.log('Reservas cargadas exitosamente:', data?.length || 0);
      // Validar datos antes de establecer el estado
      const validatedBookings = (data || []).filter(validateBookingData);
      setBookings(validatedBookings);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    console.log('Iniciando pull-to-refresh...');
    setRefreshing(true);
    await loadBookings();
  };

  const showDeleteNotification = () => {
    setShowDeleteMessage(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteMessage(false);
    });
  };

  const openCancelModal = (booking: Booking) => {
    // Validaciones antes de abrir el modal
    if (booking.status !== 'pending') {
      Alert.alert('Error', 'Solo puedes cancelar reservas pendientes');
      return;
    }

    // Validar que la reserva no haya comenzado
    const startDate = new Date(booking.start_time);
    const now = new Date();
    if (startDate <= now) {
      Alert.alert('Error', 'No puedes cancelar una reserva que ya ha comenzado');
      return;
    }

    setSelectedBooking(booking);
    setCancelModalVisible(true);
  };

  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setSelectedBooking(null);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking || !user || !user.id) {
      Alert.alert('Error', 'Datos de reserva inválidos');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Actualizar la lista localmente sin recargar
      setBookings(prev => prev.filter(booking => booking.id !== selectedBooking.id));
      
      // Mostrar mensaje flotante de éxito
      showDeleteNotification();
      
      closeCancelModal();
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'No se pudo cancelar la reserva: ' + error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#00FF87" />;
      case 'rejected':
        return <XCircle size={20} color="#FF6B9D" />;
      default:
        return <AlertCircle size={20} color="#FFB800" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#00FF87';
      case 'rejected':
        return '#FF6B9D';
      default:
        return '#FFB800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Hora inválida';
      }
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Hora inválida';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    if (!validateBookingData(item)) {
      return null; // No renderizar reservas inválidas
    }

    const startDate = new Date(item.start_time);
    const endDate = new Date(item.end_time);
    const isPast = endDate < new Date();
    const canCancel = item.status === 'pending' && !isPast;

    return (
      <View style={[styles.bookingCard, isPast && styles.pastBooking]}>
        <View style={styles.bookingHeader}>
          <Text style={styles.roomName}>
            {item.rooms?.name || 'Sala no disponible'}
          </Text>
          <View
            style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}
          >
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#00FFFF" />
            <Text style={styles.detailText}>
              {formatDate(item.start_time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color="#00FFFF" />
            <Text style={styles.detailText}>
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notas:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {item.admin_notes && (
          <View style={styles.adminNotesContainer}>
            <Text style={styles.adminNotesLabel}>Respuesta del administrador:</Text>
            <Text style={styles.adminNotesText}>{item.admin_notes}</Text>
          </View>
        )}

        {canCancel && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => openCancelModal(item)}
          >
            <Trash2 size={16} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Cancelar reserva</Text>
          </TouchableOpacity>
        )}

        {isPast && (
          <View style={styles.pastIndicator}>
            <Text style={styles.pastIndicatorText}>Reserva finalizada</Text>
          </View>
        )}
      </View>
    );
  };

  if (!mounted) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con título CENTRADO */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Reservas</Text>
          <Text style={styles.subtitle}>Gestiona tus solicitudes de reserva</Text>
        </View>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={64} color="#8C8C8C" />
          <Text style={styles.emptyTitle}>No tienes reservas</Text>
          <Text style={styles.emptySubtitle}>
            Ve a la pestaña de Salas para hacer tu primera reserva
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E50914', '#00FF87', '#00FFFF']}
              tintColor="#00FFFF"
              title="Actualizando reservas..."
              titleColor="#00FFFF"
            />
          }
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/admin/bookings')}
        >
          <Crown size={20} color="#FFD700" />
          <Text style={styles.adminButtonText}>Panel de Administrador</Text>
        </TouchableOpacity>
      )}

      {/* Footer con leyenda mejorada y colores neon */}
      <View style={styles.footer}>
        <View style={styles.heartContainer}>
          <Heart size={16} color="#FF0080" fill="#FF0080" />
        </View>
        <Text style={styles.watermark}>
          <Text style={styles.watermarkPrefix}>Desarrollado con ♥️ por </Text>
          <Text style={styles.watermarkName}>Jose Pablo Miranda Quintanilla</Text>
        </Text>
        <Text style={styles.versionText}>v2.1.0 • Build 347</Text>
      </View>

      {/* Modal de Confirmación de Cancelación Mejorado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={closeCancelModal}
      >
        <TouchableWithoutFeedback onPress={closeCancelModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <AlertCircle size={32} color="#FF6B6B" />
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={closeCancelModal}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    ¿Cancelar Reserva?
                  </Text>
                  
                  <Text style={styles.modalSubtitle}>
                    Esta acción no se puede deshacer
                  </Text>

                  {selectedBooking && (
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingInfoLabel}>Sala:</Text>
                      <Text style={styles.bookingInfoValue}>
                        {selectedBooking.rooms?.name}
                      </Text>
                      
                      <Text style={styles.bookingInfoLabel}>Fecha:</Text>
                      <Text style={styles.bookingInfoValue}>
                        {formatDate(selectedBooking.start_time)}
                      </Text>
                      
                      <Text style={styles.bookingInfoLabel}>Horario:</Text>
                      <Text style={styles.bookingInfoValue}>
                        {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.warningBox}>
                    <AlertCircle size={20} color="#FFB800" />
                    <Text style={styles.warningText}>
                      Al cancelar, esta sala quedará disponible para otros usuarios
                    </Text>
                  </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeCancelModal}
                  >
                    <Text style={styles.cancelButtonText}>Mantener Reserva</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmCancelBooking}
                  >
                    <Trash2 size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Sí, Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Mensaje Flotante de Eliminación Exitosa */}
      {showDeleteMessage && (
        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <View style={styles.successContent}>
            <CheckCircle size={24} color="#000000" />
            <Text style={styles.successText}>¡Reserva cancelada exitosamente!</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  loadingText: {
    color: '#00FF87',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#E50914',
    marginBottom: 8,
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#00FF87',
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  bookingCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pastBooking: {
    opacity: 0.7,
    borderColor: '#8C8C8C',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '600',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  notesContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  adminNotesContainer: {
    backgroundColor: '#1A2A3A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00FF87',
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF87',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E50914',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pastIndicator: {
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  pastIndicatorText: {
    color: '#8C8C8C',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E50914',
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#00FFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  refreshButton: {
    backgroundColor: '#00FF87',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#00FFFF',
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  adminButton: {
    backgroundColor: '#E50914',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#2A2A2A',
  },
  heartContainer: {
    marginBottom: 8,
  },
  watermark: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  watermarkPrefix: {
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontStyle: 'italic',
  },
  watermarkName: {
    color: '#FF0080',
    fontWeight: '700',
    textShadowColor: '#FF0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  versionText: {
    fontSize: 10,
    color: '#FFB800',
    fontWeight: '600',
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginTop: 4,
  },
  // Estilos del Modal Mejorado
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E50914',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: '#E50914',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#FF6B6B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  bookingInfo: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00FF87',
  },
  bookingInfoLabel: {
    fontSize: 12,
    color: '#00FF87',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  bookingInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  warningText: {
    fontSize: 14,
    color: '#FFB800',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderTopWidth: 2,
    borderTopColor: '#2A2A2A',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#00FFFF',
  },
  confirmButton: {
    backgroundColor: '#E50914',
    borderColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Mensaje Flotante de Eliminación Exitosa
  successMessage: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#00FF87', // Color neon verde brillante
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#00FFFF', // Borde cyan para más contraste
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 1000,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000', // Texto negro para máximo contraste
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
});