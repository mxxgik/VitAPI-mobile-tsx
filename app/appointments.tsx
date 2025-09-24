import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Appointment, getAppointmentsForUser } from '../src/data/appointments';

const AppointmentsScreen: React.FC = () => {
  const { role } = useLocalSearchParams<{ role: string }>();

  // Mock user names for demo
  const userName = role === 'patient' ? 'John Doe' : 'Dr. Smith';

  const appointments = getAppointmentsForUser(role as 'patient' | 'doctor', userName);

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
      {appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No upcoming appointments</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
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
});

export default AppointmentsScreen;