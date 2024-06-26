import { getResultOfFormatter } from "../helpers/getResultOfFormatter";

export const CustomizedTooltip = (props) => {
  const { wrapperClassName = "", formatter, separator, payload, label } = props;

  return (
    <DefaultTooltip className={wrapperClassName}>
      <TooltipLabel>{label}</TooltipLabel>
      <TooltipItemList>
        {payload.map(({ value, color, name, unit }, index) => {
          const [formattedValue, formattedName] = getResultOfFormatter({
            formatter,
            value,
            name,
          });

          return (
            <TooltipItem
              value={formattedValue}
              separator={separator}
              name={formattedName}
              color={color}
              key={index}
              unit={unit}
            ></TooltipItem>
          );
        })}
      </TooltipItemList>
    </DefaultTooltip>
  );
};

const DefaultTooltip = ({ className = "", children }) => {
  const defaultClassName = "recharts-default-tooltip";

  const entireClassName =
    className.length > 0
      ? [defaultClassName, className].join(" ")
      : defaultClassName;

  return (
    <div
      style={{
        border: "1px solid rgb(204, 204, 204)",
        backgroundColor: "rgb(255, 255, 255)",
        whiteSpace: "nowrap",
        padding: 10,
        margin: 0,
      }}
      className={entireClassName}
    >
      {children}
    </div>
  );
};

const TooltipLabel = ({ children }) => {
  return (
    <p className="recharts-tooltip-label" style={{ margin: 0 }}>
      {children}
    </p>
  );
};

const TooltipItemList = ({ children }) => {
  return (
    <ul
      className="recharts-tooltip-item-list"
      style={{ padding: 0, margin: 0 }}
    >
      {children}
    </ul>
  );
};

const TooltipItem = ({ separator, color, value, name, unit }) => {
  return (
    <li
      style={{
        display: "block",
        paddingBottom: 4,
        paddingTop: 4,
        color,
      }}
      className="recharts-tooltip-item"
    >
      <span className="recharts-tooltip-item-name">{name}</span>
      <span className="recharts-tooltip-item-separator">{separator}</span>
      <span className="recharts-tooltip-item-value">{value}</span>
      <span className="recharts-tooltip-item-unit">{unit}</span>
    </li>
  );
};

export const CustomizedTooltip2 = (props) => {
  console.log(props);

  const { wrapperClassName = "", separator, payload, label } = props;

  const className = "recharts-default-tooltip";

  const entireClassName =
    wrapperClassName.length > 0
      ? [className, wrapperClassName].join(" ")
      : className;

  return (
    <div
      style={{
        border: "1px solid rgb(204, 204, 204)",
        backgroundColor: "rgb(255, 255, 255)",
        whiteSpace: "nowrap",
        padding: 10,
        margin: 0,
      }}
      className={entireClassName}
    >
      <p className="recharts-tooltip-label" style={{ margin: 0 }}>
        {label}
      </p>
      <ul
        className="recharts-tooltip-item-list"
        style={{ padding: 0, margin: 0 }}
      >
        {payload.map(({ value, color, name, unit }, index) => (
          <li
            style={{
              display: "block",
              paddingBottom: 4,
              paddingTop: 4,
              color,
            }}
            className="recharts-tooltip-item"
            key={index}
          >
            <span className="recharts-tooltip-item-name">{name}</span>
            <span className="recharts-tooltip-item-separator">{separator}</span>
            <span className="recharts-tooltip-item-value">{value}</span>
            <span className="recharts-tooltip-item-unit">{unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
