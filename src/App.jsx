import { useState, useMemo } from "react";
import Calendar from "react-calendar";

import { getAllDataPromised } from "./helpers/getAllDataPromised";
import { fileToDateObject } from "./helpers/fileToDateObject";
import { fileListPromise } from "./constants/fileListPromise";
import { usePreviousState } from "./hooks/usePreviousState";
import { findDefaultFile } from "./helpers/findDefaultFile";
import { MainContainer } from "./components/MainContainer";
import { findDataFiles } from "./helpers/findDataFiles";
import { usePromise } from "./hooks/usePromise";
import { usePopover } from "./hooks/usePopover";
import { pivotRows } from "./helpers/pivotRows";
import { isNumeric } from "./helpers/isNumeric";
import { Content } from "./components/Content";
import { Button } from "./components/Button";

const pivotDefs = {
  groupBy: ["JOB_ECLS_FT_PT", "JOB_TYPE"],
  sumUp: ["total"],
  pivotOn: "date",
};

const { groupBy, sumUp } = pivotDefs;

const selectedSumUp = sumUp[0];

export default function App() {
  const fileList = usePromise(fileListPromise);

  const defaultFile = findDefaultFile(fileList);

  const defaultDate = fileToDateObject(defaultFile);

  const defaultDateAsString = defaultDate.toLocaleDateString();

  const initialDate = new Date(defaultDateAsString);

  const [date, setDate] = useState(initialDate);

  usePreviousState(defaultDateAsString, () => setDate(initialDate));

  const [month, day] = date.toLocaleDateString().split("/");

  const dataFiles = useMemo(
    () => findDataFiles({ fileList, month, day }),
    [fileList, day, month]
  );

  const allDataPromised = useMemo(
    () => getAllDataPromised(dataFiles),
    [dataFiles]
  );

  const dataArrays = usePromise(allDataPromised);

  const processedData = dataArrays
    .map((rows, index) =>
      rows.map((row) => {
        const dataFile = dataFiles[index];

        const localeDateString =
          fileToDateObject(dataFile).toLocaleDateString();

        const sumUpDefs = Object.fromEntries(
          sumUp.map((key) => [
            key,
            isNumeric(row[key]) ? Number(row[key]) : row[key],
          ])
        );

        return { ...row, ...sumUpDefs, date: localeDateString };
      })
    )
    .flat();

  const pivotedData = pivotRows({ ...pivotDefs, rows: processedData });

  const chartData = pivotedData.rowData.map((element) => {
    const entries = Object.entries(element);

    const group = entries
      .filter(([key, value]) => typeof value !== "object")
      .sort(([keyA], [keyB]) => groupBy.indexOf(keyA) - groupBy.indexOf(keyB))
      .map(([key, value]) => value)
      .join(" ");

    const valueEntries = entries
      .filter(([key, value]) => typeof value === "object")
      .map(([key, value]) => [key, value[selectedSumUp]]);

    const object = { group, ...Object.fromEntries(valueEntries) };

    return object;
  });

  console.log(chartData);

  // const uniqueValues = useMemo(() => {
  //   const savedValues = {};

  //   processedData.forEach((row) =>
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
  // }, [processedData]);

  const { popover, isOpen, open } = usePopover();

  const localeDateStringsSet = new Set(
    fileList.map((file) => fileToDateObject(file).toLocaleDateString())
  );

  const tileDisabled = ({ date }) =>
    !localeDateStringsSet.has(date.toLocaleDateString());

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
