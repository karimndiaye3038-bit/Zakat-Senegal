import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useInstallPrompt } from '../hooks/usePwa.js';
import { STAFF_ROLES } from '../utils/labels.js';

const links = [
  ['/', 'Accueil'],
  ['/a-propos', 'À propos'],
  ['/calculateur', 'Calculer ma Zakat'],
  ['/don', 'Faire un don'],
  ['/demande-aide', 'Demander une aide'],
  ['/transparence', 'Rapports'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canInstall, install } = useInstallPrompt();
  const navigate = useNavigate();
  const isStaff = user && STAFF_ROLES.includes(user.role);
  const cls = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'text-brand-700 underline decoration-gold-500 decoration-2 underline-offset-8' : 'text-slate-600 hover:text-brand-700'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {canInstall && <button onClick={install} className="btn btn-outline btn-sm">Installer l'app</button>}
          {user ? (
            <>
              {isStaff && <Link to="/admin" className="btn btn-outline btn-sm">Espace équipe</Link>}
              <Link to="/compte" className="btn btn-primary btn-sm">Mon compte</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm text-slate-600 hover:text-red-600">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn btn-outline btn-sm">Connexion</Link>
              <Link to="/inscription" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <svg className="h-6 w-6 text-brand-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 lg:hidden" onClick={() => setOpen(false)}>
          <nav className="flex flex-col py-2">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{label}</NavLink>)}</nav>
          <div className="mt-2 flex flex-wrap gap-2">
            {user ? (
              <>
                <Link to="/compte" className="btn btn-primary btn-sm">Mon compte</Link>
                {isStaff && <Link to="/admin" className="btn btn-outline btn-sm">Espace équipe</Link>}
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline btn-sm">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn btn-outline btn-sm">Connexion</Link>
                <Link to="/inscription" className="btn btn-primary btn-sm">S'inscrire</Link>
              </>
            )}
            {canInstall && <button onClick={install} className="btn btn-outline btn-sm">Installer l'app</button>}
          </div>
        </div>
      )}
    </header>
  );
}
