import { constants } from "../constants";

const { isDefaultKey } = constants;

export const findDefaultFile = (fileList) =>
  fileList.find(({ [isDefaultKey]: isDefault }) => isDefault === "Y");
