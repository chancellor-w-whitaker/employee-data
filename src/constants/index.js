import { csv } from "d3-fetch";

const expectedGroups = {
  "Part-time Faculty": { color: "orange" },
  "Part-time Student": { color: "purple" },
  "Full-time Faculty": { color: "blue" },
  "Part-time Staff": { color: "green" },
  "Full-time Staff": { color: "red" },
};

const linePropsLookup = Object.fromEntries(
  Object.entries(expectedGroups).map(([group, { color }]) => [
    group,
    {
      activeDot: false,
      type: "monotone",
      dataKey: group,
      strokeWidth: 2,
      stroke: color,
      dot: false,
    },
  ])
);

export const constants = {
  pivotDefs: {
    groupBy: ["JOB_ECLS_FT_PT", "JOB_TYPE"],
    sumUp: ["total"],
    pivotOn: "date",
  },
  dropShadowStyle: {
    filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))",
  },
  xAxisTickFormatter: (dateString) => new Date(dateString).getFullYear(),
  valueFormatter: (value) => value.toLocaleString(),
  fileListPromise: csv("Data/_fileList.csv"),
  xAxisPadding: { right: 30, left: 30 },
  linePropsLookup,
};
