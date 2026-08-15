"use client";

// Store del panel: estado en memoria + persistencia en localStorage.
// Cuando se conecte Supabase, esta capa se reemplaza sin tocar las vistas.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { DB, Pago, Pedido, Sesion } from "./types";
import { dbInicial } from "./defaults";
import { verificarClave } from "./auth";

const KEY_DB = "hdp-admin-db-v1";
const KEY_SESION = "hdp-admin-sesion-v1";

interface StoreCtx {
  db: DB;
  ready: boolean;
  sesion: Sesion | null;
  login: (usuario: string, clave: string) => Promise<string | null>;
  logout: () => void;
  // Mutador central: recibe el estado actual y devuelve el nuevo.
  mutar: (fn: (db: DB) => DB) => void;
  reemplazarDb: (db: DB) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function cargarDb(): DB {
  try {
    const raw = localStorage.getItem(KEY_DB);
    if (!raw) return dbInicial();
    const data = JSON.parse(raw) as DB;
    if (!data || typeof data !== "object" || !Array.isArray(data.usuarios)) {
      return dbInicial();
    }
    // Fusiona con el inicial por si se agregan campos en versiones nuevas.
    return { ...dbInicial(), ...data, config: { ...dbInicial().config, ...data.config } };
  } catch {
    return dbInicial();
  }
}

function cargarSesion(): Sesion | null {
  try {
    const raw = localStorage.getItem(KEY_SESION);
    return raw ? (JSON.parse(raw) as Sesion) : null;
  } catch {
    return null;
  }
}

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(dbInicial);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ready, setReady] = useState(false);
  const primeraCarga = useRef(true);

  useEffect(() => {
    setDb(cargarDb());
    setSesion(cargarSesion());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY_DB, JSON.stringify(db));
    } catch {
      // localStorage lleno (capturas muy pesadas): se ignora para no romper la UI.
    }
  }, [db, ready]);

  const login = useCallback(
    async (usuario: string, clave: string): Promise<string | null> => {
      const u = db.usuarios.find(
        (x) => x.usuario.toLowerCase() === usuario.trim().toLowerCase()
      );
      if (!u || !(await verificarClave(clave, u.clave)))
        return "Usuario o clave incorrectos.";
      if (!u.activo) return "Este usuario está desactivado.";
      const s: Sesion = { usuarioId: u.id, nombre: u.nombre, usuario: u.usuario, rol: u.rol };
      setSesion(s);
      localStorage.setItem(KEY_SESION, JSON.stringify(s));
      setDb((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((x) =>
          x.id === u.id ? { ...x, ultimoAcceso: new Date().toISOString() } : x
        ),
      }));
      return null;
    },
    [db.usuarios]
  );

  const logout = useCallback(() => {
    setSesion(null);
    localStorage.removeItem(KEY_SESION);
  }, []);

  const mutar = useCallback((fn: (db: DB) => DB) => {
    setDb((prev) => fn(prev));
  }, []);

  const reemplazarDb = useCallback((nuevo: DB) => {
    setDb(nuevo);
  }, []);

  return (
    <Ctx.Provider value={{ db, ready, sesion, login, logout, mutar, reemplazarDb }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de AdminStoreProvider");
  return ctx;
}

// ---------- Derivaciones (funciones puras) ----------

export function totalPedido(p: Pedido): number {
  return p.items.reduce((acc, it) => acc + it.cantidad * it.precioUsd, 0);
}

export function abonadoPedido(pedidoId: string, pagos: Pago[]): number {
  return pagos
    .filter((pg) => pg.pedidoId === pedidoId && pg.estado === "verificado")
    .reduce((acc, pg) => acc + pg.equivalenteUsd, 0);
}

export function saldoPedido(p: Pedido, pagos: Pago[]): number {
  return Math.max(0, totalPedido(p) - abonadoPedido(p.id, pagos));
}

export function tasaActual(db: DB) {
  return db.tasas.length ? db.tasas[0] : null;
}
