import { constants } from "../constants";

export const getReferenceDots = ({ lines, data }) => {
  const dataKeyColors = Object.fromEntries(
    lines.map(({ dataKey, stroke }) => [dataKey, stroke])
  );

  const defaultProperties = {
    className: "recharts-dot recharts-line-dot",
    strokeWidth: 2,
    r: 6,
  };

  const dots = data
    .map((element) =>
      Object.entries(dataKeyColors).map(([lineDataKey, stroke]) => ({
        ...defaultProperties,
        id: `${lineDataKey}→${element[xAxisDataKey]}`,
        x: element[xAxisDataKey],
        y: element[lineDataKey],
        fill: stroke,
        stroke,
      }))
    )
    .flat();

  return dots;
};

const {
  pivotDefs: { pivotOn: xAxisDataKey },
} = constants;
