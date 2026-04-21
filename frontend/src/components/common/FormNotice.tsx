interface FormNoticeProps {
  message?: string;
  title?: string;
  variant?: 'success' | 'info';
}

export default function FormNotice({
  message = '',
  title,
  variant = 'info',
}: FormNoticeProps) {
  if (!message) {
    return null;
  }

  return (
    <section role="status" className={`state-box ${variant}`}>
      {title ? <p style={{ margin: '0 0 6px', fontWeight: 600 }}>{title}</p> : null}
      <p style={{ margin: 0 }}>{message}</p>
    </section>
  );
}
