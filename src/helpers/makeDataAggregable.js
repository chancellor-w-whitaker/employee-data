import { fileToDate } from "./fileToDate";
import { constants } from "../constants";

export const makeDataAggregable = ({ dataArrays, dataFiles }) => {
  return dataArrays
    .map((array, index) =>
      array.map((row) => {
        const rowDate = fileToDate(dataFiles[index]).toLocaleDateString();

        const numericValues = Object.fromEntries(
          Object.keys(row)
            .filter((key) => numericColumns.includes(key))
            .map((key) => [key, Number(row[key])])
        );

        return {
          ...row,
          ...numericValues,
          [pivotOn]: rowDate,
        };
      })
    )
    .flat();
};

const {
  pivotDefs: { sumUp: numericColumns, pivotOn },
} = constants;
