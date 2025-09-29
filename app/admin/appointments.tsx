import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
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

const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    patient_user_id: '',
    user_id: '',
    appointment_date_time: '',
    reason: '',
    status: '',
  });

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async () => {
    try {
      const response = await apiService.createAppointment({
        patient_user_id: parseInt(formData.patient_user_id),
        user_id: parseInt(formData.user_id),
        appointment_date_time: formData.appointment_date_time,
        reason: formData.reason,
        status: formData.status,
      });
      if (response.success) {
        Alert.alert('Success', 'Appointment created successfully');
        setModalVisible(false);
        setFormData({
          patient_user_id: '',
          user_id: '',
          appointment_date_time: '',
          reason: '',
          status: '',
        });
        fetchAppointments();
      } else {
        Alert.alert('Error', response.message || 'Failed to create appointment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create appointment' + error);
    }
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
    </View>
  );

  return (
    <View style={styles.content}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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
            <Text style={styles.modalHeader}>Add New Appointment</Text>
            <TextInput
              style={styles.input}
              placeholder="Patient User ID"
              value={formData.patient_user_id}
              onChangeText={(text) => setFormData({ ...formData, patient_user_id: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Doctor User ID"
              value={formData.user_id}
              onChangeText={(text) => setFormData({ ...formData, user_id: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Date Time (YYYY-MM-DD HH:MM:SS)"
              value={formData.appointment_date_time}
              onChangeText={(text) => setFormData({ ...formData, appointment_date_time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Status"
              value={formData.status}
              onChangeText={(text) => setFormData({ ...formData, status: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateAppointment}>
                <Text style={styles.submitButtonText}>Create</Text>
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
});

export default AppointmentsScreen;