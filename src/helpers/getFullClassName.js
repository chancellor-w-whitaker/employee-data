export const getFullClassName = (defaultClassName, className) =>
  className.length > 0
    ? [defaultClassName, className].join(" ")
    : defaultClassName;
