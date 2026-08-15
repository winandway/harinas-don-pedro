"use client";

// Clientes: registro y gestión de la cartera del negocio.

import { useMemo, useState } from "react";
import type { Cliente, TipoCliente } from "@/lib/admin/types";
import { TIPOS_CLIENTE } from "@/lib/admin/catalogos";
import { useAdmin, totalPedido } from "@/lib/admin/store";
import { fmtUsd, fmtFecha, hoyIso, uid } from "@/lib/admin/format";
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
  btnSuave,
  SearchInput,
  Tabla,
} from "@/components/admin/ui";
import {
  IcoPlus,
  IcoEditar,
  IcoBasura,
  IcoWhatsApp,
  IcoTelefono,
} from "@/components/admin/icons";

const VACIO: Omit<Cliente, "id" | "creadoEl"> = {
  nombre: "",
  tipo: "detal",
  telefono: "",
  whatsapp: "",
  correo: "",
  documento: "",
  direccion: "",
  ciudad: "",
  notas: "",
  activo: true,
};

export default function ClientesPage() {
  const { db, aplicar } = useAdmin();
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente | "todos">("todos");
  const [editando, setEditando] = useState<Cliente | "nuevo" | null>(null);
  const [borrando, setBorrando] = useState<Cliente | null>(null);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return db.clientes
      .filter((c) => filtroTipo === "todos" || c.tipo === filtroTipo)
      .filter(
        (c) =>
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          (c.telefono ?? "").includes(q) ||
          (c.correo ?? "").toLowerCase().includes(q) ||
          (c.ciudad ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [db.clientes, busqueda, filtroTipo]);

  const statsCliente = (id: string) => {
    const pedidos = db.pedidos.filter((p) => p.clienteId === id && p.estado !== "cancelado");
    const total = pedidos.reduce((a, p) => a + totalPedido(p), 0);
    return { pedidos: pedidos.length, total };
  };

  const borrar = async (c: Cliente) => {
    try {
      await aplicar([{ accion: "delete", tabla: "clientes", id: c.id }]);
      setBorrando(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo eliminar.");
    }
  };

  return (
    <>
      <PageHeader
        titulo="Clientes"
        subtitulo={`${db.clientes.length} cliente${db.clientes.length === 1 ? "" : "s"} en cartera`}
        acciones={
          <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
            <IcoPlus className="w-4 h-4" /> Nuevo cliente
          </button>
        }
      />

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-rojo/5">
          <div className="flex-1">
            <SearchInput
              valor={busqueda}
              onCambio={setBusqueda}
              placeholder="Buscar por nombre, teléfono, correo o ciudad…"
            />
          </div>
          <select
            className={selectCls + " sm:w-52"}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoCliente | "todos")}
          >
            <option value="todos">Todos los tipos</option>
            {Object.entries(TIPOS_CLIENTE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <EmptyState
            emoji="👥"
            titulo={db.clientes.length === 0 ? "Todavía no hay clientes" : "Sin resultados"}
            texto={
              db.clientes.length === 0
                ? "Registra a tus clientes para asociarles pedidos y pagos, y ver su historial de compras."
                : "Prueba con otro término de búsqueda u otro filtro."
            }
            accion={
              db.clientes.length === 0 ? (
                <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
                  <IcoPlus className="w-4 h-4" /> Registrar el primero
                </button>
              ) : undefined
            }
          />
        ) : (
          <Tabla cabeceras={["Cliente", "Tipo", "Contacto", "Ciudad", "Pedidos", "Comprado", ""]}>
            {lista.map((c) => {
              const st = statsCliente(c.id);
              const wa = (c.whatsapp || c.telefono || "").replace(/\D/g, "");
              return (
                <tr key={c.id} className="hover:bg-crema/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-negro">{c.nombre}</div>
                    {c.documento && <div className="text-[11px] text-gris">{c.documento}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={TIPOS_CLIENTE[c.tipo].badge}>
                      {TIPOS_CLIENTE[c.tipo].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.telefono && (
                        <a
                          href={`tel:${c.telefono}`}
                          className="inline-flex items-center gap-1 text-negro-suave hover:text-rojo"
                          title="Llamar"
                        >
                          <IcoTelefono className="w-3.5 h-3.5" />
                          <span className="text-xs">{c.telefono}</span>
                        </a>
                      )}
                      {wa && (
                        <a
                          href={`https://wa.me/${wa.startsWith("58") ? wa : "58" + wa.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener"
                          className="text-[#25D366] hover:brightness-90"
                          title="Escribir por WhatsApp"
                        >
                          <IcoWhatsApp className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {c.correo && <div className="text-[11px] text-gris mt-0.5">{c.correo}</div>}
                  </td>
                  <td className="px-4 py-3 text-negro-suave">{c.ciudad || "—"}</td>
                  <td className="px-4 py-3 text-center font-semibold text-negro">{st.pedidos}</td>
                  <td className="px-4 py-3 font-semibold text-negro">{fmtUsd(st.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <KebabMenu
                      acciones={[
                        {
                          label: "Editar",
                          icono: <IcoEditar className="w-4 h-4" />,
                          onClick: () => setEditando(c),
                        },
                        {
                          label: "Eliminar",
                          icono: <IcoBasura className="w-4 h-4" />,
                          destructiva: true,
                          onClick: () => setBorrando(c),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </Tabla>
        )}
      </Card>

      {editando && (
        <ClienteForm cliente={editando === "nuevo" ? null : editando} onClose={() => setEditando(null)} />
      )}

      {borrando && (
        <Confirmar
          titulo="Eliminar cliente"
          mensaje={`¿Seguro que quieres eliminar a "${borrando.nombre}"? Sus pedidos y pagos existentes no se borran, pero quedarán sin cliente asociado.`}
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
    </>
  );
}

function ClienteForm({ cliente, onClose }: { cliente: Cliente | null; onClose: () => void }) {
  const { db, aplicar } = useAdmin();
  const [f, setF] = useState<Omit<Cliente, "id" | "creadoEl">>(
    cliente ? { ...cliente } : { ...VACIO }
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) => setF((prev) => ({ ...prev, [k]: v }));

  const guardar = async () => {
    if (!f.nombre.trim()) return setError("El nombre del cliente es obligatorio.");
    const dup = db.clientes.find(
      (c) => c.nombre.trim().toLowerCase() === f.nombre.trim().toLowerCase() && c.id !== cliente?.id
    );
    if (dup) return setError("Ya existe un cliente con ese nombre.");

    const fila: Cliente = cliente
      ? { ...cliente, ...f }
      : { ...f, id: uid(), creadoEl: hoyIso() };
    setGuardando(true);
    try {
      await aplicar([
        { accion: "upsert", tabla: "clientes", fila: fila as unknown as Record<string, unknown> },
      ]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={cliente ? "Editar cliente" : "Nuevo cliente"} onClose={onClose} ancho="max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre o razón social" requerido>
          <input
            className={inputCls}
            placeholder="Nombre del cliente"
            value={f.nombre}
            onChange={(e) => set("nombre", e.target.value)}
          />
        </Field>
        <Field label="Tipo de cliente">
          <select className={selectCls} value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {Object.entries(TIPOS_CLIENTE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Teléfono">
          <input
            className={inputCls}
            placeholder="04XX-0000000"
            value={f.telefono}
            onChange={(e) => set("telefono", e.target.value)}
          />
        </Field>
        <Field label="WhatsApp" ayuda="Si es el mismo teléfono, puedes dejarlo vacío.">
          <input
            className={inputCls}
            placeholder="Número de WhatsApp"
            value={f.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Field>
        <Field label="Correo electrónico">
          <input
            className={inputCls}
            placeholder="correo@ejemplo.com"
            value={f.correo}
            onChange={(e) => set("correo", e.target.value)}
          />
        </Field>
        <Field label="Cédula o RIF">
          <input
            className={inputCls}
            placeholder="V-00000000 o J-00000000-0"
            value={f.documento}
            onChange={(e) => set("documento", e.target.value)}
          />
        </Field>
        <Field label="Ciudad">
          <input
            className={inputCls}
            placeholder="Ciudad del cliente"
            value={f.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
          />
        </Field>
        <Field label="Dirección">
          <input
            className={inputCls}
            placeholder="Dirección de entrega"
            value={f.direccion}
            onChange={(e) => set("direccion", e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Notas">
          <textarea
            className={inputCls + " min-h-16 resize-y"}
            placeholder="Preferencias, acuerdos, observaciones…"
            value={f.notas}
            onChange={(e) => set("notas", e.target.value)}
          />
        </Field>
      </div>
      {cliente && (
        <label className="mt-4 flex items-center gap-2 text-sm text-negro-suave">
          <input
            type="checkbox"
            checked={f.activo}
            onChange={(e) => set("activo", e.target.checked)}
            className="w-4 h-4 accent-[#b01e2e]"
          />
          Cliente activo
        </label>
      )}
      {cliente && (
        <p className="mt-2 text-[11px] text-gris">Registrado el {fmtFecha(cliente.creadoEl)}</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : cliente ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </Modal>
  );
}
