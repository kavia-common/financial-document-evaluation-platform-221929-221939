import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * StatusToast shows transient status messages (success/error/info).
 * It auto-dismisses after a timeout and supports manual close.
 * Uses safe text rendering only.
 */
export default function StatusToast({ type = 'info', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return;
    const id = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);

  const colors = {
    info: { bg: '#3b82f6', text: '#ffffff' },
    success: { bg: '#06b6d4', text: '#083344' },
    error: { bg: '#EF4444', text: '#ffffff' },
  };

  const palette = colors[type] || colors.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '12px 16px',
        borderRadius: 8,
        background: palette.bg,
        color: palette.text,
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: '90vw',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 600 }}>
          {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
        </span>
        <span style={{ opacity: 0.95 }}>{String(message || '')}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: palette.text,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

StatusToast.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'error']),
  message: PropTypes.string,
  onClose: PropTypes.func,
  duration: PropTypes.number,
};
