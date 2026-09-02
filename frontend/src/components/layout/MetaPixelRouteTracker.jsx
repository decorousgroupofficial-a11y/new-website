import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fires a Meta Pixel PageView on every client-side route change.
 *
 * React Router navigation never reloads the page, so the PageView the base
 * Pixel code fires in index.html only ever covers the very first route a
 * visitor lands on -- every subsequent in-app navigation (Home -> Services ->
 * Contact) would otherwise go completely unseen by Meta. The first render is
 * skipped deliberately so this doesn't double-fire PageView alongside the
 * base code's own initial one.
 */
const MetaPixelRouteTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  return null;
};

export default MetaPixelRouteTracker;
