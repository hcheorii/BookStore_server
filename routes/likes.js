//2기 이현철

const express = require("express");
const { addLike, removeLike } = require("../controller/LikeController");
const router = express.Router();
router.use(express.json());
//좋아요
router.post("/:id", addLike);

//좋아요 취소
router.delete("/:id", removeLike);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게

