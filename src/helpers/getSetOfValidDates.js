import { fileToDate } from "./fileToDate";

export const getSetOfValidDates = (fileList) =>
  new Set(fileList.map((file) => fileToDate(file).toLocaleDateString()));
