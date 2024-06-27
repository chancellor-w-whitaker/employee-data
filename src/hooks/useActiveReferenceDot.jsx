import { useCallback, useState, useMemo } from "react";

import { getDotLine } from "../helpers/getDotLine";
import { constants } from "../constants";

export const useActiveReferenceDot = ({ activeLegendItem, referenceDots }) => {
  const [id, setId] = useState(null);

  const onMouseEnter = useCallback(({ id }) => setId(id), []);

  const onMouseLeave = useCallback(() => setId(null), []);

  const activeReferenceDot = useMemo(
    () => referenceDots.find(({ id: dotId }) => dotId === id),
    [referenceDots, id]
  );

  const styleReferenceDot = useCallback(
    (dot) =>
      dot === activeReferenceDot || getDotLine(dot) === activeLegendItem
        ? dropShadowStyle
        : null,
    [activeReferenceDot, activeLegendItem]
  );

  const isTooltipActive = activeReferenceDot ? true : false;

  return {
    activeReferenceDot,
    styleReferenceDot,
    isTooltipActive,
    onMouseEnter,
    onMouseLeave,
  };
};

const { dropShadowStyle } = constants;
