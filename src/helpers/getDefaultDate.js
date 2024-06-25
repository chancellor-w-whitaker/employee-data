import { fileToDate } from "./fileToDate";

export const getDefaultDate = (fileList) => {
  const defaultFile = fileList.find(
    ({ default: isDefault }) => isDefault === "Y"
  );

  return fileToDate(defaultFile);
};
