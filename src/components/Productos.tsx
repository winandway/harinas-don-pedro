"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { harinas, contacto, whatsappLink, type Producto } from "@/lib/site";
import Reveal from "./Reveal";
import {
  CloseIcon,
  WhatsAppIcon,
  PhoneIcon,
  CheckIcon,
} from "./icons";

export default function Productos() {
  const [activo, setActivo] = useState<Producto | null>(null);

  return (
    <section id="productos" className="py-16 sm:py-24 bg-crema">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            Nuestro catálogo
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            Harinas artesanales
          </h2>
          <p className="mt-4 text-negro-suave">
            Todas 100% naturales y libres de gluten, en presentación de 500 g.
            Elige la tuya y consulta la disponibilidad para tu pedido.
          </p>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {harinas.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 80}>
              <article className="group h-full flex flex-col rounded-3xl bg-white overflow-hidden shadow-[0_2px_16px_rgba(124,33,24,0.06)] ring-1 ring-rojo/5 hover:shadow-[0_14px_36px_rgba(124,33,24,0.14)] hover:-translate-y-1.5 transition-all">
                <div className="relative aspect-square bg-crema-2/50">
                  <Image
                    src={p.imagen}
                    alt={p.imagenAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {p.linea && (
                    <span className="absolute top-3 left-3 rounded-full bg-rojo text-white text-[11px] font-bold px-2.5 py-1">
                      {p.linea}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 rounded-full bg-amarillo text-negro text-[11px] font-bold px-2.5 py-1">
                    Sin gluten
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-lg font-bold text-rojo-oscuro leading-tight">
                    {p.nombre}
                  </h3>
                  <p className="text-xs text-gris mt-0.5">{p.presentacion}</p>
                  <p className="mt-2 text-sm text-negro-suave leading-relaxed flex-1">
                    {p.descripcion}
                  </p>
                  <button
                    onClick={() => setActivo(p)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-rojo text-white font-semibold py-2.5 hover:bg-rojo-oscuro transition-colors"
                  >
                    🛒 Comprar
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {activo && <ComprarModal producto={activo} onClose={() => setActivo(null)} />}
    </section>
  );
}

function ComprarModal({
  producto,
  onClose,
}: {
  producto: Producto;
  onClose: () => void;
}) {
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const mensaje =
    `¡Hola Don Pedro! Quiero consultar disponibilidad para mi pedido:\n\n` +
    `• Producto: ${producto.nombre}\n` +
    `• Presentación: ${producto.presentacion}\n` +
    `• Cantidad: ${cantidad} unidad(es)\n\n` +
    `¿Tienen stock y para cuándo sería la entrega? Gracias.`;
  const waHref = whatsappLink(mensaje);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Comprar ${producto.nombre}`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-10 h-10 grid place-items-center rounded-full bg-black/5 text-negro hover:bg-black/10 transition"
        >
          <CloseIcon />
        </button>

        <div className="flex gap-4 items-center p-5 sm:p-6 border-b border-rojo/10">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 ring-1 ring-rojo/10">
            <Image src={producto.imagen} alt={producto.imagenAlt} fill className="object-cover" sizes="80px" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-rojo-oscuro leading-tight">
              {producto.nombre}
            </h3>
            <p className="text-sm text-gris">{producto.presentacion}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-negro mb-2">
              ¿Cuántas unidades quieres?
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-rojo/20 overflow-hidden">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="w-11 h-11 grid place-items-center text-rojo text-xl font-bold hover:bg-rojo/5"
                  aria-label="Menos"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))
                  }
                  className="w-16 h-11 text-center font-bold text-lg text-negro outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Cantidad"
                />
                <button
                  onClick={() => setCantidad((c) => c + 1)}
                  className="w-11 h-11 grid place-items-center text-rojo text-xl font-bold hover:bg-rojo/5"
                  aria-label="Más"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gris">× {producto.presentacion}</span>
            </div>
          </div>

          {/* Aviso: consultar stock */}
          <div className="rounded-2xl bg-amarillo/12 border border-amarillo/40 p-4">
            <p className="font-semibold text-rojo-oscuro flex items-center gap-2">
              📞 Antes de comprar, consulta la disponibilidad
            </p>
            <p className="mt-1.5 text-sm text-negro-suave leading-relaxed">
              Como todo es artesanal y trabajamos con pedidos por adelantado,
              primero llámanos o escríbenos para confirmar el <strong>stock</strong>{" "}
              y la <strong>fecha de entrega</strong>. Con tu pedido pago,
              preparamos todo lo antes posible. ¡Gracias por tu confianza!
            </p>
          </div>

          {/* Acciones */}
          <div className="grid gap-2.5">
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-bold py-3.5 hover:brightness-105 transition"
            >
              <WhatsAppIcon className="w-5 h-5" /> Consultar por WhatsApp
            </a>
            <a
              href={`tel:${contacto.telefonos[0].tel}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rojo text-white font-bold py-3.5 hover:bg-rojo-oscuro transition"
            >
              <PhoneIcon className="w-5 h-5" /> Llamar {contacto.telefonos[0].display}
            </a>
          </div>

          <div className="text-xs text-gris space-y-1">
            <p className="font-semibold text-negro-suave">Otros números:</p>
            {contacto.telefonos.slice(1).map((t) => (
              <a key={t.tel} href={`tel:${t.tel}`} className="flex items-center gap-1.5 hover:text-rojo">
                <PhoneIcon className="w-3.5 h-3.5" /> {t.display}
              </a>
            ))}
          </div>

          <ul className="grid grid-cols-2 gap-1.5 pt-1">
            {producto.usos.map((u) => (
              <li key={u} className="flex items-start gap-1.5 text-xs text-negro-suave">
                <CheckIcon className="w-3.5 h-3.5 text-rojo mt-0.5 shrink-0" /> {u}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
