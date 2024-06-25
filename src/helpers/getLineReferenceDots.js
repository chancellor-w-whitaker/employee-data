import { constants } from "../constants";

export const getLineReferenceDots = ({ chartData, lines }) => {
  const dataKeyColors = Object.fromEntries(
    lines.map(({ dataKey, stroke }) => [dataKey, stroke])
  );

  const dots = chartData
    .map((element) =>
      Object.entries(dataKeyColors).map(([dataKey, stroke]) => ({
        className: "recharts-dot recharts-line-dot",
        x: element[xAxisDataKey],
        y: element[dataKey],
        strokeWidth: 2,
        fill: stroke,
        dataKey,
        stroke,
        r: 5,
      }))
    )
    .flat();

  return dots;
};

const {
  pivotDefs: { pivotOn: xAxisDataKey },
} = constants;
