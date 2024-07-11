export const getEntireClassName = (defaultClassName = "", className = "") =>
  [defaultClassName, className].filter((string) => string.length > 0).join(" ");
