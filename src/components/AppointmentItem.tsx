import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { apiService } from '../services/api';
import { handleApiError, showSuccessMessage } from '../utils/errorHandler';
import { theme } from '../styles/theme';
import { Appointment } from '../hooks/useAppointments';

interface AppointmentItemProps {
  item: Appointment;
  role: string;
  onExpand: (id: number) => void;
  isExpanded: boolean;
  onEdit: (appointment: Appointment) => void;
  onRefresh: () => void;
}

const AppointmentItem: React.FC<AppointmentItemProps> = React.memo(({
  item,
  role,
  onExpand,
  isExpanded,
  onEdit,
  onRefresh,
}) => {
  AppointmentItem.displayName = 'AppointmentItem';
  const handleDelete = async (appointment: Appointment) => {
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
                showSuccessMessage('Appointment deleted successfully');
                onRefresh();
              } else {
                Alert.alert('Failed', response.message);
              }
            } catch (error) {
              handleApiError(error, 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => onExpand(item.id)}
      accessibilityLabel={`Appointment on ${item.date} at ${item.time}`}
      accessibilityHint="Tap to expand and show more details"
    >
      <Text style={styles.date}>{item.date} at {item.time}</Text>
      <Text style={styles.details}>
        {role === 'patient' ? `Doctor: ${item.doctorName}` : `Patient: ${item.patientName}`}
      </Text>
      {isExpanded && (
        <>
          <Text style={styles.status}>Status: {item.status}</Text>
          <Text style={styles.reason}>Reason: {item.reason}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(item)}
              accessibilityLabel="Edit appointment"
              accessibilityHint="Opens edit modal"
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              accessibilityLabel="Delete appointment"
              accessibilityHint="Shows confirmation dialog"
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  appointmentItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  date: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  details: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  status: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  reason: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default AppointmentItem;