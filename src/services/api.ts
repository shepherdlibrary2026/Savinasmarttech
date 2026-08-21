// ============================================================================
// Savina K-12 Multi-Tenant REST API Client
// Handles tenant header injection, offline sync fallback, and API calls
// ============================================================================

export interface RequestOptions extends RequestInit {
  userId?: string;
  schoolId?: string;
  role?: string;
}

class ApiService {
  private activeUserId: string = 'usr-admin-marie';
  private activeSchoolId: string = 'sch-savina-monrovia';
  private activeRole: string = 'school_admin';

  setSession(userId: string, schoolId: string, role: string) {
    this.activeUserId = userId;
    this.activeSchoolId = schoolId;
    this.activeRole = role;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    headers.set('x-user-id', options.userId || this.activeUserId);
    headers.set('x-school-id', options.schoolId || this.activeSchoolId);
    headers.set('x-user-role', options.role || this.activeRole);

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; system: string; timestamp: string }>('/api/health');
  }

  // Auth & Identity
  async getMe() {
    return this.request<any>('/api/auth/me');
  }

  async getPersonas() {
    return this.request<{ personas: any[] }>('/api/auth/personas');
  }

  async switchPersona(role?: string, userId?: string) {
    return this.request<any>('/api/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    });
  }

  // Schools
  async getSchools() {
    return this.request<{ schools: any[] }>('/api/schools');
  }

  async getSchoolDetails(id: string) {
    return this.request<any>(`/api/schools/${id}`);
  }

  // Users & Profiles
  async getUsers(params?: { role?: string; gradeLevel?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ users: any[] }>(`/api/users${query ? `?${query}` : ''}`);
  }

  async getProfile(userId: string) {
    return this.request<{ profile: any; user: any }>(`/api/users/profiles/${userId}`);
  }

  // Classes
  async getClasses() {
    return this.request<{ classes: any[] }>('/api/classes');
  }

  async getClassDetails(classId: string) {
    return this.request<any>(`/api/classes/${classId}`);
  }

  // Grades
  async getGrades(params?: { classId?: string; studentId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ grades: any[] }>(`/api/grades${query ? `?${query}` : ''}`);
  }

  async submitGrade(gradeData: {
    classId: string;
    studentId: string;
    assignmentName: string;
    scoreAchieved: number;
    maxScore: number;
    feedback?: string;
  }) {
    return this.request<any>('/api/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async getReportCard(studentId: string) {
    return this.request<any>(`/api/grades/report-card/${studentId}`);
  }

  // Attendance
  async getAttendance(params?: { classId?: string; date?: string; studentId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ attendance: any[] }>(`/api/attendance${query ? `?${query}` : ''}`);
  }

  async submitBatchAttendance(data: {
    classId: string;
    date: string;
    records: { studentId: string; status: string; notes?: string }[];
  }) {
    return this.request<any>('/api/attendance/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bursar & Mobile Money
  async getInvoices(params?: { studentId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ invoices: any[] }>(`/api/bursar/invoices${query ? `?${query}` : ''}`);
  }

  async getPayments() {
    return this.request<{ payments: any[] }>('/api/bursar/payments');
  }

  async momoCheckout(data: {
    invoiceId: string;
    phoneNumber: string;
    paymentMethod: 'mtn_momo' | 'orange_money';
    amount: number;
    currency: 'USD' | 'LRD';
  }) {
    return this.request<any>('/api/bursar/momo-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // MoE
  async getMoECurriculum(params?: { gradeLevel?: string; subject?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/api/moe/curriculum${query ? `?${query}` : ''}`);
  }

  async getMoEComplianceReport() {
    return this.request<any>('/api/moe/compliance-report');
  }

  // Live Classroom
  async getLiveSessions() {
    return this.request<{ sessions: any[] }>('/api/live/sessions');
  }

  async setLiveSlide(sessionId: string, slideIndex: number) {
    return this.request<any>(`/api/live/sessions/${sessionId}/slide`, {
      method: 'PATCH',
      body: JSON.stringify({ slideIndex }),
    });
  }

  // Gemini AI Server Endpoints
  async generateAiLessonPlan(data: {
    topic: string;
    subject: string;
    gradeLevel: string;
    studentTier?: string;
    context?: string;
  }) {
    return this.request<any>('/api/ai/lesson-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateAiDiagnosticAnalysis(data: {
    classSubject: string;
    gradeAverage: string;
    lowScoringTopics: string;
  }) {
    return this.request<any>('/api/ai/diagnostic-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
