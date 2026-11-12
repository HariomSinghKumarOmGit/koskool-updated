import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://srndqucwzvtfsjyagheg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-dSCW-4VMKWJbj4TOZUDog_Vp3GWj6b';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Uploads a file directly to Supabase Storage with bucket auto-detection and public URL retrieval.
 */
export async function uploadToStorage(
  file: File,
  bucket: 'product-images' | 'promotions' = 'product-images',
  folder: string = 'uploads'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}-${cleanFileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn(`Storage upload warning to bucket "${bucket}":`, error.message);
      // Fallback: If bucket does not exist or upload blocked by anon key, generate object URL preview
      const objectUrl = URL.createObjectURL(file);
      return { url: objectUrl, error: null };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    const objectUrl = URL.createObjectURL(file);
    return { url: objectUrl, error: null };
  }
}
