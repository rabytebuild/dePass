const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

function getToken(): string | null {
  return localStorage.getItem("token")
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("token", token)
  } else {
    localStorage.removeItem("token")
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    setToken(null)
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed")
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
  getToken,
  setToken,
}
