# 카카오 로그인 인증 전략 처리과정

[참고 : Dev Scroll 블로그](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-%EC%B9%B4%EC%B9%B4%EC%98%A4-%EB%A1%9C%EA%B7%B8%EC%9D%B8-Passport-%EA%B5%AC%ED%98%84#%EC%B9%B4%EC%B9%B4%EC%98%A4_%EB%A1%9C%EA%B7%B8%EC%9D%B8_OAuth_%EC%8B%A0%EC%B2%AD)

1. 라우터를 통해 /kakao 요청이 서버로 들어온다.
2. passport.authenticate('kakao')를 통해서 카카오 로그인 페이지로 이동한다.
3. 카카오 로그인을 하면, 카카오 로그인 디벨로퍼에서 설정한 redirect url 경로에 따라 식별값을 전달한다.

   - Redirect URL : 해당 클라이언트를 식별하고 식별값(Access token)을 전달할 통로

    <br>

```javascript
// app.js
// 1. 카카오 로그인 요청
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");

app.use("/", pageRouter);
app.use("/auth", authRouter);
```

```javascript
// routes/auth.js
// 2. 카카오 로그인 페이지로 이동
...
router.get("/kakao", passport.authenticate("kakao"));
```

```plain text
// 카카오 로그인 페이지(클라이언트)
// 3. 유저가 카카오 로그인을 클릭 후, 카카오 로그인 디벨로퍼에서 설정한 redirect url 경로에 따라 식별값을 전달
http://localhost:3000/auth/kakao/callback
```

4. /kakao/callback 라우터로 요청이 오게 된다

```javascript
// routes/auth.js
// 4. /kakao/callback 라우터로 요청이 오게 된다
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);
```

---

<br>

5. passport.authenticate("kakao")에서 kakaoStrategy로 인증 전략 시행

   - 전략에는 카카오 서버에서 보낸 카카오 계정 정보가 들어있음

6. 카카오 전략에서 DB 내 가입 이력 조사
7. 가입 이력이 있다면, 성공 done()을 보내고 | 가입 이력이 없다면, 회원가입 시키고 성공 done()을 보낸다.
8. 클라이언트에 세션, 쿠키를 보냄으로써 로그인 인증을 완료한다.

```javascript
{
clientID : process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API  키
callbackURL: "/auth/kakao/callback", // 카카오 로그인 Redirect URI 경로
},

/*
* clientID에 카카오 앱 아이디 추가
* callbackURL : 카카오 로그인 후 카카오가 결과를 전송해줄 URL
* accessToken, refreshToken : 로그인 성공 후 카카오가 보내준 토큰
* profile : 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
*
*/
async (accessToken, refreshToken, profile, done) => {}
```

```javascript
//route/auth.js
router.get("/kakao", passport.authenticate("kakao"));

// 5. kakaoStrategy로 인증 전략 시행
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  // 7번의 결과에 따라, 카카오 로그인 디벨로퍼에서 설정한 redirect url 경로로 식별값을 전달한다.
  // 8. 클라이언트에 세션/쿠키를 보냄으로써 로그인 인증 완료
  (req, res) => {
    res.redirect("/");
  }
);
```

```javascript
// passport/kakaoStrategy.js
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (acceessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile); // 카카오가 보내준 유저 정보

        // 6. DB에서 가입 이력 조사
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });

          // 7. 가입 이력이 있으면 성공 done()을 보내고,
          // 없다면 바로 회원가입 시킨 후 성공 done()을 보냄
          if (exUser) {
            done(null, exUser); // 로그인 성공
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kaccount_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
          //
        } catch (err) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
```
