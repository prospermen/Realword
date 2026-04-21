interface SpinnerProps {
  label?: string;
  minHeight?: number;
}

export default function Spinner({ label = 'Loading...', minHeight = 80 }: SpinnerProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      style={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        color: 'var(--app-muted)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.10)',
          borderTopColor: '#2dd4bf',
          display: 'inline-block',
          animation: 'app-spinner-spin 0.8s linear infinite',
        }}
      />
      <span>{label}</span>
      <style>{'@keyframes app-spinner-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
    </section>
  );
}
