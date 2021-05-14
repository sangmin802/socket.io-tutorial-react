// 클라이언트의 요청 수가 많아지면, 하나의 서버로 모든 작업을 수행하기에는 부담이 되기 때문에, 로드밸런싱 작업 이필요함
// scale up : 서버 자체의 용량을 높이는 것
// scale out : 서버를 여러개 증설하여 클라이언트 분산(로드밸런싱)
//  -로드밸런싱 작업
//    클라이언트의 수가 늘어났을 때, 서버로 작업이 바로 전달되는것이 아닌, 로드밸런싱을 거쳐서 작업들이 분산되어 여러개의 서버에 전달됨
//    aws ec2 auto scaling

// 여러개의 socket.io서버를 만들 때 필요한 두가지 조건
//  1. 고정 세션 활성화
//  2. 기본 메모리 어뎁터를 redis 어뎁터로 변경

// cluster - 작업 스레드 증설 / 로드밸런싱 node.js 버전?
//    메인 프로세스에 여러개의 자식 프로세스들이 생성됨
//      이 하위 프로세스들을 worker 라고 하는듯 함. fork 이벤트로 생성

// redis - 데이터 통신 활성화
//    동일한 socket.io서버가 아니라면 emit등의 통신을 할 수 없다. 이러한점을 가능하게 해주는것이
//    redis의 pub/sub 기능
const cluster = require("cluster");
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
