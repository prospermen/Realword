import { useState } from 'react';
import { parseApiErrorList } from '../utils/error';

export function useFormFeedback() {
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  function clearFeedback() {
    setErrors([]);
    setNotice('');
  }

  function clearErrors() {
    setErrors([]);
  }

  function setSuccess(message: string) {
    setErrors([]);
    setNotice(message);
  }

  function setErrorMessages(messages: string[]) {
    setNotice('');
    setErrors(messages);
  }

  function setApiErrors(error: unknown, fallback: string) {
    setNotice('');
    setErrors(parseApiErrorList(error, fallback));
  }

  return {
    errors,
    notice,
    clearFeedback,
    clearErrors,
    setSuccess,
    setErrorMessages,
    setApiErrors,
  };
}
