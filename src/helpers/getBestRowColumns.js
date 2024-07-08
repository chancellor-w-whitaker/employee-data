const initArrayOfSize = (length = 5) => {
  return Array.from({ length }, (x, i) => i + 1);
};

export const getBestRowColumns = ({ minColWidth = 125, count, width }) => {
  const mods = initArrayOfSize(count)
    .map((rowColumns) => ({
      columnSize: width / rowColumns,
      mod: count % rowColumns,
      rowColumns,
    }))
    .filter(({ columnSize }) => columnSize >= minColWidth)
    .sort((a, b) => b.rowColumns - a.rowColumns)
    .sort((a, b) => b.mod - a.mod);

  const best = mods[0];

  const zeros = mods.filter(
    ({ columnSize, mod }) => mod === 0 && columnSize <= best.columnSize
  );

  const collection = [...zeros, ...mods.filter(({ mod }) => mod !== 0)];

  return collection[0];
};
