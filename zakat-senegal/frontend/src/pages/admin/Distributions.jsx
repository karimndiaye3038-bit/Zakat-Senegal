import { useState } from 'react';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fcfa } from '../../utils/format.js';
import { CATEGORY_LABELS, DIST_MODES, DIST_STATUS, FUND_LABELS } from '../../utils/labels.js';
import Alert from '../../components/Alert.jsx';
import Field from '../../components/Field.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Distributions() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const list = useFetch(`/admin/distributions?page=${page}`);
  const bal = useFetch('/admin/balances');
  const plans = useFetch('/admin/distribution-plans');
  const eligible = useFetch('/admin/aid-requests?status=approuve&limit=100');
  const waiting = useFetch('/admin/aid-requests?status=en_attente_fonds&limit=100');
  const [form, setForm] = useState({ aidRequestId: '', planId: '', fundType: 'zakat', amount: '', mode: 'mobile_money' });
  const [plan, setPlan] = useState({ name: '', budget: '', fundType: 'zakat' });
  const [modal, setModal] = useState(null); // 'dist' | 'plan' | {deliver: id}
  const [proof, setProof] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = () => { list.reload(); bal.reload(); plans.reload(); eligible.reload(); waiting.reload(); };
  const run = async (fn, ok) => {
    setErr(''); setMsg('');
    try { await fn(); setModal(null); setMsg(ok); refresh(); } catch (e) { setErr(e.message); refresh(); }
  };
  const candidates = [...(eligible.data?.items || []), ...(waiting.data?.items || [])];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Distributions" subtitle="Plans, affectations, validations et preuves de remise.">
        <div className="flex gap-2"><button className="btn btn-outline btn-sm" onClick={() => setModal('plan')}>Nouveau plan</button><button className="btn btn-primary btn-sm" onClick={() => setModal('dist')}>Nouvelle distribution</button></div>
      </PageHeader>
      <Alert type="success">{msg}</Alert><Alert type="error">{!modal && err}</Alert>
      {bal.data && (
        <div className="mt-3 grid grid-cols-2 gap-4 xl:grid-cols-3">
          {Object.entries(bal.data.byType).map(([k, v]) => <StatCard key={k} label={`Disponible – ${FUND_LABELS[k]}`} value={fcfa(v.available)} hint={`Collecté ${fcfa(v.collected)}`} tone={k === 'zakat' ? 'green' : k === 'sadaqa' ? 'gold' : 'blue'} />)}
        </div>
      )}
      {plans.data?.items.length > 0 && (
        <div className="card mt-6"><h2 className="mb-2 text-base font-semibold">Plans de distribution</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">{plans.data.items.map((p) => <li key={p._id} className="rounded-xl bg-slate-50 p-3"><b>{p.name}</b> · {FUND_LABELS[p.fundType]}<br /><span className="text-slate-500">Engagé {fcfa(p.used)} / budget {fcfa(p.budget)}</span></li>)}</ul></div>
      )}
      <div className="card mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[820px]">
          <thead className="border-b bg-slate-50"><tr>{['Dossier', 'Bénéficiaire', 'Fonds', 'Montant', 'Mode', 'Statut', 'Actions'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {list.data?.items.map((d) => (
              <tr key={d._id}>
                <td className="td font-medium">{d.aidRequest?.reference}</td><td className="td">{d.aidRequest?.fullName} <span className="text-xs text-slate-400">({CATEGORY_LABELS[d.aidRequest?.category]})</span></td>
                <td className="td">{FUND_LABELS[d.fundType]}</td><td className="td font-semibold">{fcfa(d.amount)}</td><td className="td">{DIST_MODES[d.mode]}</td>
                <td className="td"><StatusBadge map={DIST_STATUS} value={d.status} /></td>
                <td className="td space-x-1 whitespace-nowrap">
                  {d.status === 'pending_approval' && d.createdBy?._id !== user.id && <button className="btn btn-primary btn-sm" onClick={() => run(() => api.patch(`/admin/distributions/${d._id}/approve`), 'Distribution validée.')}>Valider</button>}
                  {d.status === 'pending_approval' && d.createdBy?._id === user.id && <span className="text-xs text-slate-400">En attente d'un 2e validateur</span>}
                  {d.status === 'planned' && <button className="btn btn-gold btn-sm" onClick={() => setModal({ deliver: d._id })}>Enregistrer la remise</button>}
                  {['planned', 'pending_approval'].includes(d.status) && <button className="btn btn-outline btn-sm" onClick={() => run(() => api.patch(`/admin/distributions/${d._id}/cancel`), 'Distribution annulée.')}>Annuler</button>}
                  {d.status === 'delivered' && <span className="text-xs text-slate-500">Preuve : {d.proofRef}</span>}
                </td>
              </tr>
            ))}
            {!list.data?.items.length && <tr><td colSpan="7" className="td py-8 text-center text-slate-500">Aucune distribution.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={list.data?.page} pages={list.data?.pages} onChange={setPage} />

      {modal === 'dist' && (
        <Modal title="Nouvelle distribution" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Dossier approuvé"><select className="input" value={form.aidRequestId} onChange={set('aidRequestId')}><option value="">— Choisir —</option>{candidates.map((r) => <option key={r._id} value={r._id}>{r.reference} – {r.fullName}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fonds"><select className="input" value={form.fundType} onChange={set('fundType')}>{Object.entries(FUND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Montant (FCFA)"><input type="number" min="1" className="input" value={form.amount} onChange={set('amount')} /></Field>
              <Field label="Mode de remise"><select className="input" value={form.mode} onChange={set('mode')}>{Object.entries(DIST_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Plan (optionnel)"><select className="input" value={form.planId} onChange={set('planId')}><option value="">Aucun</option>{plans.data?.items.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></Field>
            </div>
            <p className="text-xs text-slate-500">Au-delà du seuil fixé dans les paramètres, une seconde validation par une autre personne est exigée.</p>
            <Alert type="error">{err}</Alert>
            <button className="btn btn-primary w-full" disabled={!form.aidRequestId || !form.amount}
              onClick={() => run(() => api.post('/admin/distributions', { ...form, amount: Number(form.amount), planId: form.planId || undefined }), 'Distribution enregistrée.')}>Enregistrer</button>
          </div>
        </Modal>
      )}
      {modal === 'plan' && (
        <Modal title="Nouveau plan de distribution" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Nom de la campagne"><input className="input" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fonds"><select className="input" value={plan.fundType} onChange={(e) => setPlan({ ...plan, fundType: e.target.value })}>{Object.entries(FUND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Budget (FCFA)"><input type="number" min="0" className="input" value={plan.budget} onChange={(e) => setPlan({ ...plan, budget: e.target.value })} /></Field>
            </div>
            <Alert type="error">{err}</Alert>
            <button className="btn btn-primary w-full" disabled={!plan.name || plan.budget === ''} onClick={() => run(() => api.post('/admin/distribution-plans', { ...plan, budget: Number(plan.budget) }), 'Plan créé.')}>Créer le plan</button>
          </div>
        </Modal>
      )}
      {modal?.deliver && (
        <Modal title="Enregistrer la remise" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Référence de preuve" hint="N° de transaction mobile money, reçu signé, bordereau…"><input className="input" value={proof} onChange={(e) => setProof(e.target.value)} /></Field>
            <Alert type="error">{err}</Alert>
            <button className="btn btn-primary w-full" disabled={proof.length < 3} onClick={() => run(() => api.patch(`/admin/distributions/${modal.deliver}/deliver`, { proofRef: proof }), 'Remise enregistrée.')}>Confirmer la remise</button>
          </div>
        </Modal>
      )}
    </>
  );
}
