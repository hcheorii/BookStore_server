const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const ensureAuthorization = require("../auth");
const jwt = require("jsonwebtoken");

const allBooks = (req, res) => {
    let { category_id, news, limit, currentPage } = req.query;

    let offset = limit * (currentPage - 1);
    let allBooksRes = {};
    let sql = `SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE books.id=liked_book_id) AS likes FROM books`; //좋아요 개수가 포함된 books테이블 조회

    let values = [];

    if (category_id && news) {
        // news가 true이면서 category_id가 있는 경우
        sql += ` WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`; // 조건문 수정
        values = [parseInt(category_id)]; // 값 추가
    } else if (category_id) {
        // category_id만 있는 경우
        sql += ` WHERE category_id=?`;
        values = [parseInt(category_id)]; // 값 추가
    } else if (news) {
        // news만 있는 경우
        sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    }

    sql += ` LIMIT ? OFFSET ?`; // LIMIT과 OFFSET 추가
    values.push(parseInt(limit), offset);

    conn.query(sql, values, (err, results) => {
        // 쿼리 실행
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end(); // 에러 발생 시 응답
        }
        console.log(results);

        // 변경된 부분: 항상 빈 배열을 반환하도록 수정
        results.map(function (result) {
            result.pubDate = result.pub_date;
            delete result.pub_date;
        });
        allBooksRes.books = results;

        // 만약 results가 빈 배열이라도, 아래 부분이 실행되도록 수정
        sql = `SELECT found_rows()`; // LIMIT과 OFFSET 추가

        conn.query(sql, (err, results) => {
            // 두 번째 쿼리 실행
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            let pagination = {};
            pagination.currentPage = parseInt(currentPage);
            console.log(results[0]);
            pagination.totalCount = results[0]["found_rows()"];

            allBooksRes.pagination = pagination;
            return res.status(StatusCodes.OK).json(allBooksRes); // 빈 배열일 경우에도 OK 응답을 반환
        });
    });
};

const bookDetail = (req, res) => {
    //로그인 상태가 아니면 => liked 빼고 보내주면 되고
    //로그인 상태라면 => ㅣiked 추가해서 보내주면 된다.
    const book_id = req.params.id;
    const authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    }

    let sql = `SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes`;
    const values = [book_id];

    if (authorization) {
        sql += `, (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked`;
        values.push(authorization.id, book_id);
    }

    sql += ` FROM books 
            LEFT JOIN category ON books.category_id = category.category_id 
            WHERE books.id=?`;

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.length) {
            return res.status(StatusCodes.OK).json(results[0]);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
};

module.exports = {
    allBooks,
    bookDetail,
};
