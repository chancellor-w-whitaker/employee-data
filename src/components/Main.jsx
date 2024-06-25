import { getFullClassName } from "../helpers/getFullClassName";

export const Main = ({ className = "", ...props }) => (
  <main className={getFullClassName("container", className)} {...props}></main>
);
