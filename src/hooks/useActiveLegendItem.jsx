import { useCallback, useState } from "react";

export const useActiveLegendItem = () => {
  const [{ isActive, stack }, setState] = useState({
    isActive: false,
    stack: [],
  });

  const lastDataKey = stack[stack.length - 1];

  const onMouseEnter = useCallback(
    ({ dataKey }) =>
      setState(({ stack }) => ({
        stack: [...stack.filter((key) => key !== dataKey), dataKey],
        isActive: true,
      })),
    []
  );

  const onMouseLeave = useCallback(
    () =>
      setState(({ stack }) => ({
        isActive: false,
        stack,
      })),
    []
  );

  return { history: stack, onMouseEnter, onMouseLeave, lastDataKey, isActive };
};
