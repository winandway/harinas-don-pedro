"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { empresa, documentosLegales } from "@/lib/site";
import Reveal from "./Reveal";
import { CheckIcon, CloseIcon } from "./icons";

export default function Legal() {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!zoom) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  return (
    <section id="legal" className="py-16 sm:py-24 bg-crema">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            Empresa verificada
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            Legalidad y confianza
          </h2>
          <p className="mt-4 text-negro-suave">
            Somos un emprendimiento formal, registrado y con permisos vigentes.
            Aquí puedes revisar nuestros documentos.
          </p>
        </Reveal>

        {/* Ficha de empresa */}
        <Reveal delay={80} className="mt-10">
          <div className="rounded-3xl bg-white ring-1 ring-rojo/5 shadow-[0_2px_16px_rgba(124,33,24,0.06)] p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Dato k="Razón social" v={empresa.razonSocial} />
              <Dato k="Propietaria" v={empresa.propietaria} />
              <Dato k="RIF" v={empresa.rif} />
              <Dato k="Registro Sanitario (PSN)" v={empresa.registroSanitario} />
              <Dato k="Ubicación" v={`${empresa.ciudad}, ${empresa.estado}, ${empresa.pais}`} />
              <Dato k="Fundada" v={`Tradición desde ${empresa.desde}`} />
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                "Permiso Sanitario vigente (SACS)",
                "RIF activo (SENIAT)",
                "Producto 100% natural",
                "Libre de gluten",
                "Elaboración artesanal",
              ].map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amarillo/15 text-rojo-oscuro text-xs font-semibold px-3 py-1.5"
                >
                  <CheckIcon className="w-3.5 h-3.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Documentos */}
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          {documentosLegales.map((d, idx) => (
            <Reveal key={d.titulo} delay={idx * 90}>
              <button
                onClick={() => setZoom({ src: d.imagen, alt: d.alt })}
                className="group block w-full text-left rounded-3xl bg-white ring-1 ring-rojo/5 shadow-[0_2px_16px_rgba(124,33,24,0.06)] overflow-hidden hover:shadow-[0_12px_30px_rgba(124,33,24,0.12)] transition-all"
              >
                <div className="relative aspect-4/3 bg-crema-2/40">
                  <Image
                    src={d.imagen}
                    alt={d.alt}
                    fill
                    className="object-contain p-3 group-hover:scale-[1.03] transition-transform"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/70 text-white text-xs px-3 py-1.5">
                    🔍 Ampliar
                  </span>
                </div>
                <div className="p-5 border-t border-rojo/5">
                  <h3 className="font-display font-bold text-rojo-oscuro">{d.titulo}</h3>
                  <p className="text-sm text-negro-suave">{d.emisor}</p>
                  <p className="text-xs text-gris mt-1">{d.detalle}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
        >
          <div className="absolute inset-0 bg-black/80" onClick={() => setZoom(null)} />
          <button
            onClick={() => setZoom(null)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 w-11 h-11 grid place-items-center rounded-full bg-white/15 text-white hover:bg-white/30"
          >
            <CloseIcon />
          </button>
          <div className="relative w-full max-w-3xl h-[85vh]">
            <Image src={zoom.src} alt={zoom.alt} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </section>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-crema px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gris">{k}</div>
      <div className="font-semibold text-negro">{v}</div>
    </div>
  );
}
