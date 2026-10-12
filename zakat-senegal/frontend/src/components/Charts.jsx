import { num } from '../utils/format.js';

// Courbe SVG simple (sans dépendance) : data = [{ label, total }]
export function LineChart({ data = [] }) {
  const w = 520, h = 190, pad = 28;
  const max = Math.max(1, ...data.map((d) => d.total));
  const pts = data.map((d, i) => [pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1), h - pad - (d.total / max) * (h - pad * 2)]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = pts.length ? `${pad},${h - pad} ${line} ${pts[pts.length - 1][0]},${h - pad}` : '';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Évolution des collectes">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad} x2={w - pad} y1={h - pad - t * (h - pad * 2)} y2={h - pad - t * (h - pad * 2)} stroke="#e2e8f0" />
          <text x={2} y={h - pad - t * (h - pad * 2) + 4} fontSize="10" fill="#94a3b8">{num(max * t)}</text>
        </g>
      ))}
      {area && <polygon points={area} fill="#177a4e" opacity="0.12" />}
      {line && <polyline points={line} fill="none" stroke="#177a4e" strokeWidth="2.5" />}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="#177a4e" />
          <text x={p[0]} y={h - 8} fontSize="11" textAnchor="middle" fill="#64748b">{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

const COLORS = ['#177a4e', '#c9a03a', '#3b82f6', '#f97316', '#8b5cf6', '#94a3b8'];

// Donut en CSS (conic-gradient) : items = [{ label, value }]
export function Donut({ items = [], centerLabel, centerValue }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  let acc = 0;
  const stops = items.map((it, i) => {
    const from = (acc / total) * 100;
    acc += it.value;
    return `${COLORS[i % COLORS.length]} ${from}% ${(acc / total) * 100}%`;
  });
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#e2e8f0' }}>
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="font-display text-lg font-semibold text-brand-900">{centerValue}</span>
          <span className="text-[10px] text-slate-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-slate-600">{it.label}</span>
            <span className="font-semibold">{total ? Math.round((it.value / total) * 100) : 0}%</span>
          </li>
        ))}
        {!items.length && <li className="text-slate-500">Pas encore de distribution.</li>}
      </ul>
    </div>
  );
}
