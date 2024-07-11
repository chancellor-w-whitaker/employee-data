import { useCallback, useEffect, useState, useMemo } from "react";

import { filterDataByCheckboxes } from "../helpers/filterDataByCheckboxes";
import { getDataArraysPromise } from "../helpers/getDataArraysPromise";
import { makeDataAggregable } from "../helpers/makeDataAggregable";
import { getSetOfValidDates } from "../helpers/getSetOfValidDates";
import { getChartProperties } from "../helpers/getChartProperties";
import { getDefaultDate } from "../helpers/getDefaultDate";
import { useResettableState } from "./useResettableState";
import { getDataFiles } from "../helpers/getDataFiles";
import { shallowEqual } from "../helpers/shallowEqual";
import { getColumns } from "../helpers/getColumns";
import { usePromise } from "./usePromise";

export const useFileList = (promise) => {
  const fileList = usePromise(promise);

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  const defaultDate = useMemo(() => getDefaultDate(fileList), [fileList]);

  const [date, setDate] = useResettableState(defaultDate);

  const [value, onChange] = [date, setDate];

  const calendarProps = { tileDisabled, onChange, value };

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

  const columns = useMemo(() => getColumns(aggregableData), [aggregableData]);

  const [dropdownChanges, setDropdownChanges] = useState([]);

  // useEffect(() => console.log(dropdownChanges), [dropdownChanges]);

  const handleCheckboxChange = useCallback(
    ({ target: { className, checked, value, name } }) => {
      // uses className to identify whether an "All" checkbox was clicked
      const clickedAllCheckbox = className.split(" ").includes("all-checkbox");

      // element to be appended to state
      // if clickAllCheckbox, value is null (value representing "All")
      const nextElement = {
        value: clickedAllCheckbox ? null : value,
        checked,
        name,
      };

      // if clickedAllCheckbox, delete entire history of that dropdown
      // else, only delete history of clicked name + value pair
      // so, history not overwritten is kept, and "All" buttons better reflect user intent
      const filterCallbackFn = clickedAllCheckbox
        ? ({ name: elementName }) => elementName !== name
        : ({ checked, ...pair }) => !shallowEqual(pair, { value, name });

      const setStateCallbackFn = (previousState) => [
        ...previousState.filter(filterCallbackFn),
        nextElement,
      ];

      setDropdownChanges(setStateCallbackFn);
    },
    []
  );

  const dropdownState = useMemo(() => {
    const state = {};

    dropdownChanges.forEach(({ checked, value, name }) => {
      // dropdown not been discovered yet
      if (!(name in state)) {
        // initialize state of discovered dropdown
        state[name] = {
          except: { unchecked: new Set(), checked: new Set() },
          all: true,
        };
      }

      const dropdown = state[name];

      const exceptions = dropdown.except;

      // if click all checkbox
      if (value === null) {
        // record
        dropdown.all = checked;
      } else {
        if (checked) {
          exceptions.checked.add(value);
        } else {
          exceptions.unchecked.add(value);
        }
      }
    });

    return state;
  }, [dropdownChanges]);

  const isChecked = useCallback(
    ({ value, name }) => {
      const dropdownHasNeverChanged = !(name in dropdownState);

      // if dropdown has never changed, checkbox must be checked
      if (dropdownHasNeverChanged) return true;

      const {
        except: { unchecked, checked },
        all,
      } = dropdownState[name];

      const exceptions = all ? unchecked : checked;

      // clicked all checkbox
      if (value === undefined) return all && exceptions.size === 0;

      if (exceptions.has(value)) return !all;

      return all;
    },
    [dropdownState]
  );

  const filteredData = useMemo(
    () => filterDataByCheckboxes({ data: aggregableData, isChecked }),
    [aggregableData, isChecked]
  );

  const { lines, data } = useMemo(
    () => getChartProperties(filteredData),
    [filteredData]
  );

  return {
    columns: Object.values(columns),
    handleCheckboxChange,
    isChecked,
    lines,
    data,
    ...calendarProps,
  };
};
