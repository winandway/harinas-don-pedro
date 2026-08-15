"use client";

// Usuarios del panel: equipo del negocio con roles y accesos.

import { useState } from "react";
import type { Rol, Usuario } from "@/lib/admin/types";
import { ROLES } from "@/lib/admin/catalogos";
import { useAdmin, type Op } from "@/lib/admin/store";
import { fmtFechaHora, hoyIso, uid } from "@/lib/admin/format";
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
} from "@/components/admin/ui";
import { IcoPlus, IcoEditar, IcoBasura, IcoCandado } from "@/components/admin/icons";

export default function UsuariosPage() {
  const { db, aplicar, sesion } = useAdmin();
  const [editando, setEditando] = useState<Usuario | "nuevo" | null>(null);
  const [borrando, setBorrando] = useState<Usuario | null>(null);

  const superadmins = db.usuarios.filter((u) => u.rol === "superadmin" && u.activo);

  const borrar = async (u: Usuario) => {
    try {
      await aplicar([{ accion: "delete", tabla: "usuarios", id: u.id }]);
      setBorrando(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo eliminar.");
    }
  };

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        subtitulo="El equipo que usa este panel, cada quien con su rol."
        acciones={
          <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
            <IcoPlus className="w-4 h-4" /> Nuevo usuario
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.usuarios.map((u) => {
          const esYo = u.id === sesion?.usuarioId;
          const ultimoSuper = u.rol === "superadmin" && superadmins.length <= 1;
          return (
            <Card key={u.id} className={`p-5 ${!u.activo ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full brand-gradient text-white font-bold grid place-items-center">
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-negro truncate">
                    {u.nombre} {esYo && <span className="text-xs text-gris">(tú)</span>}
                  </div>
                  <div className="text-[11px] text-gris">@{u.usuario}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge className={ROLES[u.rol].badge}>{ROLES[u.rol].label}</Badge>
                    {!u.activo && <Badge className="bg-red-100 text-red-700">Inactivo</Badge>}
                  </div>
                </div>
                <KebabMenu
                  acciones={[
                    {
                      label: "Editar",
                      icono: <IcoEditar className="w-4 h-4" />,
                      onClick: () => setEditando(u),
                    },
                    ...(!esYo && !ultimoSuper
                      ? [
                          {
                            label: "Eliminar",
                            icono: <IcoBasura className="w-4 h-4" />,
                            destructiva: true,
                            onClick: () => setBorrando(u),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
              <p className="mt-3 text-xs text-gris leading-relaxed">{ROLES[u.rol].descripcion}</p>
              {u.ultimoAcceso && (
                <p className="mt-2 text-[11px] text-gris">
                  Último acceso: {fmtFechaHora(u.ultimoAcceso)}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {db.usuarios.length <= 1 && (
        <Card className="mt-4 p-5">
          <EmptyState
            emoji="👤"
            titulo="Suma a tu equipo"
            texto="Crea un usuario para cada persona que trabaja contigo: ventas, producción o administración. Así cada registro queda firmado por quien lo hizo."
            accion={
              <button className={btnPrimario} onClick={() => setEditando("nuevo")}>
                <IcoPlus className="w-4 h-4" /> Crear usuario
              </button>
            }
          />
        </Card>
      )}

      {editando && (
        <UsuarioForm usuario={editando === "nuevo" ? null : editando} onClose={() => setEditando(null)} />
      )}
      {borrando && (
        <Confirmar
          titulo="Eliminar usuario"
          mensaje={`¿Eliminar el acceso de "${borrando.nombre}"? Sus registros históricos se conservan con su nombre.`}
          textoBoton="Sí, eliminar"
          destructivo
          onConfirmar={() => borrar(borrando)}
          onCancelar={() => setBorrando(null)}
        />
      )}
    </>
  );
}

function UsuarioForm({ usuario, onClose }: { usuario: Usuario | null; onClose: () => void }) {
  const { db, aplicar, sesion } = useAdmin();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [user, setUser] = useState(usuario?.usuario ?? "");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState<Rol>(usuario?.rol ?? "ventas");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [activo, setActivo] = useState(usuario?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esYo = usuario?.id === sesion?.usuarioId;

  const guardar = async () => {
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    const u = user.trim().toLowerCase();
    if (!u) return setError("El nombre de usuario es obligatorio.");
    if (db.usuarios.some((x) => x.usuario.toLowerCase() === u && x.id !== usuario?.id))
      return setError("Ese nombre de usuario ya existe.");
    if (!usuario && clave.length < 6)
      return setError("La clave debe tener al menos 6 caracteres.");
    if (usuario && clave && clave.length < 6)
      return setError("La clave nueva debe tener al menos 6 caracteres.");
    // Protección: no degradar al último superadmin activo.
    if (
      usuario?.rol === "superadmin" &&
      (rol !== "superadmin" || !activo) &&
      db.usuarios.filter((x) => x.rol === "superadmin" && x.activo).length <= 1
    ) {
      return setError("No puedes quitar el último superadmin activo del panel.");
    }

    // La clave viaja en texto plano bajo `clave_plana`; el servidor la cifra.
    setGuardando(true);
    try {
      const ops: Op[] = [];
      if (usuario) {
        const fila: Record<string, unknown> = {
          id: usuario.id,
          nombre: nombre.trim(),
          usuario: u,
          rol,
          telefono: telefono.trim() || undefined,
          activo,
          creadoEl: usuario.creadoEl,
        };
        if (usuario.ultimoAcceso) fila.ultimoAcceso = usuario.ultimoAcceso;
        // Solo se envía la clave cuando el usuario escribió una nueva.
        if (clave) fila.clave_plana = clave;
        ops.push({ accion: "upsert", tabla: "usuarios", fila });
        // Si cambió su propia clave y era la inicial, se marca como cambiada.
        if (esYo && clave) {
          ops.push({ accion: "config", clave: "claveInicial", valor: "0" });
        }
      } else {
        const fila: Record<string, unknown> = {
          id: uid(),
          nombre: nombre.trim(),
          usuario: u,
          rol,
          telefono: telefono.trim() || undefined,
          activo: true,
          creadoEl: hoyIso(),
          clave_plana: clave,
        };
        ops.push({ accion: "upsert", tabla: "usuarios", fila });
      }
      await aplicar(ops);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo={usuario ? `Editar · ${usuario.nombre}` : "Nuevo usuario"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre completo" requerido>
          <input
            className={inputCls}
            placeholder="Nombre de la persona"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Field>
        <Field label="Usuario de acceso" requerido>
          <input
            className={inputCls}
            placeholder="Nombre de usuario (sin espacios)"
            value={user}
            onChange={(e) => setUser(e.target.value.replace(/\s/g, ""))}
          />
        </Field>
        <Field
          label={usuario ? "Clave nueva (opcional)" : "Clave"}
          requerido={!usuario}
          ayuda={usuario ? "Déjala vacía para no cambiarla." : "Mínimo 6 caracteres."}
        >
          <input
            type="password"
            className={inputCls}
            placeholder="Clave de acceso"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
        </Field>
        <Field label="Teléfono (opcional)">
          <input
            className={inputCls}
            placeholder="04XX-0000000"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </Field>
        <Field label="Rol">
          <select className={selectCls} value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-negro-suave">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 accent-[#b01e2e]"
            disabled={esYo}
          />
          Usuario activo {esYo && <span className="text-[11px] text-gris">(no puedes desactivarte)</span>}
        </label>
      </div>
      <p className="mt-3 text-xs text-gris flex items-start gap-1.5">
        <IcoCandado className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        {ROLES[rol].descripcion}
      </p>
      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnSuave} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimario} onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : usuario ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </Modal>
  );
}
