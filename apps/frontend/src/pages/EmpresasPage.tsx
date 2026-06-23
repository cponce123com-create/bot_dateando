import { useState, useEffect } from "react";
import { api } from "../api";
import type { Empresa } from "../types";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState({ ruc: "", razonSocial: "", notas: "" });

  const load = async () => setEmpresas(await api.empresas.list());
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await api.empresas.create(form);
    setForm({ ruc: "", razonSocial: "", notas: "" });
    load();
  };

  return (
    <div>
      <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", gap: 12 }}>
        <input placeholder="RUC *" value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
        <input placeholder="Razon Social *" value={form.razonSocial} onChange={e => setForm({...form, razonSocial: e.target.value})} style={{ flex: 2, padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} />
        <button onClick={submit} disabled={!form.ruc || !form.razonSocial} style={{ padding: 10, background: "#16a34a", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Registrar
        </button>
      </div>
      <table style={{ width: "100%", background: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: 12 }}>RUC</th>
            <th style={{ padding: 12 }}>Razon Social</th>
            <th style={{ padding: 12 }}>Notas</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map(e => (
            <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: 10, fontFamily: "monospace" }}>{e.ruc}</td>
              <td style={{ padding: 10 }}>{e.razonSocial}</td>
              <td style={{ padding: 10, color: "#64748b" }}>{e.notas || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
