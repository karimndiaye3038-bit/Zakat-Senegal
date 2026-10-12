import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch.js';
import { dateTimeFr } from '../../utils/format.js';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Audit() {
  const [page, setPage] = useState(1);
  const { data, error } = useFetch(`/admin/audit-logs?page=${page}`);
  return (
    <>
      <PageHeader title="Journal d'audit" subtitle="Actions sensibles : non modifiables depuis l'interface." />
      <Alert type="error">{error}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px]">
          <thead className="border-b bg-slate-50"><tr>{['Date', 'Acteur', 'Action', 'Ressource', 'Résultat'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data?.items.map((l) => (
              <tr key={l._id}><td className="td whitespace-nowrap">{dateTimeFr(l.createdAt)}</td><td className="td">{l.actor?.name || '—'} <span className="text-xs text-slate-400">{l.actorRole}</span></td>
                <td className="td font-medium">{l.action}</td><td className="td text-xs text-slate-500">{l.resource}</td>
                <td className="td"><span className={l.result === 'success' ? 'text-emerald-700' : 'text-red-600'}>{l.result}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data?.page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
