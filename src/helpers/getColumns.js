import { constants } from "../constants";

export const getColumns = (data) => {
  const sets = {};

  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = row[key];

      if (!(key in sets)) sets[key] = new Set();

      sets[key].add(value);
    });
  });

  const arrays = Object.fromEntries(
    Object.entries(sets).map(([key, set]) => [key, [...set].sort()])
  );

  const headerNameLookup = Object.fromEntries(
    columnDefs.map(({ headerName, field }) => [field, headerName])
  );

  const columns = Object.keys(arrays)
    .map((field) => ({
      headerName: field in headerNameLookup ? headerNameLookup[field] : field,
      values: arrays[field],
      field,
    }))
    .filter(({ field }) => !sumUp.includes(field) && field !== pivotOn);

  const fieldIndexedColumns = Object.fromEntries(
    columns.map((column) => [column.field, column])
  );

  return fieldIndexedColumns;
};

const {
  pivotDefs: { pivotOn, sumUp },
  columnDefs,
} = constants;
