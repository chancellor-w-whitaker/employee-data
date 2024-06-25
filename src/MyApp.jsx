import {
  ResponsiveContainer,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { useCallback, useState, useMemo } from "react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { specificLineProps } from "./constants/specificLineProps";
import { useResettableState } from "./hooks/useResettableState";
import { MainContainer } from "./components/MainContainer";
import { renderLegend } from "./constants/renderLegend";
import { fileToDate } from "./helpers/fileToDate";
import { usePromise } from "./hooks/usePromise";
import { pivotData } from "./helpers/pivotData";
import { Content } from "./components/Content";
import { constants } from "./constants";

export default function MyApp() {
  const fileList = usePromise(fileListPromise);

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

  const { lines, data } = useMemo(
    () => getChartProperties(aggregableData),
    [aggregableData]
  );

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  const [activeLegendItem, setActiveLegendItem] = useState(null);

  const handleMouseEnterLegend = useCallback(
    ({ dataKey }) => setActiveLegendItem(dataKey),
    []
  );

  const handleMouseLeaveLegend = useCallback(
    () => setActiveLegendItem(null),
    []
  );

  const getLineStyle = useCallback(
    (dataKey) => (dataKey === activeLegendItem ? hoveredStyle : null),
    [activeLegendItem]
  );

  // * legend hover event
  // * dot style
  // * legend shapes match lines with filled dots style
  // ! tooltip only on dot hover
  // ! dot hover event
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
        <ResponsiveContainer height={400}>
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
            <Legend
              onMouseEnter={handleMouseEnterLegend}
              onMouseLeave={handleMouseLeaveLegend}
              content={renderLegend}
              verticalAlign="top"
            />
            {lines.map(({ dataKey, ...line }) => (
              <Line
                {...line}
                style={getLineStyle(dataKey)}
                dataKey={dataKey}
                key={dataKey}
              ></Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Content>
    </MainContainer>
  );
}

const hoveredStyle = { filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))" };

// ? active dot based on if line is being also being hovered???

const {
  xAxisTickFormatter,
  genericLineProps,
  fileListPromise,
  valueFormatter,
  xAxisPadding,
  pivotDefs,
} = constants;

const { sumUp: numericColumns, pivotOn: xAxisDataKey, groupBy } = pivotDefs;

const activeNumericColumn = numericColumns[0];

const getDefaultDate = (fileList) => {
  const defaultFile = fileList.find(
    ({ default: isDefault }) => isDefault === "Y"
  );

  return fileToDate(defaultFile);
};

const getDataFiles = ({ fileList, date }) => {
  const [calendarMonth, calendarDay] = date.toLocaleDateString().split("/");

  return fileList.filter(
    ({ month, day }) => month === calendarMonth && day === calendarDay
  );
};

const getDataArraysPromise = (dataFiles) => {
  return Promise.all(dataFiles.map(({ web_path }) => csv(web_path)));
};

const makeDataAggregable = ({ dataArrays, dataFiles }) => {
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
};

const getChartProperties = (aggregableData) => {
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
    ...genericLineProps,
    ...specificLineProps[dataKey],
  }));

  return { lines, data };
};

const getSetOfValidDates = (fileList) =>
  new Set(fileList.map((file) => fileToDate(file).toLocaleDateString()));
