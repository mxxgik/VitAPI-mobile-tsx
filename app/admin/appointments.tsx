import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiService } from '../../src/services/api';

interface Appointment {
  id: number;
  patient_user_id: number;
  user_id: number;
  appointment_date_time: string;
  reason: string;
  status: string;
  user: {
    name: string;
    last_name: string;
  };
  patient: {
    name: string;
    last_name: string;
  };
}
interface Patient {
  id: number;
  name: string;
  last_name: string;
}

interface Doctor {
  id: number;
  name: string;
  last_name: string;
}

const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patient_user_id: '',
    user_id: '',
    reason: '',
    status: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const fetchAppointments = async () => {
    try {
      const response = await apiService.getAppointments();
      if (response.success) {
        setAppointments(response.data as Appointment[]);
      } else {
        setError(response.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      setError('Error fetching appointments' + error);
    } finally {
      setLoading(false);
    }
  };
  const fetchPatients = async () => {
    try {
      const response = await apiService.getPatients();
      if (response.success) {
        setPatients(response.data as Patient[]);
      }
    } catch (error) {
      console.error('Error fetching patients', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiService.getDoctors();
      if (response.success) {
        setDoctors(response.data as Doctor[]);
      }
    } catch (error) {
      console.error('Error fetching doctors', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }, [])
  );

  const handleSubmitAppointment = async () => {
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const timeStr = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      const appointmentDateTime = `${dateStr} ${timeStr}`;
      const appointmentData = {
        patient_user_id: parseInt(formData.patient_user_id),
        user_id: parseInt(formData.user_id),
        appointment_date_time: appointmentDateTime,
        reason: formData.reason,
        status: formData.status,
      };
      const response = isEditing && editingItem
        ? await apiService.updateAppointment(editingItem.id.toString(), appointmentData)
        : await apiService.createAppointment(appointmentData);
      if (response.success) {
        Alert.alert('Success', `Appointment ${isEditing ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setIsEditing(false);
        setEditingItem(null);
        setFormData({
          patient_user_id: '',
          user_id: '',
          reason: '',
          status: '',
        });
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setShowDatePicker(false);
        setShowTimePicker(false);
        fetchAppointments();
      } else {
        Alert.alert('Error', response.message || `Failed to ${isEditing ? 'update' : 'create'} appointment`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} appointment ` + error);
    }
  };

  const handleEditAppointment = (item: Appointment) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      patient_user_id: item.patient_user_id.toString(),
      user_id: item.user_id.toString(),
      reason: item.reason,
      status: item.status,
    });
    const dateTime = new Date(item.appointment_date_time);
    setSelectedDate(dateTime);
    setSelectedTime(dateTime);
    setModalVisible(true);
  };

  const handleDeleteAppointment = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteAppointment(id.toString());
              if (response.success) {
                Alert.alert('Success', 'Appointment deleted successfully');
                fetchAppointments();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete appointment');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete appointment' + error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#006d77" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>
        {item.patient.name} {item.patient.last_name} - {item.user.name} {item.user.last_name}
      </Text>
      <Text>Date: {new Date(item.appointment_date_time).toLocaleString()}</Text>
      <Text>Reason: {item.reason}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditAppointment(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAppointment(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.content}>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setIsEditing(false);
        setEditingItem(null);
        setFormData({
          patient_user_id: '',
          user_id: '',
          reason: '',
          status: '',
        });
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>Add New Appointment</Text>
      </TouchableOpacity>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No appointments found</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{isEditing ? 'Edit Appointment' : 'Add New Appointment'}</Text>
            <Picker
              selectedValue={formData.patient_user_id}
              onValueChange={(itemValue) => setFormData({ ...formData, patient_user_id: itemValue })}
            >
              <Picker.Item label="Select Patient" value="" />
              {patients.map((patient) => (
                <Picker.Item key={patient.id} label={`${patient.name} ${patient.last_name}`} value={patient.id.toString()} />
              ))}
            </Picker>
            <Picker
              selectedValue={formData.user_id}
              onValueChange={(itemValue) => setFormData({ ...formData, user_id: itemValue })}
              style={styles.input}
            >
              <Picker.Item label="Select Doctor" value="" />
              {doctors.map((doctor) => (
                <Picker.Item key={doctor.id} label={`${doctor.name} ${doctor.last_name}`} value={doctor.id.toString()} />
              ))}
            </Picker>
            <Text style={styles.label}>Date:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ fontSize: 16, color: '#000' }}>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Time:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={{ fontSize: 16, color: '#000' }}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
            />
            <Picker
              selectedValue={formData.status}
              onValueChange={(itemValue) => setFormData({ ...formData, status: itemValue })}
            >
              <Picker.Item label="Scheduled" value="scheduled" />
              <Picker.Item label="Cancelled" value="cancelled" />
              <Picker.Item label="Finished" value="finished" />
            </Picker>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    setSelectedTime(date);
                  }
                }}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAppointment}>
                <Text style={styles.submitButtonText}>{isEditing ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006d77',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#006d77',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#006d77',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  }
});

export default AppointmentsScreen;