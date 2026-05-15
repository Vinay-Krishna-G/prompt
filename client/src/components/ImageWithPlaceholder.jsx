import { useState, useCallback } from 'react';

/**
 * Dominant-color placeholder + soft progressive reveal (no layout pop-in).
 */
const ImageWithPlaceholder = ({
  src,
  alt,
  className = '',
  dominantColor = 'rgb(15 23 42)',
  onLoad,
  style,
}) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(
    (e) => {
      setLoaded(true);
      onLoad?.(e);
    },
    [onLoad],
  );

  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-premium pointer-events-none"
        style={{
          backgroundColor: dominantColor,
          opacity: loaded ? 0 : 1,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 blur-2xl scale-105 pointer-events-none transition-opacity duration-700 ease-premium"
        style={{
          backgroundColor: dominantColor,
          opacity: loaded ? 0 : 0.28,
        }}
        aria-hidden
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        className={`${className} transition-opacity duration-700 ease-premium ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={style}
      />
    </>
  );
};

export default ImageWithPlaceholder;
