import { getDotLine } from "./getDotLine";

export const sortDotsByActivityHistory = ({ activityHistory, dots }) => {
  const indexLookup = Object.fromEntries(
    activityHistory.map((dataKey, index) => [dataKey, index])
  );

  const lookupIndex = (dataKey) =>
    dataKey in indexLookup ? indexLookup[dataKey] : -1;

  return [...dots].sort(
    (dotA, dotB) =>
      lookupIndex(getDotLine(dotA)) - lookupIndex(getDotLine(dotB))
  );
};
