/**
// Centralized API client with env-based baseURL, sane defaults, and normalized errors
// CORS expectation:
// - Backend should allow the frontend origin (e.g., http://localhost:3000) via its CORS allow_origins.
// - Frontend calls should NOT set Content-Type manually for multipart/form-data; the browser sets boundary.
// - JSON responses should include application/json. This client handles text fallback to avoid parse errors.
*/

/**
 * Get API base URL from env. This must be provided by .env as REACT_APP_API_BASE_URL.
 * Falls back to same-origin if not set (useful for local proxies).
 */
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Default request timeout in ms.
 */
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Normalize errors so UI can handle consistently without exposing stack traces.
 * @param {number} status
 * @param {string} message
 * @param {object} [details]
 * @returns {{ok:false,status:number,message:string,details?:object}}
 */
function makeError(status = 0, message = 'Unexpected error', details) {
  return { ok: false, status, message, ...(details ? { details } : {}) };
}

/**
 * Wrapper for fetch with timeout and JSON-safe parsing.
 * Avoids throwing; returns normalized result objects.
 * @param {string} path
 * @param {RequestInit} options
 * @param {number} timeoutMs
 * @returns {Promise<{ok:true,status:number,data:any}|{ok:false,status:number,message:string,details?:object}>}
 */
async function apiFetch(path, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
      },
      credentials: 'include', // if needed for auth cookies in future
    });
  } catch (err) {
    clearTimeout(id);
    if (err && err.name === 'AbortError') {
      return makeError(0, 'Request timed out');
    }
    return makeError(0, 'Network error');
  } finally {
    clearTimeout(id);
  }

  const status = response.status;

  // Try to parse JSON safely; fall back to text
  let payload = null;
  const contentType = response.headers.get('Content-Type') || '';
  try {
    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = { message: text };
    }
  } catch {
    payload = null;
  }

  if (!response.ok) {
    // Special-case common API validation/content errors to surface clearer messages
    let message =
      (payload && (payload.error || payload.message)) ||
      `Request failed with status ${status}`;
    if (status === 400) {
      message = payload?.message || 'Invalid request. Please check the inputs.';
    } else if (status === 415) {
      message = 'Unsupported media type. Please upload a valid PDF file.';
    }
    return makeError(status, message, payload || undefined);
  }

  return { ok: true, status, data: payload };
}

// PUBLIC_INTERFACE
export async function createEvaluation(formData) {
  /** Create a new evaluation by uploading a document. Expects FormData with fields:
   * - file: File
   * - title: string (optional)
   * - notes: string (optional)
   *
   * Returns a normalized result object { ok, status, data|message }.
   */
  return apiFetch('/evaluations', {
    method: 'POST',
    body: formData,
  });
}

// PUBLIC_INTERFACE
export async function getEvaluationById(evaluationId) {
  /** Fetch a previously stored evaluation by ID.
   * Returns normalized result { ok, status, data|message }.
   */
  const safeId = encodeURIComponent(String(evaluationId || '').trim());
  if (!safeId) return makeError(400, 'Missing evaluation ID');
  return apiFetch(`/evaluations/${safeId}`, {
    method: 'GET',
  });
}

// PUBLIC_INTERFACE
export function getMaxUploadMb() {
  /** Returns max upload size in MB from env or default 10MB. */
  const val = Number(process.env.REACT_APP_MAX_UPLOAD_MB);
  return Number.isFinite(val) && val > 0 ? val : 10;
}

// PUBLIC_INTERFACE
export function getAllowedMimeTypes() {
  /** Returns allowed MIME types for uploads. Restrict to PDFs by default as required. */
  return ['application/pdf'];
}

// PUBLIC_INTERFACE
export function getBaseUrl() {
  /** Expose the resolved base URL for debugging and UI hints. */
  return BASE_URL || window.location.origin;
}
