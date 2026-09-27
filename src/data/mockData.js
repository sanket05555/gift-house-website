export const occasions = [
  { id: 'birthday', label: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'anniversary', label: 'Anniversary', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'someone-special', label: 'Someone Special', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'celebration', label: 'Celebration', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'personalized', label: 'Personalized Memories', image: 'https://images.unsplash.com/photo-1577998474537-882046522f1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'traditional', label: 'Traditional Occasions', image: 'https://images.unsplash.com/photo-1605553950156-f4021245037d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'home-decor', label: 'Home & Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

export const collections = [
  { id: 'choc-bouquet', label: 'Chocolate Bouquets', description: 'Sweet surprises elegantly arranged.' },
  { id: 'flower-bouquet', label: 'Flower Bouquets', description: 'Handcrafted floral arrangements.' },
  { id: 'personalized-gifts', label: 'Personalized Gifts', description: 'Custom-made for your loved ones.' },
  { id: 'gift-hampers', label: 'Gift Hampers', description: 'Curated boxes full of joy.' },
  { id: 'handmade-flowers', label: 'Handmade Flowers', description: 'Everlasting beautiful blooms.' },
  { id: 'handmade-decor', label: 'Handmade Decor', description: 'Artisanal touch for your home.' },
];

export const products = [
  { 
    id: 1, 
    title: 'Premium Red Rose Bouquet', 
    collection: 'flower-bouquet', 
    price: '₹999',
    occasions: ['anniversary', 'someone-special'],
    image: 'https://images.unsplash.com/photo-1584305574647-0685bd87b326?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 2, 
    title: 'Ferrero Rocher Tower', 
    collection: 'choc-bouquet', 
    price: '₹1499',
    occasions: ['birthday', 'celebration'],
    image: 'https://images.unsplash.com/photo-1563241592301-657df2a58b88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 3, 
    title: 'Photo Memory Hamper', 
    collection: 'personalized-gifts', 
    price: '₹1299',
    occasions: ['anniversary', 'personalized'],
    image: 'https://images.unsplash.com/photo-1583526685732-c7d956f70d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 4, 
    title: 'Nazar Wall Hanging', 
    collection: 'handmade-decor', 
    price: '₹599',
    occasions: ['home-decor', 'traditional'],
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 5, 
    title: 'Mixed Blossom Hamper', 
    collection: 'gift-hampers', 
    price: '₹2499',
    occasions: ['birthday', 'someone-special'],
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 6, 
    title: 'Artisan Paper Lilies', 
    collection: 'handmade-flowers', 
    price: '₹799',
    occasions: ['someone-special', 'celebration'],
    image: 'https://images.unsplash.com/photo-1605553950156-f4021245037d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
];
