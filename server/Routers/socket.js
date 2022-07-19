import { Server } from "socket.io";

module.exports = async (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      
    }
  
  });
  
  const rooms = {};

  // 해당 socket이 방을 나가는 경우
  const outRoom = (socket) => {
    let theID = "";
    Object.entries(rooms).forEach((room) => {
      let nickname = "";
      let exUserStreamID = "";

      // 나머지 인원에게 나간 사람 정보 broadcast
      const newRoomMembers = room[1].members.filter((v) => {
        if (v.socketID === socket.id) {
          theID = room[0];
          nickname = v.nickName;
          exUserStreamID = v.streamID;
          io.to(theID).emit("out user", {
            nickname,
            streamID: exUserStreamID,
          });
        }

        socket.leave(theID);
        if (v.socketID !== socket.id) {
          return v;
        }
      });

      // rooms의 정보 갱신
      room[1].members = newRoomMembers;
    });

    io.to(theID).emit("give room list", rooms);
  };

  io.on("connection", (socket) => {
    socket.on("get room list", () => {
      socket.emit("give room list", rooms);
    });

    // 방 생성
    socket.on("make room", ({ roomName, roomID }) => {
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
        // 방장은 배열에 넣어서 처음 넣어줌
        rooms[roomID].members = [{ socketID: socket.id, streamID, nickName }];
      }

      const otherUsers = rooms[roomID].members.filter(
        (id) => id.socketID !== socket.id
      );

      socket.join(roomID);

      if (otherUsers) {
        // 본인에게 기존 사람이 있다고 알림
        socket.emit("other users", otherUsers);

        // 기존 사람들에게는 본인이 새로 들어간다고 알림
        socket.broadcast.to(roomID).emit("user joined", {
          socketID: socket.id,
          streamID,
          nickName,
        });
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
      outRoom(socket);
    });

    // 뒤로가기로 방을 나갔을 경우
    socket.on("out room", () => {
      outRoom(socket);
    });
  });
};