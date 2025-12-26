# YouTube to GCS Service

유튜브 동영상의 메타데이터(제목, 설명 등)와 스크립트를 Google Cloud Storage 버킷에 저장하는 서비스입니다.

## 기능

- 유튜브 URL을 받아서 동영상 정보 추출
- 제목, 설명, 채널 정보 등 메타데이터 수집
- 자막/스크립트 추출 (유튜브에서 제공하는 경우)
- Google Cloud Storage 버킷에 JSON 형태로 저장

## 사용 방법

### 로컬 개발 환경 설정

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```
GOOGLE_CLOUD_PROJECT_ID=my-app-dev-482411
GCS_BUCKET_NAME=sj-app-storage
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3000
```

3. Google Cloud 인증 설정
```bash
gcloud auth application-default login
```

또는 서비스 계정 키 파일을 사용:
```
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

4. 서버 실행
```bash
npm run dev
```

### API 사용

브라우저에서 다음 형식으로 접근:
```
http://localhost:3000/https://www.youtube.com/watch?v=VIDEO_ID
```

또는
```
http://localhost:3000/https://youtu.be/VIDEO_ID
```

## 빠른 시작

### 1. 저장소 클론 및 설정

```bash
# GitHub에서 클론 (또는 로컬에서 초기화)
git clone https://github.com/Highland-Honey/youtube-to-gcs.git
cd youtube-to-gcs

# 의존성 설치
npm install

# 환경 변수 설정
cp env.sample .env
# .env 파일을 편집하여 YOUTUBE_API_KEY 설정
```

### 2. YouTube API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `my-app-dev-482411`
3. API 및 서비스 > 라이브러리
4. "YouTube Data API v3" 검색 및 활성화
5. API 및 서비스 > 사용자 인증 정보 > API 키 만들기

### 3. 로컬 실행

```bash
# Google Cloud 인증
gcloud auth application-default login

# 서버 실행
npm run dev
```

### 4. 테스트

브라우저에서 접근:
```
http://localhost:3000/https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### GCP App Engine 배포

1. 프로젝트 설정
```bash
gcloud config set project my-app-dev-482411
```

2. 배포
```bash
gcloud app deploy
```

## 프로젝트 정보

- 프로젝트명: my-app-dev-482411
- 프로젝트 번호: 568635180768
- 버킷명: sj-app-storage
- GitHub: https://github.com/Highland-Honey

## 기술 스택

- **Node.js** + **Express**: 서버 프레임워크
- **YouTube Data API v3**: 메타데이터 수집
- **youtube-transcript**: 자막 추출 (트래픽 효율적)
- **Google Cloud Storage**: 데이터 저장
- **Google App Engine**: 배포 플랫폼

