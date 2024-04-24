const express = require("express");
const router = express.Router();
router.use(express.json());
const { body, validationResult } = require("express-validator");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const {
    join,
    login,
    passwordReset,
    passwordResetRequest,
} = require("../controller/UserController");

const validate = (req, res, next) => {
    //효율적이지 않다.
    const err = validationResult(req);
    if (err.isEmpty()) {
        return next(); //에러가 없다면 다음 함수(미들웨어) 찾아가봐.
    } else {
        return res.status(400).json(err.array());
    }
};

//회원가입
router.post("/join", join);

//로그인
router.post("/login", login);

//비밀번호 초기화 요청
router.post("/reset", passwordResetRequest);

//비밀번호 초기화
router.put("/reset", passwordReset);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게
