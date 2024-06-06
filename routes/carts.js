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
router.post("/", cartValidationRules(), validate, addToCart);

router.get("/", getCartItem);

router.delete("/:id", removeCartItem);

module.exports = router;
