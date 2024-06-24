import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import Calendar from "react-calendar";
import { useMemo } from "react";
import { csv } from "d3-fetch";

import { useResettableState } from "./hooks/useResettableState";
import { usePromise } from "./hooks/usePromise";
import { pivotData } from "./helpers/pivotData";

export default function MyApp() {
  const fileList = usePromise(fileListPromise);

  const defaultDate = useMemo(() => {
    const defaultFile = fileList.find(
      ({ default: isDefault }) => isDefault === "Y"
    );

    return fileToDate(defaultFile);
  }, [fileList]);

  const [date, setDate] = useResettableState(defaultDate);

  const dataFiles = useMemo(() => {
    const [calendarMonth, calendarDay] = date.toLocaleDateString().split("/");

    return fileList.filter(
      ({ month, day }) => month === calendarMonth && day === calendarDay
    );
  }, [date, fileList]);

  const dataArraysPromise = useMemo(
    () => Promise.all(dataFiles.map(({ web_path }) => csv(web_path))),
    [dataFiles]
  );

  const dataArrays = usePromise(dataArraysPromise);

  const aggregableData = useMemo(() => {
    return dataArrays
      .map((array, index) =>
        array.map((row) => {
          const rowDate = fileToDate(dataFiles[index]).toLocaleDateString();

          const numericValues = Object.fromEntries(
            Object.keys(row)
              .filter((key) => numericColumns.includes(key))
              .map((key) => [key, Number(row[key])])
          );

          return {
            ...row,
            ...numericValues,
            date: rowDate,
          };
        })
      )
      .flat();
  }, [dataArrays, dataFiles]);

  /*
    [
	    { date: dateStringA, groupA: number, groupB: number, ..., groupZ: number },
	    { date: dateStringB, groupA: number, groupB: number, ..., groupZ: number },
	    ...,
	    { date: dateStringZ, groupA: number, groupB: number, ..., groupZ: number }
    ]

    meaning, date is xAxisDataKey, groups are lineDataKeys
  */

  const { lines, data } = useMemo(() => {
    const pivotedData = pivotData({ ...pivotDefs, data: aggregableData });

    const groupData = pivotedData.rowData.map((row) => {
      const group = groupBy.map((key) => row[key]).join(" ");

      const dateValues = Object.fromEntries(
        Object.entries(row)
          .filter(([key, value]) => typeof value === "object")
          .map(([key, object]) => [key, object[activeNumericColumn]])
      );

      return { group, ...dateValues };
    });

    const dates = {};

    groupData.forEach((row) => {
      Object.keys(row)
        .filter((key) => key !== "group")
        .forEach((dateString) => {
          if (!(dateString in dates)) {
            dates[dateString] = { date: dateString };
          }

          const chartElement = dates[dateString];

          const [xAxisValue, yAxisValue] = [row.group, row[dateString]];

          chartElement[xAxisValue] = yAxisValue;
        });
    });

    const data = Object.values(dates);

    const lines = groupData.map(({ group }) => ({
      type: "monotone",
      dataKey: group,
    }));

    return { lines, data };
  }, [aggregableData]);

  return (
    <div>
      <Calendar onChange={setDate} value={date} />
      <ResponsiveContainer height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line {...line} key={line.dataKey}></Line>
          ))}
          {/* <Line
            activeDot={{ r: 8 }}
            stroke="#8884d8"
            type="monotone"
            dataKey="pv"
          /> */}
          {/* <Line stroke="#82ca9d" type="monotone" dataKey="uv" /> */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const fileToDate = (file) => {
  if (file) {
    const { month, year, day } = file;

    const monthIndex = month - 1;

    return new Date(year, monthIndex, day);
  }

  return new Date();
};

const pivotDefs = {
  groupBy: ["JOB_ECLS_FT_PT", "JOB_TYPE"],
  sumUp: ["total"],
  pivotOn: "date",
};

const { sumUp: numericColumns, pivotOn: xAxisDataKey, groupBy } = pivotDefs;

const activeNumericColumn = numericColumns[0];

const fileListUrl = "Data/_fileList.csv";

const fileListPromise = csv(fileListUrl);
