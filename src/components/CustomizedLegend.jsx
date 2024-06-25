export const CustomizedLegend = (props) => {
  const { onMouseEnter, onMouseLeave, iconSize, payload } = props;

  return (
    <ul
      style={{ textAlign: "left", padding: 0, margin: 0 }}
      className="recharts-default-legend"
    >
      {payload.map(({ value, color }, index) => (
        <LegendItem
          onMouseLeave={() => onMouseLeave(payload[index])}
          onMouseEnter={() => onMouseEnter(payload[index])}
          key={`item-${index}`}
          iconSize={iconSize}
          color={color}
          value={value}
          index={index}
        ></LegendItem>
      ))}
    </ul>
  );
};

const LegendItem = ({
  onMouseEnter,
  onMouseLeave,
  iconSize,
  value,
  color,
  index,
}) => {
  return (
    <li
      className={`recharts-legend-item legend-item-${index}`}
      style={{ display: "block", marginRight: 10 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // onMouseEnter={() => onMouseEnter(payload[index])}
      // onMouseLeave={() => onMouseLeave(payload[index])}
      // key={`item-${index}`}
    >
      <svg
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          marginRight: 4,
        }}
        className="recharts-surface"
        viewBox="0 0 32 32"
        height={iconSize}
        width={iconSize}
      >
        <title />
        <desc />
        <path
          d="M0,16h10.666666666666666
          A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
          H32M21.333333333333332,16
          A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
          className="recharts-legend-icon"
          strokeWidth={4}
          stroke={color}
          fill={color}
        />
      </svg>
      <span className="recharts-legend-item-text" style={{ color }}>
        {value}
      </span>
    </li>
  );
};
