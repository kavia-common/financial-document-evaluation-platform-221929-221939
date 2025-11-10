import React, { useEffect, useState } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import ResultsView from './components/ResultsView';
import StatusToast from './components/StatusToast';
import { createEvaluation, getBaseUrl } from './api/client';
import { useApi } from './hooks/useApi';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application shell providing:
   * - Top navbar with brand and docs link
   * - Upload form (file + metadata) with client-side validation
   * - Results section rendering returned evaluation data
   * - Footer with security.txt and docs links
   * - Toast notifications for success/error
   */
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const { run: runCreateEval, loading, error, data } = useApi(createEvaluation);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  async function handleSubmit(formData) {
    const res = await runCreateEval(formData);
    if (res?.ok) {
      setToast({ open: true, type: 'success', message: 'Upload successful. Processing started.' });
    } else {
      setToast({
        open: true,
        type: 'error',
        message: res?.message || 'Upload failed',
      });
    }
  }

  function closeToast() {
    setToast({ open: false, type: 'info', message: '' });
  }

  return (
    <div className="App">
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>📄</span>
            <span style={styles.brandText}>Financial Evaluator</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a
              href={getBaseUrl() + '/docs'}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navLink}
            >
              API Docs
            </a>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <section style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.title}>Upload Financial Document</h1>
            <p style={styles.subtitle}>
              Submit a PDF for automated evaluation. Results appear below after processing.
            </p>
          </header>

          <UploadForm onSubmit={handleSubmit} busy={loading} />

          <section style={{ marginTop: 20 }}>
            <h2 style={styles.sectionTitle}>Latest Result</h2>
            {loading && <p style={styles.infoText}>Uploading…</p>}
            {!loading && error && (
              <p style={styles.errorText} role="status" aria-live="polite">
                {error}
              </p>
            )}
            {!loading && !error && !data && (
              <p style={styles.infoText}>No results yet. Upload a document to get started.</p>
            )}
            {!loading && data && <ResultsView result={data} />}
          </section>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span>© {new Date().getFullYear()} Financial Evaluator</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <a href="/security.txt" style={styles.footerLink}>security.txt</a>
            <a
              href="https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              OWASP Secure Coding
            </a>
          </span>
        </div>
      </footer>

      {toast.open && (
        <StatusToast type={toast.type} message={toast.message} onClose={closeToast} />
      )}
    </div>
  );
}

const styles = {
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  navInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { display: 'flex', gap: 10, alignItems: 'center' },
  brandIcon: { fontSize: 20 },
  brandText: { fontWeight: 700, color: '#111827' },
  navLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600,
  },
  main: { background: '#f9fafb', minHeight: 'calc(100vh - 120px)' },
  container: { maxWidth: 960, margin: '0 auto', padding: 16 },
  header: {
    background: 'linear-gradient(90deg, rgba(59,130,246,0.12), rgba(229,231,235,0.4))',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px 16px',
    marginBottom: 16,
  },
  title: { margin: 0, color: '#111827' },
  subtitle: { margin: '8px 0 0', color: '#374151' },
  sectionTitle: { margin: '12px 0', color: '#111827' },
  infoText: { color: '#374151' },
  errorText: { color: '#EF4444' },
  footer: {
    borderTop: '1px solid #e5e7eb',
    background: '#ffffff',
  },
  footerInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#111827',
  },
  footerLink: {
    color: '#06b6d4',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

export default App;
