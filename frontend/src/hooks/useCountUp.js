import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

// Animates a number from 0 → target once the element scrolls into view.
export function useCountUp(target, { duration = 1.6, decimals = 0 } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, target, duration]);

  return { ref, display: decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-PK") };
}
