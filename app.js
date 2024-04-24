//express 모듈
const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT); //기왕이면 의미있는 포트넘버

const userRouter = require("./routes/users"); //userDemo가져오기
const bookRouter = require("./routes/books"); //userDemo가져오기
const cartRouter = require("./routes/carts"); //userDemo가져오기
const likeRouter = require("./routes/likes"); //userDemo가져오기
const orderRouter = require("./routes/orders"); //userDemo가져오기
const categoryRouter = require("./routes/category"); //userDemo가져오기

app.use("/users", userRouter); //userdemo 사용
app.use("/books", bookRouter); //userdemo 사용
app.use("/carts", cartRouter); //userdemo 사용
app.use("/likes", likeRouter); //userdemo 사용
app.use("/orders", orderRouter); //userdemo 사용
app.use("/category", categoryRouter); //userdemo 사용
