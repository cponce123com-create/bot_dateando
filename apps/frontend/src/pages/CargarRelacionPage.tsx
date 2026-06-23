import { useState, useEffect } from "react";
import { api } from "../api";
import type { Persona } from "../types";

const TIPOS = ["PADRE","MADRE","HIJO","HIJA","HERMANO","HERMANA","CONYUGE","CUNADO","CUNADA","SOBRINO","SOBRINA","SOCIO","OTRO"];

export default function CargarRelacionPage() {
  const [tab, setTab] = useState<"form" | "texto">("form");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState({ personaAId: 0, personaBId: 0, tipoRelacion: "OTRO", fuente: "", fechaFuente: "" });
  const [txt, setTxt] = useState("");
  const [fuenteTxt, setFuenteTxt] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { api.personas.list().then(setPersonas); }, []);

  const submitForm = async () => {
    if (!form.fuente) return setMsg("La fuente es OBLIGATORIA");
    await api.relaciones.create(form);
    setMsg("Relacion guardada");
    setForm({ personaAId: 0, personaBId: 0, tipoRelacion: "OTRO", fuente: "", fechaFuente: "" });
  };

  const parseTexto = async () => {
    if (!txt || !fuenteTxt) return;
    const r = await api.relaciones.parseTexto(txt, fuenteTxt);
    setSugerencias(r.sugerencias);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        <button onClick={() => setTab("form")} style={{
          padding: "10px 24px", border: "none", background: tab === "form" ? "#1e293b" : "#e2e8f0",
          color: tab === "form" ? "white" : "#64748b", borderRadius: "6px 0 0 6px", cursor: "pointer", fontWeight: 600,
        }}>Formulario</button>
        <button onClick={() => setTab("texto")} style={{
          padding: "10px 24px", border: "none", background: tab === "texto" ? "#1e293b" : "#e2e8f0",
          color: tab === "texto" ? "white" : "#64748b", borderRadius: "0 6px 6px 0", cursor: "pointer", fontWeight: 600,
        }}>Texto Libre</button>
      </div>

      {msg && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: 10, borderRadius: 6, marginBottom: 16 }}>{msg}</div>}

      {tab === "form" ? (
        <div style={{ background: "white", padding: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Persona A</label>
              <select value={form.personaAId} onChange={e => setForm({...form, personaAId: +e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}>
                <option value={0}>Selecciona...</option>
                {personas.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} ({p.dni})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Persona B</label>
              <select value={form.personaBId} onChange={e => setForm({...form, personaBId: +e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}>
                <option value={0}>Selecciona...</option>
                {personas.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} ({p.dni})</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Tipo Relacion</label>
            <select value={form.tipoRelacion} onChange={e => setForm({...form, tipoRelacion: e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#dc2626" }}>Fuente * OBLIGATORIA</label>
            <input value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})} placeholder="Ej: Declaracion de Intereses 2025" style={{ width: "100%", padding: 10, border: "2px solid #fecaca", borderRadius: 6, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Fecha Fuente (opcional)</label>
            <input type="date" value={form.fechaFuente} onChange={e => setForm({...form, fechaFuente: e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6, marginTop: 4 }} />
          </div>
          <button onClick={submitForm} disabled={!form.personaAId || !form.personaBId || !form.fuente}
            style={{ padding: 12, background: "#16a34a", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
            Guardar Relacion
          </button>
        </div>
      ) : (
        <div style={{ background: "white", padding: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 12 }}>
            Pega texto en formato "FULANO es PADRE de MENGANO" o "JUAN es SOCIO de PEDRO" y el sistema detectara patrones.
          </p>
          <textarea value={txt} onChange={e => setTxt(e.target.value)} placeholder="Juan Perez es HERMANO de Maria Perez\nCarlos Lopez es SOCIO de Juan Perez"
            style={{ width: "100%", minHeight: 150, padding: 16, border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "monospace", fontSize: "0.85rem", marginBottom: 12 }} />
          <input value={fuenteTxt} onChange={e => setFuenteTxt(e.target.value)} placeholder="Fuente OBLIGATORIA (ej: Gaceta Municipal N 15)" style={{ width: "100%", padding: 10, border: "2px solid #fecaca", borderRadius: 6, marginBottom: 12, fontSize: "0.9rem" }} />
          <button onClick={parseTexto} disabled={!txt || !fuenteTxt} style={{ padding: 10, background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Analizar texto</button>

          {sugerencias.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: 0 }}>Sugerencias ({sugerencias.length})</h4>
              {sugerencias.map((s: any, i: number) => (
                <div key={i} style={{ padding: 12, background: "#f8fafc", borderRadius: 6, marginTop: 8, border: "1px solid #e2e8f0" }}>
                  <strong>{s.personaA}</strong> → {s.tipoRelacion} → <strong>{s.personaB}</strong>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Fuente: {s.fuente}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
