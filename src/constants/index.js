import { csv } from "d3-fetch";

export const constants = {
  expectedGroups: {
    "Part-time Faculty": { color: "orange" },
    "Part-time Student": { color: "purple" },
    "Full-time Faculty": { color: "blue" },
    "Part-time Staff": { color: "green" },
    "Full-time Staff": { color: "red" },
  },
  pivotDefs: {
    groupBy: ["JOB_ECLS_FT_PT", "JOB_TYPE"],
    sumUp: ["total"],
    pivotOn: "date",
  },
  xAxisTickFormatter: (dateString) => new Date(dateString).getFullYear(),
  genericLineProps: { type: "monotone", strokeWidth: 2 },
  valueFormatter: (value) => value.toLocaleString(),
  fileListPromise: csv("Data/_fileList.csv"),
  xAxisPadding: { right: 30, left: 30 },
};
