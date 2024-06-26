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
import { useCallback, useMemo } from "react";
import Calendar from "react-calendar";

import { useActiveLineReferenceDot as useActiveReferenceDot } from "./hooks/useActiveLineReferenceDot";
import { sortDotsByActivityHistory } from "./helpers/sortDotsByActivityHistory";
import { getDataArraysPromise } from "./helpers/getDataArraysPromise";
import { getLineReferenceDots } from "./helpers/getLineReferenceDots";
import { CustomizedTooltip } from "./components/CustomizedTooltip";
import { makeDataAggregable } from "./helpers/makeDataAggregable";
import { getChartProperties } from "./helpers/getChartProperties";
import { getSetOfValidDates } from "./helpers/getSetOfValidDates";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { useResettableState } from "./hooks/useResettableState";
import { useIsLineAnimating } from "./hooks/useIsLineAnimating";
import { useLegendActivity } from "./hooks/useLegendActivity";
import { useIsPopoverOpen } from "./hooks/useIsPopoverOpen";
import { getDefaultDate } from "./helpers/getDefaultDate";
import { getDataFiles } from "./helpers/getDataFiles";
import { usePromise } from "./hooks/usePromise";
import { Popover } from "./components/Popover";
import { Content } from "./components/Content";
import { Button } from "./components/Button";
import { Main } from "./components/Main";
import { constants } from "./constants";

export default function App() {
  const { state: isPopoverOpen, ...toggleHandlers } = useIsPopoverOpen();

  const fileList = usePromise(fileListPromise);

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

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

  const {
    activeDataKey: activeLegendItem,
    history: legendActivityHistory,
    style: styleLine,
    ...legendMouseHandlers
  } = useLegendActivity();

  const { state: isLineAnimating, ...lineAnimationHandlers } =
    useIsLineAnimating();

  const dots = useMemo(
    () =>
      !isLineAnimating ? getLineReferenceDots({ data: chartData, lines }) : [],
    [lines, chartData, isLineAnimating]
  );

  const dotsSorted = useMemo(
    () =>
      sortDotsByActivityHistory({
        activityHistory: legendActivityHistory,
        dots,
      }),
    [legendActivityHistory, dots]
  );

  const {
    isTooltipActive,
    style: styleDot,
    ...dotMouseHandlers
  } = useActiveReferenceDot({ activeLine: activeLegendItem, dots });

  // * legend hover event
  // * dot style
  // * legend shapes match lines with filled dots style
  // * dot hover event
  // * tooltip only on dot hover
  // * stack legend
  // * calendar popover
  // ? maybe change style of calendar button + label next to it
  // ! tooltip content (may want to remove active line as well)
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
        <div className="d-flex gap-3">
          <Popover
            {...toggleHandlers}
            hide={
              <Calendar
                tileDisabled={tileDisabled}
                className="shadow-lg"
                onChange={setDate}
                value={date}
              ></Calendar>
            }
            openWith={
              <Button className="bg-gradient shadow-sm" active={isPopoverOpen}>
                <i className="bi bi-calendar"></i>
              </Button>
            }
          ></Popover>
          <div className="fs-4">{date.toLocaleDateString()}</div>
        </div>
      </Content>
      <Content>
        <ResponsiveContainer height={400}>
          <LineChart data={chartData}>
            <XAxis
              tickFormatter={xAxisTickFormatter}
              padding={xAxisPadding}
              dataKey={xAxisDataKey}
              tickLine={false}
            ></XAxis>
            <YAxis
              tickFormatter={valueFormatter}
              axisLine={false}
              tickLine={false}
              tickCount={6}
            ></YAxis>
            <Tooltip
              content={<CustomizedTooltip></CustomizedTooltip>}
              formatter={valueFormatter}
              wrapperClassName="shadow"
              active={isTooltipActive}
            ></Tooltip>
            <Legend
              {...legendMouseHandlers}
              content={<CustomizedLegend></CustomizedLegend>}
              verticalAlign="top"
              layout="vertical"
              align="right"
              iconSize={16}
            ></Legend>
            {lines.map((line, index) => (
              <Line
                {...{ ...line, ...lineAnimationHandlers }}
                style={styleLine(line)}
                key={index}
              ></Line>
            ))}
            {dotsSorted.map((dot, index) => (
              <ReferenceDot
                {...{ ...dot, ...dotMouseHandlers }}
                style={styleDot(dot)}
                key={index}
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
