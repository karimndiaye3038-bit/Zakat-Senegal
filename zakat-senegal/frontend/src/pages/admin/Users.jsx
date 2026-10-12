import { useState } from 'react';
import { api } from '../../services/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { dateFr } from '../../utils/format.js';
import { ROLE_LABELS } from '../../utils/labels.js';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function Users() {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');
  const { data, loading, error, reload } = useFetch(`/admin/users${api.qs({ q, page })}`);
  const act = async (fn) => { setErr(''); try { await fn(); reload(); } catch (e) { setErr(e.message); reload(); } };
  return (
    <>
      <PageHeader title="Utilisateurs" subtitle="Gestion des comptes et des rôles (contrôlée côté serveur)." />
      <input className="input mb-4 max-w-sm" placeholder="Rechercher…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <Alert type="error">{error || err}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead className="border-b bg-slate-50"><tr>{['Nom', 'Contact', 'Rôle', 'Inscrit le', 'Actif'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan="5"><Spinner /></td></tr>}
            {data?.items.map((u) => (
              <tr key={u._id}>
                <td className="td font-medium">{u.name}</td><td className="td">{u.email || u.phone}</td>
                <td className="td"><select className="input py-1.5" disabled={u._id === me.id} value={u.role} onChange={(e) => act(() => api.patch(`/admin/users/${u._id}/role`, { role: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                <td className="td">{dateFr(u.createdAt)}</td>
                <td className="td"><input type="checkbox" className="h-4 w-4" disabled={u._id === me.id} checked={u.active} onChange={(e) => act(() => api.patch(`/admin/users/${u._id}/active`, { active: e.target.checked }))} aria-label="Compte actif" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data?.page} pages={data?.pages} onChange={setPage} />
    </>
  );
}
