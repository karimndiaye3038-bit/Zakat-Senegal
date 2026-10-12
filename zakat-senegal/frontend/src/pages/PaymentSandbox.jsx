import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { fcfa } from '../utils/format.js';
import { FUND_LABELS, METHOD_LABELS } from '../utils/labels.js';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';

// Page de SIMULATION du prestataire (mode sandbox). En production, l'utilisateur est redirigé vers Wave / Orange Money / carte.
export default function PaymentSandbox() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`/transactions/${reference}`);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const complete = async (outcome) => {
    setBusy(true); setErr('');
    try {
      await api.post(`/payments/sandbox/${reference}/complete`, { outcome });
      navigate(`/don/confirmation/${reference}`);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  if (loading) return <Spinner full />;
  if (error) return <div className="mx-auto max-w-md p-6"><Alert type="error">{error}</Alert></div>;
  const tx = data.transaction;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card text-center">
        <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">MODE SIMULATION – aucun argent réel</p>
        <h1 className="text-xl font-semibold">Paiement {METHOD_LABELS[tx.provider]}</h1>
        <p className="mt-3 font-display text-3xl font-bold text-brand-700">{fcfa(tx.amount)}</p>
        <p className="text-sm text-slate-500">{FUND_LABELS[tx.type]} · Réf. {tx.reference}</p>
        <div className="mt-4"><Alert type="error">{err}</Alert></div>
        <div className="mt-5 space-y-2">
          <button disabled={busy} onClick={() => complete('success')} className="btn btn-primary w-full">Simuler un paiement réussi</button>
          <button disabled={busy} onClick={() => complete('failed')} className="btn btn-outline w-full">Simuler un échec</button>
          <button disabled={busy} onClick={() => complete('cancelled')} className="btn w-full text-slate-500">Annuler</button>
        </div>
      </div>
    </div>
  );
}
