import { useCallback, useMemo } from "react";
import styled from "styled-components";
import StatusIcon from "component/status-icon/index";
import { IUser } from "util/types";

interface Props {
  user: IUser;
  selected: boolean;
  setSelectedUser(T: IUser): void;
}

const User = ({ user, selected, setSelectedUser }: Props) => {
  const onClickHandler = useCallback(() => {
    user.hasNewMessages = false;
    setSelectedUser(user);
  }, [setSelectedUser, user]);

  const status = useMemo(() => {
    return user.connected ? "online" : "offline";
  }, [user.connected]);

  return (
    <SUser selected={selected} onClick={onClickHandler}>
      <div className="description">
        <div className="name">
          {user.userName} {user.self ? " (yourself)" : ""}
        </div>
        <div className="status">
          <StatusIcon connected={user.connected} />
          {status}
        </div>
        {user.hasNewMessages && <div className="new-messages">!</div>}
      </div>
    </SUser>
  );
};

const SUser = styled.div<{ selected: boolean }>`
  padding: 10px;
  background-color: ${props => (props.selected ? "#1164a3" : "none")};

  .description {
    display: inline-block;
  }

  .status {
    color: #92959e;
  }

  .new-messages {
    color: white;
    background-color: red;
    width: 20px;
    border-radius: 5px;
    text-align: center;
    float: right;
    margin-top: 10px;
  }
`;

export default User;
