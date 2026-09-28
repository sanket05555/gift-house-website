import React, { useState, useEffect, useRef } from 'react';
import { isKnownInvalidUrl, getFallbackImage } from '../lib/imageUtils';

const ImageWithFallback = ({ src, alt, fallbackIdentifier, className, ...props }) => {
  const fallback = getFallbackImage(fallbackIdentifier || alt);
  const isInitiallyInvalid = isKnownInvalidUrl(src);

  const [error, setError] = useState(isInitiallyInvalid);
  const [currentSrc, setCurrentSrc] = useState(isInitiallyInvalid ? fallback : src);
  const fallbackRef = useRef(fallback);

  // Sync state if src prop changes
  useEffect(() => {
    fallbackRef.current = getFallbackImage(fallbackIdentifier || alt);
    if (isKnownInvalidUrl(src)) {
      setError(true);
      setCurrentSrc(fallbackRef.current);
    } else {
      setError(false);
      setCurrentSrc(src);
    }
  }, [src, fallbackIdentifier, alt]);

  const handleError = (e) => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackRef.current);
    } else if (currentSrc !== fallbackRef.current) {
      // If the fallback itself fails, we shouldn't infinite loop, but we can try the default fallback
      // Actually since it's a local SVG, it shouldn't fail, but let's be safe.
      setCurrentSrc('/images/fallbacks/default.svg');
    }
  };

  if (error || !currentSrc || currentSrc.includes('/images/fallbacks/')) {
    return (
      <div className={`bg-cream/50 flex flex-col items-center justify-center border border-wine/5 ${className}`} {...props}>
        <div className="w-10 h-10 rounded-sm bg-wine/5 flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-wine/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="font-serif text-wine/40 text-[10px] tracking-wider uppercase">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={error ? "" : alt} // Do not show alt if it's broken or a fallback
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
