import { isNumeric } from "./isNumeric";

export const getPayloadManipulator =
  ({ changeFromPreviousPoint, lineName }) =>
  (payload) => {
    const where = ({ name }) => name === lineName;

    const onlyDot = payload
      .filter(where)
      .map(({ color, ...rest }) => ({ ...rest }));

    const statement = isNumeric(changeFromPreviousPoint)
      ? `${changeFromPreviousPoint < 0 ? "-" : "+"}${Math.abs(
          changeFromPreviousPoint
        )} from previous year`
      : "";

    if (statement.length > 0) {
      return [
        ...onlyDot,
        {
          color:
            changeFromPreviousPoint === 0
              ? null
              : changeFromPreviousPoint < 0
              ? "red"
              : "green",
          name: statement,
        },
      ];
    }

    return onlyDot;
  };
