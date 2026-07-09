"use client";

// Productos e inventario: catálogo interno, stock y movimientos.

import { useMemo, useState } from "react";
import type {
  CategoriaProducto,
  MovimientoStock,
  ProductoAdmin,
  TipoMovimiento,
} from "@/lib/admin/types";
import { CATEGORIAS, TIPOS_MOVIMIENTO } from "@/lib/admin/catalogos";
import { useAdmin } from "@/lib/admin/store";
import { fmtUsd, fmtFechaHora, hoyIso, uid } from "@/lib/admin/format";
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
  btnSecundario,
  btnSuave,
  SearchInput,
} from "@/components/admin/ui";
import { IcoPlus, IcoEditar, IcoBasura, IcoProductos } from "@/components/admin/icons";

export default function ProductosPage() {
  const { db, mutar } = useAdmin();
  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState<CategoriaProducto | "todas">("todas");
  const [editando, setEditando] = useState<ProductoAdmin | "nuevo" | null>(null);
  const [ajustando, setAjustando] = useState<ProductoAdmin | null>(null);
  const [borrando, setBorrando] = useState<ProductoAdmin | null>(null);
  const [verMovs, setVerMovs] = useState(false);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return db.productos
      .filter((p) => filtroCat === "todas" || p.categoria === filtroCat)
      .filter((p) => !q || p.nombre.toLowerCase().includes(q))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [db.productos, busqueda, filtroCat]);

  const borrar = (p: ProductoAdmin) => {
    mutar((d) => ({ ...d, productos: d.productos.filter((x) => x.id !== p.id) }));
    setBorrando(null);
  };

  return (
    <>
      <PageHeader
        titulo="Productos e inventario"
        subtitulo="Tu catálogo interno con control de stock y movimientos."
        acciones={
          <>
            <button className={btnSecundario} onClick={() => setVerMovs(true)}>
              📋 Movimientos
            </button>
            <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
              <IcoPlus className="w-4 h-4" /> Nuevo producto
            </button>
          </>
        }
      />

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-rojo/5">
          <div className="flex-1">
            <SearchInput valor={busqueda} onCambio={setBusqueda} placeholder="Buscar producto…" />
          </div>
          <select
            className={selectCls + " sm:w-48"}
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value as CategoriaProducto | "todas")}
          >
            <option value="todas">Todas las categorías</option>
            {Object.entries(CATEGORIAS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <EmptyState
            emoji="📦"
            titulo="Sin productos"
            texto="Agrega los productos que elaboras para controlar su inventario."
            accion={
              <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
                <IcoPlus className="w-4 h-4" /> Agregar producto
              </button>
            }
          />
        ) : (
          <div className="p-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {lista.map((p) => {
              const agotado = p.stock === 0;
              const bajo = p.stock > 0 && p.stock <= p.stockMinimo;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl ring-1 p-4 transition ${
                    p.activo ? "bg-white ring-rojo/10" : "bg-crema/60 ring-rojo/5 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amarillo/15 grid place-items-center text-xl shrink-0">
                      {CATEGORIAS[p.categoria].emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-negro leading-tight">{p.nombre}</div>
                      <div className="text-[11px] text-gris mt-0.5">
                        {p.presentacion}
                        {p.precioRefUsd ? ` · Ref. ${fmtUsd(p.precioRefUsd)}` : ""}
                        {!p.activo && " · Inactivo"}
                      </div>
                    </div>
                    <KebabMenu
                      acciones={[
                        {
                          label: "Editar",
                          icono: <IcoEditar className="w-4 h-4" />,
                          onClick: () => setEditando(p),
                        },
                        {
                          label: "Eliminar",
                          icono: <IcoBasura className="w-4 h-4" />,
                          destructiva: true,
                          onClick: () => setBorrando(p),
                        },
                      ]}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <span
                        className={`font-display font-black text-2xl ${
                          agotado ? "text-red-600" : bajo ? "text-amber-600" : "text-negro"
                        }`}
                      >
                        {p.stock}
                      </span>
                      <span className="text-xs text-gris ml-1">und</span>
                      {agotado ? (
                        <Badge className="bg-red-100 text-red-700 ml-2">Agotado</Badge>
                      ) : bajo ? (
                        <Badge className="bg-amber-100 text-amber-800 ml-2">Stock bajo</Badge>
                      ) : null}
                    </div>
                    <button
                      className={btnSuave + " !px-3 !py-1.5 !text-xs"}
                      onClick={() => setAjustando(p)}
                    >
                      <IcoProductos className="w-3.5 h-3.5" /> Ajustar stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {editando && (
        <ProductoForm
          producto={editando === "nuevo" ? null : editando}
          onClose={() => setEditando(null)}
        />
      )}
      {ajustando && <AjusteForm producto={ajustando} onClose={() => setAjustando(null)} />}
      {borrando && (
        <Confirmar
          titulo="Eliminar producto"
          mensaje={`¿Eliminar "${borrando.nombre}" del catálogo? Su historial de movimientos se conserva. Si solo quieres pausarlo, mejor edítalo y márcalo inactivo.`}
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
      {verMovs && <MovimientosModal onClose={() => setVerMovs(false)} />}
    </>
  );
}

// ---------- Formulario producto ----------

function ProductoForm({
  producto,
  onClose,
}: {
  producto: ProductoAdmin | null;
  onClose: () => void;
}) {
  const { mutar } = useAdmin();
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [categoria, setCategoria] = useState<CategoriaProducto>(producto?.categoria ?? "harina");
  const [presentacion, setPresentacion] = useState(producto?.presentacion ?? "");
  const [precioRef, setPrecioRef] = useState(producto?.precioRefUsd ? String(producto.precioRefUsd) : "");
  const [stockMinimo, setStockMinimo] = useState(String(producto?.stockMinimo ?? 10));
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    if (!nombre.trim()) return setError("El nombre del producto es obligatorio.");
    const datos = {
      nombre: nombre.trim(),
      categoria,
      presentacion: presentacion.trim() || "—",
      precioRefUsd: parseFloat(precioRef.replace(",", ".")) || undefined,
      stockMinimo: Math.max(0, parseInt(stockMinimo) || 0),
      activo,
    };
    if (producto) {
      mutar((d) => ({
        ...d,
        productos: d.productos.map((p) => (p.id === producto.id ? { ...p, ...datos } : p)),
      }));
    } else {
      mutar((d) => ({
        ...d,
        productos: [{ id: uid(), stock: 0, ...datos }, ...d.productos],
      }));
    }
    onClose();
  };

  return (
    <Modal titulo={producto ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre" requerido>
          <input
            className={inputCls}
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Field>
        <Field label="Categoría">
          <select
            className={selectCls}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaProducto)}
          >
            {Object.entries(CATEGORIAS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Presentación">
          <input
            className={inputCls}
            placeholder="500 g, 1 kg, docena…"
            value={presentacion}
            onChange={(e) => setPresentacion(e.target.value)}
          />
        </Field>
        <Field label="Precio de referencia (USD)" ayuda="Solo referencial: el precio final se acuerda en cada pedido.">
          <input
            className={inputCls}
            inputMode="decimal"
            placeholder="0,00"
            value={precioRef}
            onChange={(e) => setPrecioRef(e.target.value)}
          />
        </Field>
        <Field label="Stock mínimo (alerta)">
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="Cantidad mínima antes de alertar"
            value={stockMinimo}
            onChange={(e) => setStockMinimo(e.target.value)}
          />
        </Field>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-negro-suave">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 accent-[#b01e2e]"
          />
          Producto activo
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar}>
          {producto ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </Modal>
  );
}

// ---------- Ajuste de stock ----------

function AjusteForm({ producto, onClose }: { producto: ProductoAdmin; onClose: () => void }) {
  const { mutar, sesion } = useAdmin();
  const [tipo, setTipo] = useState<TipoMovimiento>("entrada");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const n = parseInt(cantidad) || 0;
    if (n <= 0) return setError("Indica la cantidad del movimiento.");
    const signo = TIPOS_MOVIMIENTO[tipo].signo;
    const mov: MovimientoStock = {
      id: uid(),
      productoId: producto.id,
      productoNombre: producto.nombre,
      tipo,
      cantidad: n,
      motivo: motivo.trim() || TIPOS_MOVIMIENTO[tipo].label,
      fecha: hoyIso(),
      usuario: sesion?.nombre ?? "—",
    };
    mutar((d) => ({
      ...d,
      movimientos: [mov, ...d.movimientos],
      productos: d.productos.map((p) =>
        p.id === producto.id ? { ...p, stock: Math.max(0, p.stock + signo * n) } : p
      ),
    }));
    onClose();
  };

  return (
    <Modal titulo={`Ajustar stock · ${producto.nombre}`} onClose={onClose} ancho="max-w-md">
      <p className="text-sm text-negro-suave mb-4">
        Stock actual: <strong className="text-negro">{producto.stock} und</strong>
      </p>
      <div className="space-y-4">
        <Field label="Tipo de movimiento">
          <select className={selectCls} value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimiento)}>
            {Object.entries(TIPOS_MOVIMIENTO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.signo > 0 ? "＋" : "－"} {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cantidad" requerido>
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="Cantidad de unidades"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </Field>
        <Field label="Motivo">
          <input
            className={inputCls}
            placeholder="Producción del día, venta directa, merma…"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar}>
          Guardar movimiento
        </button>
      </div>
    </Modal>
  );
}

// ---------- Historial de movimientos ----------

function MovimientosModal({ onClose }: { onClose: () => void }) {
  const { db } = useAdmin();
  const movs = db.movimientos.slice(0, 100);

  return (
    <Modal titulo="Movimientos de inventario" onClose={onClose} ancho="max-w-2xl">
      {movs.length === 0 ? (
        <EmptyState
          emoji="📋"
          titulo="Sin movimientos"
          texto="Aquí queda el historial de entradas, salidas, ajustes y mermas del inventario."
        />
      ) : (
        <ul className="divide-y divide-rojo/5 max-h-[60vh] overflow-y-auto">
          {movs.map((m) => (
            <li key={m.id} className="py-2.5 flex items-center gap-3">
              <Badge className={TIPOS_MOVIMIENTO[m.tipo].badge}>
                {TIPOS_MOVIMIENTO[m.tipo].signo > 0 ? "+" : "−"}
                {m.cantidad}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-negro truncate">{m.productoNombre}</div>
                <div className="text-[11px] text-gris">
                  {m.motivo} · {m.usuario} · {fmtFechaHora(m.fecha)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
