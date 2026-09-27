import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('Testing authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'temp_admin_seed@example.com',
    password: 'SeedPassword123!'
  });

  if (authError) {
    console.error('Auth failed:', authError.message);
    process.exit(1);
  }
  
  console.log('Logged in successfully. Testing upload...');
  
  // Use a Blob/File polyfill or just ArrayBuffer for Supabase upload
  const dummyContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]); // 1x1 png
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload('test/test-upload.png', dummyContent.buffer, {
      contentType: 'image/png',
      upsert: true
    });
    
  if (uploadError) {
    console.error('Upload failed:', uploadError.message);
    process.exit(1);
  }
  
  console.log('Upload succeeded!');
  
  console.log('Testing public URL generation...');
  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl('test/test-upload.png');
    
  console.log('Public URL:', publicUrlData.publicUrl);
  
  console.log('Testing delete (to clean up)...');
  const { error: delError } = await supabase.storage
    .from('product-images')
    .remove(['test/test-upload.png']);
    
  if (delError) {
    console.error('Delete failed:', delError.message);
    process.exit(1);
  }
  console.log('Cleanup succeeded!');
  console.log('All tests passed.');
}

testUpload();
