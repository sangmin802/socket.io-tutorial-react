import { useRef, useCallback } from "react";
import styled from "styled-components";

interface Props {
  connectSocket(T: string): void;
}

const LogIn = ({ connectSocket }: Props) => {
  const userName = useRef<HTMLInputElement>(null);
  const onSubmitHandler = useCallback(
    e => {
      e.preventDefault();
      const name = userName?.current?.value;
      if (typeof name === "string") connectSocket(name);
    },
    [userName, connectSocket]
  );

  return (
    <SLogIn>
      <form onSubmit={onSubmitHandler}>
        <input ref={userName} type="text" placeholder="Your username" />
        <button>Send</button>
      </form>
    </SLogIn>
  );
};

const SLogIn = styled.div`
  width: 300px;
  margin: 200px auto 0;
`;

export default LogIn;
