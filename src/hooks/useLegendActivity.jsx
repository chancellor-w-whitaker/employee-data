import { useCallback, useState } from "react";

import { constants } from "../constants";

export const useLegendActivity = () => {
  const [{ isActive, history }, setState] = useState({
    isActive: false,
    history: [],
  });

  const onMouseEnter = useCallback(
    ({ dataKey }) =>
      setState(({ history: dataKeys }) => ({
        history: [...dataKeys.filter((key) => key !== dataKey), dataKey],
        isActive: true,
      })),
    []
  );

  const onMouseLeave = useCallback(
    () => setState(({ history }) => ({ isActive: false, history })),
    []
  );
  const lastDataKey = history[history.length - 1];

  const activeDataKey = isActive ? lastDataKey : null;

  const style = useCallback(
    ({ dataKey }) => (dataKey === activeDataKey ? dropShadowStyle : null),
    [activeDataKey]
  );

  return { activeDataKey, onMouseEnter, onMouseLeave, history, style };
};

const { dropShadowStyle } = constants;
