"use client";

// Dashboard: resumen operativo del negocio.

import Link from "next/link";
import { useMemo } from "react";
import { useAdmin, totalPedido, saldoPedido } from "@/lib/admin/store";
import { ESTADOS_PEDIDO, ESTADOS_PAGO, METODOS } from "@/lib/admin/catalogos";
import { fmtUsd, fmtMoneda, haceDias } from "@/lib/admin/format";
import { Card, KpiCard, PageHeader, Badge, EmptyState, btnPrimario } from "@/components/admin/ui";
import { BarChart } from "@/components/admin/charts";
import { IcoPlus, IcoChevronDer } from "@/components/admin/icons";

export default function Dashboard() {
  const { db, sesion } = useAdmin();

  const datos = useMemo(() => {
    const activos = db.pedidos.filter(
      (p) => !["entregado", "cancelado"].includes(p.estado)
    );
    const porCobrar = db.pedidos
      .filter((p) => p.estado !== "cancelado")
      .reduce((acc, p) => acc + saldoPedido(p, db.pagos), 0);
    const porVerificar = db.pagos.filter((p) => p.estado === "por_verificar");
    const stockBajo = db.productos.filter((p) => p.activo && p.stock <= p.stockMinimo);

    // Ventas (pedidos entregados) de los últimos 14 días.
    const dias: Array<{ label: string; valor: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const clave = d.toISOString().slice(0, 10);
      const total = db.pedidos
        .filter((p) => p.estado === "entregado" && p.fecha.slice(0, 10) === clave)
        .reduce((a, p) => a + totalPedido(p), 0);
      dias.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, valor: Math.round(total) });
    }
    const hayVentas = dias.some((d) => d.valor > 0);

    return { activos, porCobrar, porVerificar, stockBajo, dias, hayVentas };
  }, [db]);

  const ultimosPedidos = db.pedidos.slice(0, 6);
  const ultimosPagos = db.pagos.slice(0, 6);

  return (
    <>
      <PageHeader
        titulo={`Hola, ${sesion?.nombre?.split(" ")[0] ?? ""} 👋`}
        subtitulo="Así va el negocio hoy."
        acciones={
          <Link href="/admin/pedidos" className={btnPrimario}>
            <IcoPlus className="w-4 h-4" /> Nuevo pedido
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          titulo="Pedidos activos"
          valor={String(datos.activos.length)}
          detalle="En consulta, confirmados o en producción"
          emoji="🛒"
        />
        <KpiCard
          titulo="Por cobrar"
          valor={fmtUsd(datos.porCobrar)}
          detalle="Saldo pendiente de pedidos"
          emoji="💰"
          alerta={datos.porCobrar > 0}
        />
        <KpiCard
          titulo="Pagos por verificar"
          valor={String(datos.porVerificar.length)}
          detalle="Esperando confirmación"
          emoji="🧾"
          alerta={datos.porVerificar.length > 0}
        />
        <KpiCard
          titulo="Stock bajo"
          valor={String(datos.stockBajo.length)}
          detalle="Productos en o bajo el mínimo"
          emoji="📦"
          alerta={datos.stockBajo.length > 0}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {/* Ventas */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-negro">Ventas entregadas · últimos 14 días</h2>
            <Link href="/admin/reportes" className="text-xs font-semibold text-rojo hover:underline">
              Ver reportes
            </Link>
          </div>
          {datos.hayVentas ? (
            <BarChart datos={datos.dias} formato={(v) => fmtUsd(v)} />
          ) : (
            <EmptyState
              emoji="📈"
              titulo="Aún no hay ventas registradas"
              texto="Cuando marques pedidos como entregados, aquí verás la evolución de tus ventas."
            />
          )}
        </Card>

        {/* Alertas de stock */}
        <Card className="p-5">
          <h2 className="font-display font-bold text-negro mb-3">Alertas de inventario</h2>
          {datos.stockBajo.length === 0 ? (
            <p className="text-sm text-gris py-6 text-center">
              ✅ Todo el inventario está por encima del mínimo.
            </p>
          ) : (
            <ul className="space-y-2">
              {datos.stockBajo.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-crema px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-negro truncate">{p.nombre}</div>
                    <div className="text-[11px] text-gris">{p.presentacion}</div>
                  </div>
                  <Badge className={p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}>
                    {p.stock === 0 ? "Agotado" : `${p.stock} und`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/productos"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rojo hover:underline"
          >
            Ir al inventario <IcoChevronDer className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* Últimos pedidos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-negro">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs font-semibold text-rojo hover:underline">
              Ver todos
            </Link>
          </div>
          {ultimosPedidos.length === 0 ? (
            <EmptyState
              emoji="🛒"
              titulo="Sin pedidos todavía"
              texto="Registra tu primer pedido para empezar a llevar el control."
              accion={
                <Link href="/admin/pedidos" className={btnPrimario}>
                  <IcoPlus className="w-4 h-4" /> Crear pedido
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-rojo/5">
              {ultimosPedidos.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gris">{p.numero}</span>
                      <span className="text-sm font-semibold text-negro truncate">
                        {p.clienteNombre}
                      </span>
                    </div>
                    <div className="text-[11px] text-gris mt-0.5">{haceDias(p.fecha)}</div>
                  </div>
                  <span className="text-sm font-bold text-negro">{fmtUsd(totalPedido(p))}</span>
                  <Badge className={ESTADOS_PEDIDO[p.estado].badge}>
                    {ESTADOS_PEDIDO[p.estado].label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Últimos pagos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-negro">Últimos pagos</h2>
            <Link href="/admin/pagos" className="text-xs font-semibold text-rojo hover:underline">
              Ver todos
            </Link>
          </div>
          {ultimosPagos.length === 0 ? (
            <EmptyState
              emoji="🧾"
              titulo="Sin pagos registrados"
              texto="Cuando cobres por Pago Móvil, Zelle, USDT o efectivo, regístralo aquí con su comprobante."
              accion={
                <Link href="/admin/pagos" className={btnPrimario}>
                  <IcoPlus className="w-4 h-4" /> Registrar pago
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-rojo/5">
              {ultimosPagos.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center gap-3">
                  <span className="text-lg" title={METODOS[p.metodo].label}>
                    {METODOS[p.metodo].emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-negro truncate">
                      {p.clienteNombre ?? METODOS[p.metodo].label}
                    </div>
                    <div className="text-[11px] text-gris mt-0.5">
                      {METODOS[p.metodo].label} · {haceDias(p.fecha)}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-negro">
                    {fmtMoneda(p.monto, p.moneda)}
                  </span>
                  <Badge className={ESTADOS_PAGO[p.estado].badge}>
                    {ESTADOS_PAGO[p.estado].label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
