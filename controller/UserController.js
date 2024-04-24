//[2기] 이현철
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const join = (req, res) => {
    const { email, password } = req.body;

    //비밀번호 암호화
    const salt = crypto.randomBytes(10).toString("base64"); //64길이 만큼의 랜덤 바이트 생성
    const hashPassword = crypto
        .pbkdf2Sync(password, salt, 10000, 10, "sha512")
        .toString("base64");
    //10000은 해시함수를 반복하는 횟수
    let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
    let values = [email, hashPassword, salt];
    conn.query(sql, values, function (err, results) {
        if (err) {
            //서버측 에러
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        res.status(StatusCodes.CREATED).json(results);
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email, function (err, results) {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        const loginUser = results[0];
        const hashPassword = crypto
            .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
            .toString("base64");

        if (loginUser && loginUser.password == hashPassword) {
            //토큰 발행
            const token = jwt.sign(
                {
                    email: loginUser.email,
                    id: loginUser.id,
                },
                process.env.PRIVATE_KEY,
                {
                    expiresIn: "5m",
                    issuer: "hclee",
                }
            );
            //토큰 쿠키에 담기
            res.cookie("token", token, {
                httpOnly: true, //너 이거 API로만 활용가능해
            });
            console.log(token);
            res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end(); //인증되지 않은 사용자 (401)
        }
    });
};

const passwordResetRequest = (req, res) => {
    const { email } = req.body;
    let sql = "SELECT * FROM users WHERE email = ?";
    conn.query(sql, email, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        //이메일로 유저가 있는지 찾기
        const user = result[0];
        if (user) {
            return res.status(StatusCodes.OK).json({
                email: email, //초기화 페이지로 넘겨준다.
            });
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end();
        }
    });
};

const passwordReset = (req, res) => {
    const { email, password } = req.body; //이전 페이지에서 입력했던 이메일(요청에서 response로 넘겨준다)

    let sql = "UPDATE users SET password = ?, salt = ? WHERE email = ?";
    const salt = crypto.randomBytes(10).toString("base64"); //64길이 만큼의 랜덤 바이트 생성
    const hashPassword = crypto
        .pbkdf2Sync(password, salt, 10000, 10, "sha512")
        .toString("base64");
    let values = [hashPassword, salt, email];
    conn.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        if (result.affectedRows == 0) {
            //잘못된 입력으로 인해 바뀐 데이터가 없을때
            return res.status(StatusCodes.BAD_REQUEST).end();
        } else {
            return res.status(StatusCodes.OK).end();
        }
    });
};

module.exports = { join, login, passwordReset, passwordResetRequest };
