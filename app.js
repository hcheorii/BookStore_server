const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // 이 부분을 추가하여 자격 증명 포함 요청을 허용합니다.
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 9999; // 포트 번호가 설정되어 있지 않으면 기본값을 9999로 설정
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const userRouter = require("./routes/users");
const bookRouter = require("./routes/books");
const cartRouter = require("./routes/carts");
const likeRouter = require("./routes/likes");
const orderRouter = require("./routes/orders");
const categoryRouter = require("./routes/category");

app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/carts", cartRouter);
app.use("/likes", likeRouter);
app.use("/orders", orderRouter);
app.use("/category", categoryRouter);
