import { chooseBestPerformer, deleteVideoCache } from "../bestPerformer/bestPerformerFuncs";
import { chooseReverseUser } from "../../modules/reverseItem";
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
const reverseTime = {};
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
      io.to(socket.id).emit("give room list", rooms);
    });
    
    // 방 생성
    socket.on("make room", ({ roomName, roomID, roommode, maxCnt}) => {
      const handle = handleMakeRoom(roomName, roomID, roommode, maxCnt);
      if (handle.bool) {
        rooms[roomID] = {
          roomName,
          maxCnt,
          count: 0,
          readyCount: 0,
          bestPerformer: null,
          isPlay: false,
          members: [],
          roommode,
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

      const messageData = {
        room: roomID,
        author: 'system',
        message: `${nickName} 님이 입장했습니다`,
      }

      if (handle.bool) {
        let members = room.members;
        const member = {
          socketID: mySocket,
          streamID: streamID,
          nickName: nickName,
          isReady: false,
          HP: initialHP,      // best performer 결정에 사용
        }

        members.forEach((info) => io.to(mySocket).emit("setting", info.streamID, info.isReady, info.nickName));

        room ? members.push(member) : members = [member];
        room.count += 1;
        
        socket.join(roomID);
        socket.broadcast.to(roomID).emit("join room", mySocket);
        socket.broadcast.to(roomID).emit("setting_add", member.streamID, member.nickName);
        
        console.log(members)

        io.to(roomID).emit("onConnect", messageData);

      } else {
        io.to(mySocket).emit("join room fail", handle);
      }
    });

    // 게임 끝
    socket.on("finish", ({roomID, HP}) => {
      const room = rooms[roomID];
      const handle = handleFinish(roomID, room);
      const hpList = [];
      if (handle.bool) {
        room.bestPerformer = chooseBestPerformer(rooms, roomID);
        room.readyCount = 0
        room.isPlay = false;
        room.members.forEach((info) => {
          info.isReady = false;
        });

        reverseTime[roomID].forEach((sendReverse)=> clearTimeout(sendReverse)); // Reverse아이템 보내는 setTimeout 중지
        for (const member of rooms[roomID].members) {
            hpList.push([member.streamID, member.HP])
        }

        const chief = room.members[0].socketID;
        const chiefStream = room.members[0].streamID;
        const status = chief === socket.id ? true : false;

        io.to(socket.id).emit("wait", { status, roomID, chiefStream });
        io.to(roomID).emit("finish", (hpList));
      } else {
        io.to(socket.id).emit("finish room fail",handle);
      }
    });
    
    socket.on("restart", ({ roomID }) => {
      io.to(roomID).emit("restart");
    })
    
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


    const randomNumberProducer = async () => {
      let randomNumber = [];
      for(var i = 0; i < 22; i++) {
          let myRandomNumber = Math.floor(Math.random() * gifCount);
          if(!randomNumber.includes(myRandomNumber)) {
              randomNumber.push(myRandomNumber);
          } else {
              i--;
          }
      };
      return randomNumber
    }

    // 게임 시작
    socket.on("start", async ({roomID}) => {
      let randomList = [];
      const room = rooms[roomID];
      const mySocket = socket.id;
      const handle = handleStart(roomID, room);
      let status = false;
      randomList = await randomNumberProducer();
      for (const member of rooms[roomID].members) {
          member.HP = 100;
      }

      if (handle.bool) {
        if (room.members[0].socketID == mySocket && room.count-1 === room.readyCount) {
          status = true;
          room.isPlay = true;
          deleteVideoCache(room);
          const sendReverse1 = setTimeout(() => io.to(chooseReverseUser(rooms, roomID)).emit("send-reverse"), 30000);
          const sendReverse2 = setTimeout(() => io.to(chooseReverseUser(rooms, roomID)).emit("send-reverse"), 60000);
          reverseTime[roomID] = []
          reverseTime[roomID].push(sendReverse1);
          reverseTime[roomID].push(sendReverse2);
        }
        io.to(roomID).emit("start", status, randomList);
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

        if (member[0]) {
          const readyCount = room.readyCount;
          let isReady = member[0].isReady;

          room.readyCount = isReady ? readyCount - 1 : readyCount + 1;
          member[0].isReady = !isReady;

          io.to(roomID).emit("ready", {
            streamID: member[0].streamID,
            isReady: member[0].isReady
          });
        }
      }
    });

    socket.on("reverse", ({ roomID }) => {
      io.to(roomID).emit("reverse");
    })
    
    // 전송하고 싶은 offer을 target에게 재전송
    socket.on("offer", (offer, userID, socketID) => {
      io.to(userID).emit("offer", socketID, offer);
    });
    
    socket.on("answer", (answer, userID, socketID) => {
      io.to(userID).emit("answer", answer, socketID);
    });
    
    socket.on("ice-candidate", (incoming) => {
      io.to(incoming.userID).emit("ice-candidate", incoming.candidate, incoming.caller);
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
    socket.on("smile", (peerHP, roomID, peerID, peerStreamID, isJudgement) => {
      // HP 기록
      for (const member of rooms[roomID].members) {
        if (member.streamID === peerStreamID) {
          member.HP = peerHP;
          break;
        }
      }
      socket.to(roomID).emit("smile", peerHP, peerID, peerStreamID, isJudgement);
    });

    socket.on("zeus", (roomID) => {
      io.to(roomID).emit("zeus");
    })

    socket.on("judgement", (roomID, peerStreamID) => {
      io.to(roomID).emit("judgement", peerStreamID);
    })

    
    // 유저로부터 채팅 메시지를 받아서 다른 유저에게 뿌려줌
    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });
    
    socket.on("my_weapon", async (roomID, myGIF, myNickname) => {
      try {
        let randomList = [];
        randomList = await randomNumberProducer();

        io.to(roomID).emit("my_weapon", {randomList, myGIF, myNickname});
      } catch(e) {
        console.log(e)
      }
    });
  });
};

module.exports = { socketOn, rooms };