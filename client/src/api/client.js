// Strip trailing slash so VITE_API_URL=https://api.example.com/ doesn't produce //api/...
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(path, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.error?.message || data?.message || 'Request failed';
      const err = new Error(message);
      err.status = res.status;
      err.details = data?.error?.details;
      throw err;
    }

    return data;
  }

  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  me() {
    return this.request('/api/auth/me');
  }

  // User
  getProfile() {
    return this.request('/api/user/profile');
  }

  getLatestReport() {
    return this.request('/api/user/reports/latest');
  }

  getReportHistory(page = 1, limit = 10) {
    return this.request(`/api/user/reports?page=${page}&limit=${limit}`);
  }

  getTrends() {
    return this.request('/api/user/trends');
  }

  generateInsight(reportId) {
    return this.request('/api/user/insights', {
      method: 'POST',
      body: JSON.stringify(reportId ? { reportId } : {}),
    });
  }

  getInsights() {
    return this.request('/api/user/insights');
  }

  // Admin
  getAdminStats() {
    return this.request('/api/admin/stats');
  }

  listUsers(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return this.request(`/api/admin/users?${qs}`);
  }

  getUserDetail(clientId) {
    return this.request(`/api/admin/users/${clientId}`);
  }

  getUserReports(clientId, page = 1, limit = 10) {
    return this.request(`/api/admin/users/${clientId}/reports?page=${page}&limit=${limit}`);
  }

  uploadCsv(file) {
    const form = new FormData();
    form.append('file', file);
    return this.request('/api/admin/upload', { method: 'POST', body: form });
  }

  getUploadLogs() {
    return this.request('/api/admin/uploads');
  }
}

export const api = new ApiClient();
