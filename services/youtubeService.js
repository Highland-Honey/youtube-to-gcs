const { google } = require('googleapis');
const { YoutubeTranscript } = require('youtube-transcript');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * 유튜브 URL에서 비디오 ID 추출
 * @param {string} url - 유튜브 URL
 * @returns {string|null} 비디오 ID 또는 null
 */
function extractVideoId(url) {
  if (!url) return null;

  // 다양한 유튜브 URL 형식 지원
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube Data API v3를 사용하여 비디오 메타데이터 가져오기
 * @param {string} videoId - 유튜브 비디오 ID
 * @returns {Promise<Object>} 메타데이터 객체
 */
async function fetchYouTubeMetadata(videoId) {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('비디오를 찾을 수 없습니다.');
    }

    const video = response.data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics || {};
    const contentDetails = video.contentDetails || {};

    return {
      title: snippet.title,
      description: snippet.description,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      thumbnails: snippet.thumbnails,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId,
      duration: contentDetails.duration,
      viewCount: parseInt(statistics.viewCount || 0),
      likeCount: parseInt(statistics.likeCount || 0),
      commentCount: parseInt(statistics.commentCount || 0)
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    throw new Error(`메타데이터를 가져오는 중 오류 발생: ${error.message}`);
  }
}

/**
 * 유튜브 자막/스크립트 가져오기
 * youtube-transcript 라이브러리 사용 (트래픽 효율적)
 * @param {string} videoId - 유튜브 비디오 ID
 * @returns {Promise<Array>} 스크립트 배열
 */
async function fetchYouTubeTranscript(videoId) {
  try {
    // youtube-transcript는 유튜브에서 직접 자막을 가져옴 (API 호출 없음)
    // 이 방식은 트래픽 효율적입니다 (서버에서 직접 유튜브로 요청)
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    return transcript.map(item => ({
      text: item.text,
      start: item.offset || item.start || 0,
      duration: item.duration || 0
    }));
  } catch (error) {
    // 자막이 없는 경우 에러를 throw하지 않고 null 반환
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('Transcript is disabled') || 
        errorMsg.includes('No transcript found') ||
        errorMsg.includes('Could not retrieve a transcript') ||
        errorMsg.includes('Transcript not available')) {
      return null;
    }
    // 다른 에러는 다시 throw
    throw error;
  }
}

module.exports = {
  extractVideoId,
  fetchYouTubeMetadata,
  fetchYouTubeTranscript
};

