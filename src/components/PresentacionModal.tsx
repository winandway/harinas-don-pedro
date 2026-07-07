"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  empresa,
  contacto,
  beneficios,
  catalogoPdf,
  whatsappLink,
} from "@/lib/site";
import {
  CloseIcon,
  WhatsAppIcon,
  DownloadIcon,
  PhoneIcon,
  MailIcon,
  InstagramIcon,
} from "./icons";

type Slide = { render: () => React.ReactNode };

export default function PresentacionModal() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  const slides: Slide[] = [
    // 1 · Portada
    {
      render: () => (
        <div className="flex flex-col items-center justify-center text-center gap-6 py-6">
          <Image
            src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
            alt="Logo Harinas y Pulpas Don Pedro"
            width={180}
            height={180}
            className="drop-shadow-xl"
          />
          <div>
            <p className="text-amarillo font-semibold tracking-[0.25em] text-sm uppercase">
              Desde {empresa.desde}
            </p>
            <h3 className="font-display text-4xl sm:text-5xl font-black text-white mt-2">
              Harinas y Pulpas
              <br />
              Don Pedro
            </h3>
            <p className="text-white/80 mt-3 text-lg italic">“{empresa.eslogan}”</p>
          </div>
          <p className="text-white/70 max-w-md">
            Tradición artesanal de Mérida, Venezuela. Presentación de nuestros
            productos, su origen y cómo hacer tu pedido.
          </p>
        </div>
      ),
    },
    // 2 · Quiénes somos
    {
      render: () => (
        <SlideSplit
          img="/images/produccion/elaboracion-harina-natural-don-pedro-merida.jpg"
          alt="Elaboración artesanal de harina Don Pedro en Mérida"
        >
          <SlideKicker>Quiénes somos</SlideKicker>
          <h3 className="slide-title">Un emprendimiento con más de un siglo de sabor</h3>
          <p className="slide-text">
            Somos un emprendimiento familiar de Mérida, Venezuela, dedicado a
            elaborar <strong>harinas y pulpas 100% naturales</strong> de forma
            artesanal. Seleccionamos la mejor materia prima —plátano, yuca y
            cambur— y la transformamos cuidando cada detalle.
          </p>
          <p className="slide-text">
            Trabajamos en pequeños lotes, con normas de higiene y sin apuros:
            <strong> la calidad manda</strong>.
          </p>
        </SlideSplit>
      ),
    },
    // 3 · Harinas
    {
      render: () => (
        <SlideSplit
          img="/images/productos/harinas-don-pedro-yuca-platano-cambur-trio-500g.jpg"
          alt="Harinas artesanales Don Pedro de yuca, plátano y cambur"
          reverse
        >
          <SlideKicker>Nuestras harinas</SlideKicker>
          <h3 className="slide-title">Plátano, Yuca y Cambur (Nutriban)</h3>
          <ul className="slide-list">
            <li>🍌 <strong>Harina de Plátano</strong> — multiusos, ideal para hornear y espesar.</li>
            <li>🌿 <strong>Harina de Yuca</strong> — suave y versátil, perfecta para panadería.</li>
            <li>🍌 <strong>Nutriban · Harina de Cambur</strong> — nutritiva y energética.</li>
            <li>🥤 <strong>Nutribam</strong> — bebida instantánea de cambur.</li>
          </ul>
          <p className="slide-text">Presentación de 500 g. Todas libres de gluten.</p>
        </SlideSplit>
      ),
    },
    // 4 · Pulpas
    {
      render: () => (
        <SlideSplit
          img="/images/pulpas/surtido-pulpas-fruta-don-pedro-merida.jpg"
          alt="Surtido de pulpas de fruta natural Don Pedro"
        >
          <SlideKicker>Pulpas de fruta</SlideKicker>
          <h3 className="slide-title">El sabor de la fruta, sin conservantes</h3>
          <p className="slide-text">
            Pulpas 100% naturales, congeladas en su punto justo de maduración:
          </p>
          <ul className="slide-list grid grid-cols-2 gap-x-4">
            <li>🍅 Tomate de árbol</li>
            <li>🫐 Mora</li>
            <li>🍓 Fresa</li>
            <li>🥭 Mango</li>
            <li>🍍 Piña</li>
            <li>🍉 Patilla</li>
          </ul>
          <p className="slide-text">Listas para jugos, postres y batidos.</p>
        </SlideSplit>
      ),
    },
    // 5 · Por qué consumirlos
    {
      render: () => (
        <div className="py-4">
          <div className="text-center mb-6">
            <SlideKicker center>Por qué consumirlos</SlideKicker>
            <h3 className="slide-title">Bueno para ti, bueno para tu familia</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className="rounded-2xl bg-white/10 border border-white/15 p-4 text-center"
              >
                <div className="text-3xl mb-1">{b.emoji}</div>
                <div className="font-semibold text-white text-sm">{b.titulo}</div>
                <div className="text-white/70 text-xs mt-1 leading-snug">{b.texto}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // 6 · Cómo se elabora
    {
      render: () => (
        <SlideSplit
          img="/images/produccion/produccion-artesanal-harina-don-pedro-merida.jpg"
          alt="Producción artesanal de harina Don Pedro con normas de higiene"
          reverse
        >
          <SlideKicker>Cómo se elabora</SlideKicker>
          <h3 className="slide-title">Artesanal y con higiene garantizada</h3>
          <ol className="slide-list list-decimal pl-5">
            <li>Seleccionamos y limpiamos la materia prima fresca.</li>
            <li>Deshidratamos de forma natural para conservar sus nutrientes.</li>
            <li>Molemos hasta lograr una harina fina y pareja.</li>
            <li>Envasamos y pesamos con normas de higiene (gorro, tapaboca y guantes).</li>
          </ol>
          <p className="slide-text">Sin químicos, sin apuros, con amor por lo natural.</p>
        </SlideSplit>
      ),
    },
    // 7 · Cómo pedir
    {
      render: () => (
        <div className="py-4">
          <div className="text-center mb-5">
            <SlideKicker center>Cómo hacer tu pedido</SlideKicker>
            <h3 className="slide-title">3 pasos sencillos</h3>
          </div>
          <div className="space-y-3 max-w-lg mx-auto">
            {[
              ["1", "Elige tus productos", "Escoge las harinas o pulpas que quieras y la cantidad."],
              ["2", "Consulta disponibilidad", "Llámanos o escríbenos por WhatsApp para confirmar el stock y la fecha de entrega."],
              ["3", "Confirma tu pedido", "Al ser artesanal trabajamos con pedidos por adelantado; con tu pago confirmamos y preparamos todo lo antes posible."],
            ].map(([n, t, d]) => (
              <div key={n} className="flex gap-4 items-start rounded-2xl bg-white/10 border border-white/15 p-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-amarillo text-negro font-bold grid place-items-center">
                  {n}
                </div>
                <div>
                  <div className="font-semibold text-white">{t}</div>
                  <div className="text-white/70 text-sm">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-amarillo-claro text-sm mt-4 max-w-md mx-auto">
            💡 Trabajamos con encargos por adelantado para garantizar frescura y
            calidad. ¡Gracias por tu paciencia y confianza!
          </p>
        </div>
      ),
    },
    // 8 · Contacto
    {
      render: () => (
        <div className="py-4 text-center flex flex-col items-center gap-5">
          <SlideKicker center>Contáctanos</SlideKicker>
          <h3 className="slide-title">Haz tu pedido hoy</h3>
          <div className="grid gap-2 text-white/90 text-sm">
            {contacto.telefonos.map((t) => (
              <a key={t.tel} href={`tel:${t.tel}`} className="flex items-center gap-2 justify-center hover:text-amarillo">
                <PhoneIcon className="w-4 h-4" /> {t.display}
              </a>
            ))}
            <a href={`mailto:${contacto.correo}`} className="flex items-center gap-2 justify-center hover:text-amarillo">
              <MailIcon className="w-4 h-4" /> {contacto.correo}
            </a>
            <a href={contacto.instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2 justify-center hover:text-amarillo">
              <InstagramIcon className="w-4 h-4" /> @{contacto.instagram}
            </a>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <a
              href={whatsappLink("¡Hola Don Pedro! Vi su presentación y quiero hacer un pedido. ¿Me indican disponibilidad?")}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white font-semibold px-5 py-3 hover:brightness-105"
            >
              <WhatsAppIcon className="w-5 h-5" /> Escribir por WhatsApp
            </a>
            <a
              href={catalogoPdf}
              download
              className="inline-flex items-center gap-2 rounded-full bg-amarillo text-negro font-semibold px-5 py-3 hover:brightness-105"
            >
              <DownloadIcon className="w-5 h-5" /> Descargar catálogo
            </a>
          </div>
        </div>
      ),
    },
  ];

  const total = slides.length;
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setI((v) => (v + 1) % total), [total]);
  const prev = useCallback(() => setI((v) => (v - 1 + total) % total), [total]);

  useEffect(() => {
    const onOpen = () => {
      setI(0);
      setOpen(true);
    };
    window.addEventListener("abrir-presentacion", onOpen);
    return () => window.removeEventListener("abrir-presentacion", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, next, prev]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Presentación de Harinas Don Pedro"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl brand-gradient shadow-2xl border border-white/10">
        <button
          onClick={close}
          aria-label="Cerrar presentación"
          className="absolute top-3 right-3 z-10 w-10 h-10 grid place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
        >
          <CloseIcon />
        </button>

        <div className="px-5 sm:px-10 pt-10 pb-4 min-h-[60vh] flex flex-col justify-center">
          {slides[i].render()}
        </div>

        {/* Controles */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black/30 to-transparent px-5 sm:px-10 py-4 flex items-center justify-between gap-4">
          <button
            onClick={prev}
            className="rounded-full px-4 py-2 bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition"
          >
            ← Anterior
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Ir a diapositiva ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-amarillo" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          {i === total - 1 ? (
            <button
              onClick={close}
              className="rounded-full px-4 py-2 bg-amarillo text-negro text-sm font-semibold hover:brightness-105 transition"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={next}
              className="rounded-full px-4 py-2 bg-amarillo text-negro text-sm font-semibold hover:brightness-105 transition"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideKicker({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <p
      className={`text-amarillo font-semibold tracking-[0.2em] text-xs uppercase mb-2 ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </p>
  );
}

function SlideSplit({
  img,
  alt,
  reverse,
  children,
}: {
  img: string;
  alt: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid sm:grid-cols-2 gap-6 items-center ${
        reverse ? "sm:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/20">
        <Image src={img} alt={alt} fill className="object-cover" sizes="(max-width:640px) 100vw, 40vw" />
      </div>
      <div>{children}</div>
    </div>
  );
}
