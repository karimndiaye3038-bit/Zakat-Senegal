import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#0f6340" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#c9a03a" strokeWidth="2" />
      <path d="M24 35V24M24 24c0-6 4-9 10-9 0 6-4 9-10 9zM24 28c0-4-3-7-8-7 0 4 3 7 8 7z" fill="#c9a03a" />
    </svg>
  );
}

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block font-display text-lg font-semibold ${light ? 'text-white' : 'text-brand-800'}`}>Zakat Sénégal</span>
        <span className={`block text-[11px] ${light ? 'text-white/70' : 'text-slate-500'}`}>Partager pour un meilleur demain</span>
      </span>
    </Link>
  );
}
