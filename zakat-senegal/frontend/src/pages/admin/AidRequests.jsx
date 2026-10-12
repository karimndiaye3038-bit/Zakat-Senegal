import { useState } from 'react';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AID_STATUS, CATEGORY_LABELS, REGIONS } from '../../utils/labels.js';
import { dateFr, dateTimeFr } from '../../utils/format.js';
import Alert from '../../components/Alert.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Field from '../../components/Field.jsx';

function Detail({ id, onClose, onChanged }) {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(`/admin/aid-requests/${id}`);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const canDecide = ['agent', 'admin', 'super_admin'].includes(user.role);

  const submit = async () => {
    setErr('');
    try { await api.patch(`/admin/aid-requests/${id}/status`, { status, reason: reason || undefined, internalNote: note || undefined }); setStatus(''); setReason(''); setNote(''); reload(); onChanged(); } catch (e) { setErr(e.message); }
  };
  const r = data?.request;
  return (
    <Modal title={r ? `Dossier ${r.reference}` : 'Dossier'} onClose={onClose} wide>
      {loading && <Spinner />}<Alert type="error">{error}</Alert>
      {r && (
        <div className="space-y-4 text-sm">
          {r.possibleDuplicate && <Alert type="warning">Doublon possible détecté (même téléphone et même catégorie) : à vérifier, aucune décision automatique.</Alert>}
          <div className="grid gap-2 sm:grid-cols-2">
            <p><b>Demandeur :</b> {r.fullName}</p><p><b>Téléphone :</b> {r.phone}</p>
            <p><b>Adresse :</b> {r.address}, {r.region}</p><p><b>Catégorie :</b> {CATEGORY_LABELS[r.category]} · foyer de {r.householdSize}</p>
            <p><b>Statut :</b> <StatusBadge map={AID_STATUS} value={r.status} /></p><p><b>Déposé le :</b> {dateTimeFr(r.createdAt)}</p>
          </div>
          <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-slate-700">{r.description}</p>
          <div>
            <p className="mb-1 font-semibold">Justificatifs</p>
            <div className="flex flex-wrap gap-2">
              {r.documents.map((d) => <button key={d._id} className="btn btn-outline btn-sm" onClick={() => api.download(`/aid-requests/${r._id}/documents/${d._id}`, d.originalName).catch((e) => setErr(e.message))}>📎 {d.originalName}</button>)}
              {!r.documents.length && <span className="text-slate-500">Aucun</span>}
            </div>
          </div>
          {canDecide && data.allowedTransitions.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">Décision / changement de statut</p>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">— Choisir —</option>{data.allowedTransitions.map((s) => <option key={s} value={s}>{AID_STATUS[s][0]}</option>)}
              </select>
              {['a_completer', 'refuse'].includes(status) && <Field label="Motif communiqué au demandeur *"><textarea rows="2" className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>}
              <Field label="Note interne (jamais visible par le demandeur)"><textarea rows="2" className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
              <Alert type="error">{err}</Alert>
              <button className="btn btn-primary" disabled={!status} onClick={submit}>Enregistrer la décision</button>
            </div>
          )}
          <div>
            <p className="mb-1 font-semibold">Historique des décisions</p>
            <ul className="space-y-2">
              {data.reviews.map((v) => (
                <li key={v._id} className="rounded-lg bg-slate-50 p-3 text-xs">
                  <b>{AID_STATUS[v.decision]?.[0] || v.decision}</b> · {v.agent?.name} · {dateTimeFr(v.createdAt)}
                  {v.reason && <p>Motif : {v.reason}</p>}{v.internalNote && <p className="text-slate-500">Note interne : {v.internalNote}</p>}
                </li>
              ))}
              {!data.reviews.length && <li className="text-slate-500">Aucune décision.</li>}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AidRequests() {
  const [filters, setFilters] = useState({ status: '', category: '', region: '', q: '' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useFetch(`/admin/aid-requests${api.qs({ ...filters, page })}`);
  const set = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };
  return (
    <>
      <PageHeader title="Demandes d'aide" subtitle="File de dossiers à vérifier." />
      <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Rechercher (n°, nom, téléphone)" value={filters.q} onChange={set('q')} />
        <select className="input" value={filters.status} onChange={set('status')}><option value="">Tous les statuts</option>{Object.entries(AID_STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
        <select className="input" value={filters.category} onChange={set('category')}><option value="">Toutes catégories</option>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="input" value={filters.region} onChange={set('region')}><option value="">Toutes régions</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select>
      </div>
      <Alert type="error">{error}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead className="border-b bg-slate-50"><tr>{['N° dossier', 'Demandeur', 'Catégorie', 'Région', 'Date', 'Statut', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan="7"><Spinner /></td></tr>}
            {data?.items.map((r) => (
              <tr key={r._id}>
                <td className="td font-medium">{r.reference} {r.possibleDuplicate && <span title="Doublon possible">⚠️</span>}</td><td className="td">{r.fullName}</td>
                <td className="td">{CATEGORY_LABELS[r.category]}</td><td className="td">{r.region}</td><td className="td">{dateFr(r.createdAt)}</td>
                <td className="td"><StatusBadge map={AID_STATUS} value={r.status} /></td>
                <td className="td"><button className="btn btn-outline btn-sm" onClick={() => setOpen(r._id)}>Examiner</button></td>
              </tr>
            ))}
            {!loading && !data?.items.length && <tr><td colSpan="7" className="td py-8 text-center text-slate-500">Aucun dossier.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={data?.page} pages={data?.pages} onChange={setPage} />
      {open && <Detail id={open} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}
