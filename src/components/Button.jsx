import { getFullClassName } from "../helpers/getFullClassName";

export const Button = ({
  children = "Primary",
  variant = "primary",
  type = "button",
  className = "",
  active = false,
  ...props
}) => {
  const defaultClassName = active
    ? `btn btn-${variant} active`
    : `btn btn-${variant}`;

  const fullClassName = getFullClassName(defaultClassName, className);

  return (
    <button className={fullClassName} type={type} {...props}>
      {children}
    </button>
  );
};
