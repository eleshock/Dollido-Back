// database
module.exports = {
    insertGif: "INSERT INTO image (member_id, laughing_cnt, image_orgin, image_server) VALUES(?, ?, ?, ?)",
    findByImageId: "SELECT image_id FROM image WHERE image_server=?",
    findByIamge: "SELECT * FROM image WHERE image_server=?"
}