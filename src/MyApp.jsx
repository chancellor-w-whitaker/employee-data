import {
  ResponsiveContainer,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { useCallback, useMemo } from "react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { useResettableState } from "./hooks/useResettableState";
import { MainContainer } from "./components/MainContainer";
import { usePromise } from "./hooks/usePromise";
import { pivotData } from "./helpers/pivotData";
import { Content } from "./components/Content";

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

    const data = Object.values(dates).sort(
      ({ date: dateA }, { date: dateB }) => new Date(dateA) - new Date(dateB)
    );

    const lines = groupData.map(({ group: dataKey }) => ({
      stroke: strokeColors[dataKey],
      type: "monotone",
      strokeWidth: 2,
      dot: false,
      dataKey,
    }));

    return { lines, data };
  }, [aggregableData]);

  const validDatesSet = useMemo(
    () =>
      new Set(fileList.map((file) => fileToDate(file).toLocaleDateString())),
    [fileList]
  );

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  // ! legend hover event
  // ! dot hover event
  // ! dot style
  // ! tooltip only on dot hover
  // ! legend shapes match lines with filled dots style
  // ! filters
  // ? anything used as a prop or dependency should have optimal referential equality across renders
  // ? (won't cause unnecessary rerenders if you choose to memoize components)
  // ? and prefer using the least number of hooks required for each job, unless it is obviously inconvenient to do so

  return (
    <MainContainer>
      <Content>
        <h1 className="display-6 mb-0">Faculty/Staff Employee Data</h1>
      </Content>
      <Content>
        <Calendar
          tileDisabled={tileDisabled}
          className="shadow-sm"
          onChange={setDate}
          value={date}
        />
      </Content>
      <Content>
        <div className="fs-4">{date.toLocaleDateString()}</div>
      </Content>
      <Content>
        <ResponsiveContainer height={300}>
          <LineChart data={data}>
            <XAxis
              tickFormatter={xAxisTickFormatter}
              padding={xAxisPadding}
              dataKey={xAxisDataKey}
              tickLine={false}
            />
            <YAxis
              tickFormatter={valueFormatter}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={valueFormatter} />
            <Legend />
            {lines.map((line) => (
              <Line {...line} key={line.dataKey}></Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Content>
    </MainContainer>
  );
}

const xAxisPadding = { right: 30, left: 30 };

const xAxisTickFormatter = (dateString) => new Date(dateString).getFullYear();

const valueFormatter = (value) => value.toLocaleString();

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

const strokeColors = {
  "Part-time Faculty": "orange",
  "Part-time Student": "purple",
  "Full-time Faculty": "blue",
  "Part-time Staff": "green",
  "Full-time Staff": "red",
};

const fileListUrl = "Data/_fileList.csv";

const fileListPromise = csv(fileListUrl);
