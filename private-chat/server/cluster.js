// 클라이언트의 요청 수가 많아지면, 하나의 서버로 모든 작업을 수행하기에는 부담이 되기 때문에, 로드밸런싱 작업 이필요함
// scale up : 서버 자체의 용량을 높이는 것
// scale out : 서버를 여러개 증설하여 클라이언트 분산(로드밸런싱)
//  -로드밸런싱 작업
//    클라이언트의 수가 늘어났을 때, 서버로 작업이 바로 전달되는것이 아닌, 로드밸런싱을 거쳐서 작업들이 분산되어 여러개의 서버에 전달됨

// 여러개의 socket.io서버를 만들 때 필요한 두가지 조건
//  1. 고정 세션 활성화
//      서로 다른 socket.id가 서로의 이벤트를 전달받을 수 있도록 해야하는것 같음
//      따라서, 여러개의 socket.io 서버로 전달되는 클라이언트의 요청이 하나의 socket.io 서버로 라우팅 되도록 해야한다고 함
//  2. 기본 메모리 어뎁터를 redis 어뎁터로 변경

// cluster - 서버증설
//    메인 프로세스에 여러개의 자식 프로세스들이 생성됨
//      이 하위 프로세스들을 worker 라고 하는듯 함. fork 이벤트로 생성
const cluster = require("cluster");
const express = require("express");
const app = express();
const WORKDERS_COUNT = 4;

// 메인 프로세스
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < WORKDERS_COUNT; i++) {
    // worker 생성
    cluster.fork();
  }

  // worker들이 종료되면 해당 이벤트 발생
  cluster.on("exit", worker => {
    console.log(`Worker ${worker.process.pid} died`);
    // 종료후 worker 다시 생성
    cluster.fork();
  });
}

// 하위 프로세스
if (cluster.isWorker) {
  console.log(`Worker ${process.pid} started`);
  require("./index");
}
