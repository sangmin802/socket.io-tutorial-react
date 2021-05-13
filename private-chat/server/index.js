const crypto = require("crypto");
const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();
const express = require("express");
const app = express();
const port = 3001;
const randomId = () => crypto.randomBytes(8).toString("hex");

const userInterface = ({
  self = false,
  userID,
  userName,
  hasNewMessages = 0,
  connected = true,
  messages = [],
}) => {
  return {
    self,
    userID,
    userName,
    hasNewMessages,
    connected,
    messages,
  };
};

// express server instance 생성
const server = app.listen(port, () => {
  console.log(`Server is connected on ${port}`);
});

// socket.io에 현재 생성된 express 서버 연결
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// socket으로 접속하는 모든 요청에대한 미들웨어 io.use
io.use((socket, next) => {
  // localStorage에 저장되어있는 userID인 sessionID를 보내왔다면 sessionStore에 기억된 값으로 로그인
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

// 하나의 서버의 io안에 여러개의 socket 인스턴스?
io.on("connection", socket => {
  // 테스트를 위해 데모 유저 추가
  const users = [
    {
      self: false,
      userID: "demo user 1",
      userName: "demo user 1",
      hasNewMessages: 0,
      connected: true,
      messages: [{ content: "Hello, sangmin!", fromSelf: false }],
    },
    {
      self: false,
      userID: "demo user 2",
      userName: "demo user 2",
      hasNewMessages: 0,
      connected: false,
      messages: [],
    },
    {
      self: false,
      userID: "demo user 3",
      userName: "demo user 3",
      hasNewMessages: 0,
      connected: true,
      messages: [],
    },
  ];

  // socket에 접속한 클라이언트 저장
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    userName: socket.userName,
    connected: true,
  });

  // 클라이언트에게 생성된 sessionID, userID 전달
  // 클라이언트에서는 전달된 값 localStorage에 저장
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // 생성되는 socket간 메시지 전달이 아닌, 접속한 userID를 기반으로
  // 상호 메시지 전달을 위해, userID Room 생성
  // 기존 socket방식에서 socket.메소드로 자신에게 다시 보내는것은 불가능한가봄
  socket.join(socket.userID);

  // socket에 접속한 혹은 접속했던 모든 클라이언트 반환
  sessionStore.findAllSessions().forEach(session => {
    users.push({
      userID: session.userID,
      userName: session.userName,
      connected: session.connected,
    });
  });

  // socket의 모든 클라이언트 전달
  socket.emit("users", users);

  // 다른 유저 접속
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    userName: socket.userName,
    connected: true,
  });

  // Room 개념
  // 선택한 유저에게 보내진 메시지 송신 후, 해당 유저에게 메시지 전달
  // 메시지 전달 테스트를 위한 데모유저의 응답
  // 고유 id에 보낼때랑, 생성된 채널(room)에 보낼때랑 다른듯함
  // to 대상자가 없으면 지정된 이벤트를 감지하는 모두가 보는 전체채팅?
  // userID를 쓰면 귓속말 개념으로 할 수 있을듯
  // roomID를 생성하면 카톡 단체 채팅방 개념으로 할 수 있을듯
  //  대화 내용과 roomID은 db로 저장?
  socket.on("private message", ({ content, to }) => {
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
