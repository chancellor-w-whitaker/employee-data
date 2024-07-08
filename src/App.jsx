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
import { useState, useMemo } from "react";

import { sortReferenceDotsByHistory } from "./helpers/sortReferenceDotsByHistory";
import { getChangeFromPreviousPoint } from "./helpers/getChangeFromPreviousPoint";
import { useIsLineAnimationActive } from "./hooks/useIsLineAnimationActive";
import { getPayloadManipulator } from "./helpers/getPayloadManipulator";
import { useActiveReferenceDot } from "./hooks/useActiveReferenceDot";
import { getWrapperClassName } from "./helpers/getWrapperClassName";
import { CustomizedTooltip } from "./components/CustomizedTooltip";
import { useActiveLegendItem } from "./hooks/useActiveLegendItem";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { getBestRowColumns } from "./helpers/getBestRowColumns";
import { getReferenceDots } from "./helpers/getReferenceDots";
import { DatePicker } from "./components/DatePicker";
import { getDotLine } from "./helpers/getDotLine";
import { useFileList } from "./hooks/useFileList";
import { Content } from "./components/Content";
import { Popover } from "./components/Popover";
import { Button } from "./components/Button";
import { Main } from "./components/Main";
import { constants } from "./constants";

export default function App() {
  const { columns, lines, data, ...calendarProps } =
    useFileList(fileListPromise);

  const {
    activeLegendItemHistory,
    activeLegendItem,
    styleLine,
    ...legendMouseHandlers
  } = useActiveLegendItem();

  const { isLineAnimationActive, ...lineAnimationHandlers } =
    useIsLineAnimationActive();

  const referenceDots = useMemo(
    () => (!isLineAnimationActive ? getReferenceDots({ lines, data }) : []),
    [lines, data, isLineAnimationActive]
  );

  const referenceDotsSorted = useMemo(
    () =>
      sortReferenceDotsByHistory({
        history: activeLegendItemHistory,
        referenceDots,
      }),
    [activeLegendItemHistory, referenceDots]
  );

  const {
    activeReferenceDot,
    styleReferenceDot,
    isTooltipActive,
    ...dotMouseHandlers
  } = useActiveReferenceDot({ activeLegendItem, referenceDots });

  const activeDotLine = activeReferenceDot
    ? getDotLine(activeReferenceDot)
    : null;

  const change = getChangeFromPreviousPoint({
    point: activeReferenceDot,
    data,
  });

  const payloadManipulator = getPayloadManipulator({
    changeFromPreviousPoint: change,
    lineName: activeDotLine,
  });

  const tooltipWrapperClassName = getWrapperClassName(change);

  const [resizeWidth, setResizeWidth] = useState(0);

  const onResize = (w) => setResizeWidth(w);

  // ? maybe change style of calendar button + label next to it
  // * legend hover event
  // * dot style
  // * legend shapes match lines with filled dots style
  // * dot hover event
  // * tooltip only on dot hover
  // * stack legend
  // * calendar popover
  // * tooltip content (may want to remove active line as well)
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
        <DatePicker {...calendarProps}></DatePicker>
      </Content>
      <Content>
        <ResponsiveContainer onResize={onResize}>
          <div
            className="d-flex flex-wrap justify-content-evenly"
            style={{ marginBottom: -8, marginRight: -8 }}
          >
            {columns.map(({ headerName, values, field }) => {
              const rowColumns = getBestRowColumns({
                count: columns.length,
                width: resizeWidth,
              })?.rowColumns;

              return (
                <Popover
                  hide={
                    <ul
                      className="dropdown-menu d-block shadow overflow-y-scroll"
                      style={{ maxHeight: 250 }}
                    >
                      {values.map((value) => (
                        <li key={value}>
                          <button className="dropdown-item" type="button">
                            {value}
                          </button>
                        </li>
                      ))}
                    </ul>
                  }
                  openWith={
                    <Button
                      className="dropdown-toggle w-100 shadow-sm bg-gradient d-flex align-items-center justify-content-center"
                      variant="secondary"
                    >
                      <div className="text-truncate">{headerName}</div>
                    </Button>
                  }
                  style={{
                    width: `${Math.floor(100 / rowColumns)}%`,
                  }}
                  className="dropdown flex-fill pe-2 pb-2"
                  key={field}
                ></Popover>
              );
            })}
          </div>
        </ResponsiveContainer>
      </Content>
      {/* <Content>
        {lists.map(({ selections, options, name }) => {
          return <Button key={name}>{name}</Button>;
        })}
      </Content> */}
      <Content>
        <ResponsiveContainer height={400}>
          <LineChart data={data}>
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
              wrapperClassName={tooltipWrapperClassName}
              payloadManipulator={payloadManipulator}
              formatter={valueFormatter}
              active={isTooltipActive}
              cursor={false}
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
            {referenceDotsSorted.map((dot, index) => (
              <ReferenceDot
                {...{ ...dot, ...dotMouseHandlers }}
                style={styleReferenceDot(dot)}
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
