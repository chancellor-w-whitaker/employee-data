export const fileToDateObject = (file) => {
  if (file) {
    const { month, year, day } = file;

    const monthIndex = month - 1;

    return new Date(year, monthIndex, day);
  }
  return new Date();
};
