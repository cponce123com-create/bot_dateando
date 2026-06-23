import { Router } from "express";
import { db } from "../db/index.js";
import { personas, relaciones, empresas, personaEmpresa } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { eq, or, and, sql, ne, not } from "drizzle-orm";

export const buscarRouter = Router();
buscarRouter.use(authMiddleware);

/**
 * Busca una persona por DNI y devuelve su red de contactos hasta 2do grado.
 * Si hay conexion con un "objetivo", lo resalta.
 */
buscarRouter.get("/:dni", async (req: AuthRequest, res) => {
  const dni = req.params.dni;

  // 1. Find the person
  const [target] = await db.select().from(personas).where(eq(personas.dni, dni));
  if (!target) {
    res.json({
      persona: null,
      mensaje: `No se encontro persona con DNI ${dni}`,
      conexionesGrado1: [],
      conexionesGrado2: [],
      alertaObjetivo: false,
      empresasCompartidas: [],
    });
    return;
  }

  // 2. Get all persons
  const allPersons = await db.select().from(personas);

  // 3. Get ALL relaciones (grado 1)
  const relsGrado1 = await db.select().from(relaciones).where(
    or(eq(relaciones.personaAId, target.id), eq(relaciones.personaBId, target.id))
  );

  // 4. Get grado 2 relaciones (connections of connections)
  const connectedIds = new Set<number>();
  for (const r of relsGrado1) {
    connectedIds.add(r.personaAId === target.id ? r.personaBId : r.personaAId);
  }

  const relsGrado2 = await db.select().from(relaciones).where(
    and(
      or(
        ...Array.from(connectedIds).map(id => eq(relaciones.personaAId, id)),
        ...Array.from(connectedIds).map(id => eq(relaciones.personaBId, id)),
      ),
      not(and(
        or(eq(relaciones.personaAId, target.id), eq(relaciones.personaBId, target.id))
      ))
    )
  );

  // 5. Check for "objetivo" connections
  const objetivos = allPersons.filter(p => p.esObjetivo);
  let alertaObjetivo = false;
  const cadenasObjetivo: string[] = [];

  for (const r of relsGrado1) {
    const otherId = r.personaAId === target.id ? r.personaBId : r.personaAId;
    const other = allPersons.find(p => p.id === otherId);
    if (other?.esObjetivo) {
      alertaObjetivo = true;
      cadenasObjetivo.push(`Conexion directa con OBJETIVO: ${other.nombres} ${other.apellidos} (${other.cargo || "sin cargo"}) via ${r.tipoRelacion} - Fuente: ${r.fuente}`);
    }
  }

  // Check grado 2 for objectives
  for (const r of relsGrado2) {
    const otherA = allPersons.find(p => p.id === r.personaAId);
    const otherB = allPersons.find(p => p.id === r.personaBId);
    if (otherA?.esObjetivo) {
      alertaObjetivo = true;
      cadenasObjetivo.push(`Conexion 2do grado con OBJETIVO: ${otherA.nombres} ${otherA.apellidos} (${otherA.cargo}) via ${r.tipoRelacion} - Fuente: ${r.fuente}`);
    }
    if (otherB?.esObjetivo) {
      alertaObjetivo = true;
      cadenasObjetivo.push(`Conexion 2do grado con OBJETIVO: ${otherB.nombres} ${otherB.apellidos} (${otherB.cargo}) via ${r.tipoRelacion} - Fuente: ${r.fuente}`);
    }
  }

  // 6. Build conexiones grado 1 response
  const conexionesGrado1 = relsGrado1.map(r => {
    const otherId = r.personaAId === target.id ? r.personaBId : r.personaAId;
    const other = allPersons.find(p => p.id === otherId);
    return {
      relacionId: r.id,
      grado: 1,
      tipoRelacion: r.tipoRelacion,
      fuente: r.fuente,
      persona: other ? {
        id: other.id, dni: other.dni, nombres: other.nombres,
        apellidos: other.apellidos, esObjetivo: other.esObjetivo, cargo: other.cargo
      } : null,
    };
  });

  // 7. Build conexiones grado 2 response
  const conexionesGrado2 = relsGrado2.map(r => {
    const pA = allPersons.find(p => p.id === r.personaAId);
    const pB = allPersons.find(p => p.id === r.personaBId);
    const notTarget = connectedIds.has(r.personaAId) ? pB : pA;
    const connector = connectedIds.has(r.personaAId) ? pA : pB;
    return {
      relacionId: r.id,
      grado: 2,
      tipoRelacion: r.tipoRelacion,
      fuente: r.fuente,
      persona: notTarget ? {
        id: notTarget.id, dni: notTarget.dni, nombres: notTarget.nombres,
        apellidos: notTarget.apellidos, esObjetivo: notTarget.esObjetivo, cargo: notTarget.cargo
      } : null,
      via: connector ? `${connector.nombres} ${connector.apellidos}` : null,
    };
  });

  // 8. Check shared businesses
  const targetEmpresas = await db.select({ empresaId: personaEmpresa.empresaId })
    .from(personaEmpresa).where(eq(personaEmpresa.personaId, target.id));

  const sharedIds = targetEmpresas.map(te => te.empresaId);
  let empresasCompartidas: any[] = [];
  if (sharedIds.length > 0) {
    for (const sid of sharedIds) {
      const others = await db.select().from(personaEmpresa).innerJoin(
        personas, eq(personaEmpresa.personaId, personas.id)
      ).innerJoin(
        empresas, eq(personaEmpresa.empresaId, empresas.id)
      ).where(and(
        eq(personaEmpresa.empresaId, sid),
        ne(personaEmpresa.personaId, target.id),
      ));
      
      for (const o of others) {
        const p = o.personas;
        const e = o.empresas;
        empresasCompartidas.push({
          empresa: { id: e.id, ruc: e.ruc, razonSocial: e.razonSocial },
          persona: { id: p.id, dni: p.dni, nombres: p.nombres, apellidos: p.apellidos, esObjetivo: p.esObjetivo },
          cargo: o.persona_empresa.cargo,
          fuente: o.persona_empresa.fuente,
        });
      }
    }
  }

  res.json({
    persona: target,
    conexionesGrado1,
    conexionesGrado2,
    alertaObjetivo,
    cadenasObjetivo,
    empresasCompartidas,
  });
});
