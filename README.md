# Structure
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

# Testing
- Jest와 Supertest를 사용한 테스트 환경 구성
- MongoDB Memory Server로 테스트용 DB 환경 구축
- 유닛 테스트: 모델, 서비스, 유틸리티 함수 테스트
- 통합 테스트: API 엔드포인트 전체 플로우 테스트
- 테스트 픽스처: 재사용 가능한 테스트 데이터
- GitHub Actions: 자동화된 CI/CD 파이프라인
```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트와 함께 테스트
npm run test:coverage

# 특정 파일만 테스트
npm test auth.test.js

# 특정 테스트 스위트만 실행
npm test -- --testNamePattern="Auth Service"
```