const conn = require("../mariadb"); //db모듈
const { StatusCodes } = require("http-status-codes");

const allCategory = (req, res) => {
    //카테고리 전체 목록 리스트
    let sql = `SELECT * FROM category`;
    conn.query(sql, (err, results) => {
        if (err) {
            //서버측 에러
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        res.status(StatusCodes.OK).json(results);
    });
};

module.exports = { allCategory };
