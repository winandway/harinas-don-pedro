-- Esquema de la base de Harinas y Pulpas Don Pedro (SQLite / YaDominios env.DB).
-- Columnas en camelCase para coincidir 1:1 con los tipos del frontend.
-- El worker garantiza estas tablas al arrancar; este archivo es la fuente de verdad.

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  clave TEXT NOT NULL,
  rol TEXT NOT NULL,
  telefono TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  creadoEl TEXT NOT NULL,
  ultimoAcceso TEXT
);

CREATE TABLE IF NOT EXISTS sesiones (
  token TEXT PRIMARY KEY,
  usuarioId TEXT NOT NULL,
  creadoEl TEXT NOT NULL,
  expiraEl TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT,
  telefono TEXT,
  whatsapp TEXT,
  correo TEXT,
  documento TEXT,
  direccion TEXT,
  ciudad TEXT,
  notas TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  creadoEl TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  presentacion TEXT,
  precioRefUsd REAL,
  stock REAL NOT NULL DEFAULT 0,
  stockMinimo REAL NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  notas TEXT,
  creadoEl TEXT
);

CREATE TABLE IF NOT EXISTS movimientos (
  id TEXT PRIMARY KEY,
  productoId TEXT,
  productoNombre TEXT,
  tipo TEXT,
  cantidad REAL,
  motivo TEXT,
  fecha TEXT,
  usuario TEXT
);

CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  numero TEXT,
  clienteId TEXT,
  clienteNombre TEXT,
  telefono TEXT,
  items TEXT,
  estado TEXT,
  canal TEXT,
  fecha TEXT,
  fechaEntrega TEXT,
  notas TEXT,
  creadoPor TEXT,
  descontadoInventario INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pagos (
  id TEXT PRIMARY KEY,
  numero TEXT,
  fecha TEXT,
  clienteId TEXT,
  clienteNombre TEXT,
  pedidoId TEXT,
  metodo TEXT,
  moneda TEXT,
  monto REAL,
  tasaBs REAL,
  equivalenteUsd REAL,
  referencia TEXT,
  telefono TEXT,
  banco TEXT,
  captura TEXT,
  estado TEXT,
  verificadoPor TEXT,
  notas TEXT,
  registradoPor TEXT
);

CREATE TABLE IF NOT EXISTS tasas (
  id TEXT PRIMARY KEY,
  fecha TEXT,
  bcv REAL,
  paralelo REAL,
  usdt REAL,
  registradoPor TEXT
);

CREATE TABLE IF NOT EXISTS config (
  clave TEXT PRIMARY KEY,
  valor TEXT
);

CREATE TABLE IF NOT EXISTS capturas (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  datos TEXT,
  creadoEl TEXT
);
