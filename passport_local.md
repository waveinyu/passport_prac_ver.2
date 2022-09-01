## Passport 다루기 절차 (Local)

[참고 : T아카데미](https://youtu.be/Qn48RgkUuaA)

<br>

> 1 모듈 로딩과 초기화

```javascript
const passport = require("passport");
app.use(passport.initialize());
```

<br>

> 2 Strgategy 설정

```javascript
const Strategy = require("passport-stgategy").Strategy;
passport.use(new Strategy(function username, password, done){});
//사용자의 아이디와 비밀번호로 인증 구현 및 콜백(done)
```

다양한 인증 Strategy를 제공

- LocalAuth
- Facebook, Twitter, Google
- Kakao

<br>

> 3 인증 요청

```javascript
app.post("/login", passport.authenticate("local"));
// passport에 있는 인증 기능을 사용
// authenticate()의 인자는 전략에 따라 변경
```

- <b>인증 성공</b>
  <br>성공 메시지와 코드
  <br>성공 페이지 이동(웹)

- <b>인증 실패</b>
  <br>실패 메시지와 코드
  <br>로그인 페이지 이동(웹)

<br>

> 4 세션 기록과 읽기
> <br>- 다음 세션에도 인증 상태가 됨
> <br>- 세션에 유저 정보를 기록하고 세션의 정보를 읽어오는 과정이 필요

```javascript
// 세션 기록
passport.serializeUser(function (user, done) {});

// 기록한 세션 읽어오기
passport.deserializeUser(function (id, done) {});
```

👉🏻 1. 요청마다 세션 기록과 읽기<br>

- `serializeUser` : passport.authenticate<i>(제대로 된 인증 정보가 있는가?)</i> 이후 세션 기록
- `deserializeUser` : 일반 요청마다 세션에서 읽기<br>
  <br>

👉🏻 2. 세션에서 읽어온 데이터<br>

- `req.body` : passport에서만 사용이 가능

  <br>

> 5 사용자 정보
> : 사용자의 정보를 세션에서 읽어온다

---

<br>

## Local Auth

> 옵션

1. `passReqToCallBack` : 요청 객체를 파라미터로 전달
2. `usernameField`, `passwordField` : 사용자 ID, PW에 해당하는 필드 이름

<br>

> Strategy의 인증 기능 구현

```javascript
const strategy = new LocalStrategy(OPTION, function (
  username,
  password,
  done
) {});
// passport : `done`으로 결과를 처리
```

### 👉🏻 3. 인증 함수 `done` 구현

- done(error, USER-INFO)

- 인증 성공

  ```javascript done(null, USER - INFO);
  done(null, USER - INFO);
  ```

- 인증 실패
  ```javascript
  done(null, false, FAILURE - INFO);
  ```

<br>

### 👉🏻 4. 인증 기능 구현

```javascript
const LocalStrategy = require("passport-local").Strategy;
const strategy = new LocalStrategy(function (username, password, done) {
  if (username == "user" && password == "1234") {
    //인증 성공
    const userInfo = { name: "user", email: "user@mail.com" };
    return done(null, userInfo);
  }
  //인증 실패
  done(null, false, { message: "Incorrect ID/PW" });
});

// 패스포트에 적용
passport.use(strategy);
```

<br>

### 👉🏻 5. 인증 요청

#### 인증 요청과 인증 함수 동작

- 인증 요청 (POST / Login)
- Local Strategy의 인증 함수 동작

```javascript
passport.authenticate(Strategy, Option, CallBack);
```

#### Option

- `session` : 세션 사용 여부(기본 - true)
- `successRedirect`, `failureRedirect` : 인증 성공/실패 시 전환될 주소

```javascript
passport.authenticate("local", function (err, user, info) {
  //에러, 유저정보, 로그인메시지 순
  if (user) {
    console.log("로그인 성공");
  } else {
    console.log("로그인 실패");
  }
});
```

<br>

### 👉🏻 6. 인증 결과, 인증 요청의 응답

#### 웹 기반

- 로그인 `성공` 응답 : 성공 페이지 이동
- 로그인 `실패` 응답 : 로그인 페이지 그대로
- **페이지 이동은 서버가 담당(redirect)**

<br>

### 👉🏻 7. 인증 요청 처리

#### 클라이언트가 웹 브라우저

- 인증 성공 : /myhome
- 인증 실패 : /login

```javascript
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/myhome",
    failureRedirect: "/login",
  })
);
```

<br>

### 👉🏻 8. 인증 정보 유지 - `Session`

#### 인증 성공 -> 세션을 기록

- `passport.serializeUser()`

```javascript
passport.serializeUser(function (user, done) {
  done(null, user);
});
```

<br>

#### 클라이언트 요청 -> 세션에서 인증 정보 읽어오기

- `passport.deserializeUser()`

#### 세션에서 기록된 사용자 정보 접근 방법

- `req.user`

```javascript
passport.deserializeUser(function (user, done) {
  done(null, user); // req.user로 접근 가능
});
```

<br>

### 👉🏻 8-1. 세션 정보 저장 형태

#### 사용자 id로 저장

```javascript
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
```

<br>

#### id에서 사용자 정보 찾기

```javascript
passport.deserializeUser(function (id, done) {
  const user = findUser(id); // DB에서 사용자 정보 찾기
  done(null, user);
});
```

<br>

### 👉🏻 9. 세션 사용 설정 코드

```javascript
const app = express();

// 세션 모듈 설정
const session = require("express-session");
app.use(
  session({
    secret: "Secret Key", // 환경변수 설정해주어야 함
    resave: false,
    saveUnijtialized: true,
  })
);

// 패스포트 설정
const passport = require("passport");

app.use(passport.initionalize());
app.use(passport.session());

/*
 * resave: true
   매 요청(req)마다 세션을 다시 저장하는 것

  * false로 하는 이유
    1. 변경사항이 없는 session이 매번 재저장되는 것을 방지하여 효율을 높임
    2. 동시에 두 가지 request를 처리할 때, 양 session들의 충돌 방지
    3. 거의 대부분의 경우 false로 설정
*/
```

<br>

### 👉🏻 10. User를 사용한 인증

#### 사용자 정보를 다루는 `User 모듈` 작성

```javascript
User.findOne() = function(id) {}
User.registerUser = function(id, name, password) {}

const strategy = new LocalStrategy(function (username, password, done){
  const user = User.findOne(username);
  if(!user) {
    return done(null, false, { message: "존재하지 않는 사용자입니다." });
  } else if (user.password !== password) {
    return done(null, false, { message: "비밀번호가 일치하지 않습니다." });
  }
  done(null, user);
});
```
