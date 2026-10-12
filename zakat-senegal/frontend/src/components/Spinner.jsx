export default function Spinner({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'min-h-[50vh]' : 'py-10'}`} role="status" aria-label="Chargement">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
    </div>
  );
}
