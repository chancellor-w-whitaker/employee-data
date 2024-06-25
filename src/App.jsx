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

import { getDataArraysPromise } from "./helpers/getDataArraysPromise";
import { getLineReferenceDots } from "./helpers/getLineReferenceDots";
import { useActiveReferenceDot } from "./hooks/useActiveReferenceDot";
import { toSortedByIndexOfKey } from "./helpers/toSortedByIndexOfKey";
import { makeDataAggregable } from "./helpers/makeDataAggregable";
import { getChartProperties } from "./helpers/getChartProperties";
import { getSetOfValidDates } from "./helpers/getSetOfValidDates";
import { useActiveLegendItem } from "./hooks/useActiveLegendItem";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { useResettableState } from "./hooks/useResettableState";
import { useIsLineAnimating } from "./hooks/useIsLineAnimating";
import { useIsPopoverOpen } from "./hooks/useIsPopoverOpen";
import { getDefaultDate } from "./helpers/getDefaultDate";
import { getDataFiles } from "./helpers/getDataFiles";
import { usePromise } from "./hooks/usePromise";
import { styleLine } from "./helpers/styleLine";
import { Popover } from "./components/Popover";
import { Content } from "./components/Content";
import { styleDot } from "./helpers/styleDot";
import { Button } from "./components/Button";
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

  const {
    lastDataKey: mostRecentActiveItem,
    history: legendItemsOrder,
    isActive,
    ...legendMouseHandlers
  } = useActiveLegendItem();

  const activeLegendItem = isActive ? mostRecentActiveItem : null;

  const { state: isLineAnimating, ...lineAnimationHandlers } =
    useIsLineAnimating();

  const { coordinates: activeDot, ...dotMouseHandlers } =
    useActiveReferenceDot();

  const { isOpen: isPopoverOpen, ...toggleHandlers } = useIsPopoverOpen();

  const dots = useMemo(
    () => (!isLineAnimating ? getLineReferenceDots({ chartData, lines }) : []),
    [lines, chartData, isLineAnimating]
  );

  const dotsSortedByLastActiveItem = useMemo(
    () =>
      toSortedByIndexOfKey({
        order: legendItemsOrder,
        key: "dataKey",
        payload: dots,
      }),
    [legendItemsOrder, dots]
  );

  const emphasizeLine = useCallback(
    (dataKey) => styleLine({ activeDataKey: activeLegendItem, dataKey }),
    [activeLegendItem]
  );

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

  const validDatesSet = useMemo(() => getSetOfValidDates(fileList), [fileList]);

  const tileDisabled = useCallback(
    ({ date }) => !validDatesSet.has(date.toLocaleDateString()),
    [validDatesSet]
  );

  const isTooltipActive = "x" in activeDot && "y" in activeDot;

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
            hide={
              <Calendar
                tileDisabled={tileDisabled}
                className="shadow-lg"
                onChange={setDate}
                value={date}
              />
            }
            openWith={
              <Button className="bg-gradient shadow-sm" active={isPopoverOpen}>
                <i className="bi bi-calendar"></i>
              </Button>
            }
            {...toggleHandlers}
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
            />
            <YAxis
              tickFormatter={valueFormatter}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={valueFormatter}
              wrapperClassName="shadow"
              active={isTooltipActive}
            />
            <Legend
              content={<CustomizedLegend></CustomizedLegend>}
              {...legendMouseHandlers}
              verticalAlign="top"
              layout="vertical"
              align="right"
              iconSize={16}
            />
            {lines.map(({ dataKey, ...rest }) => (
              <Line
                {...lineAnimationHandlers}
                style={emphasizeLine(dataKey)}
                dataKey={dataKey}
                key={dataKey}
                {...rest}
              ></Line>
            ))}
            {dotsSortedByLastActiveItem.map(
              ({ dataKey, x, y, ...rest }, index) => (
                <ReferenceDot
                  style={emphasizeDot({ dataKey, x, y })}
                  {...dotMouseHandlers}
                  key={index}
                  x={x}
                  y={y}
                  {...rest}
                ></ReferenceDot>
              )
            )}
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
