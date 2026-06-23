import { Routes, Route, Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import PersonasPage from "./pages/PersonasPage";
import BuscadorPage from "./pages/BuscadorPage";
import CargarRelacionPage from "./pages/CargarRelacionPage";
import EmpresasPage from "./pages/EmpresasPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => { setLoggedIn(true); navigate("/"); };
  const handleLogout = () => { localStorage.clear(); setLoggedIn(false); navigate("/login"); };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "#1e293b", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Mapa de Vinculos</h1>
        <nav style={{ display: "flex", gap: 16 }}>
          {["/", "/personas", "/cargar", "/empresas"].map((path, i) => {
            const labels = ["Buscar DNI", "Personas", "Cargar Relacion", "Empresas"];
            return (
              <Link key={path} to={path} style={{
                color: location.pathname === path ? "#38bdf8" : "#94a3b8",
                textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
              }}>{labels[i]}</Link>
            );
          })}
          <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem" }}>Salir</button>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <Routes>
          <Route path="/" element={<BuscadorPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/cargar" element={<CargarRelacionPage />} />
          <Route path="/empresas" element={<EmpresasPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
