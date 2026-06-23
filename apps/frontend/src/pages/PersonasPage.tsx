import { useState, useEffect } from "react";
import { api } from "../api";
import type { Persona } from "../types";

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dni: "", nombres: "", apellidos: "", esObjetivo: false, cargo: "", notas: "" });

  const load = async () => setPersonas(await api.personas.list());

  useEffect(() => { load(); }, []);

  const submit = async () => {
    await api.personas.create(form);
    setShowForm(false);
    setForm({ dni: "", nombres: "", apellidos: "", esObjetivo: false, cargo: "", notas: "" });
    load();
  };

  const toggleObjetivo = async (id: number, current: boolean) => {
    await api.personas.update(id, { esObjetivo: !current });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Personas ({personas.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "8px 20px", background: "#1e293b", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          {showForm ? "Cancelar" : "+ Nueva persona"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <input placeholder="DNI *" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
          <input placeholder="Nombres *" value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
          <input placeholder="Apellidos *" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
          <input placeholder="Cargo" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} style={{ padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.esObjetivo} onChange={e => setForm({ ...form, esObjetivo: e.target.checked })} />
            Marcar como Objetivo
          </label>
          <button onClick={submit} disabled={!form.dni || !form.nombres || !form.apellidos}
            style={{ padding: 10, background: "#16a34a", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Guardar</button>
        </div>
      )}

      <table style={{ width: "100%", background: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: 12 }}>DNI</th>
            <th style={{ padding: 12 }}>Nombres</th>
            <th style={{ padding: 12 }}>Apellidos</th>
            <th style={{ padding: 12 }}>Cargo</th>
            <th style={{ padding: 12 }}>Objetivo</th>
          </tr>
        </thead>
        <tbody>
          {personas.map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: 10, fontFamily: "monospace" }}>{p.dni}</td>
              <td style={{ padding: 10 }}>{p.nombres}</td>
              <td style={{ padding: 10 }}>{p.apellidos}</td>
              <td style={{ padding: 10, color: "#64748b" }}>{p.cargo || "-"}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => toggleObjetivo(p.id, p.esObjetivo)} style={{
                  padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: "0.75rem",
                  background: p.esObjetivo ? "#fee2e2" : "#f1f5f9", color: p.esObjetivo ? "#dc2626" : "#64748b",
                }}>{p.esObjetivo ? "SI" : "NO"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
