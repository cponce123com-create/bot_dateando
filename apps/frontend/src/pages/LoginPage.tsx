import { useState } from "react";
import { api } from "../api";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.login(u, p);
      localStorage.setItem("token", r.token);
      onLogin();
    } catch { setErr("Credenciales invalidas"); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
      <form onSubmit={submit} style={{ background: "white", padding: 40, borderRadius: 12, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: "#1e293b" }}>Mapa de Vinculos</h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginBottom: 24 }}>Herramienta de investigacion</p>
        {err && <div style={{ background: "#fef2f2", color: "#dc2626", padding: 10, borderRadius: 6, marginBottom: 16, fontSize: "0.85rem" }}>{err}</div>}
        <input value={u} onChange={e => setU(e.target.value)} placeholder="Usuario" style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #d1d5db", borderRadius: 6 }} />
        <input value={p} onChange={e => setP(e.target.value)} type="password" placeholder="Password" style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #d1d5db", borderRadius: 6 }} />
        <button type="submit" style={{ width: "100%", padding: 12, background: "#1e293b", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Ingresar</button>
      </form>
    </div>
  );
}
