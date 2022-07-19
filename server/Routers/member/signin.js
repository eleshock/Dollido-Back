import { Router } from "express";
import queryGet from "../../modules/db_connect";
import memberQuery from "../../query/member";
import encryption from "./encryption";
import jwt from "../../modules/jwt";
import authUtil from "../member/auth";

const router = Router();

const handleValidate = (user_id, user_pw) => {
    let bool = true;
    let msg = '합격';

    if(user_id == "" || user_id == undefined) {
        bool = false;
        msg = '아이디를 입력해주세요';
    } else if(user_pw == "" || user_pw == undefined) {
        bool = false;
        msg = '비밀번호를 입력해주세요';
    }

    return {bool: bool, msg: msg};
}

router.post("/", async (req, res) => {
    let { user_id, user_pw } = req.body;
    let validate = handleValidate(user_id, user_pw);
    let bool = validate.bool;
    let msg = validate.msg;
    
    if (bool) {
        try {
            let result = await queryGet(memberQuery.findBySalt, user_id);
            let args = [user_id, (await encryption(user_pw, 1, result[0].salt)).password];
            let user = await queryGet(memberQuery.login, args);
            let jwtToken = await jwt.sign(user[0]);
            let member = {user_id: user[0].user_id, user_nick: user[0].nick_name, tokenInfo: jwtToken}; 
            res.status(201).send({bool: true, msg: "로그인 성공", member: member});
            return;
        } catch {
            res.status(200).send({bool: false, msg: "로그인 실패"});
            return;
        }
    }

    res.status(200).send({bool: bool, msg: msg});
});

router.post("/auth", authUtil, (_, res) => {
    res.status(200).send({bool: true, msg: "로그인 인증"})
});

module.exports = router;