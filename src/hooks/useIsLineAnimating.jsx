import { useCallback, useState } from "react";

export const useIsLineAnimating = () => {
  const [state, setState] = useState(null);

  const onAnimationStart = useCallback(() => setState(true), []);

  const onAnimationEnd = useCallback(() => setState(false), []);

  return { onAnimationStart, onAnimationEnd, state };
};
