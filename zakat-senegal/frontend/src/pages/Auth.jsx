import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { LogoMark } from '../components/Logo.jsx';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';

function Shell({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <div className="mb-5 text-center">
          <LogoMark className="mx-auto h-12 w-12" />
          <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [f, setF] = useState({ identifier: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const u = await login(f.identifier, f.password);
      const staff = ['agent', 'distribution_manager', 'admin', 'super_admin'].includes(u.role);
      navigate(location.state?.from || (staff ? '/admin' : '/compte'), { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <Shell title="Connexion" subtitle="Accédez à votre espace">
      <form onSubmit={submit} className="space-y-4">
        <Field label="E-mail ou numéro de téléphone"><input className="input" value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} autoComplete="username" required /></Field>
        <Field label="Mot de passe"><input type="password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" required /></Field>
        <Alert type="error">{err}</Alert>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        <div className="flex justify-between text-sm">
          <Link to="/mot-de-passe-oublie" className="text-brand-700 hover:underline">Mot de passe oublié ?</Link>
          <Link to="/inscription" className="text-brand-700 hover:underline">Créer un compte</Link>
        </div>
      </form>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register(f); navigate('/compte'); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <Shell title="Créer un compte" subtitle="Rejoignez la communauté Zakat Sénégal">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nom complet"><input className="input" value={f.name} onChange={set('name')} required /></Field>
        <Field label="E-mail"><input type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        <Field label="Téléphone" hint="E-mail ou téléphone : au moins l'un des deux."><input className="input" value={f.phone} onChange={set('phone')} placeholder="+221 77 123 45 67" /></Field>
        <Field label="Mot de passe" hint="8 caractères minimum."><input type="password" className="input" value={f.password} onChange={set('password')} minLength={8} autoComplete="new-password" required /></Field>
        <Alert type="error">{err}</Alert>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Création…' : "S'inscrire"}</button>
        <p className="text-center text-sm">Déjà inscrit ? <Link to="/connexion" className="text-brand-700 hover:underline">Se connecter</Link></p>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { setMsg((await api.post('/auth/forgot-password', { identifier })).message); } catch (e2) { setErr(e2.message); }
  };
  return (
    <Shell title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation">
      <form onSubmit={submit} className="space-y-4">
        <Field label="E-mail ou téléphone"><input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required /></Field>
        <Alert type="success">{msg}</Alert><Alert type="error">{err}</Alert>
        <button className="btn btn-primary w-full">Envoyer le lien</button>
        <p className="text-center text-sm"><Link to="/connexion" className="text-brand-700 hover:underline">Retour à la connexion</Link></p>
      </form>
    </Shell>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/auth/reset-password', { token: params.get('token') || '', password }); navigate('/connexion'); } catch (e2) { setErr(e2.message); }
  };
  return (
    <Shell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe sécurisé">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nouveau mot de passe"><input type="password" className="input" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <Alert type="error">{err}</Alert>
        <button className="btn btn-primary w-full">Enregistrer</button>
      </form>
    </Shell>
  );
}
