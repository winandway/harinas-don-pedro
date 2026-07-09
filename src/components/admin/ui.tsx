"use client";

// Kit UI del panel: tarjetas, modales, menú kebab (el borrar SIEMPRE va aquí),
// campos de formulario, badges y estados vacíos.

import { useEffect, useRef, useState } from "react";
import { IcoKebab, IcoX, IcoAlerta, IcoBuscar } from "./icons";

// ---------- Tarjetas ----------

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white ring-1 ring-rojo/5 shadow-[0_2px_12px_rgba(124,33,24,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  titulo,
  valor,
  detalle,
  emoji,
  alerta = false,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  emoji: string;
  alerta?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gris">{titulo}</p>
          <p
            className={`mt-1.5 font-display text-2xl font-black truncate ${
              alerta ? "text-rojo" : "text-negro"
            }`}
          >
            {valor}
          </p>
          {detalle && <p className="mt-1 text-xs text-gris">{detalle}</p>}
        </div>
        <div
          className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center text-xl ${
            alerta ? "bg-rojo/10" : "bg-amarillo/15"
          }`}
        >
          {emoji}
        </div>
      </div>
    </Card>
  );
}

// ---------- Encabezado de página ----------

export function PageHeader({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-negro">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-gris">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

// ---------- Botones ----------

export const btnPrimario =
  "inline-flex items-center gap-2 rounded-full bg-rojo text-white font-semibold px-4 py-2.5 text-sm hover:bg-rojo-oscuro transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecundario =
  "inline-flex items-center gap-2 rounded-full bg-white text-rojo font-semibold px-4 py-2.5 text-sm ring-1 ring-rojo/20 hover:bg-rojo/5 transition-colors disabled:opacity-50";
export const btnAmarillo =
  "inline-flex items-center gap-2 rounded-full bg-amarillo text-negro font-semibold px-4 py-2.5 text-sm hover:brightness-105 transition disabled:opacity-50";
export const btnSuave =
  "inline-flex items-center gap-2 rounded-full bg-crema text-negro-suave font-medium px-3.5 py-2 text-sm hover:bg-crema-2 transition-colors";

// ---------- Badge ----------

export function Badge({
  children,
  className = "bg-slate-100 text-slate-700",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

// ---------- Modal ----------

export function Modal({
  titulo,
  onClose,
  children,
  ancho = "max-w-xl",
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
  ancho?: string;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative w-full ${ancho} my-4 rounded-2xl bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-rojo/10">
          <h2 className="font-display text-lg font-bold text-rojo-oscuro">{titulo}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 grid place-items-center rounded-full text-gris hover:bg-black/5 hover:text-negro transition"
          >
            <IcoX className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- Confirmación ----------

export function Confirmar({
  titulo,
  mensaje,
  textoBoton = "Sí, continuar",
  destructivo = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  mensaje: string;
  textoBoton?: string;
  destructivo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal titulo={titulo} onClose={onCancelar} ancho="max-w-md">
      <div className="flex gap-3 items-start">
        <div
          className={`shrink-0 w-10 h-10 rounded-full grid place-items-center ${
            destructivo ? "bg-red-100 text-red-600" : "bg-amarillo/20 text-rojo-oscuro"
          }`}
        >
          <IcoAlerta className="w-5 h-5" />
        </div>
        <p className="text-sm text-negro-suave leading-relaxed">{mensaje}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onCancelar}>
          Cancelar
        </button>
        <button
          className={
            destructivo
              ? "inline-flex items-center gap-2 rounded-full bg-red-600 text-white font-semibold px-4 py-2.5 text-sm hover:bg-red-700 transition"
              : btnPrimario
          }
          onClick={onConfirmar}
        >
          {textoBoton}
        </button>
      </div>
    </Modal>
  );
}

// ---------- Menú kebab (3 puntos) ----------

export interface AccionKebab {
  label: string;
  icono?: React.ReactNode;
  destructiva?: boolean;
  onClick: () => void;
}

export function KebabMenu({ acciones }: { acciones: AccionKebab[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Más opciones"
        aria-expanded={open}
        className="w-9 h-9 grid place-items-center rounded-full text-gris hover:bg-black/5 hover:text-negro transition"
      >
        <IcoKebab className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-44 rounded-xl bg-white shadow-xl ring-1 ring-black/5 py-1.5 overflow-hidden">
          {acciones.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors ${
                a.destructiva
                  ? "text-red-600 hover:bg-red-50"
                  : "text-negro-suave hover:bg-crema"
              }`}
            >
              {a.icono}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Estado vacío ----------

export function EmptyState({
  emoji,
  titulo,
  texto,
  accion,
}: {
  emoji: string;
  titulo: string;
  texto: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="py-14 px-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-amarillo/15 grid place-items-center text-3xl">
        {emoji}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-negro">{titulo}</h3>
      <p className="mt-1.5 text-sm text-gris max-w-sm mx-auto leading-relaxed">{texto}</p>
      {accion && <div className="mt-5 flex justify-center">{accion}</div>}
    </div>
  );
}

// ---------- Campos de formulario ----------

export function Field({
  label,
  children,
  requerido = false,
  ayuda,
}: {
  label: string;
  children: React.ReactNode;
  requerido?: boolean;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-negro-suave mb-1.5">
        {label} {requerido && <span className="text-rojo">*</span>}
      </span>
      {children}
      {ayuda && <span className="block text-[11px] text-gris mt-1">{ayuda}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-rojo/15 bg-white px-3.5 py-2.5 text-sm text-negro placeholder:text-gris/70 outline-none focus:border-rojo/40 focus:ring-2 focus:ring-rojo/10 transition";

export const selectCls = inputCls + " appearance-none";

// ---------- Búsqueda ----------

export function SearchInput({
  valor,
  onCambio,
  placeholder = "Buscar…",
}: {
  valor: string;
  onCambio: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <IcoBuscar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
      <input
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className={inputCls + " pl-10"}
      />
    </div>
  );
}

// ---------- Lightbox de imagen ----------

export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 w-11 h-11 grid place-items-center rounded-full bg-white/15 text-white hover:bg-white/30"
      >
        <IcoX className="w-5 h-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative max-w-full max-h-[88vh] rounded-xl object-contain" />
    </div>
  );
}

// ---------- Tabla ----------

export function Tabla({
  cabeceras,
  children,
}: {
  cabeceras: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-gris border-b border-rojo/10">
            {cabeceras.map((c, i) => (
              <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rojo/5">{children}</tbody>
      </table>
    </div>
  );
}
