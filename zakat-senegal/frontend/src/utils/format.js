const nf = new Intl.NumberFormat('fr-FR');
export const fcfa = (n) => `${nf.format(Math.round(Number(n) || 0))} FCFA`;
export const num = (n) => nf.format(Math.round(Number(n) || 0));
export const dateFr = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
export const dateTimeFr = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
