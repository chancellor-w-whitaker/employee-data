import { getEntireClassName } from "../../helpers/getEntireClassName";

export const ListGroup = ({ className, style, ...rest }) => {
  const entireClassName = getEntireClassName(
    "list-group list-group-flush overflow-y-scroll",
    className
  );

  const entireStyle = { maxHeight: 200, ...style };

  return <div className={entireClassName} style={entireStyle} {...rest}></div>;
};
