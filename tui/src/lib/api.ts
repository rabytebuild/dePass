let API_BASE = process.env.DEPASS_API_URL || 'http://localhost:8000/api';
let TOKEN: string | null = null;

export function setBaseUrl(url: string) {
  API_BASE = url;
}

export function getBaseUrl(): string {
  return API_BASE;
}

export function setToken(token: string | null) {
  TOKEN = token;
}

export function getToken(): string | null {
  return TOKEN;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

// Auth
export interface LoginResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string; organization_id: number | null };
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/login', { username, password });
  setToken(res.token);
  return res;
}

// Stats (works for all authenticated roles)
export interface StatsResponse {
  events: number;
  passes: number;
  devices: number;
  pending_devices: number;
  templates: number;
}

export async function getStats(): Promise<StatsResponse> {
  return api.get<StatsResponse>('/stats');
}

// Dashboard (super_admin only)
export interface DashboardResponse {
  stats: {
    events: number;
    passes: number;
    approved_devices: number;
    pending_devices: number;
    templates: number;
  };
  features: Record<string, unknown>;
  services: Record<string, unknown>;
  configurations: Array<{ id: number; key: string; value: unknown; description: string | null; updated_at: string }>;
  devices: Array<Record<string, unknown>>;
}

export async function getAdminDashboard(): Promise<DashboardResponse> {
  return api.get<DashboardResponse>('/admin/dashboard');
}

// Events
export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  status: string;
  event_secret?: string;
  organization_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  organization: { id: number; name: string } | null;
  creator: { id: number; name: string } | null;
  pass_types?: PassType[];
  passes?: Pass[];
}

export interface PassType {
  id: number;
  event_id: number;
  name: string;
  price: number | null;
  max_quantity: number | null;
}

export interface Pass {
  id: number;
  event_id: number;
  pass_type_id: number;
  pass_uid: string;
  signature: string;
  attendee_name: string | null;
  company: string | null;
  phone: string | null;
  metadata: Record<string, unknown> | null;
  scan_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  pass_type: PassType | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export async function getEvents(page = 1): Promise<PaginatedResponse<Event>> {
  return api.get<PaginatedResponse<Event>>(`/events?page=${page}`);
}

export async function getEvent(id: number): Promise<Event> {
  return api.get<Event>(`/events/${id}`);
}

// Devices
export interface Device {
  id: number;
  uuid: string;
  public_key: string | null;
  device_fingerprint: string | null;
  status: string;
  user_id: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; email: string } | null;
  approver: { id: number; name: string } | null;
}

export async function getDevices(page = 1): Promise<PaginatedResponse<Device>> {
  return api.get<PaginatedResponse<Device>>(`/devices?page=${page}`);
}

export async function approveDevice(id: number): Promise<{ message: string; device: Device }> {
  return api.post<{ message: string; device: Device }>(`/devices/${id}/approve`);
}

export async function revokeDevice(id: number): Promise<{ message: string; device: Device }> {
  return api.post<{ message: string; device: Device }>(`/devices/${id}/revoke`);
}

// Passes
export async function getEventPasses(eventId: number, page = 1): Promise<PaginatedResponse<Pass>> {
  return api.get<PaginatedResponse<Pass>>(`/events/${eventId}/passes?page=${page}`);
}

export async function bulkGeneratePasses(
  eventId: number,
  passes: Array<{
    pass_type_id: number;
    attendee_name?: string;
    company?: string;
    phone?: string;
  }>,
): Promise<{ message: string; generated_count: number; results: Array<{ pass: Pass; qr_data: string }> }> {
  return api.post(`/events/${eventId}/passes/bulk-generate`, { passes });
}
