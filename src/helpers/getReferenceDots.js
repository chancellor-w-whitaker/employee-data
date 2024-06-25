import { constants } from "../constants";

export const getReferenceDots = ({ chartData, lines }) => {
  const dataKeyColors = Object.fromEntries(
    lines.map(({ dataKey, stroke }) => [dataKey, stroke])
  );

  const dots = chartData
    .map((element) =>
      Object.entries(dataKeyColors).map(([lineDataKey, stroke]) => ({
        onMouseEnter: (e) => console.log(e),
        onMouseLeave: (e) => console.log(e),
        x: element[xAxisDataKey],
        y: element[lineDataKey],
        strokeWidth: "none",
        fill: stroke,
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
