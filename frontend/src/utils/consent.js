/**
 * Cookie/tracking consent — gates GTM (Google Consent Mode v2), Meta Pixel
 * (Meta's native consent API), and PostHog behind a single accept/decline
 * choice, stored in localStorage so it persists across visits.
 *
 * All three trackers are initialized in index.html in a "denied"/paused
 * state by default (before this module or React ever runs) so no tracking
 * request goes out before the user has made a choice or before this code
 * has read a previously-stored choice.
 */
const STORAGE_KEY = "decorous_consent";

export function getStoredConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyGrantedState() {
  if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  }
  if (window.fbq) {
    window.fbq("consent", "grant");
    window.fbq("track", "PageView");
  }
  if (window.__decorousInitPostHog) {
    window.__decorousInitPostHog();
  }
}

export function grantConsent() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "granted");
  } catch {
    /* localStorage unavailable (private browsing, etc.) — consent still
       applies for this page view, it just won't persist to the next one */
  }
  applyGrantedState();
}

export function denyConsent() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "denied");
  } catch {
    /* ignore */
  }
  // fbq/gtag are already in a denied/revoked state from index.html;
  // nothing further to fire.
}

// Called once on app mount to re-apply a previously granted choice — the
// inline script in index.html only reads localStorage for Meta Pixel
// (synchronously, before React loads); this covers gtag + PostHog too and
// runs on every page load so the granted state is consistent everywhere.
export function reapplyStoredConsent() {
  if (getStoredConsent() === "granted") {
    applyGrantedState();
  }
}
