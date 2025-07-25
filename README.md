```base
my-express-app/
├── src/
│   ├── controllers/       # 비즈니스 로직 처리
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── routes/           # API 라우팅
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── models/           # 데이터 모델
│   │   └── user.model.js
│   ├── middlewares/      # 미들웨어
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── services/         # 비즈니스 로직 서비스
│   │   ├── auth.service.js
│   │   └── user.service.js
│   ├── utils/           # 유틸리티 함수
│   │   ├── jwt.js
│   │   └── validator.js
│   ├── config/          # 설정 파일
│   │   └── database.js
│   └── app.js           # Express 앱 설정
├── .env                 # 환경 변수
├── .gitignore
├── package.json
└── server.js            # 서버 시작점
```

### 핵심 개념 설명
1. 계층 분리 (Separation of Concerns)

Controller: HTTP 요청/응답 처리
Service: 비즈니스 로직
Model: 데이터 구조 정의

2. 미들웨어 패턴

인증, 유효성 검사, 에러 처리를 별도 미들웨어로 분리
재사용성과 유지보수성 향상

3. 에러 처리

try-catch와 next(error)를 통한 중앙집중식 에러 처리
일관된 에러 응답 형식

4. 보안

JWT를 이용한 인증
bcrypt를 이용한 비밀번호 해싱
helmet을 통한 보안 헤더 설정

5. 유효성 검사

express-validator를 이용한 입력값 검증
별도의 검증 미들웨어로 분리

다음 단계

MongoDB 연결 및 모델 구현
JWT 기반 인증 시스템 구현
API 문서화 (Swagger)
테스트 코드 작성
Docker 컨테이너화
