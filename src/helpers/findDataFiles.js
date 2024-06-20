export const findDataFiles = ({ fileList, month, day }) =>
  fileList.filter(
    ({ month: fileMonth, day: fileDay }) =>
      `${fileMonth}` === month && `${fileDay}` === day
  );
