import { useCallback, useState, useMemo } from "react";

import { getDotLine } from "../helpers/getDotLine";
import { constants } from "../constants";

export const useActiveLineReferenceDot = ({ activeLine, dots }) => {
  const [id, setId] = useState(null);

  const onMouseEnter = useCallback(({ id }) => setId(id), []);

  const onMouseLeave = useCallback(() => setId(null), []);

  const activeDot = useMemo(
    () => dots.find(({ id: dotId }) => dotId === id),
    [dots, id]
  );

  const style = useCallback(
    (dot) =>
      dot === activeDot || getDotLine(dot) === activeLine
        ? dropShadowStyle
        : null,
    [activeDot, activeLine]
  );

  const isTooltipActive = activeDot ? true : false;

  return { isTooltipActive, onMouseEnter, onMouseLeave, style };
};

const { dropShadowStyle } = constants;
