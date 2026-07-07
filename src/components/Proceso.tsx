import Image from "next/image";
import { galeriaProceso } from "@/lib/site";
import Reveal from "./Reveal";

const pasos = [
  { n: "01", t: "Selección", d: "Escogemos plátano, yuca y cambur frescos y en su punto." },
  { n: "02", t: "Deshidratado", d: "Secado natural que conserva nutrientes y sabor." },
  { n: "03", t: "Molienda", d: "Molemos hasta lograr una harina fina y pareja." },
  { n: "04", t: "Envasado", d: "Pesamos y empacamos con normas de higiene." },
];

export default function Proceso() {
  return (
    <section id="proceso" className="py-16 sm:py-24 bg-crema">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
              Elaboración artesanal
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
              Hecho a mano, con higiene y paciencia
            </h2>
            <p className="mt-4 text-negro-suave leading-relaxed">
              Trabajamos en pequeños lotes cumpliendo normas sanitarias: gorro,
              tapaboca y guantes en cada etapa. Al ser artesanal, no vamos a la
              velocidad de la luz… pero la calidad de lo que entregamos es
              impresionante.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {pasos.map((p) => (
                <div key={p.n} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-rojo/5">
                  <span className="font-display font-black text-2xl text-amarillo">
                    {p.n}
                  </span>
                  <div>
                    <div className="font-semibold text-rojo-oscuro">{p.t}</div>
                    <div className="text-sm text-negro-suave">{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {galeriaProceso.map((g, idx) => (
                <div
                  key={g.src}
                  className={`relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-rojo/5 ${
                    idx % 3 === 0 ? "aspect-3/4" : "aspect-square"
                  }`}
                >
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
