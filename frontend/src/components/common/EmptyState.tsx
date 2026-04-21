interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'Nothing here yet.',
  description = '',
}: EmptyStateProps) {
  return (
    <section className="state-box empty">
      <p style={{ margin: description ? '0 0 8px' : 0, fontWeight: 600 }}>{title}</p>
      {description ? <p style={{ margin: 0 }}>{description}</p> : null}
    </section>
  );
}
