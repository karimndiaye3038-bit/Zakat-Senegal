// Calcul pédagogique : tous les paramètres viennent de la configuration (jamais figés dans le code).
export function calculateZakat(values, debts, s) {
  const lines = s.categories.map((c) => ({ key: c.key, label: c.label, amount: Math.round(Number(values[c.key]) || 0) }));
  const totalAssets = lines.reduce((sum, l) => sum + l.amount, 0);
  const deductions = s.allowDebtDeduction ? Math.min(Math.round(debts || 0), totalAssets) : 0;
  const base = totalAssets - deductions;
  const eligible = base >= s.nisabAmount;
  const zakat = eligible ? Math.round(base * s.rate) : 0;
  return { lines, totalAssets, deductions, base, nisab: s.nisabAmount, rate: s.rate, eligible, zakat };
}
