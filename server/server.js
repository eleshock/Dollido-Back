import http from "http";
import cors from "cors";
import express from "express";
import webSocket from "./Routers/socket";
// routers import
import apiGifs from "./Routers/gifs";
import apiSignUp from "./Routers/member/signup";
import apiSignIn from "./Routers/member/signin";

const port = 5000;
const app = express();
const server = http.createServer(app);

// 기본 설정 (cors, 접근할 수 있는 경로)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./server/public'));
4
// routers
app.use("/api/gifs", apiGifs);
app.use("/api/user/signup", apiSignUp);
app.use("/api/user/signin", apiSignIn);

// webSocket, https 연결
webSocket(server);
server.listen(port, () => console.log("접속 완료"));