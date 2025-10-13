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
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, Trash2, Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  rooms: { name: string; description: string };
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
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
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mounted]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name, description)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string, status: string) => {
    if (status !== 'pending') {
      Alert.alert('Error', 'Solo puedes cancelar reservas pendientes');
      return;
    }

    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

              if (error) throw error;
              loadBookings();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
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

  const renderBooking = ({ item }: { item: Booking }) => {
    const startDate = new Date(item.start_time);
    const endDate = new Date(item.end_time);
    const isPast = endDate < new Date();

    return (
      <View style={[styles.bookingCard, isPast && styles.pastBooking]}>
        <View style={styles.bookingHeader}>
          <Text style={styles.roomName}>{item.rooms.name}</Text>
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
              {startDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color="#00FFFF" />
            <Text style={styles.detailText}>
              {startDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {endDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
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

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteBooking(item.id, item.status)}
          >
            <Trash2 size={16} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Cancelar reserva</Text>
          </TouchableOpacity>
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
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/admin/bookings')}
        >
          <Text style={styles.adminButtonText}>Ver panel de administrador</Text>
        </TouchableOpacity>
      )}

      {/* Footer con leyenda del desarrollador */}
      <View style={styles.footer}>
        <View style={styles.heartContainer}>
          <Heart size={14} color="#E50914" fill="#E50914" />
        </View>
        <Text style={styles.watermark}>
          Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
        </Text>
      </View>
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
    opacity: 0.6,
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
  adminButton: {
    backgroundColor: '#E50914',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
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
    fontSize: 12,
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#4ecdc4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontStyle: 'italic',
  },
});