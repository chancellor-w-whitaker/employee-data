import { useCallback, useState } from "react";

export const useActiveReferenceDot = () => {
  const [coordinates, setCoordinates] = useState({});

  const onMouseEnter = useCallback(({ x, y }) => setCoordinates({ x, y }), []);

  const onMouseLeave = useCallback(() => setCoordinates({}), []);

  return { onMouseEnter, onMouseLeave, coordinates };
};
