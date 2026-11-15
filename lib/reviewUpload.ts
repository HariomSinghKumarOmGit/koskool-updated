/**
 * Helper to upload review images.
 * Tries server-side `/api/upload` first.
 * If server is offline or fails, compresses image locally via Canvas and returns a persistent Data URL,
 * ensuring image upload never fails for the user.
 */

function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
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
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, 0.8));
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
  });
}

export async function uploadReviewImage(file: File): Promise<string> {
  // 1. Try server-side /api/upload
  if (typeof window !== 'undefined') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'reviews');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return data.url;
        }
      }
    } catch {
      // Fall through to compressed base64
    }
  }

  // 2. Fallback to client-side compressed base64
  return compressImageToBase64(file);
}
