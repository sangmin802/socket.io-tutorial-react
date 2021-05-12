import { useEffect, useCallback } from "react";
import { socket } from "socket/index";
import { IUser } from "util/types";

interface IUseSocket {
  setName(T: null | string): void;
  userList: IUser[];
  setUserList(T: IUser[]): void;
  selectedID: null | string;
}

export function useSocket({
  setName,
  userList,
  setUserList,
  selectedID,
}: IUseSocket) {
  // setName useEffect
  useEffect(() => {
    // socket 연결 실패로인한 오류 수신
    socket.on("connect_error", err => {
      if (err.message === "invalid userName") setName(null);
    });

    return () => {
      socket.off("connect_error");
    };
  }, [setName]);

  // userList, setUserList useEffect
  useEffect(() => {
    // 현재 socket에 접속중인 유저목록 수신
    socket.on("users", users => {
      const newUserList = users.map((user: IUser) => {
        user.self = user.userID === socket.id;
        return user;
        // initReactiveProperties(user); 용도 모르겠음
      });
      setUserList(newUserList);
    });

    // 새로운 유저 접속 시 수신
    socket.on("user connected", user => {
      // initReactiveProperties(user); 용도 모르겠음
      const newUserList = [...userList];
      newUserList.push(user);
      setUserList(newUserList);
    });

    // socket의 접속 이벤트 감지, 접속중인 유저 구분
    socket.on("connect", () => {
      const newUserList = userList.map(user => {
        if (user.self) user.connected = true;
        return user;
      });

      setUserList(newUserList);
    });

    // socket의 비접속 이벤트 감지, 비접속중인 유저 구분
    socket.on("disconnect", () => {
      const newUserList = userList.map(user => {
        if (user.self) user.connected = false;
        return user;
      });
      setUserList(newUserList);
    });

    return () => {
      socket.off("users");
      socket.off("user connected");
      socket.off("private message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [userList, setUserList]);

  // userList, setUserList, selectedID useEffect
  useEffect(() => {
    // 나에게로 온 메시지 수신
    socket.on("private message", ({ content, from }) => {
      const newUserList = [...userList];
      // 리스트중에 나에게 메시지를 보낸사람이 존재하고, 아직 선택하지 않았다면
      for (let i = 0; i < newUserList.length; i++) {
        if (newUserList[i].userID === from) {
          newUserList[i].messages.push({ content, fromSelf: false });
          if (newUserList[i].userID !== selectedID)
            newUserList[i].hasNewMessages = true;
          setUserList(newUserList);
          break;
        }
      }
    });

    return () => {
      socket.off("private message");
    };
  }, [userList, setUserList, selectedID]);

  // 선택한 유저에게 메시지 전달
  const onMessage = useCallback(
    content => {
      if (selectedID) {
        socket.emit("private message", {
          content,
          to: selectedID,
        });
        console.log(selectedID);
        const newUserList = userList.map(user => {
          if (user.userID === selectedID)
            user.messages.push({ content, fromSelf: true });

          return user;
        });
        setUserList(newUserList);
      }
    },
    [selectedID, userList, setUserList]
  );

  // socket 연결
  const connectSocket = useCallback(
    userName => {
      setName(userName);
      socket.auth = { userName };
      socket.connect();
    },
    [setName]
  );

  // 앱 종료시, connect_error 이벤트 수신 종료
  useEffect(() => {
    return () => {
      socket.off("connect_error");
    };
  }, []);

  return { connectSocket, onMessage };
}
