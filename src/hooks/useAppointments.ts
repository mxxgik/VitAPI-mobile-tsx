import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export interface ApiAppointment {
  id: number;
  patient_user_id: number;
  user_id: number;
  appointment_date_time: string;
  reason: string;
  status: string;
  user?: {
    name: string;
    last_name: string;
  };
  patient?: {
    name: string;
    last_name: string;
  };
}

export interface Appointment extends ApiAppointment {
  date: string;
  time: string;
  doctorName: string;
  patientName: string;
}

export const useAppointments = (userId?: string, role?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await apiService.getAppointments();
      if (response.success) {
        const apiAppointments: ApiAppointment[] = response.data as ApiAppointment[];
        let filtered = apiAppointments;
        if (role === 'patient') {
          filtered = apiAppointments.filter((apt) => apt.patient_user_id === parseInt(userId));
        } else {
          filtered = apiAppointments.filter((apt) => apt.user_id === parseInt(userId));
        }
        const displayAppointments: Appointment[] = filtered.map((apt) => {
          const dateTime = new Date(apt.appointment_date_time);
          return {
            ...apt,
            date: dateTime.toLocaleDateString(),
            time: dateTime.toLocaleTimeString(),
            doctorName: apt.user ? `${apt.user.name} ${apt.user.last_name}` : `Doctor ${apt.user_id}`,
            patientName: apt.patient ? `${apt.patient.name} ${apt.patient.last_name}` : `Patient ${apt.patient_user_id}`,
          };
        });
        setAppointments(displayAppointments);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const refreshAppointments = () => {
    setLoading(true);
    fetchAppointments();
  };

  return { appointments, loading, refreshAppointments };
};