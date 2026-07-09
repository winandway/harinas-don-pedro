// Catálogos del panel: métodos de pago venezolanos, estados, canales y roles.
import type {
  CanalPedido,
  CategoriaProducto,
  EstadoPago,
  EstadoPedido,
  MetodoPago,
  Moneda,
  Rol,
  TipoCliente,
  TipoMovimiento,
} from "./types";

// ---------- Métodos de pago (Venezuela) ----------

export interface CampoConfig {
  key: string;
  label: string;
  placeholder: string;
}

export interface DefMetodo {
  label: string;
  corto: string;
  emoji: string;
  moneda: Moneda;
  descripcion: string;
  // Campos que el negocio configura para compartir con el cliente.
  camposConfig: CampoConfig[];
  // Campos que se piden al registrar un pago con este método.
  camposPago: Array<"referencia" | "telefono" | "banco">;
  pideCaptura: boolean;
}

export const METODOS: Record<MetodoPago, DefMetodo> = {
  pago_movil: {
    label: "Pago Móvil",
    corto: "P. Móvil",
    emoji: "📲",
    moneda: "VES",
    descripcion: "Transferencia interbancaria en bolívares con número de celular.",
    camposConfig: [
      { key: "banco", label: "Banco", placeholder: "Nombre del banco" },
      { key: "telefono", label: "Teléfono", placeholder: "04XX-0000000" },
      { key: "documento", label: "Cédula / RIF", placeholder: "V-00000000" },
    ],
    camposPago: ["referencia", "telefono", "banco"],
    pideCaptura: true,
  },
  transferencia_bs: {
    label: "Transferencia en Bs",
    corto: "Transf. Bs",
    emoji: "🏦",
    moneda: "VES",
    descripcion: "Transferencia bancaria en bolívares.",
    camposConfig: [
      { key: "banco", label: "Banco", placeholder: "Nombre del banco" },
      { key: "cuenta", label: "Número de cuenta", placeholder: "0000-0000-00-0000000000" },
      { key: "titular", label: "Titular", placeholder: "Nombre del titular" },
      { key: "documento", label: "Cédula / RIF", placeholder: "V-00000000" },
    ],
    camposPago: ["referencia", "banco"],
    pideCaptura: true,
  },
  punto_venta: {
    label: "Punto de venta",
    corto: "Punto",
    emoji: "💳",
    moneda: "VES",
    descripcion: "Pago con tarjeta por punto de venta.",
    camposConfig: [{ key: "banco", label: "Banco del punto", placeholder: "Nombre del banco" }],
    camposPago: ["referencia"],
    pideCaptura: false,
  },
  efectivo_bs: {
    label: "Efectivo Bs",
    corto: "Efec. Bs",
    emoji: "💵",
    moneda: "VES",
    descripcion: "Efectivo en bolívares al momento de la entrega.",
    camposConfig: [],
    camposPago: [],
    pideCaptura: false,
  },
  zelle: {
    label: "Zelle",
    corto: "Zelle",
    emoji: "🇺🇸",
    moneda: "USD",
    descripcion: "Transferencia en dólares vía Zelle.",
    camposConfig: [
      { key: "correo", label: "Correo Zelle", placeholder: "correo@ejemplo.com" },
      { key: "titular", label: "Titular", placeholder: "Nombre del titular" },
    ],
    camposPago: ["referencia"],
    pideCaptura: true,
  },
  efectivo_usd: {
    label: "Efectivo USD",
    corto: "Efec. $",
    emoji: "💵",
    moneda: "USD",
    descripcion: "Efectivo en dólares (divisas).",
    camposConfig: [],
    camposPago: [],
    pideCaptura: false,
  },
  paypal: {
    label: "PayPal",
    corto: "PayPal",
    emoji: "🅿️",
    moneda: "USD",
    descripcion: "Pago en dólares vía PayPal.",
    camposConfig: [{ key: "correo", label: "Correo PayPal", placeholder: "correo@ejemplo.com" }],
    camposPago: ["referencia"],
    pideCaptura: true,
  },
  zinli: {
    label: "Zinli",
    corto: "Zinli",
    emoji: "🟣",
    moneda: "USD",
    descripcion: "Billetera digital Zinli en dólares.",
    camposConfig: [{ key: "correo", label: "Correo Zinli", placeholder: "correo@ejemplo.com" }],
    camposPago: ["referencia"],
    pideCaptura: true,
  },
  usdt: {
    label: "USDT (Tether)",
    corto: "USDT",
    emoji: "₮",
    moneda: "USDT",
    descripcion: "Criptomoneda estable USDT.",
    camposConfig: [
      { key: "red", label: "Red", placeholder: "TRC20 / BEP20" },
      { key: "direccion", label: "Dirección de la billetera", placeholder: "Dirección USDT" },
    ],
    camposPago: ["referencia"],
    pideCaptura: true,
  },
  binance: {
    label: "Binance Pay",
    corto: "Binance",
    emoji: "🟡",
    moneda: "USDT",
    descripcion: "Pago por Binance Pay (ID o correo).",
    camposConfig: [{ key: "id", label: "Binance ID / correo", placeholder: "ID o correo de Binance" }],
    camposPago: ["referencia"],
    pideCaptura: true,
  },
};

