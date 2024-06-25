export const getDataFiles = ({ fileList, date }) => {
  const [calendarMonth, calendarDay] = date.toLocaleDateString().split("/");

  return fileList.filter(
    ({ month, day }) => month === calendarMonth && day === calendarDay
  );
};
