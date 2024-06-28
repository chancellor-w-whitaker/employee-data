import { getDotLine } from "./getDotLine";
import { constants } from "../constants";
import { isNumeric } from "./isNumeric";

export const getChangeFromPreviousPoint = ({ point, data }) => {
  const line = point ? getDotLine(point) : null;

  const indexOfCurrentX = point
    ? data.findIndex(({ [xAxisDataKey]: xValue }) => xValue === point.x)
    : -1;

  const previousDataElement =
    indexOfCurrentX > 0 ? data[indexOfCurrentX - 1] : null;

  const previousY = previousDataElement ? previousDataElement[line] : null;

  const currentY = point ? point.y : null;

  const change =
    isNumeric(currentY) && isNumeric(previousY) ? currentY - previousY : null;

  return change;
};

const {
  pivotDefs: { pivotOn: xAxisDataKey },
} = constants;
