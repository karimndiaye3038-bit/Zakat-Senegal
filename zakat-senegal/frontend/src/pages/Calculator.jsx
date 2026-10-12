import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { fcfa, dateFr } from '../utils/format.js';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';
import Field from '../components/Field.jsx';

export default function Calculator() {
  const { data: settings, loading, error } = useFetch('/settings/zakat');
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({});
  const [debts, setDebts] = useState('');
  const [out, setOut] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner full />;
  if (error) return <div className="mx-auto max-w-3xl p-6"><Alert type="error">{error}</Alert></div>;

  const calculate = async () => {
    setBusy(true); setErr('');
    try {
      setOut(await api.post('/zakat/calculate', { values, debts: Number(debts) || 0 }));
      setStep(3);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const tabs = ['1. Biens éligibles', '2. Dettes', '3. Résultat'];
  const r = out?.result;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Calculateur de Zakat</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Estimez rapidement le montant de votre Zakat selon les règles configurées.</p>
      {!settings.validated && <div className="mb-4"><Alert type="warning">Les paramètres de calcul sont en attente de validation par le comité compétent : résultat purement indicatif.</Alert></div>}

      <div className="mb-5 grid grid-cols-3 rounded-xl bg-white p-1 text-center text-xs font-semibold shadow-soft sm:text-sm">
        {tabs.map((t, i) => (
          <button key={t} disabled={i + 1 > step} onClick={() => setStep(i + 1)} className={`rounded-lg px-2 py-2 ${step === i + 1 ? 'bg-brand-700 text-white' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.categories.map((c) => (
                <Field key={c.key} label={c.label} hint={c.hint}>
                  <div className="relative">
                    <input type="number" min="0" inputMode="numeric" className="input pr-16" value={values[c.key] ?? ''} placeholder="0"
                      onChange={(e) => setValues({ ...values, [c.key]: e.target.value })} />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">FCFA</span>
                  </div>
                </Field>
              ))}
            </div>
            <div className="mt-6 text-right"><button className="btn btn-primary" onClick={() => setStep(2)}>Suivant →</button></div>
          </>
        )}
        {step === 2 && (
          <>
            {settings.allowDebtDeduction ? (
              <Field label="Dettes déductibles" hint="Uniquement les dettes exigibles selon les règles validées.">
                <div className="relative">
                  <input type="number" min="0" inputMode="numeric" className="input pr-16" value={debts} placeholder="0" onChange={(e) => setDebts(e.target.value)} />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">FCFA</span>
                </div>
              </Field>
            ) : <Alert type="info">La déduction des dettes n'est pas activée dans les règles actuelles.</Alert>}
            <div className="mt-4"><Alert type="error">{err}</Alert></div>
            <div className="mt-6 flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Retour</button>
              <button className="btn btn-primary" disabled={busy} onClick={calculate}>{busy ? 'Calcul…' : 'Calculer'}</button>
            </div>
          </>
        )}
        {step === 3 && r && (
          <>
            <div className="rounded-2xl bg-brand-50 p-5">
              <p className="text-sm font-medium text-brand-800">Montant estimatif de la Zakat</p>
              <p className="mt-1 font-display text-3xl font-bold text-brand-700">{fcfa(r.zakat)}</p>
              <p className="text-xs text-slate-500">{r.eligible ? `(${(r.rate * 100).toFixed(1).replace('.', ',')} % de la base imposable)` : 'La base est inférieure au seuil (nisab) : aucune Zakat estimée.'}</p>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              {r.lines.map((l) => <div key={l.key} className="flex justify-between py-2"><dt className="text-slate-600">{l.label}</dt><dd className="font-medium">{fcfa(l.amount)}</dd></div>)}
              <div className="flex justify-between py-2"><dt className="font-semibold">Total des biens</dt><dd className="font-semibold">{fcfa(r.totalAssets)}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-slate-600">Dettes déduites</dt><dd className="font-medium">− {fcfa(r.deductions)}</dd></div>
              <div className="flex justify-between py-2"><dt className="font-semibold">Base calculée</dt><dd className="font-semibold">{fcfa(r.base)}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-slate-600">Seuil (nisab) configuré</dt><dd className="font-medium">{fcfa(r.nisab)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Hypothèses : seuil et taux issus des paramètres version {out.settingsVersion} (réf. {dateFr(settings.referenceDate)}). {settings.method}. {settings.notes}
            </p>
            {out.saved && <div className="mt-3"><Alert type="success">Calcul enregistré dans votre historique.</Alert></div>}
            <div className="no-print mt-5 flex flex-wrap gap-3">
              {r.zakat > 0 && <Link to={`/don?amount=${r.zakat}&type=zakat`} className="btn btn-primary">Donner ce montant</Link>}
              <button className="btn btn-outline" onClick={() => window.print()}>Imprimer le résultat</button>
              <button className="btn btn-outline" onClick={() => { setStep(1); setOut(null); }}>Nouveau calcul</button>
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">Ce résultat est une estimation et ne constitue pas un avis religieux définitif.</p>
    </div>
  );
}
