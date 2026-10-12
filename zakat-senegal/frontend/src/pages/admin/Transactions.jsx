import { useState } from 'react';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fcfa, dateTimeFr } from '../../utils/format.js';
import { FUND_LABELS, METHOD_LABELS, TX_STATUS } from '../../utils/labels.js';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Transactions() {
  const { user } = useAuth();
  const [f, setF] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');
  const { data, loading, error } = useFetch(`/admin/transactions${api.qs({ ...f, page })}`);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  return (
    <>
      <PageHeader title="Dons / Paiements" subtitle="Toutes les transactions et leur statut.">
        {['admin', 'super_admin'].includes(user.role) && <button className="btn btn-outline btn-sm" onClick={() => api.download('/admin/transactions/export', 'transactions.csv').catch((e) => setErr(e.message))}>Exporter CSV</button>}
      </PageHeader>
      <div className="card mb-4 grid gap-3 sm:grid-cols-2">
        <select className="input" value={f.status} onChange={set('status')}><option value="">Tous les statuts</option>{Object.entries(TX_STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
        <select className="input" value={f.type} onChange={set('type')}><option value="">Tous les types</option>{Object.entries(FUND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <Alert type="error">{error || err}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead className="border-b bg-slate-50"><tr>{['Référence', 'Date', 'Donateur', 'Type', 'Moyen', 'Montant', 'Statut'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan="7"><Spinner /></td></tr>}
            {data?.items.map((t) => (
              <tr key={t._id}><td className="td font-medium">{t.reference}</td><td className="td">{dateTimeFr(t.createdAt)}</td><td className="td">{t.user?.name}</td>
                <td className="td">{FUND_LABELS[t.type]}</td><td className="td">{METHOD_LABELS[t.provider]}</td><td className="td font-semibold">{fcfa(t.amount)}</td><td className="td"><StatusBadge map={TX_STATUS} value={t.status} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data?.page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
