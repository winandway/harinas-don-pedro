"use client";

// Pedidos: pipeline completo desde la consulta hasta la entrega.

import { useMemo, useState } from "react";
import type { CanalPedido, EstadoPedido, ItemPedido, Pedido } from "@/lib/admin/types";
import { CANALES, ESTADOS_PEDIDO, FLUJO_PEDIDO } from "@/lib/admin/catalogos";
import {
  useAdmin,
  totalPedido,
  abonadoPedido,
  saldoPedido,
  type Op,
} from "@/lib/admin/store";
import { fmtUsd, fmtFecha, hoyIso, hoyFecha, numeroDoc, uid } from "@/lib/admin/format";
import {
  Card,
  PageHeader,
  Badge,
  Modal,
  Confirmar,
  KebabMenu,
  EmptyState,
  Field,
  inputCls,
  selectCls,
  btnPrimario,
  btnAmarillo,
  btnSuave,
  SearchInput,
} from "@/components/admin/ui";
import PagoForm from "@/components/admin/PagoForm";
import {
  IcoPlus,
  IcoEditar,
  IcoBasura,
  IcoPagos,
  IcoCheck,
  IcoX,
  IcoOjo,
} from "@/components/admin/icons";

type FiltroEstado = EstadoPedido | "todos" | "activos";

