import { io } from "socket.io-client";

const url = "http://localhost:3001/";
// socket 바로연결이 아닌, socket.connect()로 필요할 때만 연결 가능하게 함
export const socket = io(url, { autoConnect: false });

// 클라이언트 socket의 모든 수신 이벤트들에 대해 콘솔을 찍도록 함
//  ex) on으로 받아오는것들
socket.onAny((event, ...args) => {
  console.log(event, args);
});
