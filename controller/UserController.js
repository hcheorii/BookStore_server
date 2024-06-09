//[2기] 이현철
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
dotenv.config();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(401).json({ errors: errors.array() });
};
const generateHashedPassword = (password, salt) => {
    return crypto
        .pbkdf2Sync(password, salt, 10000, 10, "sha512")
        .toString("base64");
};

const userValidationRules = () => {
    return [
        body("email")
            .notEmpty()
            .isEmail()
            .withMessage("올바른 이메일을 입력하세요"),
        body("password")
            .notEmpty()
            .isLength({ min: 5, max: 20 })
            .isString()
            .withMessage("올바른 비밀번호를 입력하세요"),
        validate,
    ];
};

const emailValidationRules = () => {
    return [
        body("email")
            .notEmpty()
            .isEmail()
            .withMessage("올바른 이메일을 입력하세요"),
        validate,
    ];
};
const join = (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //유효성 검사 통과 못했을 때
        return res.status(400).json({ erros: errors.array() });
    }

    //비밀번호 암호화
    const salt = crypto.randomBytes(10).toString("base64"); //64길이 만큼의 랜덤 바이트 생성
    const hashPassword = generateHashedPassword(password, salt);

    let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
    let values = [email, hashPassword, salt];
    conn.query(sql, values, function (err, results) {
        if (err) {
            //서버측 에러
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.affectedRows) {
            return res.status(StatusCodes.CREATED).json(results);
        } else {
            //회원가입이 정상적으로 되지 않았을 때
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
    });
};

const login = (req, res) => {
    const { email, password } = req.body;
    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const loginUser = results[0];

        // salt 값 꺼내서 비밀번호 암호화 해보고
        const hashPassword = crypto
            .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
            .toString("base64");

        // => DB 비밀번호랑 비교
        if (loginUser && loginUser.password == hashPassword) {
            // 토큰 발행
            const token = jwt.sign(
                {
                    id: loginUser.id,
                    email: loginUser.email,
                },
                process.env.PRIVATE_KEY,
                {
                    expiresIn: "100000m",
                    issuer: "hclee",
                }
            );

            //토큰 쿠키에 담기
            res.cookie("token", token, {
                httpOnly: true,
            });
            console.log(token);

            return res.status(StatusCodes.OK).json({
                ...results[0],
                token: token,
            });
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end();
        }
    });
};

const passwordResetRequest = (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let sql = "UPDATE users SET password = ?, salt = ? WHERE email = ?";
    const salt = crypto.randomBytes(10).toString("base64"); //64길이 만큼의 랜덤 바이트 생성
    const hashPassword = generateHashedPassword(password, salt);
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

module.exports = {
    join,
    login,
    passwordReset,
    passwordResetRequest,
    userValidationRules,
    validate,
    emailValidationRules,
};
