import { useCallback, useState } from "react";

export const useIsPopoverOpen = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => setIsOpen(true), []);

  const onClose = useCallback(() => setIsOpen(false), []);

  return { onClose, onOpen, isOpen };
};