export const ORDEN_METODOS: MetodoPago[] = [
  "pago_movil",
  "transferencia_bs",
  "punto_venta",
  "efectivo_bs",
  "zelle",
  "efectivo_usd",
  "paypal",
  "zinli",
  "usdt",
  "binance",
];

// ---------- Estados de pedido ----------

export const ESTADOS_PEDIDO: Record<
  EstadoPedido,
  { label: string; badge: string; dot: string }
> = {
  consulta: { label: "Consulta", badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  confirmado: { label: "Confirmado", badge: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  en_produccion: { label: "En producción", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  listo: { label: "Listo para entrega", badge: "bg-violet-100 text-violet-800", dot: "bg-violet-500" },
  entregado: { label: "Entregado", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export const FLUJO_PEDIDO: EstadoPedido[] = [
  "consulta",
  "confirmado",
  "en_produccion",
  "listo",
  "entregado",
];

// ---------- Estados de pago ----------

export const ESTADOS_PAGO: Record<
  EstadoPago,
  { label: string; badge: string }
> = {
  por_verificar: { label: "Por verificar", badge: "bg-amber-100 text-amber-800" },
  verificado: { label: "Verificado", badge: "bg-emerald-100 text-emerald-800" },
  rechazado: { label: "Rechazado", badge: "bg-red-100 text-red-700" },
};

// ---------- Canales ----------

export const CANALES: Record<CanalPedido, { label: string; emoji: string }> = {
  whatsapp: { label: "WhatsApp", emoji: "💬" },
  llamada: { label: "Llamada", emoji: "📞" },
  instagram: { label: "Instagram", emoji: "📸" },
  web: { label: "Página web", emoji: "🌐" },
  presencial: { label: "Presencial", emoji: "🤝" },
  otro: { label: "Otro", emoji: "📋" },
};

// ---------- Tipos de cliente ----------

export const TIPOS_CLIENTE: Record<TipoCliente, { label: string; badge: string }> = {
  detal: { label: "Detal", badge: "bg-slate-100 text-slate-700" },
  mayorista: { label: "Mayorista", badge: "bg-amber-100 text-amber-800" },
  restaurante: { label: "Restaurante", badge: "bg-sky-100 text-sky-800" },
  tienda: { label: "Tienda", badge: "bg-violet-100 text-violet-800" },
  distribuidor: { label: "Distribuidor", badge: "bg-emerald-100 text-emerald-800" },
};

// ---------- Categorías de producto ----------

export const CATEGORIAS: Record<CategoriaProducto, { label: string; emoji: string }> = {
  harina: { label: "Harina", emoji: "🌾" },
  pulpa: { label: "Pulpa", emoji: "🍓" },
  bebida: { label: "Bebida", emoji: "🥤" },
  otro: { label: "Otro", emoji: "📦" },
};

// ---------- Movimientos de inventario ----------

export const TIPOS_MOVIMIENTO: Record<
  TipoMovimiento,
  { label: string; signo: 1 | -1; badge: string }
> = {
  entrada: { label: "Entrada (producción)", signo: 1, badge: "bg-emerald-100 text-emerald-800" },
  salida: { label: "Salida (venta)", signo: -1, badge: "bg-sky-100 text-sky-800" },
  ajuste: { label: "Ajuste", signo: 1, badge: "bg-slate-100 text-slate-700" },
  merma: { label: "Merma / pérdida", signo: -1, badge: "bg-red-100 text-red-700" },
};

// ---------- Roles ----------

export const ROLES: Record<Rol, { label: string; descripcion: string; badge: string }> = {
  superadmin: {
    label: "Superadmin",
    descripcion: "Control total: usuarios, configuración, respaldos y todo lo demás.",
    badge: "bg-rojo/10 text-rojo",
  },
  admin: {
    label: "Administrador",
    descripcion: "Gestiona pedidos, clientes, pagos, inventario y reportes.",
    badge: "bg-amber-100 text-amber-800",
  },
  ventas: {
    label: "Ventas",
    descripcion: "Registra pedidos, clientes y pagos. No toca configuración.",
    badge: "bg-sky-100 text-sky-800",
  },
  produccion: {
    label: "Producción",
    descripcion: "Ve pedidos y actualiza inventario y estados de producción.",
    badge: "bg-emerald-100 text-emerald-800",
  },
};
