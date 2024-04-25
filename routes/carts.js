const express = require("express");
const {
    addToCart,
    getCartItem,
    removeCartItem,
    cartValidationRules,
    validate,
} = require("../controller/CartController");
const router = express.Router();
router.use(express.json());
//장바구니 조회
router.post("/", cartValidationRules(), validate, addToCart);

//장바구니 아이템 목록 조회 // 선택된 idemfdl req body로 같이 넘어오면.. 선택된 장바구니 아이템 목록 조회
router.get("/", getCartItem);

//장바구니 도서 삭제
router.delete("/:id", removeCartItem);

module.exports = router; //모듈화 하는 부분 app.js에서 사용가능하게
