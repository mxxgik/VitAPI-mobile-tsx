import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
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

    fetchAppointments();
  }, []);

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
      <Text style={styles.header}>Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No appointments found</Text>}
      />
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
});

export default AppointmentsScreen;