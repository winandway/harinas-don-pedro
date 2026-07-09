// Tipos del panel de administración de Harinas y Pulpas Don Pedro.
// Fase actual: datos locales (localStorage) con respaldo JSON.
// Diseñado para migrar a Supabase después sin cambiar las vistas.

export type Rol = "superadmin" | "admin" | "ventas" | "produccion";

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  clave: string; // fase local; con Supabase pasa a auth real
  rol: Rol;
  telefono?: string;
  activo: boolean;
  creadoEl: string;
  ultimoAcceso?: string;
}

export type TipoCliente =
  | "detal"
  | "mayorista"
  | "restaurante"
  | "tienda"
  | "distribuidor";

export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  telefono?: string;
  whatsapp?: string;
  correo?: string;
  documento?: string; // cédula o RIF
  direccion?: string;
  ciudad?: string;
  notas?: string;
  activo: boolean;
  creadoEl: string;
}

export type CategoriaProducto = "harina" | "pulpa" | "bebida" | "otro";

export interface ProductoAdmin {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  presentacion: string;
  precioRefUsd?: number; // precio de referencia (los precios fluctúan)
  stock: number;
  stockMinimo: number;
  activo: boolean;
  notas?: string;
}

export type TipoMovimiento = "entrada" | "salida" | "ajuste" | "merma";

export interface MovimientoStock {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number; // positiva; el tipo define el signo
  motivo: string;
  fecha: string;
  usuario: string;
}

export type EstadoPedido =
  | "consulta"
  | "confirmado"
  | "en_produccion"
  | "listo"
  | "entregado"
  | "cancelado";

export type CanalPedido =
  | "whatsapp"
  | "llamada"
  | "instagram"
  | "web"
  | "presencial"
  | "otro";

export interface ItemPedido {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  precioUsd: number; // precio acordado para ese pedido
}

export interface Pedido {
  id: string;
  numero: string; // PED-0001
  clienteId?: string;
  clienteNombre: string;
  telefono?: string;
  items: ItemPedido[];
  estado: EstadoPedido;
  canal: CanalPedido;
  fecha: string;
  fechaEntrega?: string;
  notas?: string;
  creadoPor: string;
  descontadoInventario?: boolean;
}

export type MetodoPago =
  | "pago_movil"
  | "transferencia_bs"
  | "punto_venta"
  | "efectivo_bs"
  | "zelle"
  | "efectivo_usd"
  | "paypal"
  | "zinli"
  | "usdt"
  | "binance";

export type Moneda = "USD" | "VES" | "USDT";

export type EstadoPago = "por_verificar" | "verificado" | "rechazado";

export interface Pago {
  id: string;
  numero: string; // PAG-0001
  fecha: string;
  clienteId?: string;
  clienteNombre?: string;
  pedidoId?: string;
  metodo: MetodoPago;
  moneda: Moneda;
  monto: number;
  tasaBs?: number; // tasa usada si la moneda es VES
  equivalenteUsd: number;
  referencia?: string;
  telefono?: string;
  banco?: string;
  captura?: string; // dataURL del comprobante
  estado: EstadoPago;
  verificadoPor?: string;
  notas?: string;
  registradoPor: string;
}

export interface TasaRegistro {
  id: string;
  fecha: string;
  bcv: number;
  paralelo?: number;
  usdt?: number; // Bs por USDT
  registradoPor: string;
}

export interface MetodoConfig {
  habilitado: boolean;
  campos: Record<string, string>;
}

export interface Config {
  metodos: Record<MetodoPago, MetodoConfig>;
  notaCobro: string; // texto extra al compartir datos de cobro
  claveInicial: boolean; // true hasta que cambien la clave del primer usuario
}

export interface DB {
  version: number;
  usuarios: Usuario[];
  clientes: Cliente[];
  productos: ProductoAdmin[];
  movimientos: MovimientoStock[];
  pedidos: Pedido[];
  pagos: Pago[];
  tasas: TasaRegistro[];
  config: Config;
  contadores: { pedido: number; pago: number };
}

export interface Sesion {
  usuarioId: string;
  nombre: string;
  usuario: string;
  rol: Rol;
}
