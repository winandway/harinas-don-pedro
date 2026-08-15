"use client";

// Store del panel: estado en memoria respaldado por la base de datos del sitio
// a través de la API del worker (/datos/*). El login es server-side por sesión.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { DB, Pago, Pedido, Sesion } from "./types";

export type Op =
  | { accion: "upsert"; tabla: string; fila: Record<string, unknown> }
  | { accion: "delete"; tabla: string; id: string }
  | { accion: "config"; clave: string; valor: unknown };

interface StoreCtx {
  db: DB;
  ready: boolean;
  sesion: Sesion | null;
  login: (usuario: string, clave: string) => Promise<string | null>;
  logout: () => Promise<void>;
  // Aplica una o varias mutaciones en la base y refresca el estado.
  aplicar: (ops: Op[]) => Promise<void>;
  recargar: () => Promise<void>;
  // Sube una imagen de comprobante y devuelve su URL (/media/...).
  subirCaptura: (dataUrl: string) => Promise<string>;
  // Cambia la clave del usuario actual (verificada en el servidor). Devuelve
  // un mensaje de error o null si salió bien.
  cambiarClave: (actual: string, nueva: string) => Promise<string | null>;
}

const Ctx = createContext<StoreCtx | null>(null);

function dbVacia(): DB {
  return {
    version: 1,
    usuarios: [],
    clientes: [],
    productos: [],
    movimientos: [],
    pedidos: [],
    pagos: [],
    tasas: [],
    config: { metodos: {} as DB["config"]["metodos"], notaCobro: "", claveInicial: false },
    contadores: { pedido: 0, pago: 0 },
  };
}

async function api(path: string, opciones?: RequestInit) {
  const r = await fetch(path, {
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    ...opciones,
  });
  return r;
}

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(dbVacia);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ready, setReady] = useState(false);

  const aplicarSnapshot = useCallback((data: Record<string, unknown>) => {
    setDb({ ...(data as unknown as DB), version: 1 });
    if (data.sesion) setSesion(data.sesion as Sesion);
  }, []);

  const recargar = useCallback(async () => {
    const r = await api("/datos/estado");
    if (r.status === 401) {
      setSesion(null);
      return;
    }
    if (r.ok) {
      const data = await r.json();
      aplicarSnapshot(data);
    }
  }, [aplicarSnapshot]);

  useEffect(() => {
    (async () => {
      try {
        await recargar();
      } finally {
        setReady(true);
      }
    })();
  }, [recargar]);

  const login = useCallback(
    async (usuario: string, clave: string): Promise<string | null> => {
      const r = await api("/datos/login", {
        method: "POST",
        body: JSON.stringify({ usuario, clave }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        return data.error || "No se pudo iniciar sesión.";
      }
      const data = await r.json();
      setSesion(data.sesion as Sesion);
      await recargar();
      return null;
    },
    [recargar]
  );

  const logout = useCallback(async () => {
    await api("/datos/logout", { method: "POST" }).catch(() => {});
    setSesion(null);
    setDb(dbVacia());
    window.location.reload();
  }, []);

  const aplicar = useCallback(async (ops: Op[]) => {
    const r = await api("/datos/aplicar", {
      method: "POST",
      body: JSON.stringify({ ops }),
    });
    if (r.status === 401) {
      setSesion(null);
      throw new Error("Tu sesión expiró. Entra de nuevo.");
    }
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data.error || "No se pudo guardar el cambio.");
    }
    const data = await r.json();
    aplicarSnapshot(data);
  }, [aplicarSnapshot]);

  const subirCaptura = useCallback(async (dataUrl: string): Promise<string> => {
    const r = await api("/media/subir", {
      method: "POST",
      body: JSON.stringify({ dataUrl }),
    });
    if (!r.ok) throw new Error("No se pudo subir la imagen.");
    const data = await r.json();
    return data.url as string;
  }, []);

  const cambiarClave = useCallback(
    async (actual: string, nueva: string): Promise<string | null> => {
      const r = await api("/datos/cambiar-clave", {
        method: "POST",
        body: JSON.stringify({ claveActual: actual, claveNueva: nueva }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        return data.error || "No se pudo cambiar la clave.";
      }
      await recargar();
      return null;
    },
    [recargar]
  );

  return (
    <Ctx.Provider
      value={{ db, ready, sesion, login, logout, aplicar, recargar, subirCaptura, cambiarClave }}
    >
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
