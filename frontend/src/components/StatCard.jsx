/** Dashboard summary card showing a labelled metric. */
export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-600 dark:text-brand-500',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-300',
  };
  return (
    <div className="card">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent] || accents.brand}`}>{value}</p>
    </div>
  );
}
