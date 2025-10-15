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
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Heart, X, Zap } from 'lucide-react-native';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  profiles: { full_name: string };
  rooms: { name: string };
};

const { width, height } = Dimensions.get('window');

export default function RoomDetailsScreen() {
  const { id, name } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [startAmPm, setStartAmPm] = useState('AM');
  const [endTime, setEndTime] = useState('10:00');
  const [endAmPm, setEndAmPm] = useState('AM');
  const [duration, setDuration] = useState('1');
  const [notes, setNotes] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalType, setTimeModalType] = useState<'start' | 'end'>('start');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  const router = useRouter();

  // Convertir hora 12h a 24h
  const convertTo24Hour = (time: string, amPm: string) => {
    let [hours, minutes] = time.split(':').map(Number);
    
    if (amPm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (amPm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Convertir hora 24h a 12h
  const convertTo12Hour = (time24: string) => {
    let [hours, minutes] = time24.split(':').map(Number);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      amPm
    };
  };

  useEffect(() => {
    setMounted(true);
    // Inicializar horas en formato 12h
    const start12h = convertTo12Hour(startTime);
    setStartTime(start12h.time);
    setStartAmPm(start12h.amPm);
    
    const end12h = convertTo12Hour(endTime);
    setEndTime(end12h.time);
    setEndAmPm(end12h.amPm);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadBookings();
  }, [selectedDate, mounted]);

  // Calcular duración automáticamente
  useEffect(() => {
    const start24h = convertTo24Hour(startTime, startAmPm);
    const end24h = convertTo24Hour(endTime, endAmPm);
    
    const startDate = new Date(`${selectedDate}T${start24h}`);
    const endDate = new Date(`${selectedDate}T${end24h}`);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours > 0) {
      setDuration(diffHours.toFixed(1));
    }
  }, [startTime, startAmPm, endTime, endAmPm]);

  const showSuccessNotification = () => {
    setShowSuccessMessage(true);
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
      setShowSuccessMessage(false);
    });
  };

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

  const isTimeSlotAvailable = (startTime24: string, endTime24: string): boolean => {
    const requestedStart = new Date(`${selectedDate}T${startTime24}`);
    const requestedEnd = new Date(`${selectedDate}T${endTime24}`);

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

  const openTimeModal = (type: 'start' | 'end') => {
    setTimeModalType(type);
    setTimeModalVisible(true);
  };

  const closeTimeModal = () => {
    setTimeModalVisible(false);
  };

  const selectTime = (hours: number, minutes: number, amPm: string) => {
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    if (timeModalType === 'start') {
      setStartTime(time);
      setStartAmPm(amPm);
    } else {
      setEndTime(time);
      setEndAmPm(amPm);
    }
    
    closeTimeModal();
  };

  const openConfirmModal = () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para realizar una reserva');
      return;
    }

    const start24h = convertTo24Hour(startTime, startAmPm);
    const end24h = convertTo24Hour(endTime, endAmPm);
    
    const startDateTime = new Date(`${selectedDate}T${start24h}`);
    const endDateTime = new Date(`${selectedDate}T${end24h}`);

    if (startDateTime >= endDateTime) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de finalización');
      return;
    }

    if (startDateTime < new Date()) {
      Alert.alert('Error', 'No puedes reservar en el pasado');
      return;
    }

    if (!isTimeSlotAvailable(start24h, end24h)) {
      Alert.alert('Error', 'Este horario no está disponible');
      return;
    }

    setConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

  const handleBooking = async () => {
    if (!user) return;

    const start24h = convertTo24Hour(startTime, startAmPm);
    const end24h = convertTo24Hour(endTime, endAmPm);
    
    const startDateTime = new Date(`${selectedDate}T${start24h}`);
    const endDateTime = new Date(`${selectedDate}T${end24h}`);

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

      closeConfirmModal();
      showSuccessNotification();
      
      // Redirigir después de mostrar el mensaje de éxito
      setTimeout(() => {
        router.back();
      }, 3500);
      
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
        return <XCircle size={16} color="#FF6B9D" />;
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
        return '#FF6B9D';
      default:
        return '#FFB800';
    }
  };

  const formatDisplayDate = (dateString: string) => {
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({ hour, minute });
      }
    }
    return slots;
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
        {/* Formulario de Reserva */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Fecha y Hora</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📅 Fecha</Text>
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
              <Text style={styles.label}>⏰ Hora de Inicio</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openTimeModal('start')}
              >
                <Text style={styles.timeInputText}>
                  {startTime} {startAmPm}
                </Text>
                <Clock size={20} color="#00FFFF" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.ml12]}>
              <Text style={styles.label}>⏱️ Hora de Finalización</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openTimeModal('end')}
              >
                <Text style={styles.timeInputText}>
                  {endTime} {endAmPm}
                </Text>
                <Clock size={20} color="#00FFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>⏳ Duración (horas)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="1.0"
              placeholderTextColor="#8C8C8C"
              keyboardType="decimal-pad"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📝 Notas (opcional)</Text>
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
            {isTimeSlotAvailable(
              convertTo24Hour(startTime, startAmPm), 
              convertTo24Hour(endTime, endAmPm)
            ) ? (
              <View style={styles.availableTag}>
                <Zap size={20} color="#00FF87" />
                <Text style={styles.availableText}>¡Horario Disponible!</Text>
              </View>
            ) : (
              <View style={styles.unavailableTag}>
                <XCircle size={20} color="#FF6B9D" />
                <Text style={styles.unavailableText}>Horario No Disponible</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              (!isTimeSlotAvailable(
                convertTo24Hour(startTime, startAmPm), 
                convertTo24Hour(endTime, endAmPm)
              )) && styles.bookButtonDisabled,
            ]}
            onPress={openConfirmModal}
            disabled={!isTimeSlotAvailable(
              convertTo24Hour(startTime, startAmPm), 
              convertTo24Hour(endTime, endAmPm)
            )}
          >
            <Text style={styles.bookButtonText}>
              🚀 Solicitar Reserva
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reservas del Día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Reservas del Día</Text>
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
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(booking.status) }]}>
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

        {/* Footer del desarrollador con tema neon */}
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
      </ScrollView>

      {/* Modal de Selección de Hora */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timeModalVisible}
        onRequestClose={closeTimeModal}
      >
        <View style={styles.timeModalOverlay}>
          <View style={styles.timeModalContainer}>
            <View style={styles.timeModalHeader}>
              <Text style={styles.timeModalTitle}>
                Seleccionar {timeModalType === 'start' ? 'Hora de Inicio' : 'Hora de Finalización'}
              </Text>
              <TouchableOpacity onPress={closeTimeModal}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeSelector}>
              <ScrollView style={styles.timeScrollView}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnTitle}>AM</Text>
                  {generateTimeSlots().map((slot, index) => (
                    <TouchableOpacity
                      key={`am-${index}`}
                      style={styles.timeSlot}
                      onPress={() => selectTime(slot.hour, slot.minute, 'AM')}
                    >
                      <Text style={styles.timeSlotText}>
                        {slot.hour}:{slot.minute.toString().padStart(2, '0')} AM
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnTitle}>PM</Text>
                  {generateTimeSlots().map((slot, index) => (
                    <TouchableOpacity
                      key={`pm-${index}`}
                      style={styles.timeSlot}
                      onPress={() => selectTime(slot.hour, slot.minute, 'PM')}
                    >
                      <Text style={styles.timeSlotText}>
                        {slot.hour}:{slot.minute.toString().padStart(2, '0')} PM
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Reserva */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={closeConfirmModal}
      >
        <TouchableWithoutFeedback onPress={closeConfirmModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <Calendar size={32} color="#00FFFF" />
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={closeConfirmModal}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Confirmar Reserva
                  </Text>
                  
                  <Text style={styles.modalSubtitle}>
                    Revisa los detalles de tu reserva
                  </Text>

                  <View style={styles.bookingSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Sala:</Text>
                      <Text style={styles.summaryValue}>{name}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Fecha:</Text>
                      <Text style={styles.summaryValue}>{formatDisplayDate(selectedDate)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Horario:</Text>
                      <Text style={styles.summaryValue}>
                        {startTime} {startAmPm} - {endTime} {endAmPm}
                      </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Duración:</Text>
                      <Text style={styles.summaryValue}>{duration} hora{duration !== '1.0' ? 's' : ''}</Text>
                    </View>

                    {notes && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Notas:</Text>
                        <Text style={styles.summaryValue}>{notes}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.warningBox}>
                    <AlertCircle size={20} color="#FFB800" />
                    <Text style={styles.warningText}>
                      Tu reserva será revisada por un administrador antes de ser confirmada
                    </Text>
                  </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeConfirmModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleBooking}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Mensaje Flotante de Éxito */}
      {showSuccessMessage && (
        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <View style={styles.successContent}>
            <CheckCircle size={24} color="#000000" />
            <Text style={styles.successText}>¡Reserva creada exitosamente!</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 40, // Aumentado el padding top
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E50914',
    marginTop: 10, // Añadido margen superior para bajar la flecha
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10, // Añadido margen superior para bajar título y subtítulo
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E50914',
    marginBottom: 4,
    textShadowColor: '#E50914',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#00FF87',
    fontWeight: '600',
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#1A1A1A',
    padding: 24,
    margin: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 16,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFB800',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FFFF',
    marginBottom: 8,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#404040',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#404040',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
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
    alignItems: 'center',
  },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FF87',
  },
  availableText: {
    color: '#00FF87',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  unavailableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  unavailableText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: '#FF6B9D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bookButton: {
    backgroundColor: '#E50914',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#8C8C8C',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#404040',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  bookingNotes: {
    fontSize: 14,
    color: '#FFB800',
    fontStyle: 'italic',
    fontWeight: '600',
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#2A2A2A',
    marginTop: 10,
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
  // Estilos del Modal de Selección de Hora
  timeModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeModalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 3,
    borderColor: '#00FFFF',
    maxHeight: '70%',
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2A2A2A',
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  timeSelector: {
    flexDirection: 'row',
  },
  timeScrollView: {
    maxHeight: 400,
  },
  timeColumn: {
    flex: 1,
    padding: 10,
  },
  timeColumnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFB800',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  timeSlot: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos del Modal de Confirmación
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
    borderColor: '#00FF87',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 255, 135, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: '#00FF87',
  },
  modalIconContainer: {
    padding: 8,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  modalCloseButton: {
    padding: 4,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00FF87',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  bookingSummary: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#404040',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB800',
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    flex: 2,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
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
    textShadowRadius: 6,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#2A2A2A',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#404040',
  },
  confirmButton: {
    backgroundColor: '#00FF87',
    borderWidth: 2,
    borderColor: '#00FF87',
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Estilos del Mensaje Flotante de Éxito - ACTUALIZADO
  successMessage: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80, // Posicionado más abajo
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