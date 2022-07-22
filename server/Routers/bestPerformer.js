import express from "express";
import multer from "multer";
import fs from "fs";
import { rooms } from "./socket/socket";

const destPath = 'uploads/'
const bestVideosPath = __dirname + '/../bestVideos';
const uploadPath = __dirname + '/../../' + destPath;

/**나중에 해야 하는 일 :
 * 방 폭파되거나 유저 나갔을 때 bestVidoes의 나간 사람들 user_nick에 대한 비디오 undefined로 바꿔주기
 * import getBestPerformer from ~~ 이런 식으로 bestPerformer 받아오는 함수 구현
 * 
 * 참고 :
 * 현재 비디오는 유저 Nick당 하나씩 서버에 저장되어 있음(영상이 덮어씌워지는 방식) */
const defaultUserNick = "salmonsushi";
const bestPerformerNick = defaultUserNick; // 임시

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
    console.log(user_nick, userVideo);

    const nowTime = getNowTime();
    const newVideoNname = `${user_nick}-${nowTime}.mp4`
    const oldPath = `${uploadPath}/${userVideo.filename}`;
    const newPath = `${bestVideosPath}/${newVideoNname}`;

    bestVideos[user_nick] = newVideoNname;    // bestVideos에 등록
    
    fs.rename(oldPath, newPath, (e) => {console.log(e)}); // 파일 bestVideosPath로 이동
    
    res.status(201).send({success : true, msg : "파일이 성공적으로 전송되었습니다."});
});


/** best performer의 id와 비디오 이름 던져줌 */
router.get("/get-video", (_, res) => {
    const bestVideoName = bestVideos[bestPerformerNick];
    console.log('video name :', bestVideoName);
    res.send({bestPerformerNick: bestPerformerNick, bestVideoName: bestVideoName});
})


/** 유저의 파일 삭제 */
router.post("/delete-video", (req, res) => {
    let user_nick = req.body.user_nick;
    if (user_nick === null) {
        user_nick = defaultUserNick;
    }
    const videoName = bestVideos[user_nick];
    console.log("Delete Video Try :", videoName);
    if (videoName === undefined) {
        res.send({msg : "비디오가 이미 삭제되었거나, 기록된 적이 없습니다."});
    } else {
        const videoPath = `${bestVideosPath}/${videoName}`;
        bestVideos[user_nick] = undefined; // 이전 영상 cache 삭제
        
        fs.unlink(videoPath, (e) => { console.log(e) });
        console.log("Video Delete Success");

        res.send({msg : `${videoName} 삭제 완료`});
    }
})


module.exports = router;