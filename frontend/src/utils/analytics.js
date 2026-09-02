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
export const trackMetaEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Track both GA4 and Meta
export const trackEvent = (eventName, params = {}) => {
  trackGA4Event(eventName, params);
  trackMetaEvent(eventName, params);
};

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
    city: leadData.city || ''
  });
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

export const trackServicePageView = (serviceName) => {
  trackGA4Event('view_service', { service_name: serviceName });
  trackMetaEvent('ViewContent', { 
    content_name: serviceName,
    content_category: 'Services'
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

export const trackProjectView = (projectName, category) => {
  trackGA4Event('view_project', { 
    project_name: projectName,
    category: category 
  });
};
