"use client";

// Reportes: ventas, cobros por método, top productos y cuentas por cobrar.

import { useMemo, useState } from "react";
import { useAdmin, totalPedido, saldoPedido } from "@/lib/admin/store";
import { METODOS, ESTADOS_PEDIDO } from "@/lib/admin/catalogos";
import { fmtUsd, fmtFecha, descargarCsv } from "@/lib/admin/format";
import {
  Card,
  KpiCard,
  PageHeader,
  Badge,
  EmptyState,
  Field,
  inputCls,
  btnSecundario,
  Tabla,
} from "@/components/admin/ui";
import { DonutChart } from "@/components/admin/charts";
import { IcoDescargar } from "@/components/admin/icons";

function inicioDeMes(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function ReportesPage() {
  const { db } = useAdmin();
  const [desde, setDesde] = useState(inicioDeMes());
  const [hasta, setHasta] = useState(hoy());

  const r = useMemo(() => {
    const enRango = (iso: string) => {
      const f = iso.slice(0, 10);
      return (!desde || f >= desde) && (!hasta || f <= hasta);
    };

    const pedidos = db.pedidos.filter((p) => enRango(p.fecha) && p.estado !== "cancelado");
    const entregados = pedidos.filter((p) => p.estado === "entregado");
    const pagos = db.pagos.filter((p) => enRango(p.fecha));
    const verificados = pagos.filter((p) => p.estado === "verificado");

    const ventasTotal = entregados.reduce((a, p) => a + totalPedido(p), 0);
    const cobrado = verificados.reduce((a, p) => a + p.equivalenteUsd, 0);

    // Cuentas por cobrar (histórico, no solo el rango).
    const porCobrar = db.pedidos
      .filter((p) => p.estado !== "cancelado")
      .map((p) => ({ pedido: p, saldo: saldoPedido(p, db.pagos) }))
      .filter((x) => x.saldo > 0.009)
      .sort((a, b) => b.saldo - a.saldo);

    // Top productos por unidades (pedidos del rango, no cancelados).
    const porProducto = new Map<string, { nombre: string; unidades: number; monto: number }>();
    for (const p of pedidos) {
      for (const it of p.items) {
        const clave = it.productoId ?? it.descripcion;
        const prev = porProducto.get(clave) ?? { nombre: it.descripcion, unidades: 0, monto: 0 };
        prev.unidades += it.cantidad;
        prev.monto += it.cantidad * it.precioUsd;
        porProducto.set(clave, prev);
      }
    }
    const topProductos = [...porProducto.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 8);

    // Cobros por método (verificados del rango).
    const porMetodo = new Map<string, number>();
    for (const p of verificados) {
      porMetodo.set(p.metodo, (porMetodo.get(p.metodo) ?? 0) + p.equivalenteUsd);
    }
    const metodos = [...porMetodo.entries()]
      .map(([m, v]) => ({
        label: METODOS[m as keyof typeof METODOS].label,
        valor: Math.round(v * 100) / 100,
      }))
      .sort((a, b) => b.valor - a.valor);

    return { pedidos, entregados, ventasTotal, cobrado, porCobrar, topProductos, metodos };
  }, [db, desde, hasta]);

  const totalPorCobrar = r.porCobrar.reduce((a, x) => a + x.saldo, 0);

  return (
    <>
      <PageHeader
        titulo="Reportes"
        subtitulo="Los números claros del negocio."
        acciones={
          <>
            <button
              className={btnSecundario}
              onClick={() =>
                descargarCsv(
                  "pedidos-don-pedro",
                  r.pedidos.map((p) => ({
                    numero: p.numero,
                    fecha: fmtFecha(p.fecha),
                    cliente: p.clienteNombre,
                    estado: ESTADOS_PEDIDO[p.estado].label,
                    total_usd: totalPedido(p),
                    saldo_usd: saldoPedido(p, db.pagos),
                  }))
                )
              }
              disabled={!r.pedidos.length}
            >
              <IcoDescargar className="w-4 h-4" /> Pedidos CSV
            </button>
            <button
              className={btnSecundario}
              onClick={() =>
                descargarCsv(
                  "clientes-don-pedro",
                  db.clientes.map((c) => ({
                    nombre: c.nombre,
                    tipo: c.tipo,
                    telefono: c.telefono ?? "",
                    correo: c.correo ?? "",
                    ciudad: c.ciudad ?? "",
                  }))
                )
              }
              disabled={!db.clientes.length}
            >
              <IcoDescargar className="w-4 h-4" /> Clientes CSV
            </button>
          </>
        }
      />

      {/* Rango */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Desde">
            <input type="date" className={inputCls} value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <input type="date" className={inputCls} value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </Field>
          <p className="text-xs text-gris pb-3">
            Los montos están en USD (los pagos en Bs se convierten con la tasa de cada pago).
          </p>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          titulo="Pedidos en el período"
          valor={String(r.pedidos.length)}
          detalle={`${r.entregados.length} entregados`}
          emoji="🛒"
        />
        <KpiCard titulo="Ventas entregadas" valor={fmtUsd(r.ventasTotal)} emoji="📈" />
        <KpiCard titulo="Cobrado (verificado)" valor={fmtUsd(r.cobrado)} emoji="✅" />
        <KpiCard
          titulo="Por cobrar (total)"
          valor={fmtUsd(totalPorCobrar)}
          detalle={`${r.porCobrar.length} pedido${r.porCobrar.length === 1 ? "" : "s"} con saldo`}
          emoji="⏳"
          alerta={totalPorCobrar > 0}
        />
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* Cobros por método */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-4">Cobros por método</h2>
          {r.metodos.length ? (
            <DonutChart datos={r.metodos} formato={(v) => fmtUsd(v)} />
          ) : (
            <EmptyState
              emoji="💳"
              titulo="Sin cobros verificados en el período"
              texto="Cuando verifiques pagos, aquí verás con qué métodos te pagan más."
            />
          )}
        </Card>

        {/* Top productos */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-3">Productos más pedidos</h2>
          {r.topProductos.length ? (
            <ul className="space-y-2">
              {r.topProductos.map((p, i) => {
                const max = r.topProductos[0].unidades || 1;
                return (
                  <li key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-negro truncate">{p.nombre}</span>
                      <span className="text-gris shrink-0 ml-2">
                        {p.unidades} und · {fmtUsd(p.monto)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-crema overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rojo to-amarillo"
                        style={{ width: `${(p.unidades / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              emoji="🌾"
              titulo="Sin pedidos en el período"
              texto="Cuando registres pedidos verás aquí qué productos se venden más."
            />
          )}
        </Card>
      </div>

      {/* Cuentas por cobrar */}
      <Card className="mt-4">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <h2 className="font-display font-bold text-negro">Cuentas por cobrar</h2>
          {totalPorCobrar > 0 && (
            <Badge className="bg-red-100 text-red-700">Total {fmtUsd(totalPorCobrar)}</Badge>
          )}
        </div>
        {r.porCobrar.length === 0 ? (
          <p className="text-sm text-gris px-5 pb-8 pt-2 text-center">
            🎉 No hay saldos pendientes: todo cobrado.
          </p>
        ) : (
          <Tabla cabeceras={["Pedido", "Cliente", "Estado", "Fecha", "Total", "Saldo"]}>
            {r.porCobrar.map(({ pedido, saldo }) => (
              <tr key={pedido.id}>
                <td className="px-4 py-2.5 font-mono text-xs text-gris">{pedido.numero}</td>
                <td className="px-4 py-2.5 font-semibold text-negro">{pedido.clienteNombre}</td>
                <td className="px-4 py-2.5">
                  <Badge className={ESTADOS_PEDIDO[pedido.estado].badge}>
                    {ESTADOS_PEDIDO[pedido.estado].label}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-negro-suave">{fmtFecha(pedido.fecha)}</td>
                <td className="px-4 py-2.5 text-negro-suave">{fmtUsd(totalPedido(pedido))}</td>
                <td className="px-4 py-2.5 font-bold text-rojo">{fmtUsd(saldo)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Card>
    </>
  );
}
