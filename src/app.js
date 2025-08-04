const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger 문서
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express API',
    documentation: '/api-docs'
  });
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

module.exports = app;