import { getEntireClassName } from "../../helpers/getEntireClassName";

export const Checkbox = ({ type = "checkbox", className, ...rest }) => {
  const entireClassName = getEntireClassName(
    "form-check-input flex-shrink-0",
    className
  );

  return <input className={entireClassName} type={type} {...rest} />;
};
