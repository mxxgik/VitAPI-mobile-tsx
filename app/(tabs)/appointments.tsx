import { useUser } from '@/src/contexts/UserContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
            // Filter for upcoming appointments (future dates)
            const now = new Date();
            filtered = filtered.filter((apt) => new Date(apt.appointment_date_time) > now);
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

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentItem}>
      <Text style={styles.date}>{item.date} at {item.time}</Text>
      <Text style={styles.details}>
        {role === 'patient' ? `Doctor: ${item.doctorName}` : `Patient: ${item.patientName}`}
      </Text>
      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

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
});

export default AppointmentsScreen;