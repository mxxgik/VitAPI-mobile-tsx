import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../src/contexts/UserContext';
import { apiService } from '../src/services/api';

interface Doctor {
  id: number;
  name: string;
  last_name: string;
  email: string;
}

const CreateAppointmentScreen: React.FC = () => {
  const { user } = useUser();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiService.getDoctors();
        console.log('API Response:', response);
        if (response.success) {
          console.log('Doctors data:', response.data);
          setDoctors(response.data as Doctor[]);
        } else {
          console.log('Response not successful:', response.message);
        }
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    console.log('Doctors state updated:', doctors);
  }, [doctors]);

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }

    // Validate that the appointment date and time is not in the past
    const now = new Date();
    const appointmentDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );
    if (appointmentDateTime < now) {
      Alert.alert('Invalid Date', 'Cannot schedule an appointment in the past');
      return;
    }

    setLoading(true);
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const timeStr = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      const appointmentDateTime = `${dateStr} ${timeStr}`;
      console.log('Appointment DateTime:', appointmentDateTime);
      const response = await apiService.createAppointment({
        patient_user_id: user.id,
        user_id: selectedDoctor,
        appointment_date_time: appointmentDateTime,
        reason,
        status: 'scheduled',
      });
      setLoading(false);
      if (response.success) {
        Alert.alert('Success', 'Appointment created');
        router.back();
      } else {
        Alert.alert('Failed', response.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create appointment' + error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Appointment</Text>

      <Text style={styles.label}>Select Doctor:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDoctor}
          onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a doctor" value={null} />
          {doctors.map((doctor) => (
            <Picker.Item key={doctor.id} label={`${doctor.name} ${doctor.last_name}`} value={doctor.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Date:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setShowDatePicker(true);
          console.log('Date picker opened');
        }}
      >
        <Text style={{ fontSize: 16, color: '#000' }}>{selectedDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Time:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setShowTimePicker(true);
          console.log('Time picker opened');
        }}
      >
        <Text style={{ fontSize: 16, color: '#000' }}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Reason"
        value={reason}
        onChangeText={setReason}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#9ac5cc' }]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Appointment'}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
              console.log('Date selected:', date);
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
              console.log('Time selected:', date);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f6fbfc',
    padding: 24,
  },
  title: {
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

export default CreateAppointmentScreen;