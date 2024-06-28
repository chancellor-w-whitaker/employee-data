import { isNumeric } from "./isNumeric";

export const getWrapperClassName = (changeFromPreviousPoint) =>
  `shadow-lg bg-${
    !isNumeric(changeFromPreviousPoint) || changeFromPreviousPoint === 0
      ? "secondary"
      : changeFromPreviousPoint < 0
      ? "danger"
      : "success"
  }-subtle`;
