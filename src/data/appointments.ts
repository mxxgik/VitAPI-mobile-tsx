export interface Appointment {
  id: string;
  date: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '2025-09-25',
    time: '10:00 AM',
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    status: 'upcoming',
  },
  {
    id: '2',
    date: '2025-09-26',
    time: '2:00 PM',
    patientName: 'Jane Doe',
    doctorName: 'Dr. Smith',
    status: 'upcoming',
  },
  {
    id: '3',
    date: '2025-09-24',
    time: '11:00 AM',
    patientName: 'John Doe',
    doctorName: 'Dr. Johnson',
    status: 'completed',
  },
  {
    id: '4',
    date: '2025-09-27',
    time: '9:00 AM',
    patientName: 'Alice Brown',
    doctorName: 'Dr. Smith',
    status: 'upcoming',
  },
  {
    id: '5',
    date: '2025-09-28',
    time: '1:00 PM',
    patientName: 'Bob Wilson',
    doctorName: 'Dr. Johnson',
    status: 'upcoming',
  },
];

export const getAllUpcomingAppointments = (): Appointment[] => {
  return mockAppointments.filter(apt => apt.status === 'upcoming');
};

export const getAppointmentsForUser = (role: 'patient' | 'doctor', userName: string): Appointment[] => {
  if (role === 'patient') {
    return mockAppointments.filter(apt => apt.patientName === userName && apt.status === 'upcoming');
  } else {
    return mockAppointments.filter(apt => apt.doctorName === userName && apt.status === 'upcoming');
  }
};