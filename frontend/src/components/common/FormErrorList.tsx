interface FormErrorListProps {
  errors: string[];
  title?: string;
}

export default function FormErrorList({
  errors,
  title = 'Please fix the following:',
}: FormErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <section role="alert" className="state-box error">
      <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{title}</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </section>
  );
}
