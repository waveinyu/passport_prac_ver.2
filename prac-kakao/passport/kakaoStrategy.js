const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
// const passportConfig = require("../passport/index");

const { User } = require("../sequelize/models");

const kakao = () => {
  passport.use(
    "kakao", //추가
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },

      async (accessToken, refreshToken, profile, done) => {
        console.log("프로필", profile);
        console.log("프로필.아이디", profile.id);
        try {
          console.log("findOne 왜 못 찾아?");
          const isExistUser = await User.findOne({
            where: { kakaoId: profile.id }, //, provider: "kakao"
          });
          console.log("여기 왔니?2");
          if (isExistUser) {
            console.log("이미 있는 회원, 로그인 성공!");
            done(null, isExistUser);
          } else {
            const createUser = await User.create({
              kakaoId: profile.id,
              nickname: profile.displayName,
              provider: "kakao",
            });
            done(null, createUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};

module.exports = kakao;
