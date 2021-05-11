import { useCallback, useState } from "react";
import { IUser } from "util/types";

export function useUserList() {
  const arr: IUser[] = [];
  const [userList, setState] = useState(arr);

  const setUserList = useCallback(
    (newUser: IUser) => {
      const newUserList = [...userList];
      newUserList.push(newUser);
      const sortedUsers = newUserList.sort((a: IUser, b: IUser) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.userName < b.userName) return -1;
        return a.userName > b.userName ? 1 : 0;
      });
      setState(sortedUsers);
    },
    [setState, userList]
  );

  return { userList, setUserList };
}
