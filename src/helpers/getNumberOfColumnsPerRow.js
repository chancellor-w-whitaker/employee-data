const initializeArrayOfLength = (length = 5) => {
  return Array.from({ length }, (x, i) => i + 1);
};

export const getNumberOfColumnsPerRow = ({
  minimumColumnSize = 125,
  length,
  width,
}) => {
  const remainders = initializeArrayOfLength(length)
    .map((rowColumns) => ({
      columnSize: width / rowColumns,
      remainder: length % rowColumns,
      rowColumns,
    }))
    .filter(({ columnSize }) => columnSize >= minimumColumnSize)
    .sort((a, b) => b.rowColumns - a.rowColumns)
    .sort((a, b) => b.remainder - a.remainder);

  const best = remainders[0];

  const zeros = remainders.filter(
    ({ columnSize, remainder }) =>
      remainder === 0 && columnSize <= best.columnSize
  );

  const collection = [
    ...zeros,
    ...remainders.filter(({ remainder }) => remainder !== 0),
  ];

  return collection[0]?.rowColumns;
};
