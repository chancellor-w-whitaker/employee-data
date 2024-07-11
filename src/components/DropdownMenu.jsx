import { getEntireClassName } from "../helpers/getEntireClassName";

export const DropdownMenu = ({ className, children }) => {
  const entireClassName = getEntireClassName(
    "dropdown-menu d-block position-static mx-0 rounded-3 shadow overflow-hidden w-280px",
    className
  );

  return (
    <div className={entireClassName}>
      {/* <Search></Search> */}
      {children}
    </div>
  );
};

const Search = () => {
  return (
    <form className="p-2 mb-2 bg-body-tertiary border-bottom">
      <input
        placeholder="Type to filter..."
        className="form-control"
        autoComplete="false"
        type="search"
      />
    </form>
  );
};
