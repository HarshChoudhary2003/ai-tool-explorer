import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  startOnMount: boolean = true
) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const countRef = useRef(0);
  const rafRef = useRef<number>();

  const startAnimation = () => {
    if (end === 0 || isAnimating) return;
    
    setIsAnimating(true);
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOut);
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsAnimating(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startOnMount && end > 0) {
      startAnimation();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, startOnMount]);

  return { count, isAnimating, startAnimation };
}
