import { useEffect, useCallback } from "react";
import { socket } from "socket/index";
import { IUser } from "util/types";

interface IUseSocket {
  setName(T: null | string): void;
  setUserList(T: IUser): void;
}

export function useSocket({ setName, setUserList }: IUseSocket) {
  useEffect(() => {
    // socket 연결 실패로인한 오류 수신
    socket.on("connect_error", err => {
      if (err.message === "invalid userName") setName(null);
    });

    // 현재 socket에 접속중인 유저목록 수신
    socket.on("users", users => {
      users.forEach((user: IUser) => {
        user.self = user.userID === socket.id;
        // initReactiveProperties(user); 용도 모르겠음
        setUserList(user);
      });
    });

    // 새로운 유저 접속 시 수신
    socket.on("user connected", user => {
      // initReactiveProperties(user); 용도 모르겠음
      setUserList(user);
    });
  }, [setName, setUserList]);

  // 앱 종료시, connect_error 이벤트 수신 종료
  useEffect(() => {
    return () => {
      socket.off("connect_error");
    };
  }, []);

  const connectSocket = useCallback(
    userName => {
      setName(userName);
      socket.auth = { userName };
      socket.connect();
    },
    [setName]
  );

  return { connectSocket };
}
