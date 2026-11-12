import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewportParam = urlParams.get('viewport') || urlParams.get('mode');
      if (viewportParam === 'mobile') return true;
      if (viewportParam === 'desktop') return false;

      const stored = localStorage.getItem('unihive_viewport_override');
      if (stored === 'mobile') return true;
      if (stored === 'desktop') return false;

      return window.innerWidth < 768;
    }
    return false;
  });

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      const urlParams = new URLSearchParams(window.location.search);
      const viewportParam = urlParams.get('viewport') || urlParams.get('mode');
      if (viewportParam === 'mobile') {
        setIsMobile(true);
        return;
      }
      if (viewportParam === 'desktop') {
        setIsMobile(false);
        return;
      }

      const stored = localStorage.getItem('unihive_viewport_override');
      if (stored === 'mobile') {
        setIsMobile(true);
        return;
      }
      if (stored === 'desktop') {
        setIsMobile(false);
        return;
      }

      setIsMobile(width < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMode = (forcedMode?: 'mobile' | 'desktop' | 'auto') => {
    if (!forcedMode || forcedMode === 'auto') {
      localStorage.removeItem('unihive_viewport_override');
      setIsMobile(window.innerWidth < 768);
    } else if (forcedMode === 'mobile') {
      localStorage.setItem('unihive_viewport_override', 'mobile');
      setIsMobile(true);
    } else {
      localStorage.setItem('unihive_viewport_override', 'desktop');
      setIsMobile(false);
    }
  };

  return { isMobile, windowWidth, toggleMobileMode };
};
