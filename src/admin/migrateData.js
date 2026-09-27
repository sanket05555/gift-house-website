import { supabase } from '../lib/supabaseClient';
import { collections, occasions, products } from '../data/mockData';

const testimonials = [
  { id: 't1', name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The personalized hamper was absolutely beautiful. My husband loved it!', visible: true },
  { id: 't2', name: 'Rahul Desai', location: 'Delhi', rating: 5, text: 'Amazing quality and such thoughtful packaging. Will definitely order again.', visible: true },
  { id: 't3', name: 'Anita Patel', location: 'Bangalore', rating: 4, text: 'Beautiful flowers, they look so real. Perfect for home decor.', visible: true }
];

export const runMigration = async () => {
  console.log('Starting migration...');
  const results = {
    categories: 0,
    occasions: 0,
    products: 0,
    testimonials: 0,
    errors: []
  };

  try {
    // 1. Categories
    for (const cat of collections) {
      if (cat.id === 'choc-bouquet') continue; // Skip existing as requested

      const { data: existing } = await supabase.from('categories').select('id').eq('slug', cat.id).single();
      if (!existing) {
        const { error } = await supabase.from('categories').insert({
          slug: cat.id,
          name: cat.label,
          description: cat.description,
          active: true
        });
        if (error) results.errors.push(`Category ${cat.id}: ${error.message}`);
        else results.categories++;
      }
    }

    // 2. Occasions
    for (const occ of occasions) {
      const { data: existing } = await supabase.from('occasions').select('id').eq('slug', occ.id).single();
      if (!existing) {
        const { error } = await supabase.from('occasions').insert({
          slug: occ.id,
          name: occ.label,
          image_url: occ.image,
          active: true
        });
        if (error) results.errors.push(`Occasion ${occ.id}: ${error.message}`);
        else results.occasions++;
      }
    }

    // Fetch created categories and occasions to map UUIDs
    const { data: cats } = await supabase.from('categories').select('id, slug');
    const { data: occs } = await supabase.from('occasions').select('id, slug');

    // 3. Products
    for (const prod of products) {
      let cat = cats?.find(c => c.slug === prod.collection);
      if (!cat) {
        // Fallback robust mapping if the expected category doesn't exist
        console.warn(`Category ${prod.collection} not found for ${prod.title}. Using fallback.`);
        cat = cats?.find(c => c.slug === 'gift-hampers') || cats?.[0];
      }
      
      if (!cat) {
        results.errors.push(`Could not find any category for product ${prod.title}`);
        continue;
      }

      const { data: existingProd } = await supabase.from('products').select('id').eq('title', prod.title).single();
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
          results.errors.push(`Product ${prod.title}: ${insertError.message}`);
          continue;
        }
        productId = newProd.id;
        results.products++;
      } else {
        productId = existingProd.id;
      }

      // Insert product_occasions
      for (const occSlug of prod.occasions) {
        const occasion = occs?.find(o => o.slug === occSlug);
        if (occasion && productId) {
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
      const { data: existing } = await supabase.from('testimonials').select('id').eq('name', test.name).single();
      if (!existing) {
        const { error } = await supabase.from('testimonials').insert({
          name: test.name,
          location: test.location,
          rating: test.rating,
          text: test.text,
          visible: test.visible
        });
        if (error) results.errors.push(`Testimonial ${test.name}: ${error.message}`);
        else results.testimonials++;
      }
    }

    console.log('Migration complete!', results);
    return results;

  } catch (err) {
    console.error('Migration failed:', err);
    results.errors.push(err.message);
    return results;
  }
};
