"use client";

import { PlayIcon } from "./icons";

export function abrirPresentacion() {
  window.dispatchEvent(new Event("abrir-presentacion"));
}

export default function BotonPresentacion({
  className = "",
  children,
  withIcon = true,
}: {
  className?: string;
  children: React.ReactNode;
  withIcon?: boolean;
}) {
  return (
    <button type="button" onClick={abrirPresentacion} className={className}>
      {withIcon && <PlayIcon className="w-5 h-5" />}
      {children}
    </button>
  );
}
