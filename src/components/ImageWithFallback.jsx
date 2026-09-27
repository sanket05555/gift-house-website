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

  if (error && !currentSrc) {
    return (
      <div className={`bg-wine/5 flex items-center justify-center ${className}`} {...props}>
        <img src={fallbackRef.current || '/images/fallbacks/default.svg'} className="w-full h-full object-cover" alt="" />
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
