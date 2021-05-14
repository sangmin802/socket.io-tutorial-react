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
  // socket.io에 생성된 socket 인스턴스 유저 리스트
  const users = [];

  // 클라이언트의 socket 인스턴스 저장
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

  // socket.io에 생성된 socket 인스턴스 유저 리스트
  const users = [];

  // 상대방의 userID로 된 room에 대한 메시지를 저장
  const messagesPerUser = new Map();
  messageStore.findMessagesForUser(socket.userID).forEach(message => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });

  // socket에 접속중인 혹은 접속했던 모든 클라이언트 반환
  sessionStore.findAllSessions().forEach(session => {
    users.push(
      userInterface({
        userID: session.userID,
        userName: session.userName,
        connected: session.connected,
        messages: messagesPerUser.get(session.userID) || [],
      })
    );
  });

  // socket의 모든 클라이언트 전달
  socket.emit("users", users);

  // 생성되는 socket간 메시지 전달이 아닌, 접속한 userID를 기반으로
  // 상호 메시지 전달을 위해, userID Room 생성
  // 별다른 room에 join 하지 않는다면, 기본적으로는 socket.id에만 join된 상태라 함
  // 각각의 유저가가 자신의 userID로 된 room을 갖고있고, 그 room에 메시지를 발신, 수신함
  // 약간 내 이름 혹은 지정한 이름으로 된 우체통을 갖고있거나 공유하는 느낌
  //    room에 join 한다면, 해당 클라이언트의 socket인스턴스는 room에 대한 권한이 생김
  //    클라이언트는 해당 roomID를 보내서, to(roomID)를 통해, 해당 room 인스턴스에 메시지를 수신 발신할 수 있는듯 함
  //    그 roomID에 join된 다른 socket인스턴스들과 교류 가능
  //      새로운 socket.id가 roomID인 새로운socket.io가 생기는건가?
  //      지정된 ID를 갖고있는 room에 join한 socket 인스턴스들이 to메소드를 통해 여러 메시지같은것을 채워가는 느낌?
  socket.join(socket.userID);

  // 다른 유저 접속
  socket.broadcast.emit(
    "user connected",
    userInterface({
      userID: socket.userID,
      userName: socket.userName,
    })
  );

  // Room 개념
  // 선택한 유저에게 보내진 메시지 발신 후, 해당 유저에게 메시지 전달
  // 메시지 전달 테스트를 위한 데모유저의 응답
  // 고유 id에 보낼때랑, 생성된 채널(room)에 보낼때랑 다른듯함
  // to 대상자가 없으면 지정된 이벤트를 감지하는 모두가 보는 전체채팅?
  // userID를 쓰면 귓속말 개념으로 할 수 있을듯
  // roomID를 생성하면 카톡 단체 채팅방 개념으로 할 수 있을듯
  //    대화 내용과 roomID은 db로 저장?
  //    클라이언트에서 해당 room id에 맞는 messages arr에 내용 담기?
  socket.on("private message", ({ content, to }) => {
    // socket 서버에 받은 메시지를 전달자와 수신사 모두에게 전달
    // 각각의 room에 private message라는 이벤트로 전달
    const message = {
      content,
      from: socket.userID,
      to,
    };
    io.to(to).to(socket.userID).emit("private message", message);
    messageStore.saveMessage(message);
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
