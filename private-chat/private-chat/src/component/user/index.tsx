import { useCallback, useMemo } from "react";
import styled from "styled-components";
import StatusIcon from "component/status-icon/index";
import { IUser } from "util/types";

interface Props {
  user: IUser;
  selected: boolean;
  setSelectedID(T: string): void;
  pushUserList(T: IUser): void;
}

const User = ({ user, selected, setSelectedID, pushUserList }: Props) => {
  // 다른 유저 클릭
  const onClickHandler = useCallback(() => {
    pushUserList({ ...user, hasNewMessages: 0 });
    setSelectedID(user.userID);
  }, [setSelectedID, user, pushUserList]);

  // 온라인 오프라인 표시
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
      </div>
      {user.hasNewMessages !== 0 && (
        <div className="new-messages">{user.hasNewMessages}</div>
      )}
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
