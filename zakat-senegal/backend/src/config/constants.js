export const ROLES = {
  USER: 'user', // donateur / demandeur d'aide
  AGENT: 'agent', // agent de vérification
  DISTRIBUTION: 'distribution_manager',
  ADMIN: 'admin',
  SUPER: 'super_admin',
};
export const ALL_ROLES = Object.values(ROLES);
export const STAFF_ROLES = [ROLES.AGENT, ROLES.DISTRIBUTION, ROLES.ADMIN, ROLES.SUPER];

export const FUND_TYPES = ['zakat', 'sadaqa', 'other'];
export const PAYMENT_METHODS = ['wave', 'orange_money', 'card'];
export const TX_STATUSES = ['initiated', 'pending', 'confirmed', 'failed', 'cancelled', 'refunded'];

export const AID_CATEGORIES = ['alimentation', 'sante', 'logement', 'education', 'autre'];
export const AID_STATUSES = [
  'brouillon', 'soumis', 'a_completer', 'en_verification', 'approuve',
  'refuse', 'en_attente_fonds', 'aide_planifiee', 'distribuee', 'cloturee',
];
// Transitions autorisées pour le personnel (distribuee est posé uniquement par une remise enregistrée).
export const AID_TRANSITIONS = {
  soumis: ['en_verification', 'a_completer', 'refuse', 'approuve'],
  a_completer: ['en_verification', 'refuse'],
  en_verification: ['approuve', 'refuse', 'a_completer'],
  approuve: ['en_attente_fonds', 'refuse'],
  en_attente_fonds: ['approuve'],
  aide_planifiee: [],
  distribuee: ['cloturee'],
  refuse: ['en_verification', 'cloturee'],
  cloturee: [],
};
export const REASON_REQUIRED = ['a_completer', 'refuse'];

export const DISTRIBUTION_MODES = ['especes', 'mobile_money', 'virement', 'nature'];
export const DISTRIBUTION_STATUSES = ['pending_approval', 'planned', 'delivered', 'cancelled'];

export const REGIONS = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda',
  'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor',
];

// Valeurs initiales du calculateur : EXEMPLES À FAIRE VALIDER par un comité compétent.
export const DEFAULT_ZAKAT_SETTINGS = {
  nisabAmount: 5000000,
  rate: 0.025,
  referenceDate: new Date().toISOString().slice(0, 10),
  method: 'Valeur de référence en FCFA (à définir par le comité)',
  notes: 'Estimation indicative. Ce calcul ne constitue pas un avis religieux. Consultez une personne compétente.',
  allowDebtDeduction: true,
  minDonation: 500,
  doubleValidationThreshold: 500000,
  categories: [
    { key: 'cash', label: 'Liquidités et comptes bancaires', hint: 'Espèces, comptes courants, mobile money' },
    { key: 'savings', label: 'Épargne et placements', hint: 'Livrets, dépôts, placements déclarés' },
    { key: 'gold', label: 'Or et argent', hint: 'Valeur marchande actuelle' },
    { key: 'goods', label: 'Marchandises commerciales', hint: 'Stock destiné à la vente' },
  ],
};
