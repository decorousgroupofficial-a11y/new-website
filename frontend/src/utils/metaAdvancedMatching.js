/**
 * Meta Advanced Matching — hashes visitor-supplied contact details (SHA-256,
 * lowercased, trimmed, per Meta's spec: developers.facebook.com/docs/meta-pixel/advanced/advanced-matching)
 * and re-initializes the Pixel with them, so the Contact/Lead event fired
 * immediately after carries matchable customer data. This runs entirely in
 * the browser via the Web Crypto API — only the hash ever reaches fbq()/Meta,
 * never the raw email, phone, or name.
 */
async function sha256Hex(value) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  // Meta expects country code + number, digits only. Decorous's entire
  // service area (Bhubaneswar/Cuttack/Puri/Khordha) is India, so a bare
  // 10-digit local number is assumed to be +91.
  return digits.length === 10 ? `91${digits}` : digits;
}

export async function setMetaAdvancedMatching({ email, phone, name, city } = {}) {
  if (typeof window === 'undefined' || !window.fbq || !window.__DECOROUS_META_PIXEL_ID) {
    return;
  }

  const matched = {};
  if (email) matched.em = await sha256Hex(email);
  if (phone) matched.ph = await sha256Hex(normalizePhone(phone));
  if (name) {
    const [first, ...rest] = name.trim().split(/\s+/);
    if (first) matched.fn = await sha256Hex(first);
    if (rest.length) matched.ln = await sha256Hex(rest.join(' '));
  }
  if (city) matched.ct = await sha256Hex(city);
  matched.country = await sha256Hex('in');

  window.fbq('init', window.__DECOROUS_META_PIXEL_ID, matched);
}
