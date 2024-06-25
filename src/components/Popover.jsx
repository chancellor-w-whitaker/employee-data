import { usePopover } from "../hooks/usePopover";

export const Popover = ({ openWith, onToggle, hide }) => {
  const { popover, isOpen, open } = usePopover(onToggle);

  return (
    <div className="position-relative">
      <div onClickCapture={open}>{openWith}</div>
      {isOpen && (
        <div
          className="position-absolute"
          style={{ zIndex: 1000 }}
          ref={popover}
        >
          {hide}
        </div>
      )}
    </div>
  );
};
