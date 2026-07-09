"use client";

// Estructura del panel: login, sidebar oscuro (vino/negro) y topbar.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAdmin, tasaActual } from "@/lib/admin/store";
import { CLAVE_INICIAL } from "@/lib/admin/defaults";
import { ROLES } from "@/lib/admin/catalogos";
import { fmtBs } from "@/lib/admin/format";
import {
  IcoDashboard,
  IcoPedidos,
  IcoPagos,
  IcoClientes,
  IcoProductos,
  IcoTasas,
  IcoReportes,
  IcoUsuarios,
  IcoConfig,
  IcoSalir,
  IcoMenu,
  IcoX,
  IcoCandado,
} from "./icons";

const NAV = [
  {
    grupo: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", Icono: IcoDashboard },
      { href: "/admin/pedidos", label: "Pedidos", Icono: IcoPedidos },
      { href: "/admin/pagos", label: "Pagos y cobros", Icono: IcoPagos },
    ],
  },
  {
    grupo: "Gestión",
    items: [
      { href: "/admin/clientes", label: "Clientes", Icono: IcoClientes },
      { href: "/admin/productos", label: "Productos e inventario", Icono: IcoProductos },
    ],
  },
  {
    grupo: "Finanzas",
    items: [
      { href: "/admin/tasas", label: "Tasas de cambio", Icono: IcoTasas },
      { href: "/admin/reportes", label: "Reportes", Icono: IcoReportes },
    ],
  },
  {
    grupo: "Sistema",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", Icono: IcoUsuarios },
      { href: "/admin/configuracion", label: "Configuración", Icono: IcoConfig },
    ],
  },
];

function Login() {
  const { login, db } = useAdmin();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(login(usuario, clave));
  };

  return (
    <div className="min-h-screen brand-gradient grain relative flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amarillo/15 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-6">
          <Image
            src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
            alt="Logo Harinas y Pulpas Don Pedro"
            width={96}
            height={96}
            className="mx-auto drop-shadow-xl"
            priority
          />
          <h1 className="mt-4 font-display text-2xl font-black text-white">
            Panel de administración
          </h1>
          <p className="text-white/70 text-sm mt-1">Harinas y Pulpas Don Pedro · 1915</p>
        </div>

        <form
          onSubmit={enviar}
          className="rounded-3xl bg-white shadow-2xl p-6 sm:p-7 space-y-4"
        >
          <label className="block">
            <span className="block text-xs font-semibold text-negro-suave mb-1.5">Usuario</span>
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Nombre de usuario"
              autoComplete="username"
              className="w-full rounded-xl border border-rojo/15 px-3.5 py-2.5 text-sm outline-none focus:border-rojo/40 focus:ring-2 focus:ring-rojo/10"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-negro-suave mb-1.5">Clave</span>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Clave de acceso"
              autoComplete="current-password"
              className="w-full rounded-xl border border-rojo/15 px-3.5 py-2.5 text-sm outline-none focus:border-rojo/40 focus:ring-2 focus:ring-rojo/10"
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rojo text-white font-bold py-3 hover:bg-rojo-oscuro transition"
          >
            <IcoCandado className="w-4 h-4" /> Entrar al panel
          </button>

          {db.config.claveInicial && (
            <div className="rounded-xl bg-amarillo/15 border border-amarillo/40 px-3.5 py-3 text-xs text-negro-suave leading-relaxed">
              <strong className="text-rojo-oscuro">Primer acceso:</strong> usuario{" "}
              <code className="font-mono bg-white rounded px-1">admin</code> y clave{" "}
              <code className="font-mono bg-white rounded px-1">{CLAVE_INICIAL}</code>. Cambia la
              clave en <strong>Configuración</strong> apenas entres.
            </div>
          )}
        </form>
        <p className="text-center text-white/50 text-xs mt-4">
          Acceso exclusivo del equipo Don Pedro
        </p>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready, sesion, logout, db } = useAdmin();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const tasa = tasaActual(db);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-crema">
        <div className="text-center">
          <Image
            src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
            alt="Cargando panel Don Pedro"
            width={72}
            height={72}
            className="mx-auto animate-pulse"
          />
          <p className="mt-3 text-sm text-gris">Cargando panel…</p>
        </div>
      </div>
    );
  }

  if (!sesion) return <Login />;

  const esActivo = (href: string) =>
    href === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link
        href="/admin"
        className="flex items-center gap-3 px-5 py-5 border-b border-white/10"
        onClick={() => setMenuAbierto(false)}
      >
        <Image
          src="/marca/logo-harinas-pulpas-don-pedro-1915.png"
          alt="Logo Don Pedro"
          width={44}
          height={44}
          className="w-11 h-11 object-contain drop-shadow"
        />
        <div className="leading-tight">
          <div className="font-display font-black text-white">Don Pedro</div>
          <div className="text-[10px] uppercase tracking-widest text-amarillo/90">
            Superadmin
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((g) => (
          <div key={g.grupo}>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              {g.grupo}
            </div>
            <ul className="space-y-0.5">
              {g.items.map(({ href, label, Icono }) => {
                const activo = esActivo(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuAbierto(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        activo
                          ? "bg-amarillo text-negro shadow-md"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icono className="w-[18px] h-[18px]" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amarillo text-negro font-bold grid place-items-center text-sm">
            {sesion.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-sm font-semibold text-white truncate">{sesion.nombre}</div>
            <div className="text-[11px] text-white/50">{ROLES[sesion.rol].label}</div>
          </div>
          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="w-9 h-9 grid place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <IcoSalir className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-crema flex">
      {/* Sidebar escritorio */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen bg-gradient-to-b from-[#4a1410] via-rojo-oscuro to-[#2a0c09]">
        {sidebar}
      </aside>

      {/* Sidebar móvil */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuAbierto(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#4a1410] via-rojo-oscuro to-[#2a0c09] shadow-2xl">
            <button
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute top-4 right-3 w-9 h-9 grid place-items-center rounded-full text-white/70 hover:bg-white/10"
            >
              <IcoX className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-crema/90 backdrop-blur-md border-b border-rojo/10">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            <button
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="lg:hidden w-9 h-9 grid place-items-center rounded-lg text-rojo-oscuro hover:bg-rojo/5"
            >
              <IcoMenu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <Link
              href="/admin/tasas"
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rojo/10 px-3 py-1.5 text-xs font-semibold text-negro-suave hover:ring-rojo/30 transition"
              title="Tasa BCV del día"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {tasa ? `BCV ${fmtBs(tasa.bcv)}` : "Registrar tasa del día"}
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rojo/10 px-3 py-1.5 text-xs font-semibold text-negro-suave hover:ring-rojo/30 transition"
            >
              🌐 Ver sitio
            </a>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
        <footer className="px-6 py-4 text-center text-[11px] text-gris">
          Panel Don Pedro · Los datos se guardan en este dispositivo (fase local). Haz respaldos
          desde Configuración.
        </footer>
      </div>
    </div>
  );
}
