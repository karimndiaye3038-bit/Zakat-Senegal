import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fcfa, dateTimeFr, dateFr } from '../utils/format.js';
import { FUND_LABELS, METHOD_LABELS, TX_STATUS } from '../utils/labels.js';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import PageHeader from '../components/PageHeader.jsx';

export function AccountHome() {
  const { user } = useAuth();
  const tx = useFetch('/transactions/me');
  const aid = useFetch('/aid-requests/me');
  const confirmed = (tx.data?.items || []).filter((t) => t.status === 'confirmed');
  const total = confirmed.reduce((s, t) => s + t.amount, 0);
  const inProgress = (aid.data?.items || []).filter((r) => !['distribuee', 'cloturee', 'refuse'].includes(r.status)).length;
  const received = (aid.data?.items || []).filter((r) => ['distribuee', 'cloturee'].includes(r.status)).length;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title={`Bonjour, ${user.name.split(' ')[0]} !`} subtitle="Voici un aperçu de votre activité." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Mes dons" value={fcfa(total)} tone="green" />
        <StatCard label="Dons confirmés" value={confirmed.length} tone="blue" />
        <StatCard label="Demandes en cours" value={inProgress} tone="orange" />
        <StatCard label="Aides reçues" value={received} tone="violet" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Actions rapides</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/calculateur" className="btn btn-primary py-3">Calculer ma Zakat</Link>
        <Link to="/don" className="btn btn-gold py-3">Faire un don</Link>
        <Link to="/demande-aide" className="btn bg-sky-700 py-3 text-white hover:bg-sky-800">Demander une aide</Link>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link to="/compte/dons" className="card hover:-translate-y-0.5">📄 Mes dons et reçus →</Link>
        <Link to="/compte/demandes" className="card hover:-translate-y-0.5">📂 Suivre mes demandes →</Link>
      </div>
    </div>
  );
}

export function MyTransactions() {
  const { data, loading, error } = useFetch('/transactions/me');
  if (loading) return <Spinner full />;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Mes dons et reçus" subtitle="Historique de vos contributions." />
      <Alert type="error">{error}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[560px]">
          <thead className="border-b bg-slate-50"><tr>{['Date', 'Type', 'Moyen', 'Montant', 'Statut', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data?.items.map((t) => (
              <tr key={t._id}>
                <td className="td">{dateFr(t.createdAt)}</td><td className="td">{FUND_LABELS[t.type]}</td><td className="td">{METHOD_LABELS[t.provider]}</td>
                <td className="td font-semibold">{fcfa(t.amount)}</td><td className="td"><StatusBadge map={TX_STATUS} value={t.status} /></td>
                <td className="td">{t.status === 'confirmed' && <Link className="text-brand-700 hover:underline" to={`/compte/recu/${t.reference}`}>Reçu</Link>}</td>
              </tr>
            ))}
            {!data?.items.length && <tr><td colSpan="6" className="td py-8 text-center text-slate-500">Aucun don pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Receipt() {
  const { reference } = useParams();
  const { data, loading, error } = useFetch(`/transactions/${reference}/receipt`);
  if (loading) return <Spinner full />;
  if (error) return <div className="mx-auto max-w-md p-6"><Alert type="error">{error}</Alert></div>;
  const { receipt: r } = data;
  const rows = [['Numéro de reçu', r.number], ['Référence transaction', r.data.reference], ['Donateur', r.user?.name], ['Date', dateTimeFr(r.data.date)],
    ['Type de contribution', FUND_LABELS[r.data.type]], ['Moyen de paiement', METHOD_LABELS[r.data.provider]], ['Statut', 'Confirmé']];
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="card">
        <h1 className="text-center text-xl font-semibold">Reçu de contribution</h1>
        <p className="mt-4 text-center font-display text-3xl font-bold text-brand-700">{fcfa(r.data.amount)}</p>
        <dl className="mt-6 divide-y divide-slate-100 text-sm">
          {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
        </dl>
        <button onClick={() => window.print()} className="btn btn-outline no-print mt-6 w-full">Imprimer / enregistrer en PDF</button>
      </div>
    </div>
  );
}
