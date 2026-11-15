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
 * Helper to convert a File to a compressed base64 data URL if storage upload fails or bucket is not created
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If it's an image, compress slightly via canvas
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, 0.82));
          return;
        }
        resolve(img.src);
      };
      img.onerror = () => {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(fallbackReader.result as string);
        fallbackReader.readAsDataURL(file);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Uploads a file directly to Supabase Storage with bucket auto-detection and public URL retrieval.
 * If storage bucket is missing, falls back to a persistent base64 data URL so it displays anywhere and in Supabase.
 */
export async function uploadToStorage(
  file: File,
  bucket: 'product-images' | 'promotions' = 'product-images',
  folder: string = 'uploads'
): Promise<{ url: string | null; error: string | null }> {
  // 1. Try server-side upload endpoint (/api/upload)
  if (typeof window !== 'undefined') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          return { url: json.url, error: null };
        }
      }
    } catch {
      // Proceed to Supabase fallback
    }
  }

  // 2. Try Supabase Storage
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}-${cleanFileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn(`Storage bucket "${bucket}" not available (${error.message}). Saving as persistent data URL.`);
      const base64Url = await fileToBase64(file);
      return { url: base64Url, error: null };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Storage upload exception, converting to persistent data URL:', err);
    const base64Url = await fileToBase64(file);
    return { url: base64Url, error: null };
  }
}
