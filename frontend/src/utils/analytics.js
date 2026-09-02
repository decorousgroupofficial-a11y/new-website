/**
 * Analytics & Tracking Utilities
 * Google Analytics (GA4) + Meta Pixel event tracking
 */

// Google Analytics Events
//
// Pushed directly to dataLayer in GTM's native {event, ...params} shape
// rather than via window.gtag(...) -- the base gtag() stub in index.html
// (needed there so Consent Mode defaults are set before GTM loads) pushes
// arguments-object-shaped entries that GTM's Custom Event triggers do not
// reliably match, which silently dropped every custom event (verified via
// direct network inspection: identical events pushed in this native shape
// fire correctly every time, gtag()-routed ones never do).
export const trackGA4Event = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
};

// Meta Pixel Events
//
// eventId is optional and, when passed, is used as fbq's eventID option --
// this must match the event_id the backend sends for the same action via
// the Conversions API (see backend/server.py's send_meta_capi_event), which
// is how Meta deduplicates a browser Pixel event against its server-side
// twin instead of double-counting the same conversion.
export const trackMetaEvent = (eventName, params = {}, eventId = null) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (eventId) {
      window.fbq('track', eventName, params, { eventID: eventId });
    } else {
      window.fbq('track', eventName, params);
    }
  }
};

// Track both GA4 and Meta
export const trackEvent = (eventName, params = {}) => {
  trackGA4Event(eventName, params);
  trackMetaEvent(eventName, params);
};

// A fresh id per conversion action, shared between the browser-side fbq()
// call and the server-side Conversions API call for the same action so Meta
// can deduplicate them instead of counting one Lead as two.
export const generateEventId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// _fbp/_fbc are set by the Meta Pixel script itself in the visitor's browser
// -- forwarding them to the backend lets the Conversions API event match to
// the same person/ad click as the browser Pixel event.
export const getMetaBrowserIds = () => ({
  fbp: readCookie('_fbp'),
  fbc: readCookie('_fbc'),
});

// Pre-defined conversion events
export const trackLeadSubmission = (leadData) => {
  // GA4 Lead Event
  trackGA4Event('generate_lead', {
    currency: 'INR',
    value: leadData.estimated_value || 0,
    lead_source: leadData.source || 'website',
    city: leadData.city || '',
    construction_type: leadData.construction_type || ''
  });

  // Meta Lead Event
  trackMetaEvent('Lead', {
    content_name: leadData.construction_type || 'General Inquiry',
    content_category: leadData.source || 'website',
    city: leadData.city || '',
    value: leadData.estimated_value || 0,
    currency: 'INR'
  }, leadData.eventId);
};

export const trackCostCalculation = (calculationData) => {
  // GA4 Event
  trackGA4Event('cost_calculator_used', {
    plot_size: calculationData.plot_size,
    floors: calculationData.floors,
    quality: calculationData.quality,
    city: calculationData.city,
    estimated_cost: calculationData.estimated_cost
  });
  
  // Meta Custom Event
  trackMetaEvent('CustomizeProduct', {
    content_name: 'Cost Calculator',
    content_category: calculationData.quality,
    value: calculationData.estimated_cost,
    currency: 'INR'
  });
};

export const trackContactFormView = () => {
  trackGA4Event('view_contact_form');
  trackMetaEvent('ViewContent', { content_name: 'Contact Form' });
};

export const trackServicePageView = (serviceName, serviceId) => {
  trackGA4Event('view_service', { service_name: serviceName });
  trackMetaEvent('ViewContent', {
    content_name: serviceName,
    content_category: 'Services',
    content_type: 'product',
    ...(serviceId ? { content_ids: [serviceId] } : {})
  });
};

export const trackBlogView = (postTitle, category) => {
  trackGA4Event('view_blog_post', { 
    post_title: postTitle,
    category: category 
  });
  trackMetaEvent('ViewContent', { 
    content_name: postTitle,
    content_category: category
  });
};

export const trackPhoneClick = () => {
  trackGA4Event('phone_click', { method: 'call' });
  trackMetaEvent('Contact', { method: 'phone' });
};

export const trackWhatsAppClick = () => {
  trackGA4Event('whatsapp_click', { method: 'whatsapp' });
  trackMetaEvent('Contact', { method: 'whatsapp' });
};

// No calendar/consultation-booking feature exists on the site today (the
// "Book a Free Site Visit" CTA links to the contact form, not a scheduler),
// and there's no newsletter signup or account creation, so Meta's Schedule
// and CompleteRegistration standard events have nothing real to attach to.
// Likewise there's no on-site search (the WebSite JSON-LD's SearchAction is
// schema-only), so Search isn't wired either -- add these once the
// corresponding feature actually exists.

export const trackProjectView = (projectName, category) => {
  trackGA4Event('view_project', { 
    project_name: projectName,
    category: category 
  });
};
