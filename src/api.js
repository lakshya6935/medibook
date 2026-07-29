const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("medibookAuth")) || null;
  } catch {
    return null;
  }
}

function setAuth(data) {
  localStorage.setItem("medibookAuth", JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem("medibookAuth");
}

function getToken() {
  const auth = getAuth();
  return auth ? auth.token : null;
}

function getUser() {
  const auth = getAuth();
  return auth ? auth.user : null;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Could not reach the server. Please make sure the API is running.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),
  getDoctors: () => request("/doctors"),
  bookAppointment: (payload) =>
    request("/appointments", { method: "POST", body: payload, auth: true }),
  getMyAppointments: () => request("/appointments/mine", { auth: true }),
  getAllAppointments: () => request("/appointments/all", { auth: true }),
  updateAppointmentStatus: (id, status) =>
    request(`/appointments/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
  getAdminStats: () => request("/admin/stats", { auth: true }),
};

export { getAuth, setAuth, clearAuth, getToken, getUser };
