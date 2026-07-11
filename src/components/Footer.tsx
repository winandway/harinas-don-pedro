import Image from "next/image";
import { empresa, contacto, catalogoPdf } from "@/lib/site";
import { InstagramIcon, MailIcon, PhoneIcon, MapPinIcon, DownloadIcon } from "./icons";

export default function Footer() {
  const year = 2026;
  return (
    <footer className="brand-gradient text-white pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
                alt="Logo Harinas y Pulpas Don Pedro"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
              />
              <div className="leading-tight">
                <div className="font-display font-black text-lg">Don Pedro</div>
                <div className="text-white/70 text-xs">Harinas y Pulpas · {empresa.desde}</div>
              </div>
            </div>
            <p className="mt-4 text-white/75 text-sm leading-relaxed">
              {empresa.descripcionCorta}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-amarillo-claro mb-3">Explora</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#productos" className="hover:text-white">Harinas</a></li>
              <li><a href="#pulpas" className="hover:text-white">Pulpas</a></li>
              <li><a href="#origen" className="hover:text-white">Origen</a></li>
              <li><a href="#proceso" className="hover:text-white">Elaboración</a></li>
              <li><a href="#como-pedir" className="hover:text-white">Cómo pedir</a></li>
              <li><a href="#legal" className="hover:text-white">Legalidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amarillo-claro mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {contacto.telefonos.map((t) => (
                <li key={t.tel}>
                  <a href={`tel:${t.tel}`} className="flex items-center gap-2 hover:text-white">
                    <PhoneIcon className="w-4 h-4" /> {t.display}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${contacto.correo}`} className="flex items-center gap-2 hover:text-white break-all">
                  <MailIcon className="w-4 h-4 shrink-0" /> {contacto.correo}
                </a>
              </li>
              <li>
                <a href={contacto.instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-white">
                  <InstagramIcon className="w-4 h-4" /> @{contacto.instagram}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amarillo-claro mb-3">Empresa</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{empresa.ciudad}, {empresa.estado}, {empresa.pais}</span>
              </li>
              <li>RIF: {empresa.rif}</li>
              <li>PSN: {empresa.registroSanitario}</li>
              <li className="text-white/60">{empresa.razonSocial}</li>
            </ul>
            <a
              href={catalogoPdf}
              download
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-amarillo text-negro font-semibold px-4 py-2.5 text-sm hover:brightness-105 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Catálogo PDF
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {year} {empresa.nombre}. Todos los derechos reservados.</p>
          <p>Hecho con 🌾 en {empresa.estado}, {empresa.pais} · {empresa.eslogan}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-[11px] text-white/50">
          <p>
            © {year} harinadonpedro.com | All rights reserved. Developed by{" "}
            <a
              href="https://windoce.com"
              target="_blank"
              rel="noopener"
              className="font-semibold text-amarillo-claro hover:text-amarillo transition-colors"
            >
              Windoce LLC
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
