import {
  ResponsiveContainer,
  ReferenceDot,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { useCallback, useState, useMemo } from "react";
import Calendar from "react-calendar";

import { getDataArraysPromise } from "./helpers/getDataArraysPromise";
import { makeDataAggregable } from "./helpers/makeDataAggregable";
import { getChartProperties } from "./helpers/getChartProperties";
import { getSetOfValidDates } from "./helpers/getSetOfValidDates";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { useResettableState } from "./hooks/useResettableState";
import { getReferenceDots } from "./helpers/getReferenceDots";
import { getDefaultDate } from "./helpers/getDefaultDate";
import { getDataFiles } from "./helpers/getDataFiles";
import { usePromise } from "./hooks/usePromise";
import { Content } from "./components/Content";
import { Main } from "./components/Main";
import { constants } from "./constants";

export default function App() {
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

  const { data: chartData, lines } = useMemo(
    () => getChartProperties(aggregableData),
    [aggregableData]
  );

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  const [activeLegendItem, setActiveLegendItem] = useState(null);

  const handleMouseEnteredLegend = useCallback(
    ({ dataKey }) => setActiveLegendItem(dataKey),
    []
  );

  const handleMouseLeftLegend = useCallback(
    () => setActiveLegendItem(null),
    []
  );

  const emphasizeLine = useCallback(
    (dataKey) => (dataKey === activeLegendItem ? emphasisStyle : null),
    [activeLegendItem]
  );

  const dynamicallyStyledLines = useMemo(
    () =>
      lines.map((line) => ({ ...line, style: emphasizeLine(line.dataKey) })),
    [lines, emphasizeLine]
  );

  const referenceDots = useMemo(
    () => getReferenceDots({ chartData, lines }),
    [lines, chartData]
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
    <Main>
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
          <LineChart data={chartData}>
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
              content={<CustomizedLegend></CustomizedLegend>}
              onMouseEnter={handleMouseEnteredLegend}
              onMouseLeave={handleMouseLeftLegend}
              verticalAlign="top"
            />
            {dynamicallyStyledLines.map((props, index) => (
              <Line {...props} key={index}></Line>
            ))}
            {referenceDots.map((props, index) => (
              <ReferenceDot {...props} key={index}></ReferenceDot>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Content>
    </Main>
  );
}

// ? active dot based on if line is being also being hovered???

const {
  xAxisTickFormatter,
  fileListPromise,
  valueFormatter,
  emphasisStyle,
  xAxisPadding,
  pivotDefs,
} = constants;

const { pivotOn: xAxisDataKey } = pivotDefs;
