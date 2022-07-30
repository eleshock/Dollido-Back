module.exports = {
    insertVideo: `INSERT INTO best_videos (member_id, video_name, server_name) VALUES(?, ?, ?)`,
    deleteVideo: `DELETE FROM best_videos WHERE server_name=(?)`
};