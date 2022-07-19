import http from "http";
import cors from "cors";
import express from "express";
import webSocket from "./Routers/socket";
// routers import
import apiGifs from "./Routers/gifs";
import apiMember from "./Routers/member";
import apiTest from "./Routers/test";

const port = 5000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('./server/public'));
4
// routers
app.use("/api/test", apiTest);
app.use("/api/gifs", apiGifs);
app.use("/api/member", apiMember);

// webSocket, https 연결
webSocket(server);
server.listen(port, () => console.log("접속 완료"));