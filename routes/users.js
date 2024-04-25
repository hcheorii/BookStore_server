const express = require("express");
const router = express.Router();
router.use(express.json());
const {
    join,
    login,
    passwordReset,
    passwordResetRequest,
    userValidationRules,
    emailValidationRules,
    validate,
} = require("../controller/UserController");

//회원가입
router.post("/join", userValidationRules(), validate, join);

//로그인
router.post("/login", userValidationRules(), validate, login);

//비밀번호 초기화 요청
router.post("/reset", emailValidationRules(), validate, passwordResetRequest);

//비밀번호 초기화
router.put("/reset", userValidationRules(), validate, passwordReset);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게
