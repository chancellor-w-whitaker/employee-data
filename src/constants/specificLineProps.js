import { constants } from ".";

const { expectedGroups } = constants;

export const specificLineProps = Object.fromEntries(
  Object.entries(expectedGroups).map(([dataKey, { color: stroke }]) => [
    dataKey,
    { dot: { fill: stroke }, dataKey, stroke },
  ])
);
