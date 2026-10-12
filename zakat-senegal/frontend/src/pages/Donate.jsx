import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useOnline } from '../hooks/usePwa.js';
import { fcfa } from '../utils/format.js';
import { FUND_LABELS, METHOD_LABELS } from '../utils/labels.js';
import Alert from '../components/Alert.jsx';

const presets = [10000, 25000, 50000, 100000];
const methodIcons = { wave: '🌊', orange_money: '🟠', card: '💳' };

export default function Donate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const online = useOnline();
  const [type, setType] = useState(params.get('type') === 'sadaqa' ? 'sadaqa' : 'zakat');
  const [amount, setAmount] = useState(params.get('amount') || '25000');
  const [method, setMethod] = useState('wave');
  const [min, setMin] = useState(500);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/settings/zakat').then((s) => setMin(s.minDonation)).catch(() => {}); }, []);

  const pay = async () => {
    setError('');
    if (!(Number(amount) >= min)) return setError(`Montant minimum : ${fcfa(min)}.`);
    setBusy(true);
    try {
      const d = await api.post('/payments/initialize', { amount: Number(amount), type, method });
      navigate(d.redirectPath);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Faire un don</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Soutenez les bénéficiaires en quelques clics.</p>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card md:col-span-2">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {Object.entries(FUND_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setType(k)} className={`rounded-lg py-2 text-sm font-semibold ${type === k ? 'bg-brand-700 text-white' : 'text-slate-600'}`}>{v}</button>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-600">Montant à donner</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(String(p))} className={`rounded-xl border py-2 text-sm font-semibold ${Number(amount) === p ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-slate-200'}`}>{new Intl.NumberFormat('fr-FR').format(p)}</button>
            ))}
          </div>
          <div className="relative mt-3">
            <input type="number" min={min} inputMode="numeric" className="input pr-16 text-lg" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Montant en FCFA" />
            <span className="absolute right-3 top-3 text-sm text-slate-400">FCFA</span>
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-600">Moyen de paiement</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setMethod(k)} className={`flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-semibold ${method === k ? 'border-brand-700 bg-brand-50' : 'border-slate-200'}`}>
                <span>{methodIcons[k]}</span>{v}
              </button>
            ))}
          </div>
          <div className="mt-4"><Alert type="error">{error}</Alert></div>
          <button onClick={pay} disabled={busy || !online} className="btn btn-primary mt-5 w-full py-3">{busy ? 'Initialisation…' : 'Payer maintenant →'}</button>
          <p className="mt-3 text-center text-xs text-slate-500">🔒 Paiement sécurisé : la plateforme ne stocke aucune donnée de carte.</p>
        </div>
        <aside className="card bg-brand-50">
          <h2 className="text-lg font-semibold">Votre don fait la différence !</h2>
          <p className="mt-2 text-sm text-slate-600">Il permet de :</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {['Soutenir les familles en difficulté', 'Financer les soins médicaux', 'Aider les étudiants', 'Soutenir les projets sociaux'].map((t) => <li key={t} className="flex gap-2"><span className="text-brand-600">✔</span>{t}</li>)}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Votre don est confirmé uniquement après vérification serveur du prestataire. Un reçu est généré automatiquement.</p>
        </aside>
      </div>
    </div>
  );
}
