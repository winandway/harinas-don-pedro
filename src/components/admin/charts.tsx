"use client";

// Gráficas SVG livianas (sin dependencias): barras y dona.

export function BarChart({
  datos,
  alto = 160,
  formato = (v: number) => String(v),
}: {
  datos: Array<{ label: string; valor: number }>;
  alto?: number;
  formato?: (v: number) => string;
}) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  const n = datos.length || 1;
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: alto }}>
        {datos.map((d, i) => {
          const h = Math.max(4, Math.round((d.valor / max) * (alto - 24)));
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
              {d.valor > 0 && (
                <span className="absolute -top-1 opacity-0 group-hover:opacity-100 transition text-[10px] font-semibold text-rojo-oscuro bg-amarillo/90 rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                  {formato(d.valor)}
                </span>
              )}
              <div
                className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-rojo to-rojo-claro group-hover:from-rojo-oscuro group-hover:to-rojo transition-colors"
                style={{ height: h, opacity: d.valor === 0 ? 0.15 : 1 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {datos.map((d, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-[9px] text-gris truncate ${
              n > 10 && i % 2 === 1 ? "invisible sm:visible" : ""
            }`}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const COLORES_DONA = [
  "#b01e2e",
  "#f5b91e",
  "#7c2118",
  "#d64236",
  "#ffd257",
  "#3a2c27",
  "#8a7a72",
  "#e8956b",
  "#5d8a66",
  "#4a6fa5",
];

export function DonutChart({
  datos,
  formato = (v: number) => String(v),
}: {
  datos: Array<{ label: string; valor: number }>;
  formato?: (v: number) => string;
}) {
  const total = datos.reduce((a, d) => a + d.valor, 0);
  if (total <= 0) return null;
  const R = 42;
  const C = 2 * Math.PI * R;
  let acumulado = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0 -rotate-90">
        {datos.map((d, i) => {
          const frac = d.valor / total;
          const largo = frac * C;
          const offset = -acumulado * C;
          acumulado += frac;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={COLORES_DONA[i % COLORES_DONA.length]}
              strokeWidth="14"
              strokeDasharray={`${largo} ${C - largo}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <ul className="flex-1 min-w-40 space-y-1.5">
        {datos.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: COLORES_DONA[i % COLORES_DONA.length] }}
            />
            <span className="flex-1 text-negro-suave truncate">{d.label}</span>
            <span className="font-semibold text-negro">{formato(d.valor)}</span>
            <span className="text-xs text-gris w-10 text-right">
              {Math.round((d.valor / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
