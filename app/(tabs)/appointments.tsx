import { useUser } from '@/src/contexts/UserContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppointments, Appointment } from '../../src/hooks/useAppointments';
import AppointmentModal from '../../src/components/AppointmentModal';
import AppointmentItem from '../../src/components/AppointmentItem';
import { theme } from '../../src/styles/theme';

const AppointmentsScreen: React.FC = () => {
  const { user } = useUser();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const router = useRouter();

  const role = user?.role;
  const userId = user?.id?.toString();

  const { appointments, loading, refreshAppointments } = useAppointments(userId, role);

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setModalVisible(true);
  };

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <AppointmentItem
      item={item}
      role={role || ''}
      onExpand={handleExpand}
      isExpanded={item.id === expandedId}
      onEdit={openEditModal}
      onRefresh={refreshAppointments}
    />
  );

  return (
    <View style={styles.container}>
      {role === 'patient' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-appointment')}
          accessibilityLabel="Create new appointment"
          accessibilityHint="Opens the appointment creation screen"
        >
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

      <AppointmentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        appointment={editingAppointment}
        isEditing={true}
        onSuccess={refreshAppointments}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  createButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  noAppointments: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl * 2,
  },
});

export default AppointmentsScreen;