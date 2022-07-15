import express from "express";
import http from "http";
import api from "./Router/api";
import cors from "cors";
import webSocket from "./socket";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use("/api", api);
app.use(express.static('./server/public'));

const port = 5000;
server.listen(port);

webSocket(server);