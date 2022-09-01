const express = require("express");
const app = express();
const port = 3000;
const indexRouter = require("./routes");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const passportConfig = require("./passport/index");

const { sequelize } = require("./sequelize/models/index");

sequelize
  .sync({ force: false })
  .then(() => console.log("db connect"))
  .catch((err) => console.error(err));

dotenv.config(); // 환경변수 설정
passportConfig(); // 카카오 전략 등록 !!!! 이거 필수 이게 없으면 Unknown Strategy가 뜬다

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
// app.use("/auth", authRouter);

app.listen(port, () => {
  console.log("Server is running on", port);
});
