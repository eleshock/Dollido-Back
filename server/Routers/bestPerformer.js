import express from "express";
import multer from "multer";
import fs from "fs";

const destPath = 'uploads/'
const bestVideosPath = __dirname + '/../bestVideos';
const uploadPath = __dirname + '/../../' + destPath;

/**나중에 해야 하는 일 :
 * 방 폭파되거나 유저 나갔을 때 bestVidoes의 나간 사람들 userId에 대한 비디오 undefined로 바꿔주기
 * import getBestPerformer from ~~ 이런 식으로 bestPerformer 받아오는 함수 구현
 * 
 * 참고 :
 * 현재 비디오는 유저 Id당 하나씩 서버에 저장되어 있음(영상이 덮어씌워지는 방식) */

const bestPerformerId = "salmonsushi"; // 임시

const router = express.Router();
const upload = multer({ dest: destPath });
const bestVideos = {}; // userId에 대한 비디오 이름이 저장됨

/** 유저가 자신의 웃는 영상(userVideo)을 userId와 함께 보내면 이를 저장하고 bestVideoPath에 보관 */
router.post('/send-video', upload.single("video"), (req, res) => {
    const userId = req.body.userId;
    const userVideo = req.file;
    console.log(userId, userVideo);

    const newVideoNname = `${userId}.mp4`
    const oldPath = `${uploadPath}/${userVideo.filename}`;
    const newPath = `${bestVideosPath}/${newVideoNname}`;

    bestVideos[userId] = newVideoNname;    // bestVideos에 등록
    
    fs.rename(oldPath, newPath, (e) => {console.log(e)}); // 파일 bestVideosPath로 이동
    
    res.status(201).send({success : true, msg : "파일이 성공적으로 전송되었습니다."});
});

/** best performer의 id와 비디오 이름 던져줌 */
router.get("/get-video", (_, res) => {
    const bestVideoName = bestVideos[bestPerformerId];
    console.log(bestVideoName);
    bestVideos[bestPerformerId] = undefined; // 이전 영상 cache 삭제
    res.send({bestPerformerId: bestPerformerId, bestVideoName: bestVideoName});
})

module.exports = router;