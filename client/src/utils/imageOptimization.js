import imageCompression from 'browser-image-compression';

/**
 * Optimizes an image file before upload.
 * Only processes jpg, jpeg, png, and webp.
 * @param {File} file - The original file to compress.
 * @returns {Promise<File>} - The compressed file or the original if compression fails or file is not an image.
 */
export const optimizeImage = async (file) => {
  // Only optimize specific image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return file;
  }

  const options = {
    maxWidthOrHeight: 1600,
    initialQuality: 0.8,
    useWebWorker: true,
  };

  try {
    const originalSize = (file.size / 1024 / 1024).toFixed(2);
    console.log(`[Optimization] Original: ${originalSize} MB`);

    const compressedFile = await imageCompression(file, options);
    
    const optimizedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    console.log(`[Optimization] Optimized: ${optimizedSize} MB`);

    // Return a new File object with the same name to preserve it
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('[Optimization] Compression failed, falling back to original:', error);
    return file;
  }
};
