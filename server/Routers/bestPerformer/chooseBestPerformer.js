const defaultUserNick = "salmonsushi";

/** best performer 결정
 * 정책 : 가장 HP가 낮은 사람 */
 function chooseBestPerformer(rooms, roomID) {
    let untilMinHP = 10**6;
    let bestPerformer = defaultUserNick;
    for (const member of rooms[roomID].members) {
        if (member.HP < untilMinHP) {
            untilMinHP = member.HP;
            bestPerformer = member.nickName;
        }
    }
    return bestPerformer;
}

module.exports = chooseBestPerformer;