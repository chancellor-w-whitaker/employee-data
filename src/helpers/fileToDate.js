export const fileToDate = (file) => {
  if (file) {
    const { month, year, day } = file;

    const monthIndex = month - 1;

    return new Date(year, monthIndex, day);
  }

  return new Date();
};
