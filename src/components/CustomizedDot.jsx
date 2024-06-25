export const CustomizedDot = ({
  dataKey,
  payload,
  index,
  value,
  ...circleProps
}) => {
  const { stroke } = circleProps;

  return (
    <circle
      {...circleProps}
      className="recharts-dot recharts-line-dot"
      fill={stroke}
    />
  );
};
