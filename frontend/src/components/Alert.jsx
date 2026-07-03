/** Inline alert for error/success/info messages. */
export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  };
  return (
    <div className={`rounded-lg border px-4 py-2 text-sm ${styles[type]}`} role="alert">
      {children}
    </div>
  );
}
