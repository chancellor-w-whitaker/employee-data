export const filterDataByCheckboxes = ({ isChecked, data }) =>
  data.filter((row) => {
    for (let name of Object.keys(row)) {
      const value = row[name];

      if (!isChecked({ value, name })) return false;
    }

    return true;
  });
