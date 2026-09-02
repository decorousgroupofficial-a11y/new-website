import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getStoredConsent, grantConsent, denyConsent } from '@/utils/consent';

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    grantConsent();
    setVisible(false);
  };

  const handleDecline = () => {
    denyConsent();
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-[#1a365d] text-white px-4 py-4 md:px-8 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      data-testid="consent-banner"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <p className="text-sm text-white/85 flex-1">
          We use cookies and similar technologies for analytics and ad measurement (Google, Meta) to
          understand how visitors use this site. See our{' '}
          <Link to="/privacy-policy" className="underline text-[#F5A623]">
            Privacy Policy
          </Link>{' '}
          for details. You can accept or decline non-essential cookies.
        </p>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white"
            onClick={handleDecline}
            data-testid="consent-decline"
          >
            Decline
          </Button>
          <Button
            className="bg-[#F5A623] text-black hover:bg-[#e09612]"
            onClick={handleAccept}
            data-testid="consent-accept"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
