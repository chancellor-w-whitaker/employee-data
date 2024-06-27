import { getDotLine } from "./getDotLine";

export const sortReferenceDotsByHistory = ({ referenceDots, history }) => {
  const indexLookup = Object.fromEntries(
    history.map((dataKey, index) => [dataKey, index])
  );

  const lookupIndex = (dataKey) =>
    dataKey in indexLookup ? indexLookup[dataKey] : -1;

  return [...referenceDots].sort(
    (dotA, dotB) =>
      lookupIndex(getDotLine(dotA)) - lookupIndex(getDotLine(dotB))
  );
};
