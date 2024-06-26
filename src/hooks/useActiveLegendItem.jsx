import { useCallback, useState } from "react";

export const useActiveLegendItem = () => {
  const [{ isCurrentlyActive, history }, setState] = useState({
    isCurrentlyActive: false,
    history: [],
  });

  const dataKey = history[history.length - 1];

  const onMouseEnter = useCallback(
    ({ dataKey }) =>
      setState(({ history }) => ({
        history: [...history.filter((key) => key !== dataKey), dataKey],
        isCurrentlyActive: true,
      })),
    []
  );

  const onMouseLeave = useCallback(
    () =>
      setState(({ history }) => ({
        isCurrentlyActive: false,
        history,
      })),
    []
  );

  return {
    isCurrentlyActive,
    onMouseEnter,
    onMouseLeave,
    dataKey,
    history,
  };
};
