import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import type { BusquedaResult } from "../types";

export default function BuscadorPage() {
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<BusquedaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) return;
    setLoading(true); setError("");
    try { setResult(await api.buscar(dni.trim())); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <form onSubmit={buscar} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input value={dni} onChange={e => setDni(e.target.value)} placeholder="Ingresa DNI a buscar..."
          style={{ flex: 1, padding: "14px 18px", fontSize: "1rem", border: "2px solid #e2e8f0", borderRadius: 8 }} />
        <button type="submit" disabled={loading} style={{ padding: "14px 28px", background: "#1e293b", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result?.alertaObjetivo && (
        <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", padding: 16, borderRadius: 8, marginBottom: 20 }}>
          {result.cadenasObjetivo.map((c, i) => (
            <div key={i} style={{ color: "#92400e", fontWeight: 600, fontSize: "0.9rem" }}>⚠️ {c}</div>
          ))}
        </div>
      )}

      {result?.persona && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: 0 }}>{result.persona.nombres} {result.persona.apellidos}</h3>
              <p style={{ color: "#64748b", margin: "4px 0 0" }}>DNI: {result.persona.dni}</p>
              {result.persona.cargo && <p style={{ margin: 4, fontSize: "0.85rem" }}>Cargo: {result.persona.cargo}</p>}
              {result.persona.esObjetivo && <span style={{ display: "inline-block", background: "#fee2e2", color: "#dc2626", padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", marginTop: 8 }}>OBJETIVO</span>}
            </div>

            <h3 style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 8 }}>Conexiones 1er grado ({result.conexionesGrado1.length})</h3>
            {result.conexionesGrado1.map(c => (
              <div key={c.relacionId} style={{ background: "white", padding: 12, borderRadius: 6, marginBottom: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <strong>{c.persona?.nombres} {c.persona?.apellidos}</strong>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}> - {c.tipoRelacion}</span>
                {c.persona?.esObjetivo && <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", marginLeft: 8 }}>OBJETIVO</span>}
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Fuente: {c.fuente}</div>
              </div>
            ))}

            <h3 style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 8 }}>Conexiones 2do grado ({result.conexionesGrado2.length})</h3>
            {result.conexionesGrado2.map(c => (
              <div key={c.relacionId} style={{ background: "#f8fafc", padding: 12, borderRadius: 6, marginBottom: 8, border: "1px solid #e2e8f0" }}>
                <strong>{c.persona?.nombres} {c.persona?.apellidos}</strong>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}> - {c.tipoRelacion}</span>
                {c.persona?.esObjetivo && <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", marginLeft: 8 }}>OBJETIVO</span>}
                {c.via && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Via: {c.via}</div>}
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Fuente: {c.fuente}</div>
              </div>
            ))}
          </div>

          {/* Graph visualization using vis-network */}
          <GrafoVinculos result={result} />
        </div>
      )}
    </div>
  );
}

function GrafoVinculos({ result }: { result: BusquedaResult }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !result.persona) return;
    if (!(window as any).vis) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/vis-network@9.1.9/dist/vis-network.min.js";
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else { setScriptLoaded(true); }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !result.persona) return;
    const vis = (window as any).vis;
    if (!vis) return;

    const nodes: any[] = [];
    const edges: any[] = [];
    const idMap = new Map<number, string>();

    // Root
    const rootId = "p" + result.persona.id;
    nodes.push({ id: rootId, label: result.persona.nombres + "\n" + result.persona.dni, color: { background: "#1e293b", border: "#0f172a" }, font: { color: "white" } });
    idMap.set(result.persona.id, rootId);

    // 1st degree
    for (const c of result.conexionesGrado1) {
      if (!c.persona) continue;
      const nid = "p" + c.persona.id;
      nodes.push({
        id: nid, label: c.persona.nombres + " " + (c.persona.apellidos || ""),
        color: { background: c.persona.esObjetivo ? "#dc2626" : "#3b82f6", border: c.persona.esObjetivo ? "#991b1b" : "#1d4ed8" },
        font: { color: "white", size: 12 },
      });
      edges.push({ from: rootId, to: nid, label: c.tipoRelacion, arrows: "to", font: { size: 10 } });
    }

    // 2nd degree
    for (const c of result.conexionesGrado2) {
      if (!c.persona) continue;
      const nid = "p" + c.persona.id;
      if (!nodes.find(n => n.id === nid)) {
        nodes.push({
          id: nid, label: c.persona.nombres + " " + (c.persona.apellidos || ""),
          color: { background: c.persona.esObjetivo ? "#fca5a5" : "#93c5fd", border: c.persona.esObjetivo ? "#dc2626" : "#3b82f6" },
          font: { size: 11 },
        });
      }
      edges.push({ from: rootId, to: nid, label: "2° " + c.tipoRelacion, dashes: true, font: { size: 9 }, color: { color: "#94a3b8" } });
    }

    new vis.Network(containerRef.current, { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) }, {
      physics: { solver: "forceAtlas2Based" },
      edges: { smooth: { type: "curvedCW", roundness: 0.2 } },
    });
  }, [scriptLoaded, result]);

  return <div ref={containerRef} style={{ height: 400, background: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }} />;
}
