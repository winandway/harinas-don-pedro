// Backend de Harinas y Pulpas Don Pedro para YaDominios Cloud.
// Sirve el sitio estático (env.ASSETS) y expone la API del panel bajo /datos/*
// y las imágenes de comprobantes bajo /media/*, contra la base SQLite (env.DB).
// Login server-side por sesión (cookie httpOnly). Sin /api/ (lo capturan los assets).

const COOKIE = "hdp_sesion";
const SESION_DIAS = 30;

// Columnas permitidas por tabla (evita escribir columnas desconocidas).
const COLUMNAS = {
  clientes: ["id", "nombre", "tipo", "telefono", "whatsapp", "correo", "documento", "direccion", "ciudad", "notas", "activo", "creadoEl"],
  productos: ["id", "nombre", "categoria", "presentacion", "precioRefUsd", "stock", "stockMinimo", "activo", "notas", "creadoEl"],
  movimientos: ["id", "productoId", "productoNombre", "tipo", "cantidad", "motivo", "fecha", "usuario"],
  pedidos: ["id", "numero", "clienteId", "clienteNombre", "telefono", "items", "estado", "canal", "fecha", "fechaEntrega", "notas", "creadoPor", "descontadoInventario"],
  pagos: ["id", "numero", "fecha", "clienteId", "clienteNombre", "pedidoId", "metodo", "moneda", "monto", "tasaBs", "equivalenteUsd", "referencia", "telefono", "banco", "captura", "estado", "verificadoPor", "notas", "registradoPor"],
  tasas: ["id", "fecha", "bcv", "paralelo", "usdt", "registradoPor"],
  usuarios: ["id", "nombre", "usuario", "clave", "rol", "telefono", "activo", "creadoEl", "ultimoAcceso"],
};
const BOOLS = new Set(["activo", "descontadoInventario"]);

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, usuario TEXT NOT NULL UNIQUE, clave TEXT NOT NULL, rol TEXT NOT NULL, telefono TEXT, activo INTEGER NOT NULL DEFAULT 1, creadoEl TEXT NOT NULL, ultimoAcceso TEXT)`,
  `CREATE TABLE IF NOT EXISTS sesiones (token TEXT PRIMARY KEY, usuarioId TEXT NOT NULL, creadoEl TEXT NOT NULL, expiraEl TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT, telefono TEXT, whatsapp TEXT, correo TEXT, documento TEXT, direccion TEXT, ciudad TEXT, notas TEXT, activo INTEGER NOT NULL DEFAULT 1, creadoEl TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS productos (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, categoria TEXT, presentacion TEXT, precioRefUsd REAL, stock REAL NOT NULL DEFAULT 0, stockMinimo REAL NOT NULL DEFAULT 0, activo INTEGER NOT NULL DEFAULT 1, notas TEXT, creadoEl TEXT)`,
  `CREATE TABLE IF NOT EXISTS movimientos (id TEXT PRIMARY KEY, productoId TEXT, productoNombre TEXT, tipo TEXT, cantidad REAL, motivo TEXT, fecha TEXT, usuario TEXT)`,
  `CREATE TABLE IF NOT EXISTS pedidos (id TEXT PRIMARY KEY, numero TEXT, clienteId TEXT, clienteNombre TEXT, telefono TEXT, items TEXT, estado TEXT, canal TEXT, fecha TEXT, fechaEntrega TEXT, notas TEXT, creadoPor TEXT, descontadoInventario INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS pagos (id TEXT PRIMARY KEY, numero TEXT, fecha TEXT, clienteId TEXT, clienteNombre TEXT, pedidoId TEXT, metodo TEXT, moneda TEXT, monto REAL, tasaBs REAL, equivalenteUsd REAL, referencia TEXT, telefono TEXT, banco TEXT, captura TEXT, estado TEXT, verificadoPor TEXT, notas TEXT, registradoPor TEXT)`,
  `CREATE TABLE IF NOT EXISTS tasas (id TEXT PRIMARY KEY, fecha TEXT, bcv REAL, paralelo REAL, usdt REAL, registradoPor TEXT)`,
  `CREATE TABLE IF NOT EXISTS config (clave TEXT PRIMARY KEY, valor TEXT)`,
  `CREATE TABLE IF NOT EXISTS capturas (id TEXT PRIMARY KEY, tipo TEXT, datos TEXT, creadoEl TEXT)`,
];

let schemaListo = false;
async function ensureSchema(env) {
  if (schemaListo) return;
  for (const s of SCHEMA) await env.DB.prepare(s).run();
  schemaListo = true;
}

// ---------- utilidades ----------
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });

const uid = () => crypto.randomUUID();

async function sha256(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function leerCookie(request, nombre) {
  const c = request.headers.get("Cookie") || "";
  const m = c.match(new RegExp("(?:^|; )" + nombre + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function cookieSesion(token, dias) {
  const maxAge = dias > 0 ? dias * 86400 : 0;
  const val = dias > 0 ? token : "";
  return `${COOKIE}=${val}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

async function sesionActual(env, request) {
  const token = leerCookie(request, COOKIE);
  if (!token) return null;
  const s = await env.DB.prepare("SELECT * FROM sesiones WHERE token=?").bind(token).first();
  if (!s) return null;
  if (new Date(s.expiraEl).getTime() < Date.now()) {
    await env.DB.prepare("DELETE FROM sesiones WHERE token=?").bind(token).run();
    return null;
  }
  const u = await env.DB.prepare("SELECT * FROM usuarios WHERE id=?").bind(s.usuarioId).first();
  if (!u || !u.activo) return null;
  return { token, usuario: u };
}

// ---------- snapshot completo ----------
async function snapshot(env) {
  const q = async (sql) => (await env.DB.prepare(sql).all()).results || [];
  const bool = (v) => v === 1 || v === true;

  const usuarios = (await q("SELECT id,nombre,usuario,rol,telefono,activo,creadoEl,ultimoAcceso FROM usuarios ORDER BY creadoEl"))
    .map((u) => ({ ...u, activo: bool(u.activo) }));
  const clientes = (await q("SELECT * FROM clientes")).map((c) => ({ ...c, activo: bool(c.activo) }));
  const productos = (await q("SELECT * FROM productos")).map((p) => ({ ...p, activo: bool(p.activo) }));
  const movimientos = await q("SELECT * FROM movimientos ORDER BY fecha DESC");
  const pedidos = (await q("SELECT * FROM pedidos ORDER BY fecha DESC")).map((p) => ({
    ...p,
    items: JSON.parse(p.items || "[]"),
    descontadoInventario: bool(p.descontadoInventario),
  }));
  const pagos = await q("SELECT * FROM pagos ORDER BY fecha DESC");
  const tasas = await q("SELECT * FROM tasas ORDER BY fecha DESC");

  const filasConfig = await q("SELECT clave,valor FROM config");
  const cfg = {};
  for (const f of filasConfig) cfg[f.clave] = f.valor;
  const config = {
    metodos: cfg.metodos ? JSON.parse(cfg.metodos) : {},
    notaCobro: cfg.notaCobro || "",
    claveInicial: cfg.claveInicial === "1",
  };
  const contadores = {
    pedido: parseInt(cfg.contador_pedido || "0", 10),
    pago: parseInt(cfg.contador_pago || "0", 10),
  };

  return { usuarios, clientes, productos, movimientos, pedidos, pagos, tasas, config, contadores };
}

// ---------- aplicar mutaciones ----------
async function siguienteNumero(env, clave, prefijo) {
  const row = await env.DB.prepare("SELECT valor FROM config WHERE clave=?").bind(clave).first();
  const n = parseInt(row ? row.valor : "0", 10) + 1;
  await env.DB.prepare("INSERT INTO config (clave,valor) VALUES (?,?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor")
    .bind(clave, String(n)).run();
  return `${prefijo}-${String(n).padStart(4, "0")}`;
}

async function upsert(env, tabla, filaCruda) {
  const cols = COLUMNAS[tabla];
  if (!cols) throw new Error("tabla no permitida: " + tabla);
  const fila = { ...filaCruda };

  if (tabla === "usuarios") {
    if (fila.clave_plana != null && fila.clave_plana !== "") {
      fila.clave = await sha256(String(fila.clave_plana));
    }
    delete fila.clave_plana;
  }
  if (tabla === "pedidos") {
    if (Array.isArray(fila.items)) fila.items = JSON.stringify(fila.items);
    if (!fila.numero) fila.numero = await siguienteNumero(env, "contador_pedido", "PED");
  }
  if (tabla === "pagos") {
    if (!fila.numero) fila.numero = await siguienteNumero(env, "contador_pago", "PAG");
  }
  for (const b of BOOLS) if (b in fila) fila[b] = fila[b] ? 1 : 0;

  // Para actualizar usuario sin cambiar la clave, no incluimos la columna clave.
  const usar = cols.filter((c) => c in fila && !(tabla === "usuarios" && c === "clave" && fila.clave == null));
  if (!usar.includes("id")) throw new Error("falta id en upsert de " + tabla);

  // Existencia primero: si la fila existe se actualizan SOLO las columnas dadas
  // (permite ediciones parciales sin chocar con columnas NOT NULL); si no,
  // se inserta con todas las columnas recibidas.
  const existe = await env.DB.prepare(`SELECT 1 FROM ${tabla} WHERE id=?`).bind(fila.id).first();
  if (existe) {
    const setCols = usar.filter((c) => c !== "id");
    if (setCols.length === 0) return;
    const setClause = setCols.map((c) => `${c}=?`).join(",");
    const valores = setCols.map((c) => fila[c] ?? null);
    await env.DB.prepare(`UPDATE ${tabla} SET ${setClause} WHERE id=?`).bind(...valores, fila.id).run();
  } else {
    const placeholders = usar.map(() => "?").join(",");
    const valores = usar.map((c) => fila[c] ?? null);
    await env.DB.prepare(`INSERT INTO ${tabla} (${usar.join(",")}) VALUES (${placeholders})`).bind(...valores).run();
  }
}

async function aplicar(env, ops) {
  for (const op of ops) {
    if (op.accion === "config") {
      const valor = typeof op.valor === "string" ? op.valor : JSON.stringify(op.valor);
      await env.DB.prepare("INSERT INTO config (clave,valor) VALUES (?,?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor")
        .bind(op.clave, valor).run();
    } else if (op.accion === "delete") {
      if (!COLUMNAS[op.tabla]) throw new Error("tabla no permitida");
      await env.DB.prepare(`DELETE FROM ${op.tabla} WHERE id=?`).bind(op.id).run();
    } else if (op.accion === "upsert") {
      await upsert(env, op.tabla, op.fila);
    } else {
      throw new Error("acción desconocida: " + op.accion);
    }
  }
}

// ---------- media (comprobantes) ----------
async function guardarCaptura(env, dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!m) throw new Error("imagen inválida");
  const id = uid();
  await env.DB.prepare("INSERT INTO capturas (id,tipo,datos,creadoEl) VALUES (?,?,?,?)")
    .bind(id, m[1], m[2], new Date().toISOString()).run();
  return `/media/${id}`;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ---------- router ----------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path.startsWith("/datos/") || path.startsWith("/media/")) {
        await ensureSchema(env);
      }

      // --- API de datos ---
      if (path === "/datos/salud") return json({ ok: true });

      if (path === "/datos/login" && request.method === "POST") {
        const { usuario, clave } = await request.json();
        const u = await env.DB.prepare("SELECT * FROM usuarios WHERE lower(usuario)=lower(?)").bind((usuario || "").trim()).first();
        const hash = await sha256(clave || "");
        if (!u || u.clave !== hash) return json({ error: "Usuario o clave incorrectos." }, 401);
        if (!u.activo) return json({ error: "Este usuario está desactivado." }, 403);
        const token = uid();
        const ahora = new Date();
        const expira = new Date(ahora.getTime() + SESION_DIAS * 86400000);
        await env.DB.prepare("INSERT INTO sesiones (token,usuarioId,creadoEl,expiraEl) VALUES (?,?,?,?)")
          .bind(token, u.id, ahora.toISOString(), expira.toISOString()).run();
        await env.DB.prepare("UPDATE usuarios SET ultimoAcceso=? WHERE id=?").bind(ahora.toISOString(), u.id).run();
        return json(
          { ok: true, sesion: { usuarioId: u.id, nombre: u.nombre, usuario: u.usuario, rol: u.rol } },
          200,
          { "Set-Cookie": cookieSesion(token, SESION_DIAS) }
        );
      }

      if (path === "/datos/logout" && request.method === "POST") {
        const token = leerCookie(request, COOKIE);
        if (token) await env.DB.prepare("DELETE FROM sesiones WHERE token=?").bind(token).run();
        return json({ ok: true }, 200, { "Set-Cookie": cookieSesion("", 0) });
      }

      // De aquí en adelante requiere sesión.
      if (
        path === "/datos/sesion" ||
        path === "/datos/estado" ||
        path === "/datos/aplicar" ||
        path === "/datos/cambiar-clave" ||
        path === "/media/subir"
      ) {
        const s = await sesionActual(env, request);
        if (!s) return json({ error: "No autenticado" }, 401);

        if (path === "/datos/cambiar-clave" && request.method === "POST") {
          const { claveActual, claveNueva } = await request.json();
          const actualHash = await sha256(claveActual || "");
          if (s.usuario.clave !== actualHash) return json({ error: "La clave actual no es correcta." }, 400);
          if (!claveNueva || String(claveNueva).length < 6)
            return json({ error: "La clave nueva debe tener al menos 6 caracteres." }, 400);
          await env.DB.prepare("UPDATE usuarios SET clave=? WHERE id=?").bind(await sha256(claveNueva), s.usuario.id).run();
          await env.DB.prepare("INSERT INTO config (clave,valor) VALUES ('claveInicial','0') ON CONFLICT(clave) DO UPDATE SET valor='0'").run();
          return json({ ok: true });
        }

        if (path === "/datos/sesion") {
          return json({ sesion: { usuarioId: s.usuario.id, nombre: s.usuario.nombre, usuario: s.usuario.usuario, rol: s.usuario.rol } });
        }
        if (path === "/datos/estado") {
          const snap = await snapshot(env);
          return json({ ...snap, sesion: { usuarioId: s.usuario.id, nombre: s.usuario.nombre, usuario: s.usuario.usuario, rol: s.usuario.rol } });
        }
        if (path === "/datos/aplicar" && request.method === "POST") {
          const { ops } = await request.json();
          if (!Array.isArray(ops)) return json({ error: "ops inválido" }, 400);
          await aplicar(env, ops);
          return json(await snapshot(env));
        }
        if (path === "/media/subir" && request.method === "POST") {
          const { dataUrl } = await request.json();
          const ruta = await guardarCaptura(env, dataUrl);
          return json({ url: ruta });
        }
      }

      // --- servir imagen de comprobante ---
      if (path.startsWith("/media/")) {
        const s = await sesionActual(env, request);
        if (!s) return new Response("No autenticado", { status: 401 });
        const id = path.slice("/media/".length);
        const row = await env.DB.prepare("SELECT tipo,datos FROM capturas WHERE id=?").bind(id).first();
        if (!row) return new Response("No encontrado", { status: 404 });
        return new Response(base64ToBytes(row.datos), {
          headers: { "content-type": row.tipo || "image/jpeg", "cache-control": "private, max-age=86400" },
        });
      }

      if (path.startsWith("/datos/")) return json({ error: "No encontrado" }, 404);

      // --- resto: archivos estáticos ---
      return env.ASSETS.fetch(request);
    } catch (e) {
      return json({ error: String(e && e.message ? e.message : e) }, 500);
    }
  },
};
