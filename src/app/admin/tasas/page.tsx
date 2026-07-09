"use client";

// Tasas de cambio: BCV, paralelo y USDT, con calculadora Bs ↔ USD.

import { useState } from "react";
import { useAdmin, tasaActual } from "@/lib/admin/store";
import { fmtBs, fmtUsd, fmtFechaHora, hoyIso, uid } from "@/lib/admin/format";
import {
  Card,
  PageHeader,
  Confirmar,
  KebabMenu,
  EmptyState,
  Field,
  inputCls,
  btnPrimario,
  btnSuave,
  Tabla,
  Modal,
} from "@/components/admin/ui";
import { IcoPlus, IcoBasura, IcoCalculadora } from "@/components/admin/icons";
import type { TasaRegistro } from "@/lib/admin/types";

export default function TasasPage() {
  const { db, mutar, sesion } = useAdmin();
  const [registrando, setRegistrando] = useState(false);
  const [borrando, setBorrando] = useState<TasaRegistro | null>(null);
  const actual = tasaActual(db);

  // Calculadora
  const [montoCalc, setMontoCalc] = useState("");
  const [direccion, setDireccion] = useState<"bs-usd" | "usd-bs">("usd-bs");
  const montoNum = parseFloat(montoCalc.replace(",", ".")) || 0;
  const tasaCalc = actual?.bcv ?? 0;
  const resultado =
    tasaCalc > 0
      ? direccion === "usd-bs"
        ? montoNum * tasaCalc
        : montoNum / tasaCalc
      : 0;

  const borrar = (t: TasaRegistro) => {
    mutar((d) => ({ ...d, tasas: d.tasas.filter((x) => x.id !== t.id) }));
    setBorrando(null);
  };

  return (
    <>
      <PageHeader
        titulo="Tasas de cambio"
        subtitulo="Registra la tasa del día para calcular los cobros en bolívares."
        acciones={
          <button className={btnPrimario} onClick={() => setRegistrando(true)}>
            <IcoPlus className="w-4 h-4" /> Registrar tasa del día
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tasa vigente */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-3">Tasa vigente</h2>
          {actual ? (
            <div className="space-y-3">
              <div className="rounded-2xl brand-gradient text-white px-5 py-4">
                <div className="text-[11px] uppercase tracking-widest text-amarillo-claro">
                  BCV (oficial)
                </div>
                <div className="font-display text-3xl font-black mt-1">{fmtBs(actual.bcv)}</div>
                <div className="text-white/60 text-[11px] mt-1">por 1 USD</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-crema px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wide text-gris">Paralelo</div>
                  <div className="font-bold text-negro">
                    {actual.paralelo ? fmtBs(actual.paralelo) : "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-crema px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wide text-gris">USDT</div>
                  <div className="font-bold text-negro">
                    {actual.usdt ? fmtBs(actual.usdt) : "—"}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gris">
                Registrada {fmtFechaHora(actual.fecha)} por {actual.registradoPor}
              </p>
            </div>
          ) : (
            <EmptyState
              emoji="💱"
              titulo="Sin tasa registrada"
              texto="Registra la tasa BCV del día: se usa al calcular pagos recibidos en bolívares."
            />
          )}
        </Card>

        {/* Calculadora */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-3 flex items-center gap-2">
            <IcoCalculadora className="w-5 h-5 text-rojo" /> Calculadora
          </h2>
          {actual ? (
            <div className="space-y-3">
              <div className="flex rounded-full bg-crema p-1">
                {(
                  [
                    ["usd-bs", "USD → Bs"],
                    ["bs-usd", "Bs → USD"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setDireccion(id)}
                    className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                      direccion === id ? "bg-rojo text-white shadow" : "text-negro-suave"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                className={inputCls + " text-lg font-semibold text-center"}
                inputMode="decimal"
                placeholder={direccion === "usd-bs" ? "Monto en USD" : "Monto en Bs"}
                value={montoCalc}
                onChange={(e) => setMontoCalc(e.target.value)}
              />
              <div className="rounded-xl bg-amarillo/15 border border-amarillo/40 px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-gris">Resultado (tasa BCV)</div>
                <div className="font-display text-2xl font-black text-rojo-oscuro mt-0.5">
                  {direccion === "usd-bs" ? fmtBs(resultado) : fmtUsd(resultado)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gris py-8 text-center">
              Registra primero la tasa del día para usar la calculadora.
            </p>
          )}
        </Card>

        {/* Historial */}
        <Card>
          <h2 className="font-display font-bold text-negro px-5 pt-5 pb-2">Historial</h2>
          {db.tasas.length === 0 ? (
            <p className="text-sm text-gris px-5 pb-8 pt-4 text-center">
              Aquí verás el historial de tasas registradas.
            </p>
          ) : (
            <Tabla cabeceras={["Fecha", "BCV", "Paralelo", "USDT", ""]}>
              {db.tasas.slice(0, 15).map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2.5 text-xs text-gris">{fmtFechaHora(t.fecha)}</td>
                  <td className="px-4 py-2.5 font-semibold text-negro">{fmtBs(t.bcv)}</td>
                  <td className="px-4 py-2.5 text-negro-suave">{t.paralelo ? fmtBs(t.paralelo) : "—"}</td>
                  <td className="px-4 py-2.5 text-negro-suave">{t.usdt ? fmtBs(t.usdt) : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <KebabMenu
                      acciones={[
                        {
                          label: "Eliminar",
                          icono: <IcoBasura className="w-4 h-4" />,
                          destructiva: true,
                          onClick: () => setBorrando(t),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </Tabla>
          )}
        </Card>
      </div>

      {registrando && <TasaForm onClose={() => setRegistrando(false)} usuario={sesion?.nombre ?? "—"} />}
      {borrando && (
        <Confirmar
          titulo="Eliminar registro de tasa"
          mensaje="¿Eliminar este registro del historial de tasas? Los pagos ya calculados no cambian."
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
    </>
  );
}

function TasaForm({ onClose, usuario }: { onClose: () => void; usuario: string }) {
  const { mutar } = useAdmin();
  const [bcv, setBcv] = useState("");
  const [paralelo, setParalelo] = useState("");
  const [usdt, setUsdt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const b = parseFloat(bcv.replace(",", ".")) || 0;
    if (b <= 0) return setError("La tasa BCV es obligatoria.");
    const nueva: TasaRegistro = {
      id: uid(),
      fecha: hoyIso(),
      bcv: b,
      paralelo: parseFloat(paralelo.replace(",", ".")) || undefined,
      usdt: parseFloat(usdt.replace(",", ".")) || undefined,
      registradoPor: usuario,
    };
    mutar((d) => ({ ...d, tasas: [nueva, ...d.tasas] }));
    onClose();
  };

  return (
    <Modal titulo="Registrar tasa del día" onClose={onClose} ancho="max-w-md">
      <div className="space-y-4">
        <Field label="Tasa BCV (Bs por USD)" requerido>
          <input
            className={inputCls}
            inputMode="decimal"
            placeholder="Tasa oficial del día"
            value={bcv}
            onChange={(e) => setBcv(e.target.value)}
          />
        </Field>
        <Field label="Tasa paralelo (opcional)">
          <input
            className={inputCls}
            inputMode="decimal"
            placeholder="Tasa del mercado paralelo"
            value={paralelo}
            onChange={(e) => setParalelo(e.target.value)}
          />
        </Field>
        <Field label="Tasa USDT (opcional)">
          <input
            className={inputCls}
            inputMode="decimal"
            placeholder="Bs por USDT"
            value={usdt}
            onChange={(e) => setUsdt(e.target.value)}
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar}>
          Guardar tasa
        </button>
      </div>
    </Modal>
  );
}
