//[2기] 이현철
// const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const mariadb = require("mysql2/promise");
const ensureAuthorization = require("../auth"); //인증 모듈
const jwt = require("jsonwebtoken");
//주문하기 API
const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: "localhost",
        user: "root",
        database: "Bookshop",
        password: "root1234",
        dateStrings: true,
    });

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
        const { items, delivery, totalQuantity, totalPrice, firstBookTitle } =
            req.body;

        // delievery 테이블 삽입
        let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
        let values = [delivery.address, delivery.receiver, delivery.contact];
        let [results] = await conn.execute(sql, values); //반환을 배열형태로 한다.
        let delivery_id = results.insertId;

        //orders 테이블에 삽입하는 코드
        sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
    VALUES (?,?,?,?,?)`;
        values = [
            firstBookTitle,
            totalQuantity,
            totalPrice,
            authorization.id,
            delivery_id,
        ];
        // firstBookTitle : 대표책제목
        [results] = await conn.execute(sql, values); //이 코드가 끝날때까지 밑의 코드가 진행되면 안되기 때문에 await
        let order_id = results.insertId;

        //items를 가지고 장바구니에서 book_id와 quantity를 조회
        sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
        let [orderItems, fields] = await conn.query(sql, [items]);

        //orderedBook 삽입하는 코드
        sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?;`;
        //items.. 는 배열이고 이걸 하나씩 꺼내서 (forEach문을 돌려야 한다.)
        values = [];
        orderItems.forEach((item) => {
            values.push([order_id, item.book_id, item.quantity]);
        });
        results = await conn.query(sql, [values]);
        let result = await deleteCartItems(conn, items);
        return res.status(StatusCodes.OK).json(result);
    }
};

const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?)`;
    let result = await conn.query(sql, [items]);
    return result;
};

const getOrders = async (req, res) => {
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
        const conn = await mariadb.createConnection({
            host: "localhost",
            user: "root",
            database: "Bookshop",
            password: "root1234",
            dateStrings: true,
        });
        sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price 
            FROM orders LEFT JOIN delivery ON orders.delivery_id = delivery.id`;
        let [rows, fields] = await conn.query(sql);
        return res.status(StatusCodes.OK).json(rows);
    }
};

const getOrderDetail = async (req, res) => {
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
        const orderId = req.params.id;
        const conn = await mariadb.createConnection({
            host: "localhost",
            user: "root",
            database: "Bookshop",
            password: "root1234",
            dateStrings: true,
        });
        sql = `SELECT book_id, title, author, price, quantity
            FROM orderedBook LEFT JOIN books ON orderedBook.book_id = books.id 
            WHERE order_id = ?`;
        let [rows, fields] = await conn.query(sql, [orderId]);
        return res.status(StatusCodes.OK).json(rows);
    }
};

module.exports = {
    order,
    getOrderDetail,
    getOrders,
};
