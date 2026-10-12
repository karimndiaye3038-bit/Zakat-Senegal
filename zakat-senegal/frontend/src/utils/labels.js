export const FUND_LABELS = { zakat: 'Zakat', sadaqa: 'Sadaqa', other: 'Autre' };
export const METHOD_LABELS = { wave: 'Wave', orange_money: 'Orange Money', card: 'Carte bancaire' };
export const CATEGORY_LABELS = { alimentation: 'Alimentation', sante: 'Santé', logement: 'Logement', education: 'Éducation', autre: 'Autre' };
export const ROLE_LABELS = {
  user: 'Utilisateur', agent: 'Agent de vérification', distribution_manager: 'Gestionnaire de distribution',
  admin: 'Administrateur', super_admin: 'Super-administrateur',
};
export const STAFF_ROLES = ['agent', 'distribution_manager', 'admin', 'super_admin'];
export const REGIONS = ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'];
export const DIST_MODES = { especes: 'Espèces', mobile_money: 'Mobile money', virement: 'Virement', nature: 'En nature' };

// [libellé, classes de couleur]
export const TX_STATUS = {
  initiated: ['Initiée', 'bg-slate-100 text-slate-700'], pending: ['En attente', 'bg-amber-100 text-amber-800'],
  confirmed: ['Confirmé', 'bg-emerald-100 text-emerald-800'], failed: ['Échouée', 'bg-red-100 text-red-700'],
  cancelled: ['Annulée', 'bg-slate-200 text-slate-700'], refunded: ['Remboursée', 'bg-blue-100 text-blue-700'],
};
export const AID_STATUS = {
  brouillon: ['Brouillon', 'bg-slate-100 text-slate-700'], soumis: ['Soumis', 'bg-blue-100 text-blue-700'],
  a_completer: ['À compléter', 'bg-amber-100 text-amber-800'], en_verification: ['En vérification', 'bg-indigo-100 text-indigo-700'],
  approuve: ['Approuvé', 'bg-emerald-100 text-emerald-800'], refuse: ['Refusé', 'bg-red-100 text-red-700'],
  en_attente_fonds: ['En attente de fonds', 'bg-amber-100 text-amber-800'], aide_planifiee: ['Aide planifiée', 'bg-teal-100 text-teal-800'],
  distribuee: ['Distribuée', 'bg-emerald-100 text-emerald-800'], cloturee: ['Clôturée', 'bg-slate-200 text-slate-700'],
};
export const DIST_STATUS = {
  pending_approval: ['2e validation requise', 'bg-amber-100 text-amber-800'], planned: ['Planifiée', 'bg-blue-100 text-blue-700'],
  delivered: ['Remise effectuée', 'bg-emerald-100 text-emerald-800'], cancelled: ['Annulée', 'bg-slate-200 text-slate-700'],
};
