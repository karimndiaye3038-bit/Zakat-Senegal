import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useOnline } from '../hooks/usePwa.js';
import { AID_STATUS, CATEGORY_LABELS, REGIONS } from '../utils/labels.js';
import { dateFr } from '../utils/format.js';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PageHeader from '../components/PageHeader.jsx';

function FileInput({ files, setFiles }) {
  const onChange = (e) => {
    const list = Array.from(e.target.files);
    if (list.some((f) => f.size > 5 * 1024 * 1024)) { alert('Chaque fichier doit faire 5 Mo maximum.'); return; }
    setFiles(list.slice(0, 5));
  };
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 text-center">
      <p className="text-sm text-slate-600">Téléversez vos justificatifs (PDF, JPG, PNG – max 5 Mo, 5 fichiers)</p>
      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={onChange} className="mt-3 text-sm" />
      {files.length > 0 && <ul className="mt-3 text-left text-xs text-slate-600">{files.map((f) => <li key={f.name}>📎 {f.name}</li>)}</ul>}
    </div>
  );
}

export function AidRequestForm() {
  const { user } = useAuth();
  const online = useOnline();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ fullName: user.name, phone: user.phone || '', address: '', region: 'Dakar', category: 'sante', householdSize: 1, description: '' });
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const next = () => {
    if (step === 1 && (!f.fullName || !f.phone || !f.address || f.description.length < 20)) return setErr('Complétez tous les champs (description : 20 caractères minimum).');
    setErr(''); setStep(step + 1);
  };
  const submit = async () => {
    setBusy(true); setErr('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    files.forEach((file) => fd.append('documents', file));
    try { setDone((await api.upload('/aid-requests', fd)).request); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  if (done) return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <div className="card">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">✔</div>
        <h1 className="mt-4 text-2xl font-semibold">Demande envoyée</h1>
        <p className="mt-2 text-sm text-slate-600">Votre numéro de dossier :</p>
        <p className="font-display text-xl font-bold text-brand-700">{done.reference}</p>
        <p className="mt-2 text-xs text-slate-500">Conservez-le : vous pouvez suivre l'avancement dans votre espace.</p>
        <Link to="/compte/demandes" className="btn btn-primary mt-5 w-full">Suivre ma demande</Link>
      </div>
    </div>
  );

  const steps = ['Informations', 'Justificatifs', 'Confirmation'];
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Demande d'aide</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Vos informations sont confidentielles et ne sont jamais publiées.</p>
      <ol className="mb-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {steps.map((s, i) => <li key={s} className={`rounded-lg py-2 ${step === i + 1 ? 'bg-brand-700 text-white' : step > i + 1 ? 'bg-brand-100 text-brand-800' : 'bg-white text-slate-400'}`}>{i + 1}. {s}</li>)}
      </ol>
      <div className="card space-y-4">
        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet *"><input className="input" value={f.fullName} onChange={set('fullName')} /></Field>
              <Field label="Téléphone *"><input className="input" value={f.phone} onChange={set('phone')} placeholder="+221 77 123 45 67" /></Field>
            </div>
            <Field label="Adresse *"><input className="input" value={f.address} onChange={set('address')} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Région *"><select className="input" value={f.region} onChange={set('region')}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
              <Field label="Catégorie d'aide *"><select className="input" value={f.category} onChange={set('category')}>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Personnes au foyer"><input type="number" min="1" className="input" value={f.householdSize} onChange={set('householdSize')} /></Field>
            </div>
            <Field label="Description de la situation *"><textarea rows="5" className="input" value={f.description} onChange={set('description')} /></Field>
          </>
        )}
        {step === 2 && <FileInput files={files} setFiles={setFiles} />}
        {step === 3 && (
          <div className="space-y-2 text-sm">
            <p><b>{f.fullName}</b> · {f.phone}</p>
            <p>{f.address}, {f.region} · Foyer de {f.householdSize} personne(s)</p>
            <p>Catégorie : <b>{CATEGORY_LABELS[f.category]}</b></p>
            <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-slate-600">{f.description}</p>
            <p>Pièces jointes : {files.length}</p>
          </div>
        )}
        <Alert type="error">{err}</Alert>
        <div className="flex justify-between">
          <button className="btn btn-outline" disabled={step === 1} onClick={() => setStep(step - 1)}>← Retour</button>
          {step < 3 ? <button className="btn btn-primary" onClick={next}>Suivant →</button>
            : <button className="btn btn-primary" disabled={busy || !online || !files.length} onClick={submit}>{busy ? 'Envoi…' : 'Envoyer ma demande'}</button>}
        </div>
        {step === 3 && !files.length && <p className="text-xs text-amber-700">Ajoutez au moins un justificatif à l'étape 2.</p>}
      </div>
    </div>
  );
}

export function MyAidRequests() {
  const { data, loading, error, reload } = useFetch('/aid-requests/me');
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');

  const resubmit = async () => {
    setErr('');
    const fd = new FormData();
    fd.append('message', message);
    files.forEach((file) => fd.append('documents', file));
    try { await api.upload(`/aid-requests/${target.id}/resubmit`, fd, 'PATCH'); setTarget(null); setMessage(''); setFiles([]); reload(); } catch (e) { setErr(e.message); }
  };
  if (loading) return <Spinner full />;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title="Mes demandes d'aide" subtitle="Suivez le statut de vos dossiers."><Link to="/demande-aide" className="btn btn-primary btn-sm">Nouvelle demande</Link></PageHeader>
      <Alert type="error">{error}</Alert>
      <div className="space-y-4">
        {data?.items.map((r) => (
          <div key={r.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-display font-semibold text-brand-800">{r.reference}</p><p className="text-xs text-slate-500">{CATEGORY_LABELS[r.category]} · {r.region} · déposé le {dateFr(r.createdAt)}</p></div>
              <StatusBadge map={AID_STATUS} value={r.status} />
            </div>
            {r.publicReason && <div className="mt-3"><Alert type={r.status === 'refuse' ? 'error' : 'warning'}><b>Motif :</b> {r.publicReason}</Alert></div>}
            {r.status === 'a_completer' && <button className="btn btn-primary btn-sm mt-3" onClick={() => setTarget(r)}>Compléter mon dossier</button>}
          </div>
        ))}
        {!data?.items.length && <p className="card text-center text-slate-500">Aucune demande pour le moment.</p>}
      </div>
      {target && (
        <Modal title={`Compléter ${target.reference}`} onClose={() => setTarget(null)}>
          <div className="space-y-4">
            <Alert type="warning">{target.publicReason}</Alert>
            <Field label="Votre message"><textarea rows="4" className="input" value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
            <FileInput files={files} setFiles={setFiles} />
            <Alert type="error">{err}</Alert>
            <button className="btn btn-primary w-full" disabled={message.length < 5} onClick={resubmit}>Renvoyer le dossier</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
