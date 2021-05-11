const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(server);
const basePath = path.join(__dirname, "..", "/");
app.get("/", (req, res) => {
  res.sendFile(basePath + "public/index.html");
});

app.get("/room", (req, res) => {
  res.sendFile(basePath + "public/room.html");
});

io.on("connection", socket => {
  // 소킷 연결
  console.log("Socket Connected");

  // 입장 감지·반환
  socket.on("join", name => {
    // 나를 제외한 연결된 모든 사용자에게 전달 - broadcast.emit
    // socket.broadcast.emit("join", name);
    // 나를 포함한 모든 사용자에게 전달 - emit
    io.emit("join", name);
  });

  // 퇴장 감지·반환
  //    현재 접속한 곳이 채팅방이여서, 퇴장하면 소킷 종료시킴
  socket.on("leave", name => {
    io.emit("leave", name);
    // socket.broadcast.emit("leave", name);
    socket.disconnect(true);
  });

  // 채팅 감지·반환
  socket.on("chat", msg => {
    io.emit("chat", msg);
  });

  // 소킷 종료
  socket.on("disconnect", () => {
    console.log("Socket Disconnected ");
  });
});

server.listen(port, () => {
  console.log(`Server is connected on ${port}`);
});
