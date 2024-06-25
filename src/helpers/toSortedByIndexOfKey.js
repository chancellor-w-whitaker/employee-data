export const toSortedByIndexOfKey = ({ key = "dataKey", payload, order }) => {
  const indexLookup = Object.fromEntries(
    order.map((value, index) => [value, index])
  );

  const lookupIndex = (value) =>
    value in indexLookup ? indexLookup[value] : -1;

  return [...payload].sort(
    ({ [key]: valueA }, { [key]: valueB }) =>
      lookupIndex(valueA) - lookupIndex(valueB)
  );
};
