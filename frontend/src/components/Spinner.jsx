/** Simple centered loading spinner. */
export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}
