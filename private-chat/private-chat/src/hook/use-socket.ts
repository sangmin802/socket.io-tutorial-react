import { useEffect, useCallback } from "react";
import { socket } from "socket/index";
import { IUser } from "util/types";

interface IUseSocket {
  setName(T: boolean): void;
  userList: IUser[];
  setUserList(T: IUser[]): void;
  pushUserList(T: IUser | null): void;
  selectedID: null | string;
}

export function useSocket({
  setName,
  userList,
  setUserList,
  pushUserList,
  selectedID,
}: IUseSocket) {
  // setName useEffect
  useEffect(() => {
    // socket 연결 실패로인한 오류 수신
    socket.on("connect_error", err => {
      if (err.message === "invalid userName") setName(false);
    });

    // 만약, localStorage에 저장된 sessionID가 있다면, 그것을 통해 바로 socket 접속
    const sessionID = localStorage.getItem("sessionID");
    if (sessionID) {
      console.log(sessionID);
      setName(true);
      socket.auth = { sessionID };
      socket.connect();
    }
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

    // 새로운 socket 참여자
    socket.on("user connected", user => {
      // initReactiveProperties(user); 용도 모르겠음
      const newUserList = [...userList];
      newUserList.push(user);
      setUserList(newUserList);
    });

    // 내 친구의 socket 접속 감지
    socket.on("connect", () => {
      const newUserList = userList.map(user => {
        if (user.self) user.connected = true;
        return user;
      });

      setUserList(newUserList);
    });

    // 내 친구의 socket 비접속 감지
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
    // 메시지 발신 시, 발신자 수신자 모두 받는 메시지
    socket.on("private message", ({ content, from, to }) => {
      // 내가 보낸 메시지인지 아닌지
      const fromSelf = socket.userID === from;
      // 내가 보낸 메시지라면 수신자 to의 인스턴스
      // 상대방이 보낸 메시지라면 발신자 from의 인스턴스
      const fromUser = userList.find(
        user => user.userID === (fromSelf ? to : from)
      );
      if (!fromUser) return;
      if (fromUser.userID !== selectedID) fromUser.hasNewMessages++;
      fromUser.messages.push({ content, fromSelf });
      pushUserList(fromUser);
    });

    return () => {
      socket.off("private message");
    };
  }, [userList, pushUserList, selectedID]);

  // 한번실행
  useEffect(() => {
    // socket에서 생성된 sessionID, userID localStorage에 저장
    socket.on("session", ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      socket.userID = userID;
      localStorage.setItem("sessionID", sessionID);
    });

    return () => {
      socket.off("connect_error");
    };
  }, []);

  // 선택한 유저에게 메시지 전달
  const onMessage = useCallback(
    content => {
      if (selectedID) {
        socket.emit("private message", {
          content,
          to: selectedID,
        });
      }
    },
    [selectedID]
  );

  // socket 연결
  const connectSocket = useCallback(
    userName => {
      setName(true);
      socket.auth = { userName };
      socket.connect();
    },
    [setName]
  );

  return { connectSocket, onMessage };
}
