const express = require("express");
const passport = require("passport");
const router = express.Router();

// 카카오 로그인 라우터
router.get("/kakao", passport.authenticate("kakao"));

// 카카오 서버 로그인 시, 카카오 리다이렉트 유알엘을 통해 오게 됨
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    console.log("req.user", req.user);
    res.redirect("/");
  }
);

module.exports = router;
