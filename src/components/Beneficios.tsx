import { beneficios } from "@/lib/site";
import Reveal from "./Reveal";

export default function Beneficios() {
  return (
    <section id="beneficios" className="py-16 sm:py-24 bg-crema">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            Por qué elegirnos
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            ¿Por qué consumir nuestros productos?
          </h2>
          <p className="mt-4 text-negro-suave">
            Porque cuidamos lo que comes. Cada harina y cada pulpa se elabora con
            materia prima natural, sin atajos y sin químicos.
          </p>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {beneficios.map((b, idx) => (
            <Reveal key={b.titulo} delay={idx * 70}>
              <div className="group h-full rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(124,33,24,0.06)] ring-1 ring-rojo/5 hover:shadow-[0_10px_30px_rgba(124,33,24,0.12)] hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-amarillo/15 grid place-items-center text-3xl group-hover:scale-110 transition-transform">
                  {b.emoji}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-rojo-oscuro">
                  {b.titulo}
                </h3>
                <p className="mt-2 text-negro-suave leading-relaxed">{b.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
