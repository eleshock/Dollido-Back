import express from "express";
import multer from "multer";
import fs from "fs";
import { rooms } from "../socket/socket";

const destPath = 'uploads/'
const bestVideosPath = __dirname + '/../../bestVideos';
const uploadPath = __dirname + '/../../../' + destPath;

const router = express.Router();
const upload = multer({ dest: destPath });
const bestVideos = {}; // user_nick에 대한 비디오 이름이 저장됨

function getNowTime() {
    let now = new Date();
    now.setHours(now.getHours() + 9); // 한국 시간으로 세팅
    const date = now.toLocaleString().split(',')[0].replace('/', '').replace('/', '');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].join('');
    const nowTime = `${date}_${time}`;

    return nowTime;
}

/** 유저가 자신의 웃는 영상(userVideo)을 user_nick와 함께 보내면 이를 저장하고 bestVideoPath에 보관 */
router.post('/send-video', upload.single("video"), (req, res) => {
    const user_nick = req.body.user_nick;
    const userVideo = req.file;
    console.log(`${user_nick} video uploaded. size : ${userVideo.size}`);

    const nowTime = getNowTime();
    const newVideoNname = `${user_nick}-${nowTime}.mp4`
    const oldPath = `${uploadPath}/${userVideo.filename}`;
    const newPath = `${bestVideosPath}/${newVideoNname}`;

    bestVideos[user_nick] = newVideoNname;    // bestVideos에 등록

    fs.rename(oldPath, newPath, (err) => {    // 파일 bestVideosPath로 이동
        if (err) console.log(err);
    });

    res.status(201).send({ success: true, msg: "파일이 성공적으로 전송되었습니다." });
});


/** best performer의 id와 비디오 이름 던져줌 */
router.post("/get-video", (req, res) => {
    const room = rooms[req.body.roomID];

    if (room === undefined) {
        res.status(404).send({ msg: `존재하지 않는 방입니다. roomID : ${req.body.roomID}` });
        return;
    }

    const bestPerformerNick = room.bestPerformer;
    console.log("best performer :", bestPerformerNick);
    if (bestPerformerNick == null) {
        res.status(404).send({ msg: "best performer가 지정되지 않았습니다." });
    } else {
        const bestVideoName = bestVideos[bestPerformerNick];
        console.log('video name :', bestVideoName);
        res.send({ bestPerformerNick: bestPerformerNick, bestVideoName: bestVideoName });
    }
})


/** 유저의 파일 삭제 */
router.post("/delete-video", (req, res) => {
    let user_nick = req.body.user_nick;

    const videoName = bestVideos[user_nick];
    if (videoName === undefined) {
        res.send({ msg: "비디오가 이미 삭제되었거나 기록된 적이 없습니다." });
    } else {
        const videoPath = `${bestVideosPath}/${videoName}`;
        bestVideos[user_nick] = undefined; // 이전 영상 cache 삭제

        fs.unlink(videoPath, (err) => {    // 파일 삭제
            if (err) console.log(err);
        });
        console.log(`Video Delete Success(Video name : ${videoName})`);

        res.send({ msg: `${videoName} 삭제 완료` });
    }
})

module.exports = router;