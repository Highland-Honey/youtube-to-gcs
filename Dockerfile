# Node.js 20 기반 이미지 사용
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8080

# 환경 변수 설정
ENV PORT=8080
ENV NODE_ENV=production

# 서버 실행
CMD ["node", "server.js"]

