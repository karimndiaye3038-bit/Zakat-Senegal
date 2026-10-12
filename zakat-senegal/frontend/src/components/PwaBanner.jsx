import { useEffect, useState } from 'react';
import { useOnline } from '../hooks/usePwa.js';

// Indique clairement l'état hors ligne et propose la mise à jour de l'application.
export default function PwaBanner() {
  const online = useOnline();
  const [worker, setWorker] = useState(null);
  useEffect(() => {
    const h = (e) => setWorker(e.detail);
    window.addEventListener('sw-update', h);
    return () => window.removeEventListener('sw-update', h);
  }, []);
  return (
    <>
      {!online && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white" role="status">
          Vous êtes hors ligne : les données affichées peuvent ne pas être à jour. Les paiements et demandes sont désactivés.
        </div>
      )}
      {worker && (
        <div className="flex items-center justify-center gap-3 bg-brand-700 px-4 py-2 text-sm text-white">
          Une nouvelle version est disponible.
          <button className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-brand-800" onClick={() => worker.postMessage('SKIP_WAITING')}>Mettre à jour</button>
        </div>
      )}
    </>
  );
}
