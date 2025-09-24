export interface User {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  name: string;
}

export const mockUsers: User[] = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'patient',
    name: 'John Doe',
  },
  {
    email: 'jane.doe@example.com',
    password: 'password123',
    role: 'patient',
    name: 'Jane Doe',
  },
  {
    email: 'dr.smith@example.com',
    password: 'password123',
    role: 'doctor',
    name: 'Dr. Smith',
  },
  {
    email: 'dr.johnson@example.com',
    password: 'password123',
    role: 'doctor',
    name: 'Dr. Johnson',
  },
];

export const authenticateUser = (email: string, password: string): User | null => {
  return mockUsers.find(user => user.email === email && user.password === password) || null;
};