import Image from "next/image";
import { catalogoPdf } from "@/lib/site";
import BotonPresentacion from "./BotonPresentacion";
import { DownloadIcon } from "./icons";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden brand-gradient grain pt-24 sm:pt-28 pb-16 sm:pb-24"
    >
      {/* estrella decorativa */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-amarillo/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-black/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-amarillo-claro text-xs sm:text-sm font-medium tracking-wide">
            ⭐ Tradición y Sabor desde 1915 · Mérida, Venezuela
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] text-balance">
            Harinas y Pulpas
            <span className="block text-amarillo">100% naturales</span>
            <span className="block">y artesanales</span>
          </h1>
          <p className="mt-5 text-white/85 text-lg max-w-xl mx-auto lg:mx-0 text-balance">
            Harina de plátano, yuca y cambur (Nutriban) y pulpas de fruta, libres
            de gluten y sin conservantes. Hechas a mano en Mérida, con la calidad
            de siempre.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <a
              href={catalogoPdf}
              download
              className="group inline-flex items-center gap-2 rounded-full bg-amarillo text-negro font-bold px-6 py-3.5 text-base shadow-lg shadow-black/20 hover:brightness-105 hover:-translate-y-0.5 transition-all"
            >
              <DownloadIcon className="w-5 h-5" /> Descargar catálogo (PDF)
            </a>
            <BotonPresentacion className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/30 text-white font-semibold px-6 py-3.5 text-base backdrop-blur-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all">
              Ver presentación
            </BotonPresentacion>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-white/80 text-sm">
            <span className="inline-flex items-center gap-1.5">✓ Libre de gluten</span>
            <span className="inline-flex items-center gap-1.5">✓ Sin conservantes</span>
            <span className="inline-flex items-center gap-1.5">✓ 100% artesanal</span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-4/3 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/20 floaty">
            <Image
              src="/images/productos/harinas-don-pedro-yuca-platano-cambur-trio-500g.jpg"
              alt="Harinas artesanales Don Pedro: yuca, plátano y cambur en presentación de 500 gramos"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-4 -left-2 sm:left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <div className="text-2xl">🌾</div>
            <div className="leading-tight">
              <div className="font-bold text-rojo-oscuro text-sm">4 harinas + 6 pulpas</div>
              <div className="text-xs text-gris">Presentación de 500 g</div>
            </div>
          </div>
        </div>
      </div>

      {/* onda inferior */}
      <div className="absolute bottom-0 inset-x-0 leading-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]" aria-hidden="true">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z" fill="var(--crema)" />
        </svg>
      </div>
    </section>
  );
}
