export const CustomizedLegend = (props) => {
  const { onMouseEnter, onMouseLeave, iconSize, payload } = props;

  return (
    <ul
      style={{ textAlign: "center", padding: 0, margin: 0 }}
      className="recharts-default-legend"
    >
      {payload.map(({ value, color }, index) => (
        <li
          className={`recharts-legend-item legend-item-${index}`}
          style={{ display: "inline-block", marginRight: 10 }}
          onMouseEnter={() => onMouseEnter(payload[index])}
          onMouseLeave={() => onMouseLeave(payload[index])}
          key={`item-${index}`}
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
      ))}
    </ul>
  );
};
