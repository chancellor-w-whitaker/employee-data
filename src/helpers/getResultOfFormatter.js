export const getResultOfFormatter = ({
  formatter = (value, name) => [value, name],
  value,
  name,
}) => {
  const result = formatter(value, name);

  const isArray = Array.isArray(result);

  const formattedValue = isArray ? result[0] : result;

  const formattedName = isArray ? result[1] : name;

  return [formattedValue, formattedName];
};
