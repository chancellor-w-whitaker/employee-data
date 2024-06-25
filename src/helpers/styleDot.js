import { constants } from "../constants";

export const styleDot = ({
  coordinates: { x, y },
  activeCoordinates,
  activeDataKey,
  dataKey,
}) =>
  dataKey === activeDataKey ||
  (x === activeCoordinates.x && y === activeCoordinates.y)
    ? emphasisStyle
    : null;

const { emphasisStyle } = constants;
