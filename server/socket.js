const rooms = {};
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

// 해당 socket이 방을 나가는 경우
const outRoom = (socket) => {
  let theID = "";
  Object.entries(rooms).forEach((room) => {
    let nickname = "";
    let exUserStreamID = "";
    // console.log(socket)
    const newRoomMembers = room[1].members.filter((v) => {
      console.log(room[1]);
      if (v.socketID === socket.id) {
        theID = room[0];
        nickname = v.nickName;
        exUserStreamID = v.streamID;
        io.to(theID).emit("out user", {
          nickname,
          streamID: exUserStreamID,
        }); // 나머지 인원에게 나간 사람 정보 broadcast
      }
      socket.leave(theID);
      if (v.socketID !== socket.id) {
        return v;
      }
    });
    room[1].members = newRoomMembers; // rooms의 정보 갱신
    // console.log(room[1]);
  });
  io.to(theID).emit("give room list", rooms);
};

module.exports = async (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });
  io.on("connection", (socket) => {
    socket.on("get room list", () => {
      socket.emit("give room list", rooms);
    });
    socket.on("make room", ({ roomName, roomID }) => {
      // 방 생성
      console.log(roomName + "/" + roomID + "방 생성!");
      rooms[roomID] = {
        roomName,
        members: [],
      };
      io.emit("give room list", rooms);
    });

    socket.on("join room", ({ roomID, streamID, nickName }) => {
      if (rooms[roomID]) {
        rooms[roomID].members.push({ socketID: socket.id, streamID, nickName });
      } else {
        rooms[roomID].members = [{ socketID: socket.id, streamID, nickName }]; // 방장은 배열에 넣어서 처음 넣어줌
      }
      const otherUsers = rooms[roomID].members.filter(
        (id) => id.socketID !== socket.id
      );
      socket.join(roomID);
      if (otherUsers) {
        socket.emit("other users", otherUsers); // 본인에게 기존 사람이 있다고 알림
        io.to(roomID).emit("user joined", {
          socketID: socket.id,
          streamID,
          nickName,
        }); // 기존 사람들에게는 본인이 새로 들어간다고 알림
      }
    });
    socket.on("offer", (payload) => {
      io.to(payload.target).emit("offer", payload); // 전송하고 싶은 offer을 target에게 재전송
    });
    socket.on("answer", (payload) => {
      io.to(payload.target).emit("answer", payload);
    });
    socket.on("ice-candidate", (incoming) => {
      io.to(incoming.roomID).emit("ice-candidate", incoming);
    });

    // 창을 완전히 닫았을 경우
    socket.on("disconnect", () => {
      outRoom(socket);
    });

    // 뒤로가기로 방을 나갔을 경우
    socket.on("out room", () => {
      outRoom(socket);
    });
  });
};