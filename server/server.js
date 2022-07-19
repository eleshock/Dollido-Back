import http from "http";
import cors from "cors";
import express from "express";
import webSocket from "./Routers/socket";

// routers import
import apiGifs from "./Routers/gifs";
import apiMember from "./Routers/member";
import apiTest from "./Routers/test";
import apiBestPerformer from "./Routers/bestPerformer";

const port = 5000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json()); // 이거 넣어줘야 post에서 데이터 받을 수 있다규..ㅠ
app.use(express.static('./server/public'));
app.use(express.static('./server/bestVideos'));
app.use(express.urlencoded({ extended: false })); // app을 통해 들어오는 모든 요청은 bodyParser라는 미들웨어를 거쳐 라우트로 전달

// routers
app.use("/api/test", apiTest);
app.use("/api/gifs", apiGifs);
app.use("/api/member", apiMember);
app.use("/api/best", apiBestPerformer);

// webSocket, https 연결 
webSocket(server);
server.listen(port, () => console.log("접속 완료"));