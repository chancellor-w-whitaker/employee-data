import { getFullClassName } from "../helpers/getFullClassName";

export const MainContainer = ({ className = "", ...props }) => (
  <main className={getFullClassName("container", className)} {...props}></main>
);
