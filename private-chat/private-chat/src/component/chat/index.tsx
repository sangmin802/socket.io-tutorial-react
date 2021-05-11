import React, { useMemo } from "react";
import styled from "styled-components";
import User from "component/user/index";
import { IUser } from "util/types";
import { useSelectUser } from "hook/use-select-user";

interface Props {
  userList: IUser[];
}

const Chat = ({ userList }: Props) => {
  const { selectedUser, setSelectedUser } = useSelectUser();

  return (
    <main>
      <SLeftPanel>
        {userList.map((user: IUser) => (
          <User
            key={user.userID}
            user={user}
            selected={selectedUser === user}
            setSelectedUser={setSelectedUser}
          />
        ))}
      </SLeftPanel>
      {/* <SRightPanel></SRightPanel> */}
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
const SRightPanel = styled.div`
  margin-left: 260px;
`;

export default Chat;
