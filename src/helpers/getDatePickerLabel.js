export const getDatePickerLabel = (date) =>
  date.toLocaleDateString(undefined, {
    month: "2-digit",
    year: "numeric",
    day: "2-digit",
  });
