import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { authRouter } from "./routes/auth.js";
import { personasRouter } from "./routes/personas.js";
import { relacionesRouter } from "./routes/relaciones.js";
import { empresasRouter } from "./routes/empresas.js";
import { buscarRouter } from "./routes/buscar.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/personas", personasRouter);
app.use("/api/relaciones", relacionesRouter);
app.use("/api/empresas", empresasRouter);
app.use("/api/buscar", buscarRouter);

// Sirve frontend compilado
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`MapaDeVinculos en http://localhost:${PORT}`);
});