export default function PedidosPage() {
  const { db, aplicar, sesion } = useAdmin();
  const [filtro, setFiltro] = useState<FiltroEstado>("activos");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Pedido | "nuevo" | null>(null);
  const [viendo, setViendo] = useState<Pedido | null>(null);
  const [cobrando, setCobrando] = useState<Pedido | null>(null);
  const [borrando, setBorrando] = useState<Pedido | null>(null);
  const [entregando, setEntregando] = useState<Pedido | null>(null);
  const [cancelando, setCancelando] = useState<Pedido | null>(null);

  const conteos = useMemo(() => {
    const c: Record<string, number> = { todos: db.pedidos.length, activos: 0 };
    for (const e of Object.keys(ESTADOS_PEDIDO)) c[e] = 0;
    for (const p of db.pedidos) {
      c[p.estado]++;
      if (!["entregado", "cancelado"].includes(p.estado)) c.activos++;
    }
    return c;
  }, [db.pedidos]);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return db.pedidos
      .filter((p) =>
        filtro === "todos"
          ? true
          : filtro === "activos"
          ? !["entregado", "cancelado"].includes(p.estado)
          : p.estado === filtro
      )
      .filter(
        (p) =>
          !q ||
          p.clienteNombre.toLowerCase().includes(q) ||
          p.numero.toLowerCase().includes(q)
      );
  }, [db.pedidos, filtro, busqueda]);

  const avanzarEstado = async (p: Pedido) => {
    const idx = FLUJO_PEDIDO.indexOf(p.estado);
    if (idx < 0 || idx >= FLUJO_PEDIDO.length - 1) return;
    const siguiente = FLUJO_PEDIDO[idx + 1];
    if (siguiente === "entregado") {
      setEntregando(p);
      return;
    }
    try {
      await aplicar([{ accion: "upsert", tabla: "pedidos", fila: { id: p.id, estado: siguiente } }]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo actualizar el pedido.");
    }
  };

  const entregar = async (p: Pedido, descontar: boolean) => {
    const ops: Op[] = [];
    if (descontar && !p.descontadoInventario) {
      for (const it of p.items) {
        if (!it.productoId) continue;
        const prod = db.productos.find((x) => x.id === it.productoId);
        if (!prod) continue;
        ops.push({
          accion: "upsert",
          tabla: "productos",
          fila: { id: prod.id, stock: Math.max(0, prod.stock - it.cantidad) },
        });
        ops.push({
          accion: "upsert",
          tabla: "movimientos",
          fila: {
            id: uid(),
            productoId: it.productoId,
            productoNombre: it.descripcion,
            tipo: "salida",
            cantidad: it.cantidad,
            motivo: `Entrega del pedido ${p.numero}`,
            fecha: hoyIso(),
            usuario: sesion?.nombre ?? "—",
          },
        });
      }
    }
    ops.push({
      accion: "upsert",
      tabla: "pedidos",
      fila: { id: p.id, estado: "entregado", descontadoInventario: descontar || p.descontadoInventario },
    });
    try {
      await aplicar(ops);
      setEntregando(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo entregar el pedido.");
    }
  };

  const cancelar = async (p: Pedido) => {
    try {
      await aplicar([{ accion: "upsert", tabla: "pedidos", fila: { id: p.id, estado: "cancelado" } }]);
      setCancelando(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo cancelar el pedido.");
    }
  };

  const borrar = async (p: Pedido) => {
    try {
      await aplicar([{ accion: "delete", tabla: "pedidos", id: p.id }]);
      setBorrando(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo eliminar el pedido.");
    }
  };

  const FILTROS: Array<{ id: FiltroEstado; label: string }> = [
    { id: "activos", label: "Activos" },
    { id: "consulta", label: "Consultas" },
    { id: "confirmado", label: "Confirmados" },
    { id: "en_produccion", label: "En producción" },
    { id: "listo", label: "Listos" },
    { id: "entregado", label: "Entregados" },
    { id: "cancelado", label: "Cancelados" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        subtitulo="De la consulta a la entrega: todo el recorrido de cada pedido."
        acciones={
          <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
            <IcoPlus className="w-4 h-4" /> Nuevo pedido
          </button>
        }
      />

      {/* Filtros por estado */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filtro === f.id
                ? "bg-rojo text-white shadow"
                : "bg-white text-negro-suave ring-1 ring-rojo/10 hover:ring-rojo/30"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 ${filtro === f.id ? "text-white/70" : "text-gris"}`}>
              {conteos[f.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-rojo/5">
          <SearchInput
            valor={busqueda}
            onCambio={setBusqueda}
            placeholder="Buscar por cliente o número de pedido…"
          />
        </div>

        {lista.length === 0 ? (
          <EmptyState
            emoji="🛒"
            titulo={db.pedidos.length === 0 ? "Todavía no hay pedidos" : "Nada por aquí"}
            texto={
              db.pedidos.length === 0
                ? "Cuando un cliente consulte o encargue, créalo aquí: queda como consulta y lo vas avanzando hasta entregarlo."
                : "No hay pedidos con este filtro o búsqueda."
            }
            accion={
              db.pedidos.length === 0 ? (
                <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
                  <IcoPlus className="w-4 h-4" /> Crear el primero
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-rojo/5">
            {lista.map((p) => {
              const total = totalPedido(p);
              const abonado = abonadoPedido(p.id, db.pagos);
              const saldo = Math.max(0, total - abonado);
              const idx = FLUJO_PEDIDO.indexOf(p.estado);
              const puedeAvanzar = idx >= 0 && idx < FLUJO_PEDIDO.length - 1;
              return (
                <li key={p.id} className="px-4 py-3.5 hover:bg-crema/40 transition-colors">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-52">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gris">{p.numero}</span>
                        <button
                          onClick={() => setViendo(p)}
                          className="font-semibold text-negro hover:text-rojo transition-colors"
                        >
                          {p.clienteNombre}
                        </button>
                        <Badge className={ESTADOS_PEDIDO[p.estado].badge}>
                          {ESTADOS_PEDIDO[p.estado].label}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-gris mt-1">
                        {CANALES[p.canal].emoji} {CANALES[p.canal].label} · {fmtFecha(p.fecha)}
                        {p.fechaEntrega && ` · Entrega: ${fmtFecha(p.fechaEntrega)}`} ·{" "}
                        {p.items.length} producto{p.items.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-negro">{fmtUsd(total)}</div>
                      {saldo > 0 && p.estado !== "cancelado" ? (
                        <div className="text-[11px] text-rojo font-semibold">
                          Saldo {fmtUsd(saldo)}
                        </div>
                      ) : total > 0 && p.estado !== "cancelado" ? (
                        <div className="text-[11px] text-emerald-600 font-semibold">Pagado ✓</div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {puedeAvanzar && (
                        <button
                          onClick={() => avanzarEstado(p)}
                          className={btnAmarillo + " !px-3 !py-1.5 !text-xs"}
                          title={`Pasar a ${ESTADOS_PEDIDO[FLUJO_PEDIDO[idx + 1]].label}`}
                        >
                          <IcoCheck className="w-3.5 h-3.5" />
                          {ESTADOS_PEDIDO[FLUJO_PEDIDO[idx + 1]].label}
                        </button>
                      )}
                      {saldo > 0 && p.estado !== "cancelado" && (
                        <button
                          onClick={() => setCobrando(p)}
                          className={btnSuave + " !px-3 !py-1.5 !text-xs"}
                          title="Registrar pago"
                        >
                          <IcoPagos className="w-3.5 h-3.5" /> Cobrar
                        </button>
                      )}
                      <KebabMenu
                        acciones={[
                          {
                            label: "Ver detalle",
                            icono: <IcoOjo className="w-4 h-4" />,
                            onClick: () => setViendo(p),
                          },
                          {
                            label: "Editar",
                            icono: <IcoEditar className="w-4 h-4" />,
                            onClick: () => setEditando(p),
                          },
                          ...(p.estado !== "cancelado" && p.estado !== "entregado"
                            ? [
                                {
                                  label: "Cancelar pedido",
                                  icono: <IcoX className="w-4 h-4" />,
                                  onClick: () => setCancelando(p),
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {editando && (
        <PedidoForm pedido={editando === "nuevo" ? null : editando} onClose={() => setEditando(null)} />
      )}
      {viendo && <PedidoDetalle pedido={viendo} onClose={() => setViendo(null)} onCobrar={() => { setCobrando(viendo); setViendo(null); }} />}
      {cobrando && <PagoForm pedidoId={cobrando.id} onClose={() => setCobrando(null)} />}
      {entregando && (
        <Modal titulo={`Entregar ${entregando.numero}`} onClose={() => setEntregando(null)} ancho="max-w-md">
          <p className="text-sm text-negro-suave leading-relaxed">
            Vas a marcar este pedido como <strong>entregado</strong>. ¿Descontamos las cantidades
            del inventario automáticamente?
          </p>
          {saldoPedido(entregando, db.pagos) > 0 && (
            <p className="mt-3 text-sm bg-amarillo/15 border border-amarillo/40 rounded-lg px-3 py-2 text-rojo-oscuro">
              ⚠️ Este pedido aún tiene saldo pendiente de{" "}
              <strong>{fmtUsd(saldoPedido(entregando, db.pagos))}</strong>.
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button className={btnSuave} onClick={() => setEntregando(null)}>
              Cancelar
            </button>
            <button className={btnSuave} onClick={() => entregar(entregando, false)}>
              Entregar sin descontar
            </button>
            <button className={btnPrimario} onClick={() => entregar(entregando, true)}>
              Entregar y descontar stock
            </button>
          </div>
        </Modal>
      )}
      {cancelando && (
        <Confirmar
          titulo="Cancelar pedido"
          mensaje={`¿Cancelar el pedido ${cancelando.numero} de ${cancelando.clienteNombre}? El pedido queda registrado como cancelado.`}
          textoBoton="Sí, cancelar pedido"
          destructivo
          onConfirmar={() => cancelar(cancelando)}
          onCancelar={() => setCancelando(null)}
        />
      )}
      {borrando && (
        <Confirmar
          titulo="Eliminar pedido"
          mensaje={`¿Eliminar definitivamente el pedido ${borrando.numero}? Esta acción no se puede deshacer. Los pagos asociados no se borran.`}
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
    </>
  );
}

// ---------- Detalle ----------

function PedidoDetalle({
  pedido,
  onClose,
  onCobrar,
}: {
  pedido: Pedido;
  onClose: () => void;
  onCobrar: () => void;
}) {
  const { db } = useAdmin();
  const total = totalPedido(pedido);
  const pagos = db.pagos.filter((pg) => pg.pedidoId === pedido.id);
  const abonado = abonadoPedido(pedido.id, db.pagos);
  const saldo = Math.max(0, total - abonado);

  return (
    <Modal titulo={`${pedido.numero} · ${pedido.clienteNombre}`} onClose={onClose} ancho="max-w-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={ESTADOS_PEDIDO[pedido.estado].badge}>
          {ESTADOS_PEDIDO[pedido.estado].label}
        </Badge>
        <Badge>
          {CANALES[pedido.canal].emoji} {CANALES[pedido.canal].label}
        </Badge>
        <Badge>📅 {fmtFecha(pedido.fecha)}</Badge>
        {pedido.fechaEntrega && <Badge>🚚 Entrega {fmtFecha(pedido.fechaEntrega)}</Badge>}
      </div>

      <div className="rounded-xl ring-1 ring-rojo/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-crema text-left text-[11px] uppercase tracking-wide text-gris">
              <th className="px-3.5 py-2 font-semibold">Producto</th>
              <th className="px-3.5 py-2 font-semibold text-center">Cant.</th>
              <th className="px-3.5 py-2 font-semibold text-right">Precio</th>
              <th className="px-3.5 py-2 font-semibold text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rojo/5">
            {pedido.items.map((it, i) => (
              <tr key={i}>
                <td className="px-3.5 py-2.5 text-negro">{it.descripcion}</td>
                <td className="px-3.5 py-2.5 text-center text-negro-suave">{it.cantidad}</td>
                <td className="px-3.5 py-2.5 text-right text-negro-suave">{fmtUsd(it.precioUsd)}</td>
                <td className="px-3.5 py-2.5 text-right font-semibold text-negro">
                  {fmtUsd(it.cantidad * it.precioUsd)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-crema/60">
              <td colSpan={3} className="px-3.5 py-2.5 text-right font-semibold text-negro-suave">
                Total
              </td>
              <td className="px-3.5 py-2.5 text-right font-black text-negro">{fmtUsd(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-crema px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wide text-gris">Total</div>
          <div className="font-bold text-negro">{fmtUsd(total)}</div>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wide text-emerald-700">Abonado</div>
          <div className="font-bold text-emerald-700">{fmtUsd(abonado)}</div>
        </div>
        <div className={`rounded-xl px-3 py-2.5 ${saldo > 0 ? "bg-red-50" : "bg-crema"}`}>
          <div className={`text-[10px] uppercase tracking-wide ${saldo > 0 ? "text-red-600" : "text-gris"}`}>
            Saldo
          </div>
          <div className={`font-bold ${saldo > 0 ? "text-red-600" : "text-negro"}`}>
            {fmtUsd(saldo)}
          </div>
        </div>
      </div>

      {pagos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gris mb-2">
            Pagos de este pedido
          </h3>
          <ul className="space-y-1.5">
            {pagos.map((pg) => (
              <li key={pg.id} className="flex items-center justify-between rounded-lg bg-crema px-3 py-2 text-sm">
                <span className="text-negro-suave">
                  {pg.numero} · {fmtFecha(pg.fecha)}
                </span>
                <span className="font-semibold text-negro">{fmtUsd(pg.equivalenteUsd)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pedido.notas && (
        <p className="mt-4 text-sm text-negro-suave bg-crema rounded-xl px-3.5 py-2.5">
          📝 {pedido.notas}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cerrar
        </button>
        {saldo > 0 && pedido.estado !== "cancelado" && (
          <button className={btnPrimario} onClick={onCobrar}>
            <IcoPagos className="w-4 h-4" /> Registrar pago
          </button>
        )}
      </div>
    </Modal>
  );
}

// ---------- Formulario ----------

function PedidoForm({ pedido, onClose }: { pedido: Pedido | null; onClose: () => void }) {
  const { db, aplicar, sesion } = useAdmin();
  const [clienteId, setClienteId] = useState(pedido?.clienteId ?? "");
  const [clienteNombre, setClienteNombre] = useState(pedido?.clienteNombre ?? "");
  const [canal, setCanal] = useState<CanalPedido>(pedido?.canal ?? "whatsapp");
  const [estado, setEstado] = useState<EstadoPedido>(pedido?.estado ?? "consulta");
  const [fechaEntrega, setFechaEntrega] = useState(pedido?.fechaEntrega?.slice(0, 10) ?? "");
  const [notas, setNotas] = useState(pedido?.notas ?? "");
  const [items, setItems] = useState<ItemPedido[]>(
    pedido?.items.length ? [...pedido.items] : [{ descripcion: "", cantidad: 1, precioUsd: 0 }]
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const productosActivos = db.productos.filter((p) => p.activo);
  const total = items.reduce((a, it) => a + it.cantidad * it.precioUsd, 0);

  const setItem = (i: number, patch: Partial<ItemPedido>) =>
    setItems((prev) => prev.map((it, x) => (x === i ? { ...it, ...patch } : it)));

  const elegirProducto = (i: number, productoId: string) => {
    const prod = db.productos.find((p) => p.id === productoId);
    setItem(i, {
      productoId: productoId || undefined,
      descripcion: prod ? `${prod.nombre} (${prod.presentacion})` : "",
      precioUsd: prod?.precioRefUsd ?? items[i].precioUsd,
    });
  };

  const guardar = async () => {
    const cliente = db.clientes.find((c) => c.id === clienteId);
    const nombreFinal = cliente?.nombre ?? clienteNombre.trim();
    if (!nombreFinal) return setError("Selecciona un cliente o escribe su nombre.");
    const itemsValidos = items.filter((it) => it.descripcion.trim() && it.cantidad > 0);
    if (!itemsValidos.length) return setError("Agrega al menos un producto con cantidad.");

    // numero (PED-####) lo asigna el servidor en pedidos nuevos.
    const fila = pedido
      ? {
          id: pedido.id,
          numero: pedido.numero,
          clienteId: clienteId || null,
          clienteNombre: nombreFinal,
          canal,
          estado,
          fecha: pedido.fecha,
          fechaEntrega: fechaEntrega || null,
          notas: notas.trim() || null,
          items: itemsValidos,
          creadoPor: pedido.creadoPor,
          descontadoInventario: pedido.descontadoInventario ?? false,
        }
      : {
          id: uid(),
          clienteId: clienteId || null,
          clienteNombre: nombreFinal,
          items: itemsValidos,
          estado,
          canal,
          fecha: hoyIso(),
          fechaEntrega: fechaEntrega || null,
          notas: notas.trim() || null,
          creadoPor: sesion?.nombre ?? "—",
          descontadoInventario: false,
        };
    setGuardando(true);
    try {
      await aplicar([{ accion: "upsert", tabla: "pedidos", fila }]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el pedido.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={pedido ? `Editar ${pedido.numero}` : "Nuevo pedido"} onClose={onClose} ancho="max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Cliente registrado" ayuda="O escribe el nombre abajo si aún no está registrado.">
          <select
            className={selectCls}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">— Elegir cliente —</option>
            {db.clientes
              .filter((c) => c.activo)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Nombre (si no está registrado)">
          <input
            className={inputCls}
            placeholder="Nombre del cliente"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            disabled={!!clienteId}
          />
        </Field>
        <Field label="Canal del pedido">
          <select className={selectCls} value={canal} onChange={(e) => setCanal(e.target.value as CanalPedido)}>
            {Object.entries(CANALES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de entrega acordada">
          <input
            type="date"
            className={inputCls}
            min={hoyFecha()}
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </Field>
      </div>

      {/* Items */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gris">Productos</span>
          <button
            type="button"
            className="text-xs font-semibold text-rojo hover:underline"
            onClick={() => setItems((prev) => [...prev, { descripcion: "", cantidad: 1, precioUsd: 0 }])}
          >
            + Agregar línea
          </button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select
                className={selectCls + " col-span-12 sm:col-span-5"}
                value={it.productoId ?? ""}
                onChange={(e) => elegirProducto(i, e.target.value)}
              >
                <option value="">— Producto del catálogo o texto libre —</option>
                {productosActivos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.presentacion})
                  </option>
                ))}
              </select>
              <input
                className={inputCls + " col-span-6 sm:col-span-3"}
                placeholder="Descripción del producto"
                value={it.descripcion}
                onChange={(e) => setItem(i, { descripcion: e.target.value, productoId: undefined })}
              />
              <input
                className={inputCls + " col-span-2 sm:col-span-1 text-center"}
                inputMode="numeric"
                placeholder="Cant."
                value={it.cantidad || ""}
                onChange={(e) => setItem(i, { cantidad: Math.max(0, parseInt(e.target.value) || 0) })}
              />
              <input
                className={inputCls + " col-span-3 sm:col-span-2 text-right"}
                inputMode="decimal"
                placeholder="Precio $"
                value={it.precioUsd || ""}
                onChange={(e) =>
                  setItem(i, { precioUsd: Math.max(0, parseFloat(e.target.value.replace(",", ".")) || 0) })
                }
              />
              <button
                type="button"
                aria-label="Quitar línea"
                onClick={() => setItems((prev) => prev.filter((_, x) => x !== i))}
                className="col-span-1 w-9 h-9 grid place-items-center rounded-full text-gris hover:bg-red-50 hover:text-red-600 transition"
              >
                <IcoX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-gris">Total del pedido: </span>
          <span className="font-black text-negro text-lg">{fmtUsd(total)}</span>
        </div>
      </div>

      <div className="mt-2 grid sm:grid-cols-2 gap-4">
        {pedido && (
          <Field label="Estado">
            <select className={selectCls} value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido)}>
              {Object.entries(ESTADOS_PEDIDO).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Notas">
          <input
            className={inputCls}
            placeholder="Acuerdos, dirección de entrega, observaciones…"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : pedido ? "Guardar cambios" : "Crear pedido"}
        </button>
      </div>
    </Modal>
  );
}
