const API_BASE_URL = 'http://10.2.233.19:8000/api'; // Adjust if needed

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

  clearToken() {
    this.token = null;
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
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
  }) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request('/logout', {
      method: 'GET',
    });

    if (response.success) {
      this.clearToken();
    }

    return response;
  }

  // Appointments endpoints
  async getAppointments() {
    return this.request('/listAppointments');
  }

  async createAppointment(appointmentData: {
    patient_user_id: number;
    user_id: number;
    appointment_date_time: string;
    reason: string;
    status: string;
  }) {
    return this.request('/createAppointment', {
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
    return this.request(`/editAppointment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  // Doctors endpoints
  async getDoctors() {
    return this.request('/listDoctors');
  }

  // Patient endpoints
  async getPatientProfile() {
    return this.request('/showPatient');
  }

  async updatePatientProfile(profileData: any) {
    return this.request('/editPatient', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export const apiService = new ApiService();