import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { fcfa, num } from '../utils/format.js';

const features = [
  ['Calculateur de Zakat', 'Estimez facilement votre montant', '🧮', '/calculateur'],
  ['Collecte sécurisée', 'Paiements via Wave, Orange Money, carte', '🔒', '/don'],
  ['Suivi des demandes', 'Aide aux personnes éligibles', '🤝', '/demande-aide'],
  ['Transparence', 'Rapports publics et traçabilité', '📊', '/transparence'],
];

export default function Home() {
  const { data } = useFetch('/reports/public');
  const stats = [
    ['👥', num(data?.donors), 'Donateurs'],
    ['💰', fcfa(data?.collected), 'Collectés'],
    ['🏠', num(data?.beneficiaries), 'Bénéficiaires aidés'],
    ['✅', '100 %', 'Transparence'],
  ];
  return (
    <>
      <section className="hero-pattern relative overflow-hidden text-white">
        <svg className="pointer-events-none absolute bottom-0 right-0 hidden h-72 w-auto text-white/10 md:block" viewBox="0 0 400 300" fill="currentColor" aria-hidden="true">
          <path d="M60 300V170h20v-40l10-30 10 30v40h20v130zM330 300V150h-20v-40l-10-30-10 30v40h-20v150zM110 300v-90c0-50 40-80 90-110 50 30 90 60 90 110v90z" />
          <circle cx="200" cy="70" r="10" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-14 sm:pt-20">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-400">SOLIDARITÉ · PARTAGE · FOI</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            Ensemble pour une <span className="text-gold-400">Zakat efficace</span> et transparente
          </h1>
          <p className="mt-4 max-w-xl text-white/85">Calculez votre Zakat, faites un don en toute sécurité et aidez ceux qui en ont besoin au Sénégal.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/calculateur" className="btn bg-brand-500 text-white hover:bg-brand-400">Calculer ma Zakat →</Link>
            <Link to="/don" className="btn btn-light">Faire un don ♥</Link>
            <Link to="/demande-aide" className="btn btn-light">Demander une aide</Link>
          </div>
          <blockquote className="mt-10 max-w-md border-l-2 border-gold-500 pl-4 text-sm italic text-white/80">
            « La meilleure des aumônes est celle faite en secret. »
          </blockquote>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-20 max-w-7xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, text, icon, to]) => (
            <Link key={title} to={to} className="card flex items-start gap-3 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-50 text-xl">{icon}</span>
              <span><span className="block text-sm font-semibold text-brand-900">{title}</span><span className="text-xs text-slate-500">{text}</span></span>
            </Link>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 shadow-soft lg:grid-cols-4">
          {stats.map(([icon, value, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-lg">{icon}</span>
              <div><p className="font-display text-lg font-semibold text-brand-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <h2 className="text-center text-2xl font-semibold">Comment ça marche ?</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[['1', 'Calculez', 'Renseignez vos biens et vos dettes : le calculateur détaille chaque étape.'],
            ['2', 'Donnez', 'Choisissez Zakat ou Sadaqa et payez avec un moyen autorisé. Recevez votre reçu.'],
            ['3', 'Suivez', "Les dons sont distribués après vérification des dossiers. Des rapports publics sont publiés."]].map(([n, t, d]) => (
            <div key={n} className="card text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-700 font-display font-semibold text-white">{n}</span>
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
