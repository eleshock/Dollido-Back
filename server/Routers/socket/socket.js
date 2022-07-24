import chooseBestPerformer from "../bestPerformer/chooseBestPerformer";
import { Server } from "socket.io";
import {
  handleMakeRoom,
  handleJoinRoom,
  handleFinish,
  handleWait,
  handleStart,
  handleReady,
  handleOutRoom
} from "./handleSocket";

const rooms = {};
const socketOn = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });

  // 소켓 연결
  io.on("connection", (socket) => {
    //방 리스트
    socket.on("get room list", () => {
      socket.emit("give room list", rooms);
    });

    // 방 생성
    socket.on("make room", ({ roomName, roomID, maxCnt}) => {
      const handle = handleMakeRoom(roomName, roomID, maxCnt);
      if (handle.bool) {
        rooms[roomID] = {
          roomName,
          maxCnt,
          count: 0,
          readyCount: 0,
          bestPerformer: null,
          isPlay: false,
          members: [],
        };

        io.emit("give room list", rooms);
      } else {
        io.to(socket.id).emit("make room fail", handle);
      }
    });

    // 방 참여
    socket.on("join room", ({ roomID, streamID, nickName, initialHP }) => {
      const room = rooms[roomID];
      const handle = handleJoinRoom(roomID, streamID, nickName, room);
      const mySocket = socket.id;

      if (handle.bool) {
        let members = room.members;
        const member = {
          socketID: mySocket,
          streamID: streamID,
          nickName: nickName,
          isReady: false,
          HP: initialHP,      // best performer 결정에 사용
        }

        if (room) {
          members.push(member);
        } else {
          members = [member];
        }

        const otherUsers = members.filter((info) => info.socketID !== mySocket);

        socket.join(roomID);
        room.count += 1;

        if (otherUsers) {
          socket.emit("other users", otherUsers);
          console.log("socketID", mySocket);
          console.log("streamID", streamID);
          console.log("nickName", nickName);
          socket.broadcast.to(roomID).emit("user joined", {
            socketID: mySocket,
            streamID,
            nickName,
          });
        }
        console.log(members)
      } else {
        io.to(mySocket).emit("join room fail", handle);
      }
    });

    // 게임 끝
    socket.on("finish", ({roomID}) => {
      const room = rooms[roomID];
      const handle = handleFinish(roomID, room);

      if (handle.bool) {
        room.bestPerformer = chooseBestPerformer(rooms, roomID);
        room.readyCount = 0
        room.members.forEach((info) => {
          info.isReady = false;
          info.isPlay = false;
        });

        io.to(roomID).emit("finish");
      } else {
        io.to(socket.id).emit("finish room fail",handle);
      }
    });

    // 방장 체크
    socket.on("wait", ({roomID}) => {
      const room = rooms[roomID];
      const handle = handleWait(roomID, room);

      if (handle.bool) {
        const chief = room.members[0].socketID;
        const chiefStream = room.members[0].streamID;
        const status = chief === socket.id ? true : false;

        io.to(socket.id).emit("wait", { status, roomID, chiefStream });
      } else {
        io.to(socket.id).emit("wait room fail", handle);
      }
    });

    // 게임 시작
    socket.on("start", ({roomID}) => {
      const room = rooms[roomID];
      const mySocket = socket.id;
      const handle = handleStart(roomID, room);
      let status = false;

      if (handle.bool) {
        if (room.members[0].socketID == mySocket && room.count-1 === room.readyCount) {
          status = true;
        }
        io.to(roomID).emit("start", status);
      } else {
        io.to(socket.id).emit("start room fail", handle);
      }
    });

    // 게임 레디
    socket.on("ready", ({roomID}) => {
      const room = rooms[roomID];
      const handle = handleReady(roomID, room);

      if (handle.bool) {
        const member = room.members.filter((info) => info.socketID == socket.id);

        if (member) {
          const chief = room.members[0]
          let isReady = member[0].isReady;

          room.readyCount = isReady ? room.readyCount - 1 : room.readyCount + 1;
          member[0].isReady = !isReady;

          console.log(room);

          io.to(roomID).emit("ready", {
            nickName: member[0].nickName,
            status: member[0].status,
            stream: member[0].streamID,
          });
        }
      }
    });

    // 전송하고 싶은 offer을 target에게 재전송
    socket.on("offer", (payload) => {
      io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", (payload) => {
      io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", (incoming) => {
      socket.broadcast.to(incoming.roomID).emit("ice-candidate", incoming);
    });

    // 창을 완전히 닫았을 경우
    socket.on("disconnect", () => {
      handleOutRoom(socket, rooms, io);
    });

    // 뒤로가기로 방을 나갔을 경우
    socket.on("out room", () => {
      handleOutRoom(socket, rooms, io);
    });

    // 각 유저의 hp 전달
    socket.on("smile", (peerHP, roomID, peerID, peerStreamID) => {
      // HP 기록
      for (const member of rooms[roomID].members) {
        if (member.nickName === peerID) {
          member.HP = peerHP;
          break;
        }
      }
      socket.to(roomID).emit("smile", peerHP, peerID, peerStreamID);
    });

    // 유저로부터 채팅 메시지를 받아서 다른 유저에게 뿌려줌
    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });
  });
};

module.exports = { socketOn, rooms };