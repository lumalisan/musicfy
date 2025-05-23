import { useState, useEffect } from 'react';

type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

/**
 * Custom React hook to get the current window size.
 *
 * @returns {WindowSize} An object containing the current width and height of the window.
 * Returns undefined for width and height during server-side rendering
 * or before the first client-side render.
 *
 * @example
 * const { width, height } = useWindowSize();
 * if (width && width < 768) {
 * // Mobile view
 * }
 */
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Check if window object is available
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);

      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }

    // If window is not defined (e.g., during SSR), do nothing and rely on initial state.
    return undefined;
  }, []);

  return windowSize;
};
