//2기 이현철
const express = require("express");
const router = express.Router();
router.use(express.json());
const {
    order,
    getOrders,
    getOrderDetail,
} = require("../controller/OrderController");
//주문하기
router.post("/", order);

//주문내역 조회
router.get("/", getOrders);
//주문 상세 조회
router.get("/:id", getOrderDetail);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게
