import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { fcfa, dateTimeFr } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

export default function DonationResult() {
  const { reference } = useParams();
  const { data, loading, error } = useFetch(`/transactions/${reference}`);
  if (loading) return <Spinner full />;
  if (error) return <div className="mx-auto max-w-md p-6"><Alert type="error">{error}</Alert></div>;
  const tx = data.transaction;
  const ok = tx.status === 'confirmed';
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <div className="card">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${ok ? 'bg-emerald-100' : 'bg-red-100'}`}>{ok ? '✔' : '✕'}</div>
        <h1 className="mt-4 text-2xl font-semibold">{ok ? 'Merci pour votre don !' : tx.status === 'cancelled' ? 'Paiement annulé' : 'Erreur de paiement'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {ok ? `Votre don de ${fcfa(tx.amount)} est confirmé le ${dateTimeFr(tx.confirmedAt)}.` : tx.status === 'pending' ? 'Paiement en attente de confirmation du prestataire.' : "Aucun montant n'a été débité par la plateforme. Vous pouvez réessayer."}
        </p>
        <p className="mt-1 text-xs text-slate-400">Référence : {tx.reference}</p>
        <div className="mt-6 flex flex-col gap-2">
          {ok && <Link to={`/compte/recu/${tx.reference}`} className="btn btn-primary">Voir mon reçu</Link>}
          {!ok && <Link to="/don" className="btn btn-primary">Réessayer</Link>}
          <Link to="/compte" className="btn btn-outline">Mon espace</Link>
        </div>
      </div>
    </div>
  );
}
