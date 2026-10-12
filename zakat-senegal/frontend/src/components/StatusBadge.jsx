export default function StatusBadge({ map, value }) {
  const [label, cls] = map[value] || [value, 'bg-slate-100 text-slate-700'];
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}
