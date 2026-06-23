import { Router } from "express";
import { db } from "../db/index.js";
import { relaciones, personas } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { eq, or, sql } from "drizzle-orm";

export const relacionesRouter = Router();
relacionesRouter.use(authMiddleware);

const FAMILY_MAP: Record<string, string[]> = {
  PADRE: ["HIJO", "HIJA"],
  HIJO: ["PADRE", "MADRE"],
  HIJA: ["PADRE", "MADRE"],
  MADRE: ["HIJO", "HIJA"],
  HERMANO: ["HERMANO", "HERMANA"],
  HERMANA: ["HERMANO", "HERMANA"],
  CONYUGE: ["CONYUGE"],
};

// Crear relacion (fuente OBLIGATORIA)
relacionesRouter.post("/", async (req: AuthRequest, res) => {
  const { personaAId, personaBId, tipoRelacion, fuente, fechaFuente, notas } = req.body;

  if (!personaAId || !personaBId || !tipoRelacion || !fuente) {
    res.status(400).json({ error: "personaAId, personaBId, tipoRelacion y fuente son REQUERIDOS" });
    return;
  }
  if (personaAId === personaBId) {
    res.status(400).json({ error: "Una persona no puede relacionarse consigo misma" });
    return;
  }

  const [r] = await db.insert(relaciones).values({
    personaAId, personaBId, tipoRelacion, fuente,
    fechaFuente: fechaFuente || null,
    notas: notas || null,
  }).returning();
  res.status(201).json(r);
});

// Listar relaciones directas de una persona
relacionesRouter.get("/:personaId", async (req: AuthRequest, res) => {
  const pid = parseInt(req.params.personaId);
  const result = await db.select({
    id: relaciones.id,
    tipoRelacion: relaciones.tipoRelacion,
    fuente: relaciones.fuente,
    fechaFuente: relaciones.fechaFuente,
    personaA: { id: personas.id, nombres: personas.nombres, apellidos: personas.apellidos, dni: personas.dni },
    personaB: { id: personas.id, nombres: personas.nombres, apellidos: personas.apellidos, dni: personas.dni },
  })
  .from(relaciones)
  .innerJoin(personas, or(
    eq(relaciones.personaAId, personas.id),
    eq(relaciones.personaBId, personas.id)
  ))
  .where(or(eq(relaciones.personaAId, pid), eq(relaciones.personaBId, pid)));

  res.json(result);
});

// Parse texto para sugerir relaciones
relacionesRouter.post("/parse-texto", async (req: AuthRequest, res) => {
  const { texto, fuente_default } = req.body;
  if (!texto || !fuente_default) {
    res.status(400).json({ error: "texto y fuente_default son requeridos" });
    return;
  }

  const sugerencias: any[] = [];
  const lines = texto.split("\n").filter((l: string) => l.trim());

  // Patrones: "FULANO es PADRE de FULANO"
  const patron = /^(.+?)\s+(?:es|fue|era)\s+(PADRE|MADRE|HIJO|HIJA|HERMANO|HERMANA|CONYUGE|CU.ADO|CU.ADA|SOCIO)\s+(?:de\s+)?(.+)$/i;

  for (const line of lines) {
    const m = line.match(patron);
    if (m) {
      const tipoMap: Record<string, string> = {
        padre: "PADRE", madre: "MADRE", hijo: "HIJO", hija: "HIJA",
        hermano: "HERMANO", hermana: "HERMANA", conyuge: "CONYUGE",
        "cuñado": "CUNADO", "cuñada": "CUNADA", socio: "SOCIO",
      };
      sugerencias.push({
        personaA: m[1].trim(),
        personaB: m[3].trim(),
        tipoRelacion: tipoMap[m[2].toLowerCase()] || "OTRO",
        fuente: fuente_default,
      });
    }
  }

  res.json({ sugerencias, total: sugerencias.length });
});

// Eliminar relacion
relacionesRouter.delete("/:id", async (req: AuthRequest, res) => {
  await db.delete(relaciones).where(eq(relaciones.id, parseInt(req.params.id)));
  res.json({ ok: true });
});

export { FAMILY_MAP };
