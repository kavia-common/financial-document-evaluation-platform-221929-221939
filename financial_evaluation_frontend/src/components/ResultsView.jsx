import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResultsView safely renders evaluation results as plain text and key details.
 * No innerHTML usage; only text nodes. External links (if any provided by API)
 * are rendered with rel="noopener noreferrer".
 */
export default function ResultsView({ result }) {
  if (!result) return null;

  // Shape expected (example): { id, title, notes, status, score, findings: [ { key, value } ], reportUrl }
  // We defensively access fields and coerce to string to prevent object injection surprises.
  const safe = (v) => (v === null || v === undefined ? '' : String(v));

  const findings = Array.isArray(result.findings) ? result.findings : [];

  return (
    <section aria-labelledby="results-heading" style={styles.card}>
      <h2 id="results-heading" style={styles.heading}>Evaluation Result</h2>
      <div style={styles.meta}>
        <Row label="ID" value={safe(result.id)} />
        <Row label="Title" value={safe(result.title)} />
        <Row label="Status" value={safe(result.status)} />
        {'score' in result ? <Row label="Score" value={safe(result.score)} /> : null}
      </div>

      {findings.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={styles.subheading}>Findings</h3>
          <ul style={styles.list}>
            {findings.map((f, idx) => (
              <li key={`${safe(f.key)}-${idx}`} style={styles.listItem}>
                <strong>{safe(f.key)}:</strong> <span>{safe(f.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.reportUrl && typeof result.reportUrl === 'string' && (
        <p style={{ marginTop: 12 }}>
          <a
            href={result.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            View full report
          </a>
        </p>
      )}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

ResultsView.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    status: PropTypes.string,
    score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    findings: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    reportUrl: PropTypes.string,
  }),
};

const styles = {
  card: {
    marginTop: 16,
    padding: 16,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
  },
  heading: { margin: 0, color: '#111827' },
  subheading: { margin: '8px 0', color: '#111827' },
  meta: { display: 'grid', gap: 8, marginTop: 8 },
  row: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    gap: 8,
  },
  label: { color: '#6b7280' },
  value: { color: '#111827' },
  list: { margin: 0, paddingLeft: 18 },
  listItem: { margin: '6px 0' },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
