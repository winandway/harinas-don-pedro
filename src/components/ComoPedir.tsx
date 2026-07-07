import { contacto, whatsappLink, catalogoPdf } from "@/lib/site";
import Reveal from "./Reveal";
import { WhatsAppIcon, PhoneIcon, DownloadIcon } from "./icons";

const pasos = [
  {
    n: "1",
    emoji: "🛒",
    t: "Elige tus productos",
    d: "Escoge las harinas o pulpas que quieras y la cantidad que necesitas.",
  },
  {
    n: "2",
    emoji: "📞",
    t: "Consulta la disponibilidad",
    d: "Llámanos o escríbenos por WhatsApp para confirmar el stock y la fecha de entrega antes de pagar.",
  },
  {
    n: "3",
    emoji: "✅",
    t: "Confirma y recibe",
    d: "Trabajamos con pedidos por adelantado. Con tu pago confirmamos y preparamos todo lo antes posible.",
  },
];

export default function ComoPedir() {
  return (
    <section id="como-pedir" className="py-16 sm:py-24 bg-crema">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            Fácil y rápido
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            ¿Cómo hacer tu pedido?
          </h2>
          <p className="mt-4 text-negro-suave">
            Así de sencillo. Recuerda: siempre consulta primero la disponibilidad,
            porque cada pedido se prepara de forma artesanal.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5 sm:gap-6">
          {pasos.map((p, idx) => (
            <Reveal key={p.n} delay={idx * 90}>
              <div className="relative h-full rounded-3xl bg-white p-6 sm:p-7 ring-1 ring-rojo/5 shadow-[0_2px_16px_rgba(124,33,24,0.06)]">
                <div className="absolute -top-4 left-6 w-10 h-10 rounded-full brand-gradient text-white font-display font-black grid place-items-center shadow-lg">
                  {p.n}
                </div>
                <div className="text-4xl mt-3">{p.emoji}</div>
                <h3 className="mt-3 font-display text-xl font-bold text-rojo-oscuro">
                  {p.t}
                </h3>
                <p className="mt-2 text-negro-suave leading-relaxed">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10">
          <div className="rounded-3xl brand-gradient text-white p-7 sm:p-10 text-center">
            <h3 className="font-display text-2xl sm:text-3xl font-black">
              ¿List@ para hacer tu pedido?
            </h3>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">
              Escríbenos o llámanos y con gusto te decimos qué tenemos disponible y
              para cuándo lo entregamos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <a
                href={whatsappLink(
                  "¡Hola Don Pedro! Quiero hacer un pedido. ¿Me indican disponibilidad y fecha de entrega?"
                )}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white font-bold px-6 py-3.5 hover:brightness-105 transition"
              >
                <WhatsAppIcon className="w-5 h-5" /> Escribir por WhatsApp
              </a>
              <a
                href={`tel:${contacto.telefonos[0].tel}`}
                className="inline-flex items-center gap-2 rounded-full bg-amarillo text-negro font-bold px-6 py-3.5 hover:brightness-105 transition"
              >
                <PhoneIcon className="w-5 h-5" /> Llamar ahora
              </a>
              <a
                href={catalogoPdf}
                download
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/30 text-white font-semibold px-6 py-3.5 hover:bg-white/20 transition"
              >
                <DownloadIcon className="w-5 h-5" /> Ver catálogo
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
