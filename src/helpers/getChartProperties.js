import { constants } from "../constants";
import { pivotData } from "./pivotData";

export const getChartProperties = (aggregableData) => {
  const pivotedData = pivotData({ ...pivotDefs, data: aggregableData });

  const groupData = pivotedData.rowData.map((row) => {
    const group = groupBy.map((key) => row[key]).join(" ");

    const dateValues = Object.fromEntries(
      Object.entries(row)
        .filter(([key, value]) => typeof value === "object")
        .map(([key, object]) => [key, object[activeNumericColumn]])
    );

    return { group, ...dateValues };
  });

  const dates = {};

  groupData.forEach((row) => {
    Object.keys(row)
      .filter((key) => key !== "group")
      .forEach((dateString) => {
        if (!(dateString in dates)) {
          dates[dateString] = { [xAxisDataKey]: dateString };
        }

        const chartElement = dates[dateString];

        const [xAxisValue, yAxisValue] = [row.group, row[dateString]];

        chartElement[xAxisValue] = yAxisValue;
      });
  });

  const data = Object.values(dates).sort(
    ({ [xAxisDataKey]: dateA }, { [xAxisDataKey]: dateB }) =>
      new Date(dateA) - new Date(dateB)
  );

  const lines = groupData.map(({ group: dataKey }) => linePropsLookup[dataKey]);

  return { lines, data };
};

const { linePropsLookup, pivotDefs } = constants;

const { pivotOn: xAxisDataKey, groupBy, sumUp } = pivotDefs;

const activeNumericColumn = sumUp[0];
