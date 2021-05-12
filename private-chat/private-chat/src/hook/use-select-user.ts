import { useCallback, useState } from "react";

export function useSelectUser() {
  const [selectedID, setState] = useState<null | string>(null);

  const setSelectedID = useCallback(
    (userID: string) => {
      setState(userID);
    },
    [setState]
  );

  return { selectedID, setSelectedID };
}
