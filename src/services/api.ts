import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface ApiResponse<T = any> {
  response_code: number;
  success: boolean;
  message: string;
  data?: T;
  user_info?: any;
  token?: string;
  token_type?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  async loadToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        this.token = token;
      }
      return token;
    } catch (error) {
      console.error('Failed to load token:', error);
      return null;
    }
  }

  async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  clearToken() {
    this.token = null;
    AsyncStorage.removeItem('authToken').catch((error: any) => console.error('Failed to clear token:', error));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('Making API request to:', url, 'Token present:', !!this.token);
    console.log('Request method:', options.method || 'GET');
    console.log('Request body:', options.body);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    console.log('Response status:', response.status, 'Success:', data.success, 'Message:', data.message);

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      await this.saveToken(response.token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    last_name: string;
    identification: string;
    phone: string;
    email: string;
    password: string;
    role?: string;
    dob?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'GET',
    });

    if (response.success) {
      this.clearToken();
    }

    return response;
  }

  // Appointments endpoints
  async getAppointments() {
    return this.request('/appointments/list');
  }

  async createAppointment(appointmentData: {
    patient_user_id: number;
    user_id: number;
    appointment_date_time: string;
    reason: string;
    status: string;
  }) {
    return this.request('/patients/appointments/create', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: {
    patient_user_id: number;
    user_id: number;
    appointment_date_time: string;
    reason: string;
    status: string;
  }) {
    return this.request(`/appointments/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Doctors endpoints
  async getDoctors() {
    return this.request('/doctors/list');
  }

  async getDoctorProfile() {
    return this.request('/doctors/show');
  }

  async updateOwnDoctorProfile(profileData: {
    name?: string;
    last_name?: string;
    identification?: string;
    genero?: string;
    phone?: string;
    email?: string;
    dob?: string;
  }) {
    return this.request('/doctors/edit', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Patient endpoints
  async getPatientProfile() {
    return this.request('/patients/show');
  }

  async updatePatientProfile(profileData: any) {
    return this.request('/patients/edit', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateOwnProfile(profileData: {
    name?: string;
    last_name?: string;
    identification?: string;
    dob?: string;
    genero?: string;
    phone?: string;
    email?: string;
  }) {
    return this.request('/patients/edit', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Admin endpoints
  async getEntities() {
    return this.request('/entities/list');
  }

  async getSpecialties() {
    return this.request('/specialties/list');
  }

  async getPatients() {
    return this.request('/patients/list');
  }

  async createPatient(patientData: {
    entity_id: number | null;
    name: string;
    last_name: string;
    identification: string;
    dob: string;
    genero: string;
    phone: string;
    email: string;
  }) {
    return this.request('/patients/create', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(id: string, patientData: {
    entity_id: number | null;
    name: string;
    last_name: string;
    identification: string;
    dob: string;
    genero: string;
    phone: string;
    email: string;
  }) {
    return this.request(`/patients/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  }

  async createDoctor(doctorData: {
    name: string;
    last_name: string;
    specialty_id: number;
    identification: string;
    genero: string;
    phone: string;
    email: string;
  }) {
    return this.request('/doctors/create', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(id: string, doctorData: {
    name: string;
    last_name: string;
    specialty_id: number;
    identification: string;
    genero: string;
    phone: string;
    email: string;
  }) {
    return this.request(`/doctors/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  }

  async createSpecialty(specialtyData: {
    specialty: string;
  }) {
    return this.request('/specialties/create', {
      method: 'POST',
      body: JSON.stringify(specialtyData),
    });
  }

  async updateSpecialty(id: string, specialtyData: {
    specialty: string;
  }) {
    return this.request(`/specialties/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(specialtyData),
    });
  }

  async createEntity(entityData: {
    name: string;
    code: string;
  }) {
    return this.request('/entities/create', {
      method: 'POST',
      body: JSON.stringify(entityData),
    });
  }

  async updateEntity(id: string, entityData: {
    name: string;
    code: string;
  }) {
    return this.request(`/entities/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entityData),
    });
  }

  async deletePatient(id: string) {
    return this.request(`/patients/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteDoctor(id: string) {
    return this.request(`/doctors/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteSpecialty(id: string) {
    return this.request(`/specialties/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteEntity(id: string) {
    return this.request(`/entities/delete/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();