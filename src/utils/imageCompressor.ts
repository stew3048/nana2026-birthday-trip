/**
 * Image compression utility to ensure uploaded photos stay lightweight,
 * fast-loading, and well within Firestore and LocalStorage limits.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.75
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('請選取有效的圖片格式 (JPG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('讀取圖片檔案失敗'));
    reader.onload = (e) => {
      const srcUrl = e.target?.result as string;
      if (!srcUrl) {
        reject(new Error('圖片內容為空'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('解析圖片失敗，請嘗試其他圖片'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.warn('Canvas 2D context not available, using raw image');
          resolve(srcUrl);
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as Web-optimized JPEG
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          const origSizeKb = Math.round(file.size / 1024);
          const newSizeKb = Math.round((compressed.length * 3) / 4 / 1024);
          console.log(`[ImageCompressor] Photo optimized: ${origSizeKb}KB -> ${newSizeKb}KB (${width}x${height})`);
          resolve(compressed);
        } catch (err) {
          console.warn('Failed to encode canvas to JPEG:', err);
          resolve(srcUrl);
        }
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  });
}
