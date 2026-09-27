import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');

const supabase = createClient(supabaseUrl, supabaseKey);

// Data from mockData.js
const occasions = [
  { id: 'birthday', label: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'anniversary', label: 'Anniversary', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'someone-special', label: 'Someone Special', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'celebration', label: 'Celebration', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'personalized', label: 'Personalized Memories', image: 'https://images.unsplash.com/photo-1577998474537-882046522f1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'traditional', label: 'Traditional Occasions', image: 'https://images.unsplash.com/photo-1605553950156-f4021245037d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'home-decor', label: 'Home & Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const collections = [
  { id: 'choc-bouquet', label: 'Chocolate Bouquets', description: 'Sweet surprises elegantly arranged.' },
  { id: 'flower-bouquet', label: 'Flower Bouquets', description: 'Handcrafted floral arrangements.' },
  { id: 'personalized-gifts', label: 'Personalized Gifts', description: 'Custom-made for your loved ones.' },
  { id: 'gift-hampers', label: 'Gift Hampers', description: 'Curated boxes full of joy.' },
  { id: 'handmade-flowers', label: 'Handmade Flowers', description: 'Everlasting beautiful blooms.' },
  { id: 'handmade-decor', label: 'Handmade Decor', description: 'Artisanal touch for your home.' },
];

const products = [
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

const testimonials = [
  { id: 't1', name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The personalized hamper was absolutely beautiful. My husband loved it!', visible: true },
  { id: 't2', name: 'Rahul Desai', location: 'Delhi', rating: 5, text: 'Amazing quality and such thoughtful packaging. Will definitely order again.', visible: true },
  { id: 't3', name: 'Anita Patel', location: 'Bangalore', rating: 4, text: 'Beautiful flowers, they look so real. Perfect for home decor.', visible: true }
];

async function seed() {
  console.log('Starting seed process...');
  
  // 1. Categories
  for (const cat of collections) {
    const { data: existing } = await supabase.from('categories').select('id, slug').eq('slug', cat.id).single();
    if (!existing) {
      const { error } = await supabase.from('categories').insert({
        slug: cat.id,
        name: cat.label,
        description: cat.description,
        active: true
      });
      if (error) console.error('Error inserting category', cat.id, error);
      else console.log('Inserted category', cat.id);
    } else {
      console.log('Category exists:', cat.id);
    }
  }

  // 2. Occasions
  for (const occ of occasions) {
    const { data: existing } = await supabase.from('occasions').select('id, slug').eq('slug', occ.id).single();
    if (!existing) {
      const { error } = await supabase.from('occasions').insert({
        slug: occ.id,
        name: occ.label,
        image_url: occ.image,
        active: true
      });
      if (error) console.error('Error inserting occasion', occ.id, error);
      else console.log('Inserted occasion', occ.id);
    } else {
      console.log('Occasion exists:', occ.id);
    }
  }

  // Fetch created categories and occasions to map UUIDs
  const { data: cats } = await supabase.from('categories').select('id, slug');
  const { data: occs } = await supabase.from('occasions').select('id, slug');

  // 3. Products
  for (const prod of products) {
    let cat = cats.find(c => c.slug === prod.collection);
    if (!cat) {
      console.warn(`Category ${prod.collection} not found for ${prod.title}. Using fallback.`);
      cat = cats.find(c => c.slug === 'gift-hampers') || cats[0];
    }
    if (!cat) {
      console.error('Could not find any category for product', prod.title);
      continue;
    }

    const { data: existingProd } = await supabase.from('products').select('id, title').eq('title', prod.title).single();
    let productId;
    
    if (!existingProd) {
      const { data: newProd, error: insertError } = await supabase.from('products').insert({
        title: prod.title,
        price: Number(prod.price.replace(/[^\d.]/g, '')),
        category_id: cat.id,
        image_url: prod.image,
        featured: false,
        available: true
      }).select().single();
      
      if (insertError) {
        console.error('Error inserting product', prod.title, insertError);
        continue;
      }
      productId = newProd.id;
      console.log('Inserted product', prod.title);
    } else {
      productId = existingProd.id;
      console.log('Product exists:', prod.title);
    }

    // Insert product_occasions
    for (const occSlug of prod.occasions) {
      const occasion = occs.find(o => o.slug === occSlug);
      if (occasion) {
        // check if relation exists
        const { data: existingRel } = await supabase
          .from('product_occasions')
          .select('*')
          .eq('product_id', productId)
          .eq('occasion_id', occasion.id)
          .single();
          
        if (!existingRel) {
          await supabase.from('product_occasions').insert({
            product_id: productId,
            occasion_id: occasion.id
          });
        }
      }
    }
  }

  // 4. Testimonials
  for (const test of testimonials) {
    const { data: existing } = await supabase.from('testimonials').select('id, name').eq('name', test.name).single();
    if (!existing) {
      const { error } = await supabase.from('testimonials').insert({
        name: test.name,
        location: test.location,
        rating: test.rating,
        text: test.text,
        visible: test.visible
      });
      if (error) console.error('Error inserting testimonial', test.name, error);
      else console.log('Inserted testimonial', test.name);
    } else {
      console.log('Testimonial exists:', test.name);
    }
  }

  console.log('Seed complete!');
}

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'temp_admin_seed@example.com',
    password: 'SeedPassword123!'
  });
  
  if (error) {
    console.error('Failed to sign up temp admin:', error.message);
    // Maybe sign in?
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'temp_admin_seed@example.com',
      password: 'SeedPassword123!'
    });
    if (signInError) {
      console.error('Failed to sign in:', signInError.message);
      return;
    }
  }
  
  console.log('Successfully authenticated as temp admin');
  await seed();
}

run().catch(console.error);
