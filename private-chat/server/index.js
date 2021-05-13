const crypto = require("crypto");
const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();
const express = require("express");
const app = express();
const port = 3001;
const randomId = () => crypto.randomBytes(8).toString("hex");

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
  // sessionID를 보내왔다면 sessionStore에 기억된 값으로 로그인
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.userName = session.userName;
      return next();
    }
  }
  // 아니면 일반 로그인
  const userName = socket.handshake.auth.userName;
  if (!userName) return next(new Error("invalid userName"));
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.userName = userName;
  next();
});

io.on("connection", socket => {
  // 테스트를 위해 데모 유저 추가
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

  // 클라이언트에게 생성된 sessionID, userID 전달
  //  클라이언트에서는 전달된 값 localStorage에 저장
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

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

  // userID기반의 room 입장
  socket.join(socket.userID);

  // Room 개념
  // 선택한 유저에게 보내진 메시지 송신 후, 해당 유저에게 메시지 전달
  // 메시지 전달 테스트를 위한 데모유저의 응답
  // 고유 id에 보낼때랑, 생성된 채널(room)에 보낼때랑 다른듯함
  // io.to : 귓속말 개념
  // socket.to : 카톡 단체 채팅방 개념
  //    - room방식으로, join, leave 메소드가 존재함
  //    - socket에서 저장하지 않기 때문에, room data는 db로 관리해야하는듯
  //    - 접속할때마다 room data를 가져와서 연결하는 느낌
  socket.on("private message", ({ content, to }) => {
    // socket 서버에 받은 메시지를 수신자에게만 전달
    // io.to(socket.id).emit("private message", {
    //   content: `You said ${content}`,
    //   from: to,
    // });
    // io.to(socket.id).emit("private message", {
    //   content: "Hi Sangmin! What are you doing!",
    //   from: "demo user 3",
    // });
    // socket 서버에 받은 메시지를 전달자와 수신사 모두에게 전달
    io.to(to).to(socket.userID).emit("private message", {
      content,
      from: socket.userID,
      to,
    });
    io.to(socket.userID)
      .to(to)
      .emit("private message", {
        content: `You said, ${content} right?`,
        from: to,
        to: socket.userID,
      });
    io.to("demo user 3").to(socket.userID).emit("private message", {
      content: "Hi Sangmin! What are you doing!",
      from: "demo user 3",
      to: socket.userID,
    });
  });

  socket.on("disconnect", async () => {
    // 지정된 방(socket.userID)에 있는 모든 다른 유저(socket 인스턴스) 반환
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    // socket을 종료하며 sessionStore에 저장
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", socket.userID);
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        userName: socket.userName,
        connected: false,
      });
    }
  });
});
