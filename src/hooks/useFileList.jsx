import { useCallback, useMemo } from "react";

import { getDataArraysPromise } from "../helpers/getDataArraysPromise";
import { makeDataAggregable } from "../helpers/makeDataAggregable";
import { getSetOfValidDates } from "../helpers/getSetOfValidDates";
import { getChartProperties } from "../helpers/getChartProperties";
import { getDefaultDate } from "../helpers/getDefaultDate";
import { useResettableState } from "./useResettableState";
import { getDataFiles } from "../helpers/getDataFiles";
import { usePromise } from "./usePromise";

export const useFileList = (promise) => {
  const fileList = usePromise(promise);

  const defaultDate = useMemo(() => getDefaultDate(fileList), [fileList]);

  const [date, setDate] = useResettableState(defaultDate);

  const dataFiles = useMemo(
    () => getDataFiles({ fileList, date }),
    [date, fileList]
  );

  const dataArraysPromise = useMemo(
    () => getDataArraysPromise(dataFiles),
    [dataFiles]
  );

  const dataArrays = usePromise(dataArraysPromise);

  const aggregableData = useMemo(
    () => makeDataAggregable({ dataArrays, dataFiles }),
    [dataArrays, dataFiles]
  );

  // const lists = useMemo(() => {
  //   const sets = {};

  //   aggregableData.forEach((row) => {
  //     Object.keys(row).forEach((key) => {
  //       const value = row[key];

  //       if (!(key in sets)) sets[key] = new Set();

  //       sets[key].add(value);
  //     });
  //   });

  //   const arrays = Object.fromEntries(
  //     Object.entries(sets).map(([key, set]) => [key, [...set].sort()])
  //   );

  //   const lists = Object.keys(arrays).map((name) => ({
  //     selections: sets[name],
  //     options: arrays[name],
  //     name,
  //   }));

  //   return lists;
  // }, [aggregableData]);

  const { lines, data } = useMemo(
    () => getChartProperties(aggregableData),
    [aggregableData]
  );

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  const calendarProps = { onChange: setDate, tileDisabled, value: date };

  return { lines, data, ...calendarProps };
};
