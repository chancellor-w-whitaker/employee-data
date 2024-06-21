import { useCallback, useMemo } from "react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { useResettableState } from "./hooks/useResettableState";
import { fileListPromise } from "./constants/fileListPromise";
import { MainContainer } from "./components/MainContainer";
import { usePromise } from "./hooks/usePromise";
import { usePopover } from "./hooks/usePopover";
import { pivotData } from "./helpers/pivotData";
import { isNumeric } from "./helpers/isNumeric";
import { Content } from "./components/Content";
import { Button } from "./components/Button";

const pivotDefs = {
  groupBy: ["JOB_ECLS_FT_PT", "JOB_TYPE"],
  sumUp: ["total"],
  pivotOn: "date",
};

const { groupBy, sumUp } = pivotDefs;

const measure = sumUp[0];

const fileToDateObject = (file) => {
  if (file) {
    const { month, year, day } = file;

    const monthIndex = month - 1;

    return new Date(year, monthIndex, day);
  }
  return new Date();
};

const makeDataAggregable = ({ dataArrays, dataFiles }) =>
  dataArrays
    .map((rows, index) =>
      rows.map((row) => {
        const file = dataFiles[index];

        const dateString = fileToDateObject(file).toLocaleDateString();

        const rowWithNumericValues = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            sumUp.includes(key) && isNumeric(value) ? Number(value) : value,
          ])
        );

        return { ...rowWithNumericValues, date: dateString };
      })
    )
    .flat();

const getChartData = (data) => {
  const pivotedData = pivotData({ ...pivotDefs, data });

  return pivotedData.rowData.map((element) => {
    const entries = Object.entries(element);

    const group = entries
      .filter(([key, value]) => typeof value !== "object")
      .sort(([keyA], [keyB]) => groupBy.indexOf(keyA) - groupBy.indexOf(keyB))
      .map(([key, value]) => value)
      .join(" ");

    const valueEntries = entries
      .filter(([key, value]) => typeof value === "object")
      .map(([key, value]) => [key, value[measure]]);

    const object = { group, ...Object.fromEntries(valueEntries) };

    return object;
  });
};

const getInitialCalendarDate = (fileList) => {
  const defaultFile = fileList.find(
    ({ default: isDefault }) => isDefault === "Y"
  );

  if (defaultFile) {
    const { month, year, day } = defaultFile;

    const monthIndex = month - 1;

    return new Date(year, monthIndex, day);
  }

  return new Date();
};

const findFilesOfDate = ({ fileList, date }) => {
  const [month, day] = date.toLocaleDateString().split("/");

  return fileList.filter(
    ({ month: fileMonth, day: fileDay }) =>
      `${fileMonth}` === month && `${fileDay}` === day
  );
};

const getDataArraysPromise = (dataFiles) => {
  return Promise.all(dataFiles.map(({ web_path }) => csv(web_path)));
};

export default function App() {
  const fileList = usePromise(fileListPromise);

  const initialDate = useMemo(
    () => getInitialCalendarDate(fileList),
    [fileList]
  );

  const [date, setDate] = useResettableState(initialDate);

  const filesMatchingDate = useMemo(
    () => findFilesOfDate({ fileList, date }),
    [date, fileList]
  );

  const dataArraysPromise = useMemo(
    () => getDataArraysPromise(filesMatchingDate),
    [filesMatchingDate]
  );

  const dataArrays = usePromise(dataArraysPromise);

  const aggregableData = useMemo(
    () =>
      makeDataAggregable({
        dataFiles: filesMatchingDate,
        dataArrays,
      }),
    [dataArrays, filesMatchingDate]
  );

  const chartData = useMemo(
    () => getChartData(aggregableData),
    [aggregableData]
  );

  console.log(chartData);

  // const uniqueValues = useMemo(() => {
  //   const savedValues = {};

  //   rowData.forEach((row) =>
  //     Object.keys(row).forEach((key) => {
  //       if (!(key in savedValues)) savedValues[key] = new Set();

  //       const set = savedValues[key];

  //       const value = row[key];

  //       set.add(value);
  //     })
  //   );

  //   const savedValuesSorted = Object.fromEntries(
  //     Object.entries(savedValues).map(([key, set]) => [key, [...set].sort()])
  //   );

  //   return savedValuesSorted;
  // }, [rowData]);

  const { popover, isOpen, open } = usePopover();

  const setOfDatesWithData = useMemo(
    () =>
      new Set(
        fileList.map((file) => fileToDateObject(file).toLocaleDateString())
      ),
    [fileList]
  );

  const tileDisabled = useCallback(
    ({ date }) => !setOfDatesWithData.has(date.toLocaleDateString()),
    [setOfDatesWithData]
  );

  return (
    <MainContainer>
      <Content>
        <div className="position-relative">
          <Button
            className="shadow-sm bg-gradient"
            active={isOpen}
            onClick={open}
          >
            <i className="bi bi-calendar"></i>
          </Button>
          {isOpen && (
            <div className="position-absolute" ref={popover}>
              <Calendar
                tileDisabled={tileDisabled}
                className="shadow"
                onChange={setDate}
                value={date}
              ></Calendar>
            </div>
          )}
        </div>
      </Content>
    </MainContainer>
  );
}
