import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 text-sm">Calculer, donner et suivre la Zakat au Sénégal, en toute transparence.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 font-semibold text-white">Liens utiles</h4>
          <ul className="space-y-1">
            <li><Link to="/faq" className="hover:text-gold-400">Questions fréquentes</Link></li>
            <li><Link to="/transparence" className="hover:text-gold-400">Rapports de transparence</Link></li>
            <li><Link to="/contact" className="hover:text-gold-400">Contact</Link></li>
          </ul>
        </div>
        <p className="text-xs leading-relaxed">
          Cette plateforme ne remplace pas un avis religieux personnalisé. Les résultats du calculateur sont des estimations.
          Les données personnelles des bénéficiaires ne sont jamais publiées.
        </p>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Zakat Sénégal</div>
    </footer>
  );
}
