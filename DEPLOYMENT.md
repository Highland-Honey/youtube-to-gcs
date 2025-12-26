# 배포 가이드

## 사전 준비

### 1. Google Cloud SDK 설치 및 인증

```bash
# gcloud CLI 설치 확인
gcloud --version

# 프로젝트 설정
gcloud config set project my-app-dev-482411

# 인증
gcloud auth login
gcloud auth application-default login
```

### 2. YouTube Data API v3 활성화 및 API 키 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. API 및 서비스 > 라이브러리
3. "YouTube Data API v3" 검색 및 활성화
4. API 및 서비스 > 사용자 인증 정보
5. "사용자 인증 정보 만들기" > "API 키" 선택
6. 생성된 API 키 복사

### 3. GCS 버킷 확인

```bash
# 버킷 존재 확인
gsutil ls gs://sj-app-storage

# 버킷이 없다면 생성
gsutil mb -p my-app-dev-482411 -l asia-northeast3 gs://sj-app-storage
```

### 4. 서비스 계정 권한 설정

App Engine 기본 서비스 계정이 GCS 버킷에 접근할 수 있도록 권한 설정:

```bash
# 서비스 계정 이메일 확인
gcloud iam service-accounts list

# Storage Object Admin 역할 부여
gsutil iam ch serviceAccount:my-app-dev-482411@appspot.gserviceaccount.com:roles/storage.objectAdmin gs://sj-app-storage
```

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
cd youtube-to-gcs
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cp env.sample .env
```

`.env` 파일 편집:

```
GOOGLE_CLOUD_PROJECT_ID=my-app-dev-482411
GCS_BUCKET_NAME=sj-app-storage
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3000
```

### 3. 로컬 서버 실행

```bash
npm run dev
```

### 4. 테스트

브라우저에서 접근:
```
http://localhost:3000/https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## GCP App Engine 배포

### 1. 환경 변수 설정 (Secret Manager 사용 권장)

```bash
# Secret Manager에 API 키 저장
echo -n "your_youtube_api_key" | gcloud secrets create YOUTUBE_API_KEY --data-file=-

# App Engine에 Secret 참조 설정
# app.yaml의 env_variables 섹션 수정 필요
```

또는 직접 환경 변수 설정:

```bash
gcloud app deploy --set-env-vars YOUTUBE_API_KEY=your_api_key
```

### 2. 배포

```bash
gcloud app deploy
```

### 3. 배포 확인

```bash
# 앱 URL 확인
gcloud app browse

# 로그 확인
gcloud app logs tail -s default
```

## Cloud Run 배포 (대안)

### 1. Docker 이미지 빌드 및 배포

```bash
# 이미지 빌드
docker build -t gcr.io/my-app-dev-482411/youtube-to-gcs .

# 이미지 푸시
docker push gcr.io/my-app-dev-482411/youtube-to-gcs

# Cloud Run 배포
gcloud run deploy youtube-to-gcs \
  --image gcr.io/my-app-dev-482411/youtube-to-gcs \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT_ID=my-app-dev-482411,GCS_BUCKET_NAME=sj-app-storage \
  --set-secrets YOUTUBE_API_KEY=YOUTUBE_API_KEY:latest
```

### 2. Cloud Build를 통한 자동 배포

GitHub에 푸시하면 자동으로 배포되도록 설정:

1. Cloud Build API 활성화
2. GitHub 저장소 연결
3. `cloudbuild.yaml` 파일 사용

## GitHub 설정

### 1. 저장소 초기화

```bash
cd youtube-to-gcs
git init
git add .
git commit -m "Initial commit"
```

### 2. GitHub 저장소 연결

```bash
git remote add origin https://github.com/Highland-Honey/youtube-to-gcs.git
git branch -M main
git push -u origin main
```

### 3. .env 파일은 커밋하지 않기

`.gitignore`에 이미 포함되어 있지만 확인:

```bash
# .env 파일이 커밋되지 않았는지 확인
git status
```

## 문제 해결

### GCS 권한 오류

```bash
# 서비스 계정 권한 확인
gsutil iam get gs://sj-app-storage
```

### YouTube API 할당량 초과

- YouTube Data API v3는 일일 할당량이 있습니다
- 필요시 할당량 증가 요청

### 자막이 없는 동영상

- 자막이 없는 동영상의 경우 transcript는 null로 저장됩니다
- 이는 정상 동작입니다

