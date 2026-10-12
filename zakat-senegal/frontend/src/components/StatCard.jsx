const tones = {
  green: 'bg-brand-50 text-brand-800', blue: 'bg-sky-50 text-sky-800', orange: 'bg-orange-50 text-orange-800',
  gold: 'bg-gold-50 text-gold-600', violet: 'bg-violet-50 text-violet-800',
};
export default function StatCard({ label, value, hint, tone = 'green' }) {
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs opacity-70">{hint}</p>}
    </div>
  );
}
