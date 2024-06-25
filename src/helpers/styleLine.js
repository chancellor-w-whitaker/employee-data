import { constants } from "../constants";

export const styleLine = ({ activeDataKey, dataKey }) =>
  dataKey === activeDataKey ? emphasisStyle : null;

const { emphasisStyle } = constants;
