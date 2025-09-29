import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@/src/contexts/UserContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiService } from '../../src/services/api';

interface ApiAppointment {
  id: number;
  patient_user_id: number;
  user_id: number;
  appointment_date_time: string;
  reason: string;
  status: string;
}

interface Appointment extends ApiAppointment {
  date: string;
  time: string;
  doctorName: string;
  patientName: string;
}

const AppointmentsScreen: React.FC = () => {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState(new Date());
  const [editReason, setEditReason] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const role = user?.role;
  const userId = user?.id?.toString();

  console.log('Role:', role, 'UserId:', userId);

  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;
      const fetchAppointments = async () => {
        try {
          const response = await apiService.getAppointments();
          if (response.success) {
            const apiAppointments: ApiAppointment[] = response.data as ApiAppointment[];
            // Filter appointments based on role
            let filtered = apiAppointments;
            console.log('Filtering appointments - userId:', userId, 'type:', typeof userId);
            if (role === 'patient') {
              filtered = apiAppointments.filter((apt) => apt.patient_user_id === parseInt(userId));
            } else {
              filtered = apiAppointments.filter((apt) => apt.user_id === parseInt(userId));
            }
            filtered = filtered.filter((apt) => apt.status === 'scheduled');
            // Map to display format
            const displayAppointments: Appointment[] = filtered.map((apt) => {
              const dateTime = new Date(apt.appointment_date_time);
              return {
                ...apt,
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString(),
                doctorName: `Doctor ${apt.user_id}`,
                patientName: `Patient ${apt.patient_user_id}`,
              };
            });
            setAppointments(displayAppointments);
          }
        } catch (error) {
          console.error('Failed to fetch appointments', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAppointments();
    }, [role, userId])
  );

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const dateTime = new Date(appointment.appointment_date_time);
    setEditDate(dateTime);
    setEditTime(dateTime);
    setEditReason(appointment.reason);
    setEditStatus(appointment.status);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingAppointment || !userId) return;
    setUpdating(true);
    try {
      const dateStr = editDate.toISOString().split('T')[0];
      const timeStr = editTime.toTimeString().split(' ')[0].substring(0, 5);
      const appointmentDateTime = `${dateStr} ${timeStr}`;
      const response = await apiService.updateAppointment(editingAppointment.id.toString(), {
        patient_user_id: editingAppointment.patient_user_id,
        user_id: editingAppointment.user_id,
        appointment_date_time: appointmentDateTime,
        reason: editReason,
        status: editStatus,
      });
      setUpdating(false);
      if (response.success) {
        Alert.alert('Success', 'Appointment updated');
        setModalVisible(false);
        // Refresh the list
        const fetchResponse = await apiService.getAppointments();
        if (fetchResponse.success) {
          const apiAppointments: ApiAppointment[] = fetchResponse.data as ApiAppointment[];
          let filtered = apiAppointments;
          if (role === 'patient') {
            filtered = apiAppointments.filter((apt) => apt.patient_user_id === parseInt(userId));
          } else {
            filtered = apiAppointments.filter((apt) => apt.user_id === parseInt(userId));
          }
          filtered = filtered.filter((apt) => apt.status === 'scheduled');
          const displayAppointments: Appointment[] = filtered.map((apt) => {
            const dateTime = new Date(apt.appointment_date_time);
            return {
              ...apt,
              date: dateTime.toLocaleDateString(),
              time: dateTime.toLocaleTimeString(),
              doctorName: `Doctor ${apt.user_id}`,
              patientName: `Patient ${apt.patient_user_id}`,
            };
          });
          setAppointments(displayAppointments);
        }
      } else {
        Alert.alert('Failed', response.message);
      }
    } catch (error) {
      setUpdating(false);
      Alert.alert('Error', 'Failed to update appointment ' + error);
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    if (!userId) return;
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteAppointment(appointment.id.toString());
              if (response.success) {
                Alert.alert('Success', 'Appointment deleted');
                // Refresh the list
                const fetchResponse = await apiService.getAppointments();
                if (fetchResponse.success) {
                  const apiAppointments: ApiAppointment[] = fetchResponse.data as ApiAppointment[];
                  let filtered = apiAppointments;
                  if (role === 'patient') {
                    filtered = apiAppointments.filter((apt) => apt.patient_user_id === parseInt(userId));
                  } else {
                    filtered = apiAppointments.filter((apt) => apt.user_id === parseInt(userId));
                  }
                  filtered = filtered.filter((apt) => apt.status === 'scheduled');
                  const displayAppointments: Appointment[] = filtered.map((apt) => {
                    const dateTime = new Date(apt.appointment_date_time);
                    return {
                      ...apt,
                      date: dateTime.toLocaleDateString(),
                      time: dateTime.toLocaleTimeString(),
                      doctorName: `Doctor ${apt.user_id}`,
                      patientName: `Patient ${apt.patient_user_id}`,
                    };
                  });
                  setAppointments(displayAppointments);
                }
              } else {
                Alert.alert('Failed', response.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete appointment ' + error);
            }
          },
        },
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const isExpanded = item.id === expandedId;
    return (
      <TouchableOpacity style={styles.appointmentItem} onPress={() => setExpandedId(isExpanded ? null : item.id)}>
        <Text style={styles.date}>{item.date} at {item.time}</Text>
        <Text style={styles.details}>
          {role === 'patient' ? `Doctor: ${item.doctorName}` : `Patient: ${item.patientName}`}
        </Text>
        {isExpanded && (
          <>
            <Text style={styles.status}>Status: {item.status}</Text>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Appointments</Text>
      {role === 'patient' && (
        <TouchableOpacity style={styles.createButton} onPress={() => router.push(`/create-appointment?userId=${userId}` as any)}>
          <Text style={styles.createButtonText}>Create New Appointment</Text>
        </TouchableOpacity>
      )}
      {loading ? (
        <Text style={styles.noAppointments}>Loading...</Text>
      ) : appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No upcoming appointments</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAppointment}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Appointment</Text>

          <Text style={styles.label}>Date:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ fontSize: 16, color: '#000' }}>{editDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Time:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ fontSize: 16, color: '#000' }}>{editTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Reason"
            value={editReason}
            onChangeText={setEditReason}
            multiline
          />

          <Text style={styles.label}>Status:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={editStatus}
              onValueChange={(itemValue) => setEditStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="scheduled" value="scheduled" />
              <Picker.Item label="finished" value="finished" />
              <Picker.Item label="cancelled" value="cancelled" />
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.button, updating && { backgroundColor: '#9ac5cc' }]}
            onPress={handleUpdate}
            disabled={updating}
          >
            <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Appointment'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ccc' }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={editDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setEditDate(date);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={editTime}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) setEditTime(date);
              }}
            />
          )}
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbfc',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006d77',
    marginBottom: 16,
    textAlign: 'center',
  },
  appointmentItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#006d77',
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noAppointments: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  createButton: {
    backgroundColor: '#00a896',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#00a896',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flexGrow: 1,
    backgroundColor: '#f6fbfc',
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006d77',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  button: {
    width: '100%',
    backgroundColor: '#00a896',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AppointmentsScreen;