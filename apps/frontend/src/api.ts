const BASE = "";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function request(url: string, options?: RequestInit) {
  const res = await fetch(BASE + url, { ...options, headers: { ...headers(), ...options?.headers } });
  if (res.status === 401) { localStorage.clear(); window.location.href = "/login"; throw new Error("No autorizado"); }
  if (!res.ok) { const e = await res.json().catch(() => ({ error: "Error" })); throw new Error(e.error || res.statusText); }
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  personas: {
    list: (params?: string) => request(`/api/personas${params ? "?" + params : ""}`),
    get: (id: number) => request(`/api/personas/${id}`),
    create: (data: any) => request("/api/personas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/api/personas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/api/personas/${id}`, { method: "DELETE" }),
  },
  relaciones: {
    create: (data: any) => request("/api/relaciones", { method: "POST", body: JSON.stringify(data) }),
    getByPersona: (id: number) => request(`/api/relaciones/${id}`),
    delete: (id: number) => request(`/api/relaciones/${id}`, { method: "DELETE" }),
    parseTexto: (texto: string, fuente_default: string) =>
      request("/api/relaciones/parse-texto", { method: "POST", body: JSON.stringify({ texto, fuente_default }) }),
  },
  buscar: (dni: string) => request(`/api/buscar/${dni}`),
  empresas: {
    list: () => request("/api/empresas"),
    create: (data: any) => request("/api/empresas", { method: "POST", body: JSON.stringify(data) }),
    vincular: (data: any) => request("/api/empresas/persona-empresa", { method: "POST", body: JSON.stringify(data) }),
  },
};
