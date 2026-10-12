import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Alert from '../../components/Alert.jsx';
import Field from '../../components/Field.jsx';
import Spinner from '../../components/Spinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Settings() {
  const { data, loading, error, reload } = useFetch('/settings/zakat');
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (data) {
      const { version, effectiveDate, ...rest } = data;
      setF({ ...rest, validatedBy: rest.validatedBy || '' });
    }
  }, [data]);
  if (loading || !f) return <Spinner full />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setCat = (i, k, v) => setF({ ...f, categories: f.categories.map((c, j) => (j === i ? { ...c, [k]: v } : c)) });
  const addCat = () => setF({ ...f, categories: [...f.categories, { key: `cat_${Date.now().toString(36)}`, label: '', hint: '' }] });

  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.put('/settings/zakat', {
        ...f, nisabAmount: Number(f.nisabAmount), rate: Number(f.rate), minDonation: Number(f.minDonation),
        doubleValidationThreshold: Number(f.doubleValidationThreshold), validatedBy: f.validated ? f.validatedBy : undefined,
      });
      setMsg('Nouvelle version des paramètres enregistrée.'); reload();
    } catch (e2) { setErr(e2.message); }
  };

  return (
    <>
      <PageHeader title="Paramètres" subtitle={`Calculateur et gouvernance – version actuelle : ${data.version}`} />
      <Alert type="warning">Seuil, taux et catégories ne sont jamais figés dans le code : ils doivent être validés par un comité compétent avant le lancement. Chaque enregistrement crée une nouvelle version (historique conservé).</Alert>
      <form onSubmit={save} className="card mt-4 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seuil – nisab (FCFA)"><input type="number" min="1" className="input" value={f.nisabAmount} onChange={set('nisabAmount')} required /></Field>
          <Field label="Taux (ex. 0.025 = 2,5 %)"><input type="number" step="0.001" min="0.001" max="1" className="input" value={f.rate} onChange={set('rate')} required /></Field>
          <Field label="Date de référence"><input type="date" className="input" value={f.referenceDate} onChange={set('referenceDate')} required /></Field>
          <Field label="Méthode de calcul"><input className="input" value={f.method} onChange={set('method')} required /></Field>
          <Field label="Don minimum (FCFA)"><input type="number" min="100" className="input" value={f.minDonation} onChange={set('minDonation')} required /></Field>
          <Field label="Seuil de double validation des distributions (FCFA)"><input type="number" min="1000" className="input" value={f.doubleValidationThreshold} onChange={set('doubleValidationThreshold')} required /></Field>
        </div>
        <Field label="Notes explicatives affichées aux utilisateurs"><textarea rows="2" className="input" value={f.notes} onChange={set('notes')} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={f.allowDebtDeduction} onChange={set('allowDebtDeduction')} />Autoriser la déduction des dettes</label>

        <div>
          <p className="label">Catégories de biens</p>
          <div className="space-y-2">
            {f.categories.map((c, i) => (
              <div key={c.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input className="input" placeholder="Libellé" value={c.label} onChange={(e) => setCat(i, 'label', e.target.value)} required />
                <input className="input" placeholder="Aide (optionnel)" value={c.hint} onChange={(e) => setCat(i, 'hint', e.target.value)} />
                <button type="button" className="btn btn-outline btn-sm" disabled={f.categories.length <= 1} onClick={() => setF({ ...f, categories: f.categories.filter((_, j) => j !== i) })}>Retirer</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-sm mt-2" onClick={addCat}>+ Ajouter une catégorie</button>
        </div>

        <div className="rounded-xl bg-brand-50 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4" checked={f.validated} onChange={set('validated')} />Paramètres validés par le comité compétent</label>
          {f.validated && <div className="mt-3"><Field label="Validé par (nom du comité / de la personne)"><input className="input" value={f.validatedBy} onChange={set('validatedBy')} required /></Field></div>}
        </div>
        <Alert type="success">{msg}</Alert><Alert type="error">{error || err}</Alert>
        <button className="btn btn-primary">Enregistrer une nouvelle version</button>
      </form>
    </>
  );
}
