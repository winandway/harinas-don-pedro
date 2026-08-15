// Cifrado de claves del panel (fase local).
// Las claves se guardan como hash SHA-256, nunca en texto plano, para que
// el valor real no quede visible en el código del sitio. Se compara el hash
// de lo que escribe el usuario contra el hash guardado.

export async function hashClave(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Verifica una clave escrita contra el valor guardado. Acepta como respaldo
// una clave antigua guardada en texto plano (datos previos en el navegador),
// para no dejar a nadie afuera al migrar al cifrado.
export async function verificarClave(escrita: string, guardada: string): Promise<boolean> {
  if (!guardada) return false;
  const hash = await hashClave(escrita);
  return guardada === hash || guardada === escrita;
}
