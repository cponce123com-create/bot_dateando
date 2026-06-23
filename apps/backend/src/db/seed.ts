import { db } from "./index.js";
import { personas, relaciones, tipoRelacionEnum, usuarios } from "./schema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("Seeding database...");

  // Usuario
  const hash = await bcrypt.hash("admin123", 10);
  await db.insert(usuarios).values({
    username: "admin",
    passwordHash: hash,
  }).onConflictDoNothing();
  console.log("  User: admin / admin123");

  // Personas objetivo
  const p = await db.insert(personas).values([
    { dni: "12345678", nombres: "Carlos", apellidos: "Mendoza Rios", esObjetivo: true, cargo: "Alcalde Distrital" },
    { dni: "23456789", nombres: "Rosa", apellidos: "Lopez Garcia", esObjetivo: true, cargo: "Regidora" },
    { dni: "34567890", nombres: "Miguel", apellidos: "Torres Paz", esObjetivo: true, cargo: "Funcionario Municipal" },
    { dni: "45678901", nombres: "Jorge", apellidos: "Salas Ruiz", esObjetivo: true, cargo: "Periodista / Operador" },
    { dni: "99999999", nombres: "Proveedor", apellidos: "Anonimo S.A.", esObjetivo: false, cargo: "Proveedor" },
  ]).returning();
  console.log("  Personas creadas:", p.length);

  // Relaciones
  await db.insert(relaciones).values([
    { personaAId: p[0].id, personaBId: p[1].id, tipoRelacion: "CONYUGE", fuente: "Declaracion de Intereses 2025" },
    { personaAId: p[0].id, personaBId: p[2].id, tipoRelacion: "HERMANO", fuente: "RENIEC - solicitud tasa 2026-01" },
    { personaAId: p[2].id, personaBId: p[3].id, tipoRelacion: "SOCIO", fuente: "Gaceta Municipal N 15" },
    { personaAId: p[3].id, personaBId: p[4].id, tipoRelacion: "HERMANO", fuente: "Declaracion Jurada 2024" },
  ]);
  console.log("  Relaciones creadas: 4");

  console.log("Seed completo!");
}

seed().catch(console.error).then(() => process.exit(0));
