import { useCallback, useEffect, useState, useRef } from "react";

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

const usePopover = (onToggle) => {
  const popover = useRef();

  const [isOpen, toggle] = useState(false);

  const open = useCallback(() => toggle(true), []);

  const close = useCallback(() => toggle(false), []);

  useClickOutside(popover, close);

  useEffect(() => {
    typeof onToggle === "function" && onToggle(isOpen);
  }, [isOpen, onToggle]);

  // usePreviousState(isOpen, onToggle);

  return { popover, isOpen, open };
};

// const usePreviousState = (value, doSomething) => {
//   const [previousValue, setPreviousValue] = useState(value);

//   if (previousValue !== value) {
//     setPreviousValue(value);

//     typeof doSomething === "function" && doSomething(previousValue);
//   }
// };

// Improved version of https://usehooks.com/useOnClickOutside/
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = (event) => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(event.target);
    };

    document.addEventListener("mousedown", validateEventStart);
    document.addEventListener("touchstart", validateEventStart);
    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("mousedown", validateEventStart);
      document.removeEventListener("touchstart", validateEventStart);
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};
