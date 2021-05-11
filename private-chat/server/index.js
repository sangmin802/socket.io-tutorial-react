const express = require("express");
const app = express();
const port = 3001;

// express server instance 생성
const server = app.listen(port, () => {
  console.log(`Server is connected on ${port}`);
});

// socket.io 에 express server instance 할당
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// socket으로 접속하는 모든 요청에대한 미들웨어 io.use
io.use((socket, next) => {
  const userName = socket.handshake.auth.userName;
  if (!userName) return next(new Error("invalid userName"));
  socket.userName = userName;
  next();
});

io.on("connection", socket => {
  const users = [];
  // io.of('/').sockets : 현재 socket에 접속한 모든 유저 리스트 생성
  for (let [id, socket] of io.of("/").sockets) {
    users.push({ userID: id, userName: socket.userName });
  }

  // 접속중인 유저 리스트 송신
  socket.emit("users", users);

  // 새로 접속한 유저 송신
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    userName: socket.userName,
  });
});
