'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// Smoothly scroll to the top over a fixed duration (ms) using requestAnimationFrame,
// so the motion is consistent across browsers (native 'smooth' can feel instant).
function scrollToTopSlow(duration = 600) {
  const start = window.scrollY;
  if (start === 0) return;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // easeInOutCubic for a gentle, slightly slower feel
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, start * (1 - eased));
    if (elapsed < duration) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// On the server-rendered browse pages, scroll to the top of the results whenever
// the URL search params change (page / search / category), so navigating to the
// next page always shows the first item of that page.
export default function ScrollToTop() {
  const params = useSearchParams();
  const key = params.toString();
  const prev = useRef(key);

  useEffect(() => {
    if (prev.current !== key) {
      prev.current = key;
      scrollToTopSlow();
    }
  }, [key]);

  return null;
}
