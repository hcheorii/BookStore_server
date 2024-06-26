// [2기] 이현철
const conn = require("../mariadb"); //db모듈
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const ensureAuthorization = require("../auth"); //인증 모듈
const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
    console.log(2);

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
};
const cartValidationRules = () => {
    console.log(3);
    return [
        body("book_id")
            .notEmpty()
            .custom((value) => {
                // 숫자로만 이루어진 문자열인지 확인하는 검증 로직
                return /^\d+$/.test(value);
            })
            .withMessage("책 제품 번호를 입력하세요"),
        body("quantity").notEmpty().isInt().withMessage("책 개수를 입력하세요"),
        validate,
    ];
};

//장바구니 담기
const addToCart = (req, res) => {
    const { book_id, quantity } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // 유효성 검사 통과 못했을 때
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ errors: errors.array() });
    }

    const authorization = ensureAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    } else if (!authorization.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "사용자 정보가 없습니다.",
        });
    } else {
        let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
        let values = [book_id, quantity, authorization.id];
        conn.query(sql, values, (err, results) => {
            if (err) {
                // 서버측 에러
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        });
    }
};

//장바구니 아이템 목록 조회
const getCartItem = (req, res) => {
    const { selected } = req.body; //selected는 장바구니에서 내가 선택한 도서들 배열
    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    } else {
        let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price  
        FROM cartItems LEFT JOIN books 
        ON books.id = cartItems.book_id  
        WHERE user_id = ? `;

        let values = [authorization.id];
        if (selected) {
            //주문서 작성시 선택한 장바구니 조회하는 용도
            sql += `AND cartItems.id IN (?)`;
            values.push(selected);
        }

        conn.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        });
    }
};

//[2기] 이현철
const removeCartItem = (req, res) => {
    let sql = `DELETE FROM cartItems WHERE id = ?`;
    const authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    } else {
        const cartItemId = req.params.id; //cartItemId
        conn.query(sql, cartItemId, (err, results) => {
            if (err) {
                //서버측 에러
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        });
    }
};

module.exports = {
    addToCart,
    getCartItem,
    removeCartItem,
    cartValidationRules,
    validate,
};
