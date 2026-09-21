/**
 * Offline Local API Service
 * Connects exclusively to the local FastAPI backend on http://127.0.0.1:8000
 * No external network requests are made.
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  getToken() {
    return localStorage.getItem('smart_water_token');
  }

  setToken(token) {
    localStorage.setItem('smart_water_token', token);
  }

  clearToken() {
    localStorage.removeItem('smart_water_token');
    localStorage.removeItem('smart_water_user');
  }

  getUser() {
    const userStr = localStorage.getItem('smart_water_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem('smart_water_user', JSON.stringify(user));
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
        }
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      // Check if response is CSV or plain text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return await response.text();
      }

      return await response.json();
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.name === 'TypeError') {
        throw new Error(
          'Backend server is not running. Please start the local FastAPI server using start_offline.bat or `uvicorn main:app --reload`.'
        );
      }
      throw err;
    }
  }

  // Auth endpoints
  async login(username_or_email, password, role) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email, password, role })
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(profileData) {
    const updated = await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    this.setUser(updated);
    return updated;
  }

  // Complaint endpoints
  async createComplaint(complaintData) {
    return await this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData)
    });
  }

  async getComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    if (params.my_only) query.append('my_only', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/complaints${qs}`);
  }

  async getComplaint(id) {
    return await this.request(`/complaints/${id}`);
  }

  async updateComplaintStatus(id, updateData) {
    return await this.request(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // Dashboard & Analytics
  async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  async getSurveyAnalytics() {
    return await this.request('/survey/analytics');
  }

  async getAwarenessContent() {
    return await this.request('/awareness');
  }

  // Notifications
  async getNotifications() {
    return await this.request('/notifications');
  }

  async markNotificationRead(id) {
    return await this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return await this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // Reports
  async getReportsSummary(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/reports/summary${qs}`);
  }

  async exportReportsCsv(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/reports/export-csv${qs}`);
  }

  async healthCheck() {
    return await this.request('/health');
  }
}

export const api = new ApiService();
export default api;
