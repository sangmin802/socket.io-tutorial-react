import React, { useCallback, useRef } from "react";
import StatusIcon from "component/status-icon/index";
import styled from "styled-components";
import { IUser } from "util/types";

interface Props {
  user: IUser;
  onMessage(T: string): void;
}

const MessagePanel = ({ user, onMessage }: Props) => {
  const content = useRef<HTMLTextAreaElement>(null);
  const onSubmitHandler = useCallback(
    e => {
      e.preventDefault();
      const message = content?.current?.value;
      if (message && message.length > 0) {
        onMessage(message);
        e.target[0].value = "";
      }
    },
    [content, onMessage]
  );

  return (
    <SMessagePanel>
      <div className="header">
        <StatusIcon connected={user.connected} />
        {user.userName}
      </div>
      <ul className="messages">
        {user.messages.map(({ content, fromSelf }, i) => {
          return (
            <li className="message" key={content + i}>
              <div className="sender">
                {fromSelf ? "(yourself)" : user.userName}
              </div>
              {content}
            </li>
          );
        })}
      </ul>
      <form onSubmit={onSubmitHandler} className="form">
        <textarea
          ref={content}
          className="input"
          placeholder="Your message..."
        />
        <button className="send-button">Send</button>
      </form>
    </SMessagePanel>
  );
};

const SMessagePanel = styled.div`
  margin-left: 260px;
  .header {
    line-height: 40px;
    padding: 10px 20px;
    border-bottom: 1px solid #dddddd;
  }
  .messages {
    margin: 0;
    padding: 20px;
  }
  .message {
    list-style: none;
  }
  .sender {
    font-weight: bold;
    margin-top: 5px;
  }
  .form {
    padding: 10px;
  }
  .input {
    width: 80%;
    resize: none;
    padding: 10px;
    line-height: 1.5;
    border-radius: 5px;
    border: 1px solid #000;
  }
  .send-button {
    vertical-align: top;
  }
`;

export default MessagePanel;
