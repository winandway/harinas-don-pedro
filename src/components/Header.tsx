"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { abrirPresentacion } from "./BotonPresentacion";
import { catalogoPdf } from "@/lib/site";
import { DownloadIcon, PlayIcon } from "./icons";

const links = [
  { href: "#productos", label: "Productos" },
  { href: "#origen", label: "Origen" },
  { href: "#proceso", label: "Elaboración" },
  { href: "#pulpas", label: "Pulpas" },
  { href: "#como-pedir", label: "Cómo pedir" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-crema/95 backdrop-blur-md shadow-[0_4px_20px_rgba(124,33,24,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
            alt="Logo Harinas y Pulpas Don Pedro"
            width={48}
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow"
            priority
          />
          <span className="leading-tight">
            <span
              className={`block font-display font-black text-base sm:text-lg transition-colors ${
                scrolled ? "text-rojo-oscuro" : "text-white"
              }`}
            >
              Don Pedro
            </span>
            <span
              className={`block text-[10px] sm:text-xs -mt-0.5 tracking-wide transition-colors ${
                scrolled ? "text-negro-suave" : "text-white/80"
              }`}
            >
              Harinas y Pulpas · 1915
            </span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled
                    ? "text-negro-suave hover:text-rojo hover:bg-rojo/5"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={abrirPresentacion}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full border transition-colors ${
              scrolled
                ? "text-rojo border-rojo/30 hover:bg-rojo/5"
                : "text-white border-white/40 hover:bg-white/10"
            }`}
          >
            <PlayIcon className="w-4 h-4" /> Presentación
          </button>
          <a
            href={catalogoPdf}
            download
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm ${
              scrolled
                ? "text-white bg-rojo hover:bg-rojo-oscuro"
                : "text-negro bg-amarillo hover:brightness-105"
            }`}
          >
            <DownloadIcon className="w-4 h-4" /> Catálogo
          </a>
        </div>

        {/* Botón menú móvil */}
        <button
          onClick={() => setOpenMenu((v) => !v)}
          className={`lg:hidden w-10 h-10 grid place-items-center rounded-lg transition-colors ${
            scrolled || openMenu ? "text-rojo-oscuro hover:bg-rojo/5" : "text-white hover:bg-white/10"
          }`}
          aria-label="Abrir menú"
          aria-expanded={openMenu}
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-transform ${openMenu ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-opacity ${openMenu ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-transform ${openMenu ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      {openMenu && (
        <div className="lg:hidden bg-crema/98 backdrop-blur-md border-t border-rojo/10 shadow-lg">
          <ul className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpenMenu(false)}
                  className="block px-3 py-2.5 rounded-lg font-medium text-negro-suave hover:bg-rojo/5 hover:text-rojo"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setOpenMenu(false);
                  abrirPresentacion();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-rojo px-3 py-2.5 rounded-full border border-rojo/30"
              >
                <PlayIcon className="w-4 h-4" /> Presentación
              </button>
              <a
                href={catalogoPdf}
                download
                onClick={() => setOpenMenu(false)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-rojo px-3 py-2.5 rounded-full"
              >
                <DownloadIcon className="w-4 h-4" /> Catálogo
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
