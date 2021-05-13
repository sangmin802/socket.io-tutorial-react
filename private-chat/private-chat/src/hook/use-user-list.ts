import { useCallback, useState } from "react";
import { IUser } from "util/types";

export function useUserList() {
  const root: IUser[] = [];
  const [userList, setState] = useState(root);

  const setUserList = useCallback(
    (newUserList: IUser[]) => {
      const sortedUsers = newUserList.sort((a: IUser, b: IUser) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.userName < b.userName) return -1;
        return a.userName > b.userName ? 1 : 0;
      });
      setState(sortedUsers);
    },
    [setState]
  );

  const pushUserList = useCallback(
    (newUser: IUser) => {
      const newUserList = userList.map(user => {
        if (user.userID === newUser.userID) return { ...user, ...newUser };
        return user;
      });
      setState(newUserList);
    },
    [setState, userList]
  );

  return { userList, setUserList, pushUserList };
}
