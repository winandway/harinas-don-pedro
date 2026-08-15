"use client";

// Configuración: métodos de cobro del negocio, clave de acceso y respaldos.

import { useState } from "react";
import type { DB, MetodoPago } from "@/lib/admin/types";
import { METODOS, ORDEN_METODOS } from "@/lib/admin/catalogos";
import { useAdmin } from "@/lib/admin/store";
import { descargarJson } from "@/lib/admin/format";
import { empresa } from "@/lib/site";
import {
  Card,
  PageHeader,
  Field,
  inputCls,
  btnPrimario,
} from "@/components/admin/ui";
import { IcoCandado, IcoRespaldo, IcoDescargar, IcoCheck } from "@/components/admin/icons";

export default function ConfiguracionPage() {
  const { db, aplicar, cambiarClave } = useAdmin();
  const [guardado, setGuardado] = useState(false);

  // --- Métodos de pago ---
  const [metodos, setMetodos] = useState(() =>
    JSON.parse(JSON.stringify(db.config.metodos)) as DB["config"]["metodos"]
  );
  const [notaCobro, setNotaCobro] = useState(db.config.notaCobro);

  const toggleMetodo = (m: MetodoPago) =>
    setMetodos((prev) => ({
      ...prev,
      [m]: { ...prev[m], habilitado: !prev[m].habilitado },
    }));

  const setCampo = (m: MetodoPago, key: string, valor: string) =>
    setMetodos((prev) => ({
      ...prev,
      [m]: { ...prev[m], campos: { ...prev[m].campos, [key]: valor } },
    }));

  const [guardandoMetodos, setGuardandoMetodos] = useState(false);
  const guardarMetodos = async () => {
    setGuardandoMetodos(true);
    try {
      await aplicar([
        { accion: "config", clave: "metodos", valor: JSON.stringify(metodos) },
        { accion: "config", clave: "notaCobro", valor: notaCobro },
      ]);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudieron guardar los métodos.");
    } finally {
      setGuardandoMetodos(false);
    }
  };

  // --- Clave ---
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [claveRepite, setClaveRepite] = useState("");
  const [msgClave, setMsgClave] = useState<{ ok: boolean; texto: string } | null>(null);

  const [cambiandoClave, setCambiandoClave] = useState(false);
  const cambiar = async () => {
    if (claveNueva.length < 6)
      return setMsgClave({ ok: false, texto: "La clave nueva debe tener al menos 6 caracteres." });
    if (claveNueva !== claveRepite)
      return setMsgClave({ ok: false, texto: "Las claves nuevas no coinciden." });
    setCambiandoClave(true);
    try {
      const err = await cambiarClave(claveActual, claveNueva);
      if (err) return setMsgClave({ ok: false, texto: err });
      setClaveActual("");
      setClaveNueva("");
      setClaveRepite("");
      setMsgClave({ ok: true, texto: "Clave actualizada correctamente." });
    } finally {
      setCambiandoClave(false);
    }
  };

  // --- Respaldo (exportar) ---
  const exportar = () => {
    const fecha = new Date().toISOString().slice(0, 10);
    descargarJson(`respaldo-don-pedro-${fecha}`, db);
  };

  return (
    <>
      <PageHeader
        titulo="Configuración"
        subtitulo="Datos de cobro, seguridad y respaldos del panel."
      />

      {/* Datos del negocio */}
      <Card className="p-5 mb-4">
        <h2 className="font-display font-bold text-negro mb-3">Datos del negocio</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {[
            ["Nombre", empresa.nombre],
            ["RIF", empresa.rif],
            ["Registro sanitario", empresa.registroSanitario],
            ["Ubicación", `${empresa.ciudad}, ${empresa.estado}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-crema px-4 py-3">
              <div className="text-[10px] uppercase tracking-wide text-gris">{k}</div>
              <div className="font-semibold text-negro">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-gris">
          Estos datos vienen del sitio web público. Si cambian, se actualizan en el código del sitio.
        </p>
      </Card>

      {/* Métodos de cobro */}
      <Card className="p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="font-display font-bold text-negro">Métodos de cobro</h2>
          <button className={btnPrimario} onClick={guardarMetodos} disabled={guardandoMetodos}>
            {guardado ? <IcoCheck className="w-4 h-4" /> : null}
            {guardandoMetodos ? "Guardando…" : guardado ? "Guardado" : "Guardar cambios"}
          </button>
        </div>
        <p className="text-sm text-gris mb-4">
          Activa los métodos con los que cobras y completa sus datos. Con esto se arma el mensaje
          de <strong>«Datos de cobro»</strong> que compartes con los clientes.
        </p>

        <div className="grid lg:grid-cols-2 gap-3">
          {ORDEN_METODOS.map((m) => {
            const def = METODOS[m];
            const conf = metodos[m];
            return (
              <div
                key={m}
                className={`rounded-2xl ring-1 p-4 transition ${
                  conf.habilitado ? "ring-rojo/20 bg-white" : "ring-rojo/5 bg-crema/50"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conf.habilitado}
                    onChange={() => toggleMetodo(m)}
                    className="w-4 h-4 accent-[#b01e2e]"
                  />
                  <span className="text-lg">{def.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-negro text-sm">{def.label}</span>
                    <span className="block text-[11px] text-gris">{def.descripcion}</span>
                  </span>
                </label>
                {conf.habilitado && def.camposConfig.length > 0 && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
                    {def.camposConfig.map((c) => (
                      <label key={c.key} className="block">
                        <span className="block text-[11px] font-semibold text-negro-suave mb-1">
                          {c.label}
                        </span>
                        <input
                          className={inputCls + " !py-2 !text-xs"}
                          placeholder={c.placeholder}
                          value={conf.campos[c.key] ?? ""}
                          onChange={(e) => setCampo(m, c.key, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Field label="Nota al final del mensaje de cobro">
            <textarea
              className={inputCls + " min-h-16 resize-y"}
              placeholder="Texto amigable que acompaña tus datos de pago"
              value={notaCobro}
              onChange={(e) => setNotaCobro(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Cambiar clave */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-1 flex items-center gap-2">
            <IcoCandado className="w-5 h-5 text-rojo" /> Cambiar mi clave
          </h2>
          {db.config.claveInicial && (
            <p className="text-xs bg-amarillo/15 border border-amarillo/40 rounded-lg px-3 py-2 text-rojo-oscuro mb-3">
              ⚠️ Sigues usando la clave inicial del panel. Cámbiala ahora.
            </p>
          )}
          <div className="space-y-3">
            <Field label="Clave actual">
              <input
                type="password"
                className={inputCls}
                placeholder="Tu clave actual"
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
              />
            </Field>
            <Field label="Clave nueva">
              <input
                type="password"
                className={inputCls}
                placeholder="Mínimo 6 caracteres"
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
              />
            </Field>
            <Field label="Repite la clave nueva">
              <input
                type="password"
                className={inputCls}
                placeholder="Repite la clave nueva"
                value={claveRepite}
                onChange={(e) => setClaveRepite(e.target.value)}
              />
            </Field>
            {msgClave && (
              <p
                className={`text-sm rounded-lg px-3 py-2 ${
                  msgClave.ok ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                }`}
              >
                {msgClave.texto}
              </p>
            )}
            <button className={btnPrimario} onClick={cambiar} disabled={cambiandoClave}>
              {cambiandoClave ? "Actualizando…" : "Actualizar clave"}
            </button>
          </div>
        </Card>

        {/* Respaldo */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-1 flex items-center gap-2">
            <IcoRespaldo className="w-5 h-5 text-rojo" /> Respaldo de datos
          </h2>
          <p className="text-sm text-gris mb-4 leading-relaxed">
            Tus datos se guardan de forma segura en la base de datos central del sitio, no en este
            dispositivo. Aun así, puedes descargar una copia para tus registros cuando quieras.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className={btnPrimario} onClick={exportar}>
              <IcoDescargar className="w-4 h-4" /> Descargar copia (JSON)
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-crema px-4 py-3 text-xs text-negro-suave space-y-1">
            <p>📦 Pedidos: <strong>{db.pedidos.length}</strong> · Pagos: <strong>{db.pagos.length}</strong> · Clientes: <strong>{db.clientes.length}</strong></p>
            <p>👥 Usuarios: <strong>{db.usuarios.length}</strong> · Productos: <strong>{db.productos.length}</strong> · Movimientos: <strong>{db.movimientos.length}</strong></p>
          </div>
        </Card>
      </div>
    </>
  );
}
