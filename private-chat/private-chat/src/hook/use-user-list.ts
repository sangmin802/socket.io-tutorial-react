import { useCallback, useState } from "react";
import { IUser } from "util/types";

export function useUserList() {
  const root: IUser[] = [];
  const [userList, setState] = useState(root);

  const setUserList = useCallback(
    (param: IUser[] | IUser | null) => {
      if (!param) return;
      if ("sort" in param) {
        const sortedUsers = param.sort((a: IUser, b: IUser) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.userName < b.userName) return -1;
          return a.userName > b.userName ? 1 : 0;
        });
        setState(sortedUsers);
      } else {
        const newUserList = userList.map(user => {
          if (user.userID === param.userID) return { ...user, ...param };
          return user;
        });
        setState(newUserList);
      }
    },
    [setState, userList]
  );

  return { userList, setUserList };
}
