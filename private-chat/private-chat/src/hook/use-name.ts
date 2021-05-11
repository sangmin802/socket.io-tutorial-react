import { useState, useCallback } from "react";

export function useName() {
  const [name, setState] = useState(null);
  const setName = useCallback(
    name => {
      setState(name);
    },
    [setState]
  );

  return { name, setName };
}
