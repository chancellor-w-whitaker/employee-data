import { useCallback, useState } from "react";

export const useIsLineAnimationActive = () => {
  const [isAnimationActive, setIsAnimationActive] = useState(null);

  const onAnimationStart = useCallback(() => setIsAnimationActive(true), []);

  const onAnimationEnd = useCallback(() => setIsAnimationActive(false), []);

  return {
    isLineAnimationActive: isAnimationActive,
    onAnimationStart,
    onAnimationEnd,
  };
};
