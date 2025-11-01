import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Appointment } from '../hooks/useAppointments';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';
import { handleApiError, showSuccessMessage } from '../utils/errorHandler';

interface AppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  isEditing: boolean;
  onSuccess: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible,
  onClose,
  appointment,
  isEditing,
  onSuccess,
}) => {
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState(new Date());
  const [editReason, setEditReason] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [updating, setUpdating] = useState(false);

  React.useEffect(() => {
    if (appointment && visible) {
      const dateTime = new Date(appointment.appointment_date_time + 'Z'); // Treat as UTC
      setEditDate(dateTime);
      setEditTime(dateTime);
      setEditReason(appointment.reason);
      setEditStatus(appointment.status);
    }
  }, [appointment, visible]);

  const handleUpdate = async () => {
    if (!appointment) return;
    setUpdating(true);
    try {
      const dateStr = `${editDate.getUTCFullYear()}-${String(editDate.getUTCMonth() + 1).padStart(2, '0')}-${String(editDate.getUTCDate()).padStart(2, '0')}`;
      const timeStr = editTime.toISOString().split('T')[1].substring(0, 5);
      const appointmentDateTime = `${dateStr} ${timeStr}`;
      const response = await apiService.updateAppointment(appointment.id.toString(), {
        patient_user_id: appointment.patient_user_id,
        user_id: appointment.user_id,
        appointment_date_time: appointmentDateTime,
        reason: editReason,
        status: editStatus,
      });
      setUpdating(false);
      if (response.success) {
        showSuccessMessage('Appointment updated successfully');
        onClose();
        onSuccess();
      } else {
        Alert.alert('Failed', response.message);
      }
    } catch (error) {
      setUpdating(false);
      handleApiError(error, 'Failed to update appointment');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Edit Appointment</Text>

        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="Select appointment date"
          accessibilityHint="Opens date picker"
        >
          <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.text }}>
            {editDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
          accessibilityLabel="Select appointment time"
          accessibilityHint="Opens time picker"
        >
          <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.text }}>
            {editTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Reason"
          value={editReason}
          onChangeText={setEditReason}
          multiline
          accessibilityLabel="Appointment reason"
        />

        <Text style={styles.label}>Status:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={editStatus}
            onValueChange={(itemValue) => setEditStatus(itemValue)}
            style={styles.picker}
            accessibilityLabel="Appointment status"
          >
            <Picker.Item label="scheduled" value="scheduled" />
            <Picker.Item label="finished" value="finished" />
            <Picker.Item label="cancelled" value="cancelled" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, updating && { backgroundColor: theme.colors.textLight }]}
          onPress={handleUpdate}
          disabled={updating}
          accessibilityLabel="Update appointment"
          accessibilityHint="Saves the appointment changes"
        >
          <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Appointment'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.border }]}
          onPress={onClose}
          accessibilityLabel="Cancel editing"
          accessibilityHint="Closes the modal without saving"
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    fontSize: theme.fontSize.md,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  picker: {
    height: 50,
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default AppointmentModal;