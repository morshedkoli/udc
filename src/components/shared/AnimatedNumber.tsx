"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatter = (n) => n.toLocaleString("en-US"),
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;

      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{formatter(Math.round(display))}</>;
}
