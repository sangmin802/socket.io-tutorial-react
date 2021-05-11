import { useCallback, useState } from "react";

export function useSelectUser() {
  const [selectedUser, setState] = useState(null);

  const setSelectedUser = useCallback(
    user => {
      setState(user);
    },
    [setState]
  );

  return { selectedUser, setSelectedUser };
}
