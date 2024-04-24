//[2기] 이현철

const express = require("express");
const router = express.Router();
router.use(express.json());
const { allCategory } = require("../controller/CategoryController");

//카테고리 전체 조회
router.get("/", allCategory);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게
