// Fallback images map (Local SVGs)
export const FALLBACK_IMAGES = {
  // Occasions
  'birthday': '/images/fallbacks/birthday.svg',
  'celebration': '/images/fallbacks/celebration.svg',
  'home-decor': '/images/fallbacks/home-decor.svg',
  'personalized': '/images/fallbacks/personalized.svg',
  'someone-special': '/images/fallbacks/someone-special.svg',
  'traditional': '/images/fallbacks/traditional.svg',
  'wedding': '/images/fallbacks/wedding.svg',

  // Products
  'chocolate': '/images/fallbacks/chocolate.svg',
  'flowers': '/images/fallbacks/flowers.svg',
  'hamper': '/images/fallbacks/hamper.svg',
  
  // Generic products / fallback
  'default': '/images/fallbacks/default.svg'
};

/**
 * Checks if a URL is an invalid google image search URL or empty.
 */
export const isKnownInvalidUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('google.com/imgres')) return true;
  if (lowerUrl.includes('google.com/search')) return true;
  if (lowerUrl.includes('images.google.com')) return true;
  if (lowerUrl.startsWith('data:image') && lowerUrl.length < 100) return true; // tiny data uris
  return false;
};

/**
 * Gets the best fallback image based on a name, slug, or type.
 */
export const getFallbackImage = (identifier = '') => {
  if (!identifier) return FALLBACK_IMAGES.default;
  const lower = identifier.toLowerCase();
  
  // Product logic
  if (lower.includes('chocolate') || lower.includes('choc')) return FALLBACK_IMAGES['chocolate'];
  if (lower.includes('flower') || lower.includes('bouquet') || lower.includes('rose') || lower.includes('lil') || lower.includes('floral')) return FALLBACK_IMAGES['flowers'];
  if (lower.includes('hamper') || lower.includes('basket')) return FALLBACK_IMAGES['hamper'];
  
  // Occasion & General logic
  if (lower.includes('birthday')) return FALLBACK_IMAGES['birthday'];
  if (lower.includes('celebrat')) return FALLBACK_IMAGES['celebration'];
  if (lower.includes('home') || lower.includes('decor')) return FALLBACK_IMAGES['home-decor'];
  if (lower.includes('photo') || lower.includes('personal')) return FALLBACK_IMAGES['personalized'];
  if (lower.includes('special') || lower.includes('romantic') || lower.includes('love')) return FALLBACK_IMAGES['someone-special'];
  if (lower.includes('tradition')) return FALLBACK_IMAGES['traditional'];
  if (lower.includes('wedding') || lower.includes('marriage')) return FALLBACK_IMAGES['wedding'];
  
  return FALLBACK_IMAGES.default;
};

/**
 * Validates an image URL by actually attempting to load it.
 * Returns a promise that resolves to true if valid, false if broken.
 */
export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    if (isKnownInvalidUrl(url)) {
      resolve(false);
      return;
    }

    // In a browser environment, use Image object
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } else {
      // Server-side / Node environment
      fetch(url, { method: 'HEAD' })
        .then(res => resolve(res.ok))
        .catch(() => resolve(false));
    }
  });
};
