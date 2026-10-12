import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import PwaBanner from '../components/PwaBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../utils/labels.js';

// [route, libellé, rôles autorisés]
const items = [
  ['/admin', 'Tableau de bord', ['admin', 'distribution_manager'], true],
  ['/admin/demandes', "Demandes d'aide", ['agent', 'admin', 'distribution_manager']],
  ['/admin/paiements', 'Dons / Paiements', ['admin', 'distribution_manager']],
  ['/admin/distributions', 'Distributions', ['admin', 'distribution_manager']],
  ['/admin/utilisateurs', 'Utilisateurs', ['admin']],
  ['/admin/parametres', 'Paramètres', ['admin']],
  ['/admin/audit', "Journal d'audit", []],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const allowed = items.filter(([, , roles]) => user.role === 'super_admin' || roles.includes(user.role));
  const link = ({ isActive }) => `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-gradient-to-b from-brand-800 to-brand-900 p-4 lg:static lg:block`}>
        <Logo light to="/admin" />
        <nav className="mt-8 space-y-1" onClick={() => setOpen(false)}>
          {allowed.map(([to, label, , end]) => <NavLink key={to} to={to} end={!!end} className={link}>{label}</NavLink>)}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4 text-sm">
          <Link to="/" className="block rounded-xl px-3 py-2 text-white/70 hover:bg-white/10">← Site public</Link>
          <button onClick={() => { logout(); navigate('/'); }} className="block w-full rounded-xl px-3 py-2 text-left text-white/70 hover:bg-white/10">Déconnexion</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0 flex-1">
        <PwaBanner />
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">☰</button>
          <span className="hidden text-sm text-slate-500 lg:block">Espace équipe</span>
          <div className="text-right text-sm">
            <p className="font-semibold text-brand-900">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
