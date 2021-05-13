import { useState, useCallback } from "react";

export function useName() {
  const [name, setState] = useState(false);
  const setName = useCallback(
    boolean => {
      setState(boolean);
    },
    [setState]
  );

  return { name, setName };
}
