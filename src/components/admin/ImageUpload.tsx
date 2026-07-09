"use client";

// Subida de captura de comprobante: reduce la imagen a un dataURL liviano
// (máx. 1000 px, JPEG 80%) para guardarla en el almacenamiento local.

import { useRef, useState } from "react";
import { IcoSubir, IcoX } from "./icons";

async function comprimir(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const MAX = 1000;
  const escala = Math.min(1, MAX / Math.max(img.width, img.height));
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export default function ImageUpload({
  valor,
  onCambio,
  label = "Captura del comprobante",
}: {
  valor?: string;
  onCambio: (dataUrl: string | undefined) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [cargando, setCargando] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f || !f.type.startsWith("image/")) return;
    setCargando(true);
    try {
      onCambio(await comprimir(f));
    } finally {
      setCargando(false);
    }
  };

  if (valor) {
    return (
      <div className="relative rounded-xl overflow-hidden ring-1 ring-rojo/15 bg-crema">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={valor} alt="Comprobante de pago" className="w-full max-h-56 object-contain" />
        <button
          type="button"
          onClick={() => onCambio(undefined)}
          aria-label="Quitar captura"
          className="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <IcoX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files?.[0]);
      }}
      className="w-full rounded-xl border-2 border-dashed border-rojo/20 bg-crema/60 px-4 py-6 text-center hover:border-rojo/40 hover:bg-crema transition"
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <IcoSubir className="w-6 h-6 mx-auto text-rojo/60" />
      <p className="mt-2 text-sm font-medium text-negro-suave">
        {cargando ? "Procesando imagen…" : label}
      </p>
      <p className="text-xs text-gris mt-0.5">Toca para elegir o arrastra la imagen aquí</p>
    </button>
  );
}
