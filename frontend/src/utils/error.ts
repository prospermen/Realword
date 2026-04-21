interface ApiErrorData {
  message?: unknown;
  errors?: Record<string, unknown>;
}

function normalizeFieldLabel(field: string) {
  if (!field || field === 'body') return '';
  return field.replace(/_/g, ' ');
}

function formatFieldError(field: string, message: string) {
  const label = normalizeFieldLabel(field);
  return label ? `${label} ${message}` : message;
}

export function parseApiErrorList(error: unknown, fallback = 'Something went wrong'): string[] {
  const messages: string[] = [];

  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: unknown;
      response?: { data?: unknown };
    };

    const responseData = maybeError.response?.data;
    if (responseData && typeof responseData === 'object') {
      const data = responseData as ApiErrorData;

      if (data.errors && typeof data.errors === 'object') {
        for (const [field, value] of Object.entries(data.errors)) {
          if (Array.isArray(value)) {
            for (const item of value) {
              if (typeof item === 'string' && item.trim()) {
                messages.push(formatFieldError(field, item.trim()));
              }
            }
            continue;
          }

          if (typeof value === 'string' && value.trim()) {
            messages.push(formatFieldError(field, value.trim()));
          }
        }
      }

      if (messages.length === 0 && typeof data.message === 'string' && data.message.trim()) {
        messages.push(data.message.trim());
      }
    }

    if (
      messages.length === 0 &&
      typeof maybeError.message === 'string' &&
      maybeError.message.trim() &&
      !maybeError.message.includes('status code')
    ) {
      messages.push(maybeError.message.trim());
    }
  }

  if (messages.length === 0 && fallback.trim()) {
    messages.push(fallback.trim());
  }

  return Array.from(new Set(messages));
}

export function parseApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  return parseApiErrorList(error, fallback)[0] ?? fallback;
}
