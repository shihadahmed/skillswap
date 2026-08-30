// Contextual empty states. Rendered whenever a dynamic array returns empty
// (length === 0) so users always know why a list is blank and what to do next.

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'There are no items to show.',
  icon,
  action,
}) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-10 text-center mt-8">
      {icon ? <div className="flex justify-center mb-4 text-muted">{icon}</div> : null}
      <p className="text-ink font-semibold text-lg">{title}</p>
      <p className="text-muted text-sm mt-1 max-w-md mx-auto">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
