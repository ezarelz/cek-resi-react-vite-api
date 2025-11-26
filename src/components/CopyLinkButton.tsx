import { useState } from 'react';
import { Link, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  awb: string;
  courier: string;
}

export function CopyLinkButton({ awb, courier }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${
      window.location.pathname
    }?courier=${encodeURIComponent(courier)}&noresi=${encodeURIComponent(awb)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button onClick={handleCopy} className='copy-link-btn' disabled={copied}>
      {copied ? (
        <>
          <Check size={20} />
          Link Copied!
        </>
      ) : (
        <>
          <Link size={20} />
          Copy Tracking Link
        </>
      )}
    </button>
  );
}
