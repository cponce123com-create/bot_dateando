export interface Persona {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  esObjetivo: boolean;
  cargo: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Relacion {
  id: number;
  personaAId: number;
  personaBId: number;
  tipoRelacion: string;
  fuente: string;
  fechaFuente: string | null;
  notas: string | null;
  createdAt: string;
}

export interface Empresa {
  id: number;
  ruc: string;
  razonSocial: string;
  notas: string | null;
  createdAt: string;
}

export interface BusquedaResult {
  persona: Persona | null;
  mensaje?: string;
  conexionesGrado1: ConexionResult[];
  conexionesGrado2: ConexionResult[];
  alertaObjetivo: boolean;
  cadenasObjetivo: string[];
  empresasCompartidas: EmpresaCompartida[];
}

export interface ConexionResult {
  relacionId: number;
  grado: number;
  tipoRelacion: string;
  fuente: string;
  persona: Persona | null;
  via?: string;
}

export interface EmpresaCompartida {
  empresa: Empresa;
  persona: Persona;
  cargo: string | null;
  fuente: string;
}
