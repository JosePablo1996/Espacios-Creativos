import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Heart } from 'lucide-react-native';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  profiles: { full_name: string };
  rooms: { name: string };
};

const { width, height } = Dimensions.get('window');

export default function RoomDetailsScreen() {
  const { id, name } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState('1');
  const [notes, setNotes] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadBookings();
  }, [selectedDate, mounted]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (full_name),
          rooms (name)
        `)
        .eq('room_id', id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotAvailable = (time: string, durationHours: number): boolean => {
    const requestedStart = new Date(`${selectedDate}T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + durationHours * 60 * 60 * 1000);

    return !bookings.some((booking) => {
      if (booking.status === 'rejected') return false;

      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);

      return (
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
      );
    });
  };

  const handleBooking = async () => {
    if (!user) return;

    const durationHours = parseFloat(duration);
    if (isNaN(durationHours) || durationHours <= 0) {
      Alert.alert('Error', 'Por favor ingresa una duración válida');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    if (startDateTime < new Date()) {
      Alert.alert('Error', 'No puedes reservar en el pasado');
      return;
    }

    if (!isTimeSlotAvailable(selectedTime, durationHours)) {
      Alert.alert('Error', 'Este horario no está disponible');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        room_id: id as string,
        user_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: notes.trim(),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud de reserva ha sido enviada. Espera la aprobación del administrador.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color="#00FF87" />;
      case 'rejected':
        return <XCircle size={16} color="#FF0000" />;
      default:
        return <AlertCircle size={16} color="#FFB800" />;
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
        return '#FF0000';
      default:
        return '#FFB800';
    }
  };

  if (!mounted) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#E50914" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>Reservar Sala</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Fecha y Hora</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha</Text>
            <TextInput
              style={styles.input}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8C8C8C"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Hora de Inicio</Text>
              <TextInput
                style={styles.input}
                value={selectedTime}
                onChangeText={setSelectedTime}
                placeholder="HH:MM"
                placeholderTextColor="#8C8C8C"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.ml12]}>
              <Text style={styles.label}>Duración (horas)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="1"
                placeholderTextColor="#8C8C8C"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Propósito de la reunión..."
              placeholderTextColor="#8C8C8C"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.availabilityCheck}>
            {isTimeSlotAvailable(selectedTime, parseFloat(duration) || 0) ? (
              <View style={styles.availableTag}>
                <CheckCircle size={20} color="#00FF87" />
                <Text style={styles.availableText}>Disponible</Text>
              </View>
            ) : (
              <View style={styles.unavailableTag}>
                <XCircle size={20} color="#FF0000" />
                <Text style={styles.unavailableText}>No disponible</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              (submitting || !isTimeSlotAvailable(selectedTime, parseFloat(duration) || 0)) &&
                styles.bookButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={submitting || !isTimeSlotAvailable(selectedTime, parseFloat(duration) || 0)}
          >
            <Text style={styles.bookButtonText}>
              {submitting ? 'Enviando solicitud...' : 'Solicitar Reserva'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservas del Día</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#E50914" />
          ) : bookings.length === 0 ? (
            <Text style={styles.emptyText}>No hay reservas para este día</Text>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTime}>
                    {new Date(booking.start_time).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(booking.end_time).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(booking.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>
                {booking.notes && <Text style={styles.bookingNotes}>{booking.notes}</Text>}
              </View>
            ))
          )}
        </View>

        {/* Footer del desarrollador */}
        <View style={styles.footer}>
          <Text style={styles.watermark}>
            Desarrollado con <Heart size={12} color="#FF6B9D" /> por Jose Pablo Miranda Quintanilla
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E50914',
    marginBottom: 4,
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#1F1F1F',
    padding: 20,
    margin: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml12: {
    marginLeft: 12,
  },
  availabilityCheck: {
    marginBottom: 20,
  },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#00FF87',
  },
  availableText: {
    color: '#00FF87',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  unavailableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  unavailableText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  bookButton: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  bookingCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  bookingNotes: {
    fontSize: 14,
    color: '#8C8C8C',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  watermark: {
    fontSize: 12,
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});