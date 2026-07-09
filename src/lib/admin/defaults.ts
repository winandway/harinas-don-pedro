// Estado inicial del panel. Sin datos de prueba: solo los productos reales
// del catálogo y un usuario administrador inicial cuya clave debe cambiarse.
import type { Config, DB, MetodoConfig, MetodoPago, ProductoAdmin, Usuario } from "./types";
import { ORDEN_METODOS } from "./catalogos";

export const CLAVE_INICIAL = "donpedro1915";

function metodosVacios(): Record<MetodoPago, MetodoConfig> {
  const out = {} as Record<MetodoPago, MetodoConfig>;
  for (const m of ORDEN_METODOS) out[m] = { habilitado: false, campos: {} };
  // Métodos que no requieren datos se habilitan de entrada.
  out.efectivo_usd.habilitado = true;
  out.efectivo_bs.habilitado = true;
  return out;
}

export function configInicial(): Config {
  return {
    metodos: metodosVacios(),
    notaCobro:
      "Al realizar tu pago, envíanos la captura o el número de referencia para confirmarlo. ¡Gracias por tu compra!",
    claveInicial: true,
  };
}

// Productos reales del catálogo Don Pedro (stock inicial en cero:
// el equipo lo carga con su primer inventario).
export function productosIniciales(ahora: string): ProductoAdmin[] {
  const base = { stock: 0, stockMinimo: 10, activo: true };
  return [
    { id: "prod-harina-platano", nombre: "Harina de Plátano", categoria: "harina", presentacion: "500 g", ...base },
    { id: "prod-harina-yuca", nombre: "Harina de Yuca", categoria: "harina", presentacion: "500 g", ...base },
    { id: "prod-nutriban-cambur", nombre: "Nutriban · Harina de Cambur", categoria: "harina", presentacion: "500 g", ...base },
    { id: "prod-nutribam-bebida", nombre: "Nutribam · Bebida instantánea de Cambur", categoria: "bebida", presentacion: "250 g", ...base },
    { id: "prod-pulpa-tomate-arbol", nombre: "Pulpa de Tomate de Árbol", categoria: "pulpa", presentacion: "500 g", ...base },
    { id: "prod-pulpa-mora", nombre: "Pulpa de Mora", categoria: "pulpa", presentacion: "500 g", ...base },
    { id: "prod-pulpa-fresa", nombre: "Pulpa de Fresa", categoria: "pulpa", presentacion: "500 g", ...base },
    { id: "prod-pulpa-mango", nombre: "Pulpa de Mango", categoria: "pulpa", presentacion: "500 g", ...base },
    { id: "prod-pulpa-pina", nombre: "Pulpa de Piña", categoria: "pulpa", presentacion: "500 g", ...base },
    { id: "prod-pulpa-patilla", nombre: "Pulpa de Patilla", categoria: "pulpa", presentacion: "500 g", ...base },
  ].map((p) => ({ ...p, notas: "", creadoEl: ahora })) as ProductoAdmin[];
}

export function usuarioInicial(ahora: string): Usuario {
  return {
    id: "usr-admin",
    nombre: "Administrador",
    usuario: "admin",
    clave: CLAVE_INICIAL,
    rol: "superadmin",
    activo: true,
    creadoEl: ahora,
  };
}

export function dbInicial(): DB {
  const ahora = new Date().toISOString();
  return {
    version: 1,
    usuarios: [usuarioInicial(ahora)],
    clientes: [],
    productos: productosIniciales(ahora),
    movimientos: [],
    pedidos: [],
    pagos: [],
    tasas: [],
    config: configInicial(),
    contadores: { pedido: 0, pago: 0 },
  };
}
