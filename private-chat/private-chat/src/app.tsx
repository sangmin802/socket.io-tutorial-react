import React, { useEffect, useMemo } from "react";
import { useName } from "hook/use-name";
import { useUserList } from "hook/use-user-list";
import { useSocket } from "hook/use-socket";
import { useSelectUser } from "hook/use-select-user";
import LogIn from "component/log-in/index";
import Chat from "component/chat/index";
// import { socket2 } from "socket/index";

function App() {
  const { name, setName } = useName();
  const { userList, setUserList, pushUserList } = useUserList();
  const { selectedID, setSelectedID } = useSelectUser();
  const { connectSocket, onMessage } = useSocket({
    setName,
    userList,
    setUserList,
    selectedID,
    pushUserList,
  });

  const selectedUser = useMemo(
    () => userList.find(user => user.userID === selectedID) ?? null,
    [userList, selectedID]
  );

  // 전체채팅을 위한 name-space 서버 별도로 connect
  // useEffect(() => {
  //   socket2.connect();

  //   socket2.on("msg", msg => {
  //     console.log(msg);
  //   });
  // }, []);

  return (
    <div className="app">
      {!name && <LogIn connectSocket={connectSocket} />}
      {userList.length > 0 && (
        <Chat
          userList={userList}
          pushUserList={pushUserList}
          selectedUser={selectedUser}
          setSelectedID={setSelectedID}
          onMessage={onMessage}
        />
      )}
    </div>
  );
}

export default App;
