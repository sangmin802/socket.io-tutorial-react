import React from "react";
import { useName } from "hook/use-name";
import { useUserList } from "hook/use-user-list";
import { useSocket } from "hook/use-socket";
import LogIn from "component/log-in/index";
import Chat from "component/chat/index";

function App() {
  const { name, setName } = useName();
  const { userList, setUserList } = useUserList();
  const { connectSocket } = useSocket({ setName, setUserList });

  return (
    <div className="app">
      {!name && <LogIn connectSocket={connectSocket} />}
      {userList.length > 0 && <Chat userList={userList} />}
    </div>
  );
}

export default App;
