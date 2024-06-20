import { getFullClassName } from "../helpers/getFullClassName";

export const Content = ({ className = "", ...props }) => (
  <div
    className={getFullClassName(
      "my-3 p-3 bg-body rounded shadow-sm",
      className
    )}
    {...props}
  ></div>
);
