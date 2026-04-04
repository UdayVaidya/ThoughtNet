import { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

/**
 * Scramble hook — uses a single RAF loop instead of rapid setTimeouts.
 * Much cheaper on re-renders; runs ~60fps throttled to speed param.
 */
export function useScramble(text, speed = 38, shuffles = 5) {
  const [display, setDisplay] = useState(text || '');
  const rafRef    = useRef(null);
  const startRef  = useRef(null);
  const textRef   = useRef(text);

  useEffect(() => {
    textRef.current = text;
    if (!text) return;

    // Cancel previous
    cancelAnimationFrame(rafRef.current);

    const totalFrames = text.replace(/ /g, '').length * shuffles;
    startRef.current  = null;

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const frame    = Math.floor(elapsed / speed);
      const revealed = Math.min(Math.floor(frame / shuffles), text.length);

      const output = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < revealed) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplay(output);

      if (revealed < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    // Small initial delay then start
    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 150);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, shuffles]);

  return display;
}
