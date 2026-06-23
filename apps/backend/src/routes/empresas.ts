import { Router } from "express";
import { db } from "../db/index.js";
import { empresas, personaEmpresa } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

export const empresasRouter = Router();
empresasRouter.use(authMiddleware);

// Listar
empresasRouter.get("/", async (_req, res) => {
  const result = await db.select().from(empresas);
  res.json(result);
});

// Crear
empresasRouter.post("/", async (req: AuthRequest, res) => {
  const { ruc, razonSocial, notas } = req.body;
  if (!ruc || !razonSocial) {
    res.status(400).json({ error: "ruc y razonSocial son requeridos" });
    return;
  }
  const [e] = await db.insert(empresas).values({ ruc, razonSocial, notas }).returning();
  res.status(201).json(e);
});

// Vincular persona a empresa
empresasRouter.post("/persona-empresa", async (req: AuthRequest, res) => {
  const { personaId, empresaId, cargo, fuente, desde } = req.body;
  if (!personaId || !empresaId || !fuente) {
    res.status(400).json({ error: "personaId, empresaId y fuente son requeridos" });
    return;
  }
  const [pe] = await db.insert(personaEmpresa).values({
    personaId, empresaId, cargo, fuente, desde: desde || null,
  }).returning();
  res.status(201).json(pe);
});
