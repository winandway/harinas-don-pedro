"use client";

// Pagos y cobros: registro con comprobante, verificación y datos de cobro.

import { useMemo, useState } from "react";
import type { EstadoPago, MetodoPago, Pago } from "@/lib/admin/types";
import { ESTADOS_PAGO, METODOS, ORDEN_METODOS } from "@/lib/admin/catalogos";
import { useAdmin } from "@/lib/admin/store";
import { fmtUsd, fmtMoneda, fmtFechaHora, descargarCsv } from "@/lib/admin/format";
import {
  Card,
  PageHeader,
  Badge,
  Confirmar,
  KebabMenu,
  EmptyState,
  selectCls,
  btnPrimario,
  btnSecundario,
  SearchInput,
  Tabla,
  Lightbox,
  Modal,
  btnSuave,
} from "@/components/admin/ui";
import PagoForm from "@/components/admin/PagoForm";
import {
  IcoPlus,
  IcoCheck,
  IcoX,
  IcoBasura,
  IcoOjo,
  IcoCopiar,
  IcoDescargar,
} from "@/components/admin/icons";

export default function PagosPage() {
  const { db, mutar, sesion } = useAdmin();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | "todos">("todos");
  const [filtroMetodo, setFiltroMetodo] = useState<MetodoPago | "todos">("todos");
  const [nuevo, setNuevo] = useState(false);
  const [captura, setCaptura] = useState<Pago | null>(null);
  const [borrando, setBorrando] = useState<Pago | null>(null);
  const [datosCobro, setDatosCobro] = useState(false);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return db.pagos
      .filter((p) => filtroEstado === "todos" || p.estado === filtroEstado)
      .filter((p) => filtroMetodo === "todos" || p.metodo === filtroMetodo)
      .filter(
        (p) =>
          !q ||
          p.numero.toLowerCase().includes(q) ||
          (p.clienteNombre ?? "").toLowerCase().includes(q) ||
          (p.referencia ?? "").toLowerCase().includes(q)
      );
  }, [db.pagos, busqueda, filtroEstado, filtroMetodo]);

  const porVerificar = db.pagos.filter((p) => p.estado === "por_verificar").length;

  const cambiarEstado = (p: Pago, estado: EstadoPago) => {
    mutar((d) => ({
      ...d,
      pagos: d.pagos.map((x) =>
        x.id === p.id ? { ...x, estado, verificadoPor: sesion?.nombre } : x
      ),
    }));
  };

  const borrar = (p: Pago) => {
    mutar((d) => ({ ...d, pagos: d.pagos.filter((x) => x.id !== p.id) }));
    setBorrando(null);
  };

  const exportar = () =>
    descargarCsv(
      "pagos-don-pedro",
      lista.map((p) => ({
        numero: p.numero,
        fecha: fmtFechaHora(p.fecha),
        cliente: p.clienteNombre ?? "",
        pedido: db.pedidos.find((x) => x.id === p.pedidoId)?.numero ?? "",
        metodo: METODOS[p.metodo].label,
        moneda: p.moneda,
        monto: p.monto,
        tasa: p.tasaBs ?? "",
        equivalente_usd: p.equivalenteUsd,
        referencia: p.referencia ?? "",
        estado: ESTADOS_PAGO[p.estado].label,
        registrado_por: p.registradoPor,
      }))
    );

  return (
    <>
      <PageHeader
        titulo="Pagos y cobros"
        subtitulo={
          porVerificar > 0
            ? `${porVerificar} pago${porVerificar === 1 ? "" : "s"} esperando verificación`
            : "Todos los pagos están al día."
        }
        acciones={
          <>
            <button className={btnSecundario} onClick={() => setDatosCobro(true)}>
              <IcoCopiar className="w-4 h-4" /> Datos de cobro
            </button>
            {lista.length > 0 && (
              <button className={btnSecundario} onClick={exportar}>
                <IcoDescargar className="w-4 h-4" /> CSV
              </button>
            )}
            <button className={btnPrimario} onClick={() => setNuevo(true)}>
              <IcoPlus className="w-4 h-4" /> Registrar pago
            </button>
          </>
        }
      />

      <Card>
        <div className="p-4 flex flex-col lg:flex-row gap-3 border-b border-rojo/5">
          <div className="flex-1">
            <SearchInput
              valor={busqueda}
              onCambio={setBusqueda}
              placeholder="Buscar por número, cliente o referencia…"
            />
          </div>
          <select
            className={selectCls + " lg:w-48"}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoPago | "todos")}
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(ESTADOS_PAGO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className={selectCls + " lg:w-52"}
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value as MetodoPago | "todos")}
          >
            <option value="todos">Todos los métodos</option>
            {ORDEN_METODOS.map((m) => (
              <option key={m} value={m}>
                {METODOS[m].emoji} {METODOS[m].label}
              </option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <EmptyState
            emoji="🧾"
            titulo={db.pagos.length === 0 ? "Todavía no hay pagos" : "Sin resultados"}
            texto={
              db.pagos.length === 0
                ? "Registra cada cobro con su método (Pago Móvil, Zelle, USDT, efectivo…) y su captura. Luego un administrador lo verifica."
                : "No hay pagos con estos filtros."
            }
            accion={
              db.pagos.length === 0 ? (
                <button className={btnPrimario} onClick={() => setNuevo(true)}>
                  <IcoPlus className="w-4 h-4" /> Registrar el primero
                </button>
              ) : undefined
            }
          />
        ) : (
          <Tabla cabeceras={["Pago", "Cliente / Pedido", "Método", "Monto", "Equiv. USD", "Estado", "Comprobante", ""]}>
            {lista.map((p) => {
              const pedido = db.pedidos.find((x) => x.id === p.pedidoId);
              return (
                <tr key={p.id} className="hover:bg-crema/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gris">{p.numero}</div>
                    <div className="text-[11px] text-gris mt-0.5">{fmtFechaHora(p.fecha)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-negro">{p.clienteNombre ?? "—"}</div>
                    {pedido && <div className="text-[11px] text-gris">{pedido.numero}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-negro-suave">
                      <span>{METODOS[p.metodo].emoji}</span>
                      <span className="text-xs font-medium">{METODOS[p.metodo].label}</span>
                    </span>
                    {p.referencia && (
                      <div className="text-[11px] text-gris mt-0.5">Ref. {p.referencia}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-negro whitespace-nowrap">
                    {fmtMoneda(p.monto, p.moneda)}
                    {p.tasaBs ? (
                      <div className="text-[11px] font-normal text-gris">Tasa {p.tasaBs}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-bold text-negro whitespace-nowrap">
                    {fmtUsd(p.equivalenteUsd)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ESTADOS_PAGO[p.estado].badge}>
                      {ESTADOS_PAGO[p.estado].label}
                    </Badge>
                    {p.verificadoPor && p.estado !== "por_verificar" && (
                      <div className="text-[10px] text-gris mt-0.5">por {p.verificadoPor}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.captura ? (
                      <button
                        onClick={() => setCaptura(p)}
                        className="relative group"
                        title="Ver comprobante"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.captura}
                          alt={`Comprobante ${p.numero}`}
                          className="w-12 h-12 object-cover rounded-lg ring-1 ring-rojo/10 group-hover:ring-rojo/40 transition"
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gris">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.estado === "por_verificar" && (
                        <>
                          <button
                            onClick={() => cambiarEstado(p, "verificado")}
                            title="Marcar verificado"
                            className="w-8 h-8 grid place-items-center rounded-full text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <IcoCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cambiarEstado(p, "rechazado")}
                            title="Rechazar"
                            className="w-8 h-8 grid place-items-center rounded-full text-red-500 hover:bg-red-50 transition"
                          >
                            <IcoX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <KebabMenu
                        acciones={[
                          ...(p.captura
                            ? [
                                {
                                  label: "Ver comprobante",
                                  icono: <IcoOjo className="w-4 h-4" />,
                                  onClick: () => setCaptura(p),
                                },
                              ]
                            : []),
                          ...(p.estado !== "por_verificar"
                            ? [
                                {
                                  label: "Volver a «por verificar»",
                                  icono: <IcoX className="w-4 h-4" />,
                                  onClick: () => cambiarEstado(p, "por_verificar"),
                                },
                              ]
                            : []),
                          {
                            label: "Eliminar",
                            icono: <IcoBasura className="w-4 h-4" />,
                            destructiva: true,
                            onClick: () => setBorrando(p),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </Tabla>
        )}
      </Card>

      {nuevo && <PagoForm onClose={() => setNuevo(false)} />}
      {captura?.captura && (
        <Lightbox
          src={captura.captura}
          alt={`Comprobante del pago ${captura.numero}`}
          onClose={() => setCaptura(null)}
        />
      )}
      {borrando && (
        <Confirmar
          titulo="Eliminar pago"
          mensaje={`¿Eliminar el pago ${borrando.numero}${
            borrando.clienteNombre ? ` de ${borrando.clienteNombre}` : ""
          }? Si estaba verificado, el saldo del pedido volverá a aumentar.`}
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
      {datosCobro && <DatosCobroModal onClose={() => setDatosCobro(false)} />}
    </>
  );
}

// ---------- Datos de cobro para compartir ----------

function DatosCobroModal({ onClose }: { onClose: () => void }) {
  const { db } = useAdmin();
  const [copiado, setCopiado] = useState(false);

  const habilitados = ORDEN_METODOS.filter(
    (m) => db.config.metodos[m]?.habilitado && METODOS[m].camposConfig.length > 0
  );

  const texto = useMemo(() => {
    const lineas: string[] = ["*Datos de pago · Harinas y Pulpas Don Pedro* 🌾", ""];
    for (const m of habilitados) {
      const def = METODOS[m];
      const conf = db.config.metodos[m];
      lineas.push(`${def.emoji} *${def.label}*`);
      for (const campo of def.camposConfig) {
        const v = conf.campos[campo.key];
        if (v) lineas.push(`   ${campo.label}: ${v}`);
      }
      lineas.push("");
    }
    if (db.config.metodos.efectivo_usd.habilitado || db.config.metodos.efectivo_bs.habilitado) {
      lineas.push("💵 También aceptamos efectivo (USD y Bs).", "");
    }
    if (db.config.notaCobro) lineas.push(db.config.notaCobro);
    return lineas.join("\n");
  }, [db.config, habilitados]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sin permiso de portapapeles: el usuario puede copiar manualmente
    }
  };

  return (
    <Modal titulo="Datos de cobro para compartir" onClose={onClose} ancho="max-w-lg">
      {habilitados.length === 0 ? (
        <EmptyState
          emoji="⚙️"
          titulo="Configura tus métodos de cobro"
          texto="En Configuración activa tus métodos (Pago Móvil, Zelle, USDT…) y completa sus datos. Aquí se arma el mensaje listo para enviar al cliente."
        />
      ) : (
        <>
          <p className="text-sm text-negro-suave mb-3">
            Mensaje listo para pegar en WhatsApp cuando un cliente pregunte cómo pagar:
          </p>
          <pre className="whitespace-pre-wrap rounded-xl bg-crema px-4 py-3 text-sm text-negro leading-relaxed max-h-72 overflow-y-auto">
            {texto}
          </pre>
          <div className="mt-4 flex justify-end gap-2">
            <button className={btnSuave} onClick={onClose}>
              Cerrar
            </button>
            <button className={btnPrimario} onClick={copiar}>
              <IcoCopiar className="w-4 h-4" /> {copiado ? "¡Copiado!" : "Copiar mensaje"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
