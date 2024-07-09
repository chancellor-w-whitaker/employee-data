import Calendar from "react-calendar";

import { getDatePickerLabel } from "../helpers/getDatePickerLabel";
import { useIsPopoverOpen } from "../hooks/useIsPopoverOpen";
import { Popover } from "./Popover";
import { Button } from "./Button";

export const DatePicker = ({ className = "shadow-lg", value, ...props }) => {
  const { isPopoverOpen, ...toggleHandlers } = useIsPopoverOpen();

  return (
    <Popover
      {...toggleHandlers}
      openWith={
        <Button
          className="bg-gradient shadow-sm btn-lg d-flex gap-2"
          active={isPopoverOpen}
        >
          <i className="bi bi-calendar-fill"></i>
          <div className="font-monospace">{getDatePickerLabel(value)}</div>
        </Button>
      }
      openUp={
        <Calendar className={className} value={value} {...props}></Calendar>
      }
    ></Popover>
  );
};
