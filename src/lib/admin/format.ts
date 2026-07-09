// Utilidades de formato para el panel (moneda, fechas, CSV).
import type { Moneda } from "./types";

const nfUsd = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nfBs = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nfNum = new Intl.NumberFormat("es-VE", {
  maximumFractionDigits: 2,
});

export function fmtUsd(n: number): string {
  return `$ ${nfUsd.format(n || 0)}`;
}

export function fmtBs(n: number): string {
  return `Bs ${nfBs.format(n || 0)}`;
}

export function fmtNum(n: number): string {
  return nfNum.format(n || 0);
}

export function fmtMoneda(monto: number, moneda: Moneda): string {
  if (moneda === "VES") return fmtBs(monto);
  if (moneda === "USDT") return `₮ ${nfUsd.format(monto || 0)}`;
  return fmtUsd(monto);
}

export function fmtFecha(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtFechaHora(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hoyIso(): string {
  return new Date().toISOString();
}

export function hoyFecha(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function haceDias(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  const mes = Math.floor(d / 30);
  return mes === 1 ? "hace 1 mes" : `hace ${mes} meses`;
}

export function numeroDoc(prefijo: string, n: number): string {
  return `${prefijo}-${String(n).padStart(4, "0")}`;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- CSV ----------

export function descargarCsv(nombre: string, filas: Array<Record<string, unknown>>) {
  if (!filas.length) return;
  const cols = Object.keys(filas[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    cols.join(";"),
    ...filas.map((f) => cols.map((c) => esc(f[c])).join(";")),
  ].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function descargarJson(nombre: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
