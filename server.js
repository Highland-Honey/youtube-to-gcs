require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { extractVideoId, fetchYouTubeMetadata, fetchYouTubeTranscript } = require('./services/youtubeService');
const { saveToGCS } = require('./services/gcsService');

const app = express();
// App Engine은 PORT 환경 변수를 자동으로 설정합니다
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint - 사용 안내
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube to GCS Service',
    usage: '브라우저 주소창에 다음 형식으로 입력하세요:',
    examples: [
      `http://${req.get('host')}/https://www.youtube.com/watch?v=VIDEO_ID`,
      `http://${req.get('host')}/https://youtu.be/VIDEO_ID`,
      `http://${req.get('host')}/video?url=https://www.youtube.com/watch?v=VIDEO_ID`
    ],
    note: '유튜브 URL을 직접 경로에 붙여넣거나, /video?url= 형식으로 사용할 수 있습니다.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Video endpoint with query parameter
app.get('/video', async (req, res) => {
  try {
    const youtubeUrl = req.query.url;
    
    if (!youtubeUrl) {
      return res.status(400).json({ 
        error: 'YouTube URL이 필요합니다. 형식: /video?url=https://www.youtube.com/watch?v=VIDEO_ID' 
      });
    }

    await processVideo(youtubeUrl, res);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      message: error.message 
    });
  }
});

// Main endpoint: GET /* (for direct URL pasting)
app.get('/*', async (req, res) => {
  try {
    // URL 파라미터에서 유튜브 URL 추출
    let youtubeUrl = req.params[0];
    
    // URL 디코딩
    if (youtubeUrl) {
      youtubeUrl = decodeURIComponent(youtubeUrl);
    }
    
    // health, video 엔드포인트는 제외
    if (youtubeUrl === 'health' || youtubeUrl === 'video') {
      return;
    }
    
    if (!youtubeUrl) {
      return res.status(400).json({ 
        error: 'YouTube URL이 필요합니다. 형식: /https://www.youtube.com/watch?v=VIDEO_ID' 
      });
    }

    await processVideo(youtubeUrl, res);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      message: error.message 
    });
  }
});

// Video processing function
async function processVideo(youtubeUrl, res) {

  // 유튜브 URL에서 비디오 ID 추출
  const videoId = extractVideoId(youtubeUrl);
  
  if (!videoId) {
    return res.status(400).json({ 
      error: '유효하지 않은 YouTube URL입니다.' 
    });
  }

  console.log(`Processing video ID: ${videoId}`);

  // 유튜브 메타데이터 가져오기 (YouTube Data API v3 사용)
  const metadata = await fetchYouTubeMetadata(videoId);
  
  // 유튜브 스크립트 가져오기 (youtube-transcript 라이브러리 사용)
  let transcript = null;
  try {
    transcript = await fetchYouTubeTranscript(videoId);
  } catch (error) {
    console.warn(`Transcript not available for video ${videoId}:`, error.message);
    // 스크립트가 없어도 계속 진행
  }

  // 데이터 조합
  const videoData = {
    videoId: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    metadata: metadata,
    transcript: transcript,
    savedAt: new Date().toISOString()
  };

  // GCS에 저장
  const gcsPath = await saveToGCS(videoId, videoData);

  res.json({
    success: true,
    message: 'YouTube 데이터가 성공적으로 저장되었습니다.',
    videoId: videoId,
    gcsPath: gcsPath,
    data: videoData
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Example: http://localhost:${PORT}/https://www.youtube.com/watch?v=dQw4w9WgXcQ`);
});

