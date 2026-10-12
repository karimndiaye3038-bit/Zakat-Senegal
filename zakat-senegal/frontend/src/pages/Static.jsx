import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { fcfa, num, dateFr } from '../utils/format.js';
import { CATEGORY_LABELS, FUND_LABELS } from '../utils/labels.js';
import { LineChart, Donut } from '../components/Charts.jsx';
import StatCard from '../components/StatCard.jsx';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import Spinner from '../components/Spinner.jsx';

const Page = ({ title, children }) => (
  <div className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">{title}</h1>
    <div className="space-y-4 text-slate-700">{children}</div>
  </div>
);

export function About() {
  return (
    <Page title="À propos">
      <p>Zakat Sénégal est une plateforme numérique qui facilite la compréhension et le calcul de la Zakat, organise la collecte des contributions, traite les demandes d'aide et suit la distribution aux bénéficiaires éligibles.</p>
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Notre engagement</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Calculateur pédagogique avec détail de chaque élément pris en compte.</li>
          <li>Paiements confirmés uniquement après vérification serveur du prestataire.</li>
          <li>Séparation comptable entre Zakat, Sadaqa et autres fonds.</li>
          <li>Rapports publics agrégés, sans aucune donnée personnelle.</li>
          <li>Dignité et confidentialité des bénéficiaires protégées.</li>
        </ul>
      </div>
      <Alert type="info">La plateforme ne remplace pas un avis religieux personnalisé. Les règles de calcul et les catégories de bénéficiaires sont validées par des personnes compétentes.</Alert>
      <div className="flex gap-3"><Link to="/calculateur" className="btn btn-primary">Calculer ma Zakat</Link><Link to="/faq" className="btn btn-outline">Questions fréquentes</Link></div>
    </Page>
  );
}

const FAQ = [
  ['Le calculateur donne-t-il un avis religieux ?', "Non. Il fournit une estimation selon des paramètres validés par un comité compétent. Pour une situation particulière, consultez une personne qualifiée."],
  ['Comment mon don est-il confirmé ?', "Le paiement est confirmé uniquement après vérification, côté serveur, de la réponse du prestataire (Wave, Orange Money, carte). Un reçu avec référence unique est alors généré."],
  ['Mes données de carte sont-elles stockées ?', 'Non. Aucune donnée de carte ni secret de paiement n’est conservé par la plateforme.'],
  ['Qui peut demander une aide ?', 'Toute personne en difficulté peut déposer un dossier avec ses justificatifs. Chaque dossier est examiné par des agents habilités ; aucune décision n’est automatique.'],
  ['Mes justificatifs sont-ils visibles publiquement ?', 'Jamais. Ils sont stockés dans un espace privé, accessibles uniquement à vous et aux agents autorisés.'],
  ['Puis-je utiliser le site hors ligne ?', 'Seules les pages publiques déjà consultées sont disponibles hors ligne. Paiements et demandes nécessitent une connexion.'],
];
export function Faq() {
  return (
    <Page title="Questions fréquentes">
      {FAQ.map(([q, a]) => <details key={q} className="card group"><summary className="cursor-pointer font-semibold text-brand-900">{q}</summary><p className="mt-2 text-sm">{a}</p></details>)}
    </Page>
  );
}

export function Contact() {
  const [f, setF] = useState({ name: '', contact: '', message: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try { setMsg((await api.post('/contact', f)).message); setF({ name: '', contact: '', message: '' }); } catch (e2) { setErr(e2.message); }
  };
  return (
    <Page title="Contact">
      <form onSubmit={submit} className="card space-y-4">
        <Field label="Nom"><input className="input" value={f.name} onChange={set('name')} required /></Field>
        <Field label="E-mail ou téléphone"><input className="input" value={f.contact} onChange={set('contact')} required /></Field>
        <Field label="Message"><textarea rows="5" className="input" value={f.message} onChange={set('message')} minLength={10} required /></Field>
        <Alert type="success">{msg}</Alert><Alert type="error">{err}</Alert>
        <button className="btn btn-primary">Envoyer</button>
      </form>
    </Page>
  );
}

export function Transparency() {
  const { data, loading, error } = useFetch('/reports/public');
  if (loading) return <Spinner full />;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Rapports de transparence</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Statistiques agrégées, sans aucune donnée personnelle. Mise à jour : {dateFr(data?.updatedAt)}.</p>
      <Alert type="error">{error}</Alert>
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Collecte confirmée" value={fcfa(data.collected)} tone="green" />
            <StatCard label="Montant distribué" value={fcfa(data.distributed)} tone="blue" />
            <StatCard label="Bénéficiaires aidés" value={num(data.beneficiaries)} tone="orange" />
            <StatCard label="Solde disponible" value={fcfa(data.available)} tone="gold" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card"><h2 className="mb-3 text-base font-semibold">Évolution des collectes</h2><LineChart data={data.series} /></div>
            <div className="card"><h2 className="mb-3 text-base font-semibold">Répartition des aides</h2>
              <Donut items={data.breakdown.map((b) => ({ label: CATEGORY_LABELS[b.category] || b.category, value: b.total }))} centerValue={num(data.beneficiaries)} centerLabel="Bénéficiaires" />
            </div>
          </div>
          <div className="card mt-6 overflow-x-auto p-0">
            <table className="w-full min-w-[480px]"><thead className="border-b bg-slate-50"><tr>{['Fonds', 'Collecté', 'Distribué', 'Disponible'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{Object.entries(data.byType).map(([k, v]) => (
                <tr key={k}><td className="td font-medium">{FUND_LABELS[k]}</td><td className="td">{fcfa(v.collected)}</td><td className="td">{fcfa(v.delivered)}</td><td className="td">{fcfa(v.available)}</td></tr>))}</tbody></table>
          </div>
        </>
      )}
    </div>
  );
}

export function NotFound() {
  return <Page title="Page introuvable"><p>La page demandée n'existe pas.</p><Link to="/" className="btn btn-primary">Retour à l'accueil</Link></Page>;
}
export function Forbidden() {
  return <Page title="Accès refusé"><p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p><Link to="/" className="btn btn-primary">Retour à l'accueil</Link></Page>;
}
