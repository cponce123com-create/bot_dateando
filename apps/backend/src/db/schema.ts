import {
  pgTable, serial, varchar, text, boolean, date,
  timestamp, integer, index, uniqueIndex, pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// === Enums ===
export const tipoRelacionEnum = pgEnum("tipo_relacion", [
  "PADRE", "MADRE", "HIJO", "HIJA",
  "HERMANO", "HERMANA", "CONYUGE",
  "CUNADO", "CUNADA", "SOBRINO", "SOBRINA",
  "SOCIO", "OTRO",
]);

// === Tablas ===
export const personas = pgTable("personas", {
  id: serial("id").primaryKey(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  nombres: varchar("nombres", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  esObjetivo: boolean("es_objetivo").default(false).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_personas_dni").on(table.dni),
]);

export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  ruc: varchar("ruc", { length: 20 }).notNull().unique(),
  razonSocial: varchar("razon_social", { length: 255 }).notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const relaciones = pgTable("relaciones", {
  id: serial("id").primaryKey(),
  personaAId: integer("persona_a_id").references(() => personas.id, { onDelete: "cascade" }).notNull(),
  personaBId: integer("persona_b_id").references(() => personas.id, { onDelete: "cascade" }).notNull(),
  tipoRelacion: tipoRelacionEnum("tipo_relacion").notNull(),
  fuente: varchar("fuente", { length: 500 }).notNull(),
  fechaFuente: date("fecha_fuente"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_rel_persona_a").on(table.personaAId),
  index("idx_rel_persona_b").on(table.personaBId),
]);

export const personaEmpresa = pgTable("persona_empresa", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").references(() => personas.id, { onDelete: "cascade" }).notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id, { onDelete: "cascade" }).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  fuente: varchar("fuente", { length: 500 }).notNull(),
  desde: date("desde"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_pe_persona").on(table.personaId),
  index("idx_pe_empresa").on(table.empresaId),
]);

// === Auth ===
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Relations (Drizzle ORM) ===
export const personasRelations = relations(personas, ({ many }) => ({
  relacionesComoA: many(relaciones, { relationName: "personaA" }),
  relacionesComoB: many(relaciones, { relationName: "personaB" }),
  empresas: many(personaEmpresa),
}));

export const relacionesRelations = relations(relaciones, ({ one }) => ({
  personaA: one(personas, { fields: [relaciones.personaAId], references: [personas.id], relationName: "personaA" }),
  personaB: one(personas, { fields: [relaciones.personaBId], references: [personas.id], relationName: "personaB" }),
}));

export const personaEmpresaRelations = relations(personaEmpresa, ({ one }) => ({
  persona: one(personas, { fields: [personaEmpresa.personaId], references: [personas.id] }),
  empresa: one(empresas, { fields: [personaEmpresa.empresaId], references: [empresas.id] }),
}));
