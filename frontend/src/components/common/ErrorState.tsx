import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void | Promise<void>;
  retryText?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryText = 'Retry',
}: ErrorStateProps) {
  return (
    <section role="alert" className="state-box error">
      <p style={{ margin: onRetry ? '0 0 10px' : 0 }}>{message}</p>

      {onRetry ? (
        <Button type="button" onClick={onRetry} size="sm">
          {retryText}
        </Button>
      ) : null}
    </section>
  );
}
