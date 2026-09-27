import { supabase } from '../lib/supabaseClient';
import { validateImageUrl, getFallbackImage } from '../lib/imageUtils';

export const fixBrokenImages = async () => {
  console.log('Starting image validation and fix...');
  const results = {
    occasionsChecked: 0,
    occasionsFixed: 0,
    productsChecked: 0,
    productsFixed: 0,
    errors: []
  };

  try {
    // 1. Fetch occasions
    const { data: occasions, error: occError } = await supabase.from('occasions').select('*');
    if (occError) throw occError;

    for (const occ of occasions) {
      results.occasionsChecked++;
      const isValid = await validateImageUrl(occ.image_url);
      
      if (!isValid) {
        const fallback = getFallbackImage(occ.name || occ.slug);
        const { error } = await supabase
          .from('occasions')
          .update({ image_url: fallback })
          .eq('id', occ.id);
          
        if (error) {
          results.errors.push(`Failed to update occasion ${occ.name}: ${error.message}`);
        } else {
          results.occasionsFixed++;
          console.log(`Fixed occasion image for: ${occ.name}`);
        }
      }
    }

    // 2. Fetch products
    const { data: products, error: prodError } = await supabase.from('products').select(`*, categories (name)`);
    if (prodError) throw prodError;

    for (const prod of products) {
      results.productsChecked++;
      const isValid = await validateImageUrl(prod.image_url);
      
      if (!isValid) {
        const fallback = getFallbackImage(prod.title || prod.categories?.name);
        const { error } = await supabase
          .from('products')
          .update({ image_url: fallback })
          .eq('id', prod.id);
          
        if (error) {
          results.errors.push(`Failed to update product ${prod.title}: ${error.message}`);
        } else {
          results.productsFixed++;
          console.log(`Fixed product image for: ${prod.title}`);
        }
      }
    }

    console.log('Image fix complete!', results);
    return results;

  } catch (err) {
    console.error('Fix failed:', err);
    results.errors.push(err.message);
    return results;
  }
};
