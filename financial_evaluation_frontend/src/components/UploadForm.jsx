import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getAllowedMimeTypes, getMaxUploadMb } from '../api/client';

/**
 * UploadForm handles file + metadata selection with client-side validation.
 * It does not perform uploads itself; it calls onSubmit with a valid FormData.
 */
export default function UploadForm({ onSubmit, busy }) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const allowedTypes = getAllowedMimeTypes();
  const acceptAttr = '.pdf'; // UI affordance; enforce using MIME validation too
  const maxMb = getMaxUploadMb();

  function resetError() {
    if (error) setError('');
  }

  function validateFile(file) {
    if (!file) return 'Please select a file.';
    if (!allowedTypes.includes(file.type)) {
      return 'Unsupported file type. Please upload a PDF file.';
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > maxMb) {
      return `File is too large. Max size is ${maxMb} MB.`;
    }
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const file = fileInputRef.current?.files?.[0] || null;
    const validationMsg = validateFile(file);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    // Sanitize user-provided text by trimming only; we do not render as HTML anywhere
    formData.append('title', (title || '').toString().slice(0, 200).trim());
    formData.append('notes', (notes || '').toString().slice(0, 2000).trim());

    onSubmit && onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <div style={styles.field}>
        <label htmlFor="file" style={styles.label}>Document (PDF)</label>
        <input
          ref={fileInputRef}
          id="file"
          name="file"
          type="file"
          accept={acceptAttr}
          onChange={resetError}
          disabled={busy}
          style={styles.input}
          aria-describedby="file-help"
        />
        <small id="file-help" style={styles.help}>
          Allowed: PDF. Max size: {maxMb} MB.
        </small>
      </div>

      <div style={styles.field}>
        <label htmlFor="title" style={styles.label}>Title (optional)</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          style={styles.textInput}
          placeholder="Quarterly Report Q2"
          autoComplete="off"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="notes" style={styles.label}>Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          maxLength={2000}
          onChange={(e) => setNotes(e.target.value)}
          disabled={busy}
          style={styles.textarea}
          placeholder="Any specific areas to evaluate?"
          rows={4}
        />
      </div>

      {error ? (
        <div role="alert" aria-live="assertive" style={styles.error}>
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={busy} style={{ ...styles.button, ...(busy ? styles.buttonDisabled : {}) }}>
        {busy ? 'Uploading…' : 'Submit for Evaluation'}
      </button>
    </form>
  );
}

UploadForm.propTypes = {
  onSubmit: PropTypes.func,
  busy: PropTypes.bool,
};

const styles = {
  form: {
    display: 'grid',
    gap: 16,
    padding: 16,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
  },
  field: { display: 'grid', gap: 6 },
  label: { fontWeight: 600, color: '#111827' },
  input: {
    padding: 10,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#f9fafb',
  },
  textInput: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#ffffff',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#ffffff',
    resize: 'vertical',
  },
  help: { color: '#6b7280', fontSize: 12 },
  error: {
    background: '#FEF2F2',
    color: '#B91C1C',
    border: '1px solid #FECACA',
    padding: '8px 12px',
    borderRadius: 8,
  },
  button: {
    alignSelf: 'start',
    background: '#3b82f6',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 10px rgba(59,130,246,0.25)',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};
