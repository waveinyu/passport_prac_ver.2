const express = require("express");
const router = require("./routes/index.js");
const passport = require("passport");
const passportConfig = require("./passport");
const session = require("express-session");
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "diveintoyu",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", pageRouter);
app.use("/auth", authRouter);

// port setting
app.listen(port, () => {
  console.log("Server is running on 3000");
});
