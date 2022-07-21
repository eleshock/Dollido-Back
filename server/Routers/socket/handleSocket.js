const handleMakeRoom = (roomName, roomID, maxCnt) => {
    let msg;
    let bool = false;

    if (roomName === "" || roomName === undefined || roomID === "" || roomID === undefined) {
        msg = "방 이름을 작성해 주세요";
    } else if (maxCnt <= 0) {
        msg = "방 인원을 최소 1명 이상이여야 됩니다";
    } else if (maxCnt > 4) {
        msg = "방 인원은 최대 4명 입니다";
    } else {
        msg = "방 생성 성공";
        bool = true;
    }

    return {msg: msg, bool: bool};
}

const handleJoinRoom = (roomName, streamID, nickName, count, isPlay) => {
    let msg;
    let bool = false;

    if (roomName === "" || roomName === undefined) {
        msg = "해당 방이 없습니다";
    } else if (streamID === "" && streamID === undefined) {
        msg = "영상을 허용해주세요";
    } else if (nickName === "" || nickName === undefined) {
        msg = "로그인 후 이용가능합니다";
    } else if (count > 4) {
        msg = "현재 방에 인원이 꽉 찼습니다";
    } else if (isPlay) {
        msg = "이미 게임 중입니다";
    } else {
        msg = "방 입장 성공";
        bool = true;
    }

    return {msg: msg, bool: bool};
}

module.exports = {
    handleMakeRoom,
    handleJoinRoom
}