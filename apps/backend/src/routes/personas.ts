import { Router } from "express";
import { db } from "../db/index.js";
import { personas } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { eq, like, or, and } from "drizzle-orm";

export const personasRouter = Router();
personasRouter.use(authMiddleware);

// Listar personas
personasRouter.get("/", async (req: AuthRequest, res) => {
  const objetivo = req.query.es_objetivo;
  const search = req.query.search as string;

  let where = undefined;
  if (objetivo === "true") where = eq(personas.esObjetivo, true);
  if (search) {
    const cond = or(
      like(personas.nombres, `%${search}%`),
      like(personas.apellidos, `%${search}%`),
      like(personas.dni, `%${search}%`)
    );
    where = where ? and(where, cond) : cond;
  }

  const result = await db.select().from(personas).where(where);
  res.json(result);
});

// Crear persona
personasRouter.post("/", async (req: AuthRequest, res) => {
  const { dni, nombres, apellidos, esObjetivo, cargo, notas } = req.body;
  if (!dni || !nombres || !apellidos) {
    res.status(400).json({ error: "dni, nombres y apellidos son requeridos" });
    return;
  }

  const [existing] = await db.select().from(personas).where(eq(personas.dni, dni));
  if (existing) {
    res.status(409).json({ error: "Ya existe una persona con ese DNI" });
    return;
  }

  const [p] = await db.insert(personas).values({
    dni, nombres, apellidos,
    esObjetivo: esObjetivo || false,
    cargo: cargo || null,
    notas: notas || null,
  }).returning();

  res.status(201).json(p);
});

// Detalle persona
personasRouter.get("/:id", async (req: AuthRequest, res) => {
  const [p] = await db.select().from(personas).where(eq(personas.id, parseInt(req.params.id)));
  if (!p) { res.status(404).json({ error: "No encontrada" }); return; }
  res.json(p);
});

// Editar persona
personasRouter.put("/:id", async (req: AuthRequest, res) => {
  const { nombres, apellidos, esObjetivo, cargo, notas } = req.body;
  const [p] = await db.update(personas).set({
    nombres, apellidos, esObjetivo, cargo, notas,
    updatedAt: new Date(),
  }).where(eq(personas.id, parseInt(req.params.id))).returning();

  if (!p) { res.status(404).json({ error: "No encontrada" }); return; }
  res.json(p);
});

// Eliminar persona
personasRouter.delete("/:id", async (req: AuthRequest, res) => {
  await db.delete(personas).where(eq(personas.id, parseInt(req.params.id)));
  res.json({ ok: true });
});
