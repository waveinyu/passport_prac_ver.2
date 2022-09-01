const passport = require("passport");
const kakao = require("./kakaoStrategy");

const { User } = require("../sequelize/models");

const passportConfig = () => {
  passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.userId);
  });

  passport.deserializeUser((id, done) => {
    console.log(id);
    User.findOne({ where: { userId: id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  kakao();
};

module.exports = passportConfig;
