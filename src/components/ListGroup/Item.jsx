import { getEntireClassName } from "../../helpers/getEntireClassName";

export const Item = ({ className, ...rest }) => {
  const entireClassName = getEntireClassName(
    "list-group-item d-flex gap-2",
    className
  );

  return <label className={entireClassName} {...rest}></label>;
};
