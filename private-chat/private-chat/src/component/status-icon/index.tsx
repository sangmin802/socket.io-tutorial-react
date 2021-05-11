import React from "react";
import styled from "styled-components";

interface Props {
  connected: boolean;
}

const StatusIcon = ({ connected }: Props) => (
  <SStatusIcon connected={connected} />
);

const SStatusIcon = styled.i<{ connected: boolean }>`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  background-color: ${props => (props.connected ? "#86bb71" : "#e38968")};
  margin-right: 6px;
`;

export default StatusIcon;
