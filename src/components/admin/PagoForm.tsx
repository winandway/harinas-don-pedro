"use client";

// Formulario de registro de pago (compartido entre Pagos y Pedidos).
// Cubre los métodos de cobro venezolanos con captura de comprobante.

import { useMemo, useState } from "react";
import type { MetodoPago } from "@/lib/admin/types";
import { METODOS, ORDEN_METODOS } from "@/lib/admin/catalogos";
import { useAdmin, totalPedido, saldoPedido, tasaActual } from "@/lib/admin/store";
import { fmtUsd, hoyIso, uid } from "@/lib/admin/format";
import { Modal, Field, inputCls, selectCls, btnPrimario, btnSuave } from "./ui";
import ImageUpload from "./ImageUpload";

export default function PagoForm({
  pedidoId,
  onClose,
}: {
  pedidoId?: string;
  onClose: () => void;
}) {
  const { db, aplicar, subirCaptura, sesion } = useAdmin();
  const tasa = tasaActual(db);
  const pedido = pedidoId ? db.pedidos.find((p) => p.id === pedidoId) : undefined;

  const metodosDisponibles = useMemo(
    () => ORDEN_METODOS.filter((m) => db.config.metodos[m]?.habilitado),
    [db.config.metodos]
  );
  // Si no hay ninguno configurado, se muestran todos (mejor que bloquear el cobro).
  const opciones = metodosDisponibles.length ? metodosDisponibles : ORDEN_METODOS;

  const [metodo, setMetodo] = useState<MetodoPago>(opciones[0]);
  const [monto, setMonto] = useState("");
  const [tasaBs, setTasaBs] = useState(tasa ? String(tasa.bcv) : "");
  const [referencia, setReferencia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [banco, setBanco] = useState("");
  const [captura, setCaptura] = useState<string | undefined>();
  const [clienteId, setClienteId] = useState(pedido?.clienteId ?? "");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const def = METODOS[metodo];
  const esBs = def.moneda === "VES";
  const montoNum = parseFloat(monto.replace(",", ".")) || 0;
  const tasaNum = parseFloat(tasaBs.replace(",", ".")) || 0;
  const equivalente = esBs ? (tasaNum > 0 ? montoNum / tasaNum : 0) : montoNum;

  const saldo = pedido ? saldoPedido(pedido, db.pagos) : null;

  const guardar = async () => {
    if (montoNum <= 0) return setError("Indica el monto recibido.");
    if (esBs && tasaNum <= 0) return setError("Indica la tasa en Bs para calcular el equivalente.");
    setGuardando(true);
    try {
      // Si hay comprobante nuevo (dataURL), se sube y se guarda solo su URL.
      let capturaUrl: string | null = captura ?? null;
      if (captura && captura.startsWith("data:")) capturaUrl = await subirCaptura(captura);

      const cliente = db.clientes.find((c) => c.id === clienteId);
      // El número (PAG-####) lo asigna el servidor.
      const fila = {
        id: uid(),
        fecha: hoyIso(),
        clienteId: clienteId || pedido?.clienteId || null,
        clienteNombre: cliente?.nombre ?? pedido?.clienteNombre ?? null,
        pedidoId: pedido?.id ?? null,
        metodo,
        moneda: def.moneda,
        monto: montoNum,
        tasaBs: esBs ? tasaNum : null,
        equivalenteUsd: Math.round(equivalente * 100) / 100,
        referencia: referencia.trim() || null,
        telefono: telefono.trim() || null,
        banco: banco.trim() || null,
        captura: capturaUrl,
        estado: "por_verificar",
        notas: notas.trim() || null,
        registradoPor: sesion?.nombre ?? "—",
      };
      await aplicar([{ accion: "upsert", tabla: "pagos", fila }]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el pago.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      titulo={pedido ? `Registrar pago · ${pedido.numero}` : "Registrar pago"}
      onClose={onClose}
      ancho="max-w-2xl"
    >
      {pedido && (
        <div className="mb-4 rounded-xl bg-crema px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1">
          <span className="text-negro-suave">
            Cliente: <strong className="text-negro">{pedido.clienteNombre}</strong>
          </span>
          <span className="text-negro-suave">
            Total: <strong className="text-negro">{fmtUsd(totalPedido(pedido))}</strong>
          </span>
          {saldo !== null && (
            <span className="text-negro-suave">
              Saldo pendiente: <strong className="text-rojo">{fmtUsd(saldo)}</strong>
            </span>
          )}
        </div>
      )}

      {/* Método */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {opciones.map((m) => {
          const d = METODOS[m];
          const activo = m === metodo;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMetodo(m)}
              className={`rounded-xl px-2 py-2.5 text-center transition ring-1 ${
                activo
                  ? "bg-rojo text-white ring-rojo shadow"
                  : "bg-white text-negro-suave ring-rojo/10 hover:ring-rojo/30"
              }`}
            >
              <div className="text-lg leading-none">{d.emoji}</div>
              <div className="text-[11px] font-semibold mt-1">{d.corto}</div>
            </button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={`Monto recibido (${def.moneda === "VES" ? "Bs" : def.moneda})`} requerido>
          <input
            className={inputCls}
            inputMode="decimal"
            placeholder="0,00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </Field>

        {esBs ? (
          <Field label="Tasa del día (Bs por USD)" requerido ayuda={equivalente > 0 ? `Equivale a ${fmtUsd(equivalente)}` : "Se usa para calcular el equivalente en dólares."}>
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="Tasa en Bs"
              value={tasaBs}
              onChange={(e) => setTasaBs(e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Equivalente en USD">
            <input className={inputCls} value={fmtUsd(equivalente)} readOnly />
          </Field>
        )}

        {!pedido && (
          <Field label="Cliente (opcional)">
            <select className={selectCls} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Sin cliente asociado</option>
              {db.clientes
                .filter((c) => c.activo)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>
          </Field>
        )}

        {def.camposPago.includes("referencia") && (
          <Field label="Número de referencia">
            <input
              className={inputCls}
              placeholder="Referencia de la operación"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </Field>
        )}
        {def.camposPago.includes("telefono") && (
          <Field label="Teléfono emisor">
            <input
              className={inputCls}
              placeholder="04XX-0000000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </Field>
        )}
        {def.camposPago.includes("banco") && (
          <Field label="Banco emisor">
            <input
              className={inputCls}
              placeholder="Banco desde donde pagó"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
            />
          </Field>
        )}
      </div>

      {def.pideCaptura && (
        <div className="mt-4">
          <span className="block text-xs font-semibold text-negro-suave mb-1.5">
            Captura del comprobante
          </span>
          <ImageUpload valor={captura} onCambio={setCaptura} />
        </div>
      )}

      <div className="mt-4">
        <Field label="Notas (opcional)">
          <textarea
            className={inputCls + " min-h-16 resize-y"}
            placeholder="Observaciones del pago"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </Field>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar pago"}
        </button>
      </div>
      <p className="mt-3 text-[11px] text-gris">
        El pago queda <strong>por verificar</strong> hasta que un administrador lo confirme. Solo
        los pagos verificados abonan al pedido.
      </p>
    </Modal>
  );
}
