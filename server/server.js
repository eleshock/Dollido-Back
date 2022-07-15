const express = require("express");
const app = express();
const server = require('http').createServer(app);
const api = require("./Router/api");
const path = require("path");
const router = require("./Router/api");
const webSocket = require("./socket");


app.use("/api", api);
app.use(express.static('public'));

const port = 5000;
server.listen(port, () => console.log(`server is running on port ${port}`))

webSocket(server);