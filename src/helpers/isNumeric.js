const isNumeric1 = (string) => !Number.isNaN(string);

const isNumeric2 = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);

const isNumeric3 = (string) => !Number.isNaN(Number(string));

const isNumeric4 = (string) => Number.isFinite(+string);

const isNumeric5 = (string) => string == Number.parseFloat(string);

export const isNumeric = (string) =>
  isNumeric1(string) &&
  isNumeric2(string) &&
  isNumeric3(string) &&
  isNumeric4(string) &&
  isNumeric5(string);
