import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useScrollReveal — lightweight IntersectionObserver hook.
 * Returns a ref to attach + a boolean `isVisible`.
 * Once visible, stays visible (no re-animation on scroll back).
 *
 * @param {Object} options
 * @param {number} options.threshold - 0–1, fraction visible before triggering (default 0.1)
 * @param {string} options.rootMargin - CSS margin string (default '0px 0px -40px 0px')
 */
export const useScrollReveal = ({ threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin]);

  return { ref, isVisible };
};

/**
 * ScrollReveal wrapper component.
 * Wraps children and applies the scroll-reveal CSS class.
 *
 * @param {string} className - extra classes
 * @param {string} variant - 'up' | 'scale' (default 'up')
 * @param {number} delay - stagger delay in ms
 * @param {React.ReactNode} children
 */
export const ScrollReveal = ({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  threshold = 0.1,
  as: Tag = 'div',
  ...rest
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold });

  const baseClass = variant === 'scale' ? 'scroll-reveal-scale' : 'scroll-reveal';

  return (
    <Tag
      ref={ref}
      className={`${baseClass} ${isVisible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default ScrollReveal;
