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
  const users = [
    {
      self: false,
      userID: "demo user 1",
      userName: "demo user 1",
      hasNewMessages: false,
      connected: true,
      messages: [{ content: "Hello, sangmin!", fromSelf: false }],
    },
    {
      self: false,
      userID: "demo user 2",
      userName: "demo user 2",
      hasNewMessages: false,
      connected: false,
      messages: [],
    },
    {
      self: false,
      userID: "demo user 3",
      userName: "demo user 3",
      hasNewMessages: false,
      connected: true,
      messages: [],
    },
  ];
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

  // Room 개념
  // 선택한 유저에게 보내진 메시지 송신 후, 해당 유저에게 메시지 전달
  socket.on("private message", ({ content, to }) => {
    // 데모 유저의 메시징 전달 테스트
    // 고유 id에 보낼때랑, 생성된 채널(room)에 보낼때랑 다른듯함
    // io.to : 귓속말 개념
    // socket.to : 카톡 단체 채팅방 개념
    //    - room방식으로, join, leave 메소드가 존재함
    //    - socket에서 저장하지 않기 때문에, room data는 db로 관리해야하는듯
    //    - 접속할때마다 room data를 가져와서 연결하는 느낌
    io.to(socket.id).emit("private message", {
      content: `You said ${content}`,
      from: to,
    });
    io.to(socket.id).emit("private message", {
      content: "demo user 3 send message to yourSelf",
      from: "demo user 3",
    });

    // socket.to를 통해 특정 Room에만 이벤트를 부여할 수 있다.
    // socket.to(to).emit("private message", { content, from: socket.id });
  });
});
