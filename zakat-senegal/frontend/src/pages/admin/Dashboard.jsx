import { useFetch } from '../../hooks/useFetch.js';
import { fcfa, num, dateFr } from '../../utils/format.js';
import { CATEGORY_LABELS, FUND_LABELS, TX_STATUS } from '../../utils/labels.js';
import { LineChart, Donut } from '../../components/Charts.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Spinner from '../../components/Spinner.jsx';
import Alert from '../../components/Alert.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Dashboard() {
  const { data, loading, error } = useFetch('/admin/dashboard');
  if (loading) return <Spinner full />;
  if (error) return <Alert type="error">{error}</Alert>;
  const { balances: b } = data;
  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la collecte et des distributions." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total collecté" value={fcfa(b.collected)} tone="green" />
        <StatCard label="Total distribué" value={fcfa(b.delivered)} tone="blue" />
        <StatCard label="Bénéficiaires aidés" value={num(data.beneficiaries)} hint={`${data.pending} demande(s) en attente`} tone="orange" />
        <StatCard label="Solde disponible" value={fcfa(b.available)} tone="gold" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="card xl:col-span-3"><h2 className="mb-3 text-base font-semibold">Évolution des collectes</h2><LineChart data={data.series} /></div>
        <div className="card xl:col-span-2"><h2 className="mb-3 text-base font-semibold">Répartition des aides</h2>
          <Donut items={data.breakdown.map((x) => ({ label: CATEGORY_LABELS[x.category] || x.category, value: x.total }))} centerValue={num(data.beneficiaries)} centerLabel="Bénéficiaires" /></div>
      </div>
      <div className="card mt-6 overflow-x-auto p-0">
        <h2 className="p-5 pb-2 text-base font-semibold">Soldes par type de fonds</h2>
        <table className="w-full min-w-[480px]"><thead className="border-y bg-slate-50"><tr>{['Fonds', 'Collecté', 'Engagé', 'Remis', 'Disponible'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{Object.entries(b.byType).map(([k, v]) => (
            <tr key={k}><td className="td font-medium">{FUND_LABELS[k]}</td><td className="td">{fcfa(v.collected)}</td><td className="td">{fcfa(v.committed)}</td><td className="td">{fcfa(v.delivered)}</td><td className="td font-semibold">{fcfa(v.available)}</td></tr>))}</tbody></table>
      </div>
      <div className="card mt-6 overflow-x-auto p-0">
        <h2 className="p-5 pb-2 text-base font-semibold">Dernières transactions</h2>
        <table className="w-full min-w-[560px]"><thead className="border-y bg-slate-50"><tr>{['Date', 'Donateur', 'Type', 'Montant', 'Statut'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{data.recent.map((t) => (
            <tr key={t._id}><td className="td">{dateFr(t.createdAt)}</td><td className="td">{t.user?.name}</td><td className="td">{FUND_LABELS[t.type]}</td><td className="td">{fcfa(t.amount)}</td><td className="td"><StatusBadge map={TX_STATUS} value={t.status} /></td></tr>))}
            {!data.recent.length && <tr><td colSpan="5" className="td py-6 text-center text-slate-500">Aucune transaction.</td></tr>}</tbody></table>
      </div>
    </>
  );
}
