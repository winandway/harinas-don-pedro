import Image from "next/image";
import { pulpas, galeriaPulpas, whatsappLink } from "@/lib/site";
import Reveal from "./Reveal";
import { WhatsAppIcon } from "./icons";

export default function Pulpas() {
  return (
    <section id="pulpas" className="py-16 sm:py-24 bg-crema-2/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
              También pulpas de fruta
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
              Pulpas 100% naturales, sin conservantes
            </h2>
            <p className="mt-4 text-negro-suave leading-relaxed">
              Congeladas en su punto justo de maduración para que disfrutes el
              sabor de la fruta fresca durante todo el año. Perfectas para jugos,
              postres y batidos.
            </p>

            <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pulpas.map((p) => (
                <li
                  key={p.nombre}
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-rojo/5 text-sm font-medium text-negro-suave"
                >
                  <span className="text-lg">{p.emoji}</span> {p.nombre}
                </li>
              ))}
            </ul>

            <a
              href={whatsappLink(
                "¡Hola Don Pedro! Quiero consultar disponibilidad de sus pulpas de fruta. ¿Qué sabores tienen y para cuándo la entrega?"
              )}
              target="_blank"
              rel="noopener"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white font-semibold px-5 py-3 hover:brightness-105 transition"
            >
              <WhatsAppIcon className="w-5 h-5" /> Consultar pulpas
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative col-span-2 aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-rojo/5">
                <Image
                  src={galeriaPulpas[0].src}
                  alt={galeriaPulpas[0].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {galeriaPulpas.slice(1).map((g) => (
                <div key={g.src} className="relative aspect-square rounded-2xl overflow-hidden shadow-lg ring-1 ring-rojo/5">
                  <Image src={g.src} alt={g.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
