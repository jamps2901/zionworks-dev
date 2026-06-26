import { useState, useEffect } from 'react';
import { createIntersectionObserver, preloadImage } from '@/lib/performance';

interface UseOptimizedImagesProps {
  images: string[];
  preloadFirst?: number;
}

export const useOptimizedImages = ({ images, preloadFirst = 2 }: UseOptimizedImagesProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload the first few images immediately
    const preloadImages = images.slice(0, preloadFirst);
    
    Promise.all(preloadImages.map(preloadImage))
      .then(() => {
        setLoadedImages(new Set(preloadImages));
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Set up intersection observer for remaining images
    if (images.length > preloadFirst) {
      const observer = createIntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !loadedImages.has(src)) {
              preloadImage(src).then(() => {
                setLoadedImages(prev => new Set([...prev, src]));
                img.src = src;
                observer.unobserve(img);
              });
            }
          }
        });
      });

      // Store observer reference for cleanup
      return () => observer.disconnect();
    }
  }, [images, preloadFirst]);

  return { loadedImages, isLoading };
};

// Hook for individual image lazy loading
export const useLazyImage = (src: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setLoaded(false);
    };
    
    img.src = src;
  }, [src]);

  return { loaded, error };
};