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
import { getNumberOfColumnsPerRow } from "./helpers/getNumberOfColumnsPerRow";
import { useIsLineAnimationActive } from "./hooks/useIsLineAnimationActive";
import { getPayloadManipulator } from "./helpers/getPayloadManipulator";
import { useActiveReferenceDot } from "./hooks/useActiveReferenceDot";
import { getWrapperClassName } from "./helpers/getWrapperClassName";
import { CustomizedTooltip } from "./components/CustomizedTooltip";
import { useActiveLegendItem } from "./hooks/useActiveLegendItem";
import { getEntireClassName } from "./helpers/getEntireClassName";
import { CustomizedLegend } from "./components/CustomizedLegend";
import { getReferenceDots } from "./helpers/getReferenceDots";
import { Checkbox } from "./components/ListGroup/Checkbox";
import { DropdownMenu } from "./components/DropdownMenu";
import { DatePicker } from "./components/DatePicker";
import { ListGroup } from "./components/ListGroup";
import { Item } from "./components/ListGroup/Item";
import { getDotLine } from "./helpers/getDotLine";
import { useFileList } from "./hooks/useFileList";
import { Content } from "./components/Content";
import { Popover } from "./components/Popover";
import { Button } from "./components/Button";
import { Main } from "./components/Main";
import { constants } from "./constants";

export default function App() {
  const {
    handleCheckboxChange,
    isChecked,
    columns,
    lines,
    data,
    ...calendarProps
  } = useFileList(fileListPromise);

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
            {columns.map(({ field: name, headerName, values }) => {
              const columnsPerRow = getNumberOfColumnsPerRow({
                length: columns.length,
                width: resizeWidth,
              });

              const allAreChecked = isChecked({ name });

              const variant = allAreChecked ? "secondary" : "warning";

              const width = `${Math.floor(100 / columnsPerRow)}%`;

              return (
                <Popover
                  openUp={
                    <DropdownMenu>
                      <ListGroup>
                        <Item>
                          <Checkbox
                            onChange={handleCheckboxChange}
                            className="all-checkbox"
                            checked={allAreChecked}
                            name={name}
                          ></Checkbox>
                          <span>All</span>
                        </Item>
                        {values.map((value) => (
                          <Item key={value}>
                            <Checkbox
                              checked={isChecked({ value, name })}
                              onChange={handleCheckboxChange}
                              value={value}
                              name={name}
                            ></Checkbox>
                            <span>{value}</span>
                          </Item>
                        ))}
                      </ListGroup>
                    </DropdownMenu>
                  }
                  openWith={
                    <PopoverButton variant={variant}>
                      <div className="text-truncate">{headerName}</div>
                    </PopoverButton>
                  }
                  className="dropdown flex-fill pe-2 pb-2"
                  style={{ width }}
                  key={name}
                ></Popover>
              );
            })}
          </div>
        </ResponsiveContainer>
      </Content>
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

const PopoverButton = ({ className, ...rest }) => {
  const entireClassName = getEntireClassName(
    "dropdown-toggle w-100 shadow-sm bg-gradient d-flex align-items-center justify-content-center",
    className
  );

  return <Button className={entireClassName} {...rest}></Button>;
};

const {
  pivotDefs: { pivotOn: xAxisDataKey },
  xAxisTickFormatter,
  fileListPromise,
  valueFormatter,
  xAxisPadding,
} = constants;

// * maybe change style of calendar button + label next to it
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
