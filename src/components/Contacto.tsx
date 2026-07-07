import { empresa, contacto, whatsappLink } from "@/lib/site";
import Reveal from "./Reveal";
import {
  WhatsAppIcon,
  PhoneIcon,
  MailIcon,
  InstagramIcon,
  MapPinIcon,
} from "./icons";

export default function Contacto() {
  return (
    <section id="contacto" className="py-16 sm:py-24 bg-crema-2/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-rojo font-semibold tracking-[0.2em] text-xs uppercase">
            Estamos para ti
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black text-negro">
            Contacto
          </h2>
          <p className="mt-4 text-negro-suave">
            Escríbenos o llámanos. Con gusto te atendemos y resolvemos tus dudas.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Teléfonos */}
          <Reveal>
            <div className="h-full rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-rojo/5 shadow-[0_2px_16px_rgba(124,33,24,0.06)]">
              <h3 className="font-display text-xl font-bold text-rojo-oscuro flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-rojo" /> Teléfonos
              </h3>
              <ul className="mt-4 space-y-2">
                {contacto.telefonos.map((t) => (
                  <li key={t.tel}>
                    <a
                      href={`tel:${t.tel}`}
                      className="flex items-center gap-3 rounded-2xl bg-crema px-4 py-3 font-semibold text-negro hover:bg-rojo/5 hover:text-rojo transition"
                    >
                      <PhoneIcon className="w-4 h-4 text-rojo" /> {t.display}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(
                  "¡Hola Don Pedro! Tengo una consulta sobre sus productos."
                )}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-bold py-3.5 hover:brightness-105 transition"
              >
                <WhatsAppIcon className="w-5 h-5" /> Escribir por WhatsApp
              </a>
            </div>
          </Reveal>

          {/* Correo, redes, ubicación */}
          <Reveal delay={100}>
            <div className="h-full rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-rojo/5 shadow-[0_2px_16px_rgba(124,33,24,0.06)] space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold text-rojo-oscuro flex items-center gap-2">
                  <MailIcon className="w-5 h-5 text-rojo" /> Correo
                </h3>
                <a
                  href={`mailto:${contacto.correo}`}
                  className="mt-2 inline-block font-medium text-negro-suave hover:text-rojo break-all"
                >
                  {contacto.correo}
                </a>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-rojo-oscuro flex items-center gap-2">
                  <InstagramIcon className="w-5 h-5 text-rojo" /> Redes
                </h3>
                <a
                  href={contacto.instagramUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex items-center gap-2 font-medium text-negro-suave hover:text-rojo"
                >
                  <InstagramIcon className="w-4 h-4" /> @{contacto.instagram}
                </a>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-rojo-oscuro flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-rojo" /> Ubicación
                </h3>
                <p className="mt-2 text-negro-suave leading-relaxed">
                  {empresa.ciudad}, {empresa.municipio}
                  <br />
                  {empresa.estado}, {empresa.pais}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
