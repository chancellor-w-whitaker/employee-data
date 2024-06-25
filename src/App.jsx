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
import { getLineReferenceDots } from "./helpers/getLineReferenceDots";
import { makeDataAggregable } from "./helpers/makeDataAggregable";
import { getChartProperties } from "./helpers/getChartProperties";
import { getSetOfValidDates } from "./helpers/getSetOfValidDates";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { useResettableState } from "./hooks/useResettableState";
import { getDefaultDate } from "./helpers/getDefaultDate";
import { getDataFiles } from "./helpers/getDataFiles";
import { usePromise } from "./hooks/usePromise";
import { styleLine } from "./helpers/styleLine";
import { Content } from "./components/Content";
import { styleDot } from "./helpers/styleDot";
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

  const onMouseEnterLegend = useCallback(
    ({ dataKey }) => setActiveLegendItem(dataKey),
    []
  );

  const onMouseLeaveLegend = useCallback(() => setActiveLegendItem(null), []);

  const [isAnimating, setIsAnimating] = useState(null);

  const onLineAnimationStart = useCallback(() => setIsAnimating(true), []);

  const onLineAnimationEnd = useCallback(() => setIsAnimating(false), []);

  const emphasizeLine = useCallback(
    (dataKey) => styleLine({ activeDataKey: activeLegendItem, dataKey }),
    [activeLegendItem]
  );

  const dots = useMemo(
    () => (!isAnimating ? getLineReferenceDots({ chartData, lines }) : []),
    [lines, chartData, isAnimating]
  );

  const [activeDot, setActiveDot] = useState({});

  const onMouseEnterDot = useCallback(({ x, y }) => setActiveDot({ x, y }), []);

  const onMouseLeaveDot = useCallback(() => setActiveDot({}), []);

  const emphasizeDot = useCallback(
    ({ dataKey, ...coordinates }) =>
      styleDot({
        activeDataKey: activeLegendItem,
        activeCoordinates: activeDot,
        coordinates,
        dataKey,
      }),
    [activeDot, activeLegendItem]
  );

  const isTooltipActive = "x" in activeDot && "y" in activeDot;

  // * legend hover event
  // * dot style
  // * legend shapes match lines with filled dots style
  // * dot hover event
  // * tooltip only on dot hover
  // * stack legend
  // ! tooltip content (may want to remove active line as well)
  // ! calendar popover
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
            <Tooltip formatter={valueFormatter} active={isTooltipActive} />
            <Legend
              content={<CustomizedLegend></CustomizedLegend>}
              onMouseEnter={onMouseEnterLegend}
              onMouseLeave={onMouseLeaveLegend}
              verticalAlign="top"
              layout="vertical"
              align="right"
              iconSize={16}
            />
            {lines.map(({ dataKey, ...rest }) => (
              <Line
                onAnimationStart={onLineAnimationStart}
                onAnimationEnd={onLineAnimationEnd}
                style={emphasizeLine(dataKey)}
                dataKey={dataKey}
                key={dataKey}
                {...rest}
              ></Line>
            ))}
            {dots.map(({ dataKey, x, y, ...rest }, index) => (
              <ReferenceDot
                style={emphasizeDot({ dataKey, x, y })}
                onMouseEnter={onMouseEnterDot}
                onMouseLeave={onMouseLeaveDot}
                key={index}
                x={x}
                y={y}
                {...rest}
              ></ReferenceDot>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Content>
    </Main>
  );
}

const {
  pivotDefs: { pivotOn: xAxisDataKey },
  xAxisTickFormatter,
  fileListPromise,
  valueFormatter,
  xAxisPadding,
} = constants;
