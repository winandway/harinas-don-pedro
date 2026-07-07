import Image from "next/image";
import { origenes } from "@/lib/site";
import Reveal from "./Reveal";

export default function Origen() {
  return (
    <section id="origen" className="py-16 sm:py-24 bg-crema-2/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            De la mata a tu mesa
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            ¿De dónde sale nuestra harina?
          </h2>
          <p className="mt-4 text-negro-suave">
            Nada de misterios: cada harina viene directo de la naturaleza. Estos
            son los frutos y tubérculos que transformamos en producto de calidad.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {origenes.map((o, idx) => (
            <Reveal key={o.titulo} delay={idx * 90}>
              <article className="h-full rounded-3xl overflow-hidden bg-white shadow-[0_2px_16px_rgba(124,33,24,0.06)] ring-1 ring-rojo/5">
                <div className="relative aspect-4/3">
                  <Image
                    src={o.imagen}
                    alt={o.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 w-11 h-11 rounded-full bg-white/90 grid place-items-center text-2xl shadow">
                    {o.emoji}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-rojo-oscuro">
                    {o.titulo}
                  </h3>
                  <p className="mt-2 text-negro-suave leading-relaxed">{o.texto}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10">
          <div className="rounded-3xl brand-gradient text-white p-6 sm:p-8 text-center">
            <p className="text-lg sm:text-xl font-medium max-w-3xl mx-auto text-balance">
              🌱 Del campo merideño a tu cocina. Aprovechamos lo mejor del plátano,
              la yuca y el cambur para que nada se pierda y todo alimente.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
