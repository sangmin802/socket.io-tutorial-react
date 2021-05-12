import React from "react";
import styled from "styled-components";
import { IUser } from "util/types";
import User from "component/user/index";
import MessagePanel from "component/message-panel/index";

interface Props {
  userList: IUser[];
  setUserList(T: IUser[]): void;
  selectedUser: null | IUser;
  setSelectedID(T: string): void;
  onMessage(T: string): void;
}

const Chat = ({
  userList,
  selectedUser,
  setSelectedID,
  onMessage,
  setUserList,
}: Props) => {
  return (
    <main>
      <SLeftPanel>
        {userList.map((user: IUser) => (
          <User
            key={user.userID}
            user={user}
            userList={userList}
            setUserList={setUserList}
            selected={selectedUser?.userID === user.userID}
            setSelectedID={setSelectedID}
          />
        ))}
      </SLeftPanel>
      {selectedUser && (
        <MessagePanel user={selectedUser} onMessage={onMessage} />
      )}
    </main>
  );
};

const SLeftPanel = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
`;

export default Chat;
