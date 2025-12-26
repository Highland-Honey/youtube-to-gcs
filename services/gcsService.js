const { Storage } = require('@google-cloud/storage');

// GCS 클라이언트 초기화
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'my-app-dev-482411'
});

const bucketName = process.env.GCS_BUCKET_NAME || 'sj-app-storage';
const bucket = storage.bucket(bucketName);

/**
 * 데이터를 Google Cloud Storage에 저장
 * @param {string} videoId - 유튜브 비디오 ID
 * @param {Object} data - 저장할 데이터 객체
 * @returns {Promise<string>} GCS 파일 경로
 */
async function saveToGCS(videoId, data) {
  try {
    // 파일명: videos/{videoId}/{timestamp}.json
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `videos/${videoId}/${timestamp}.json`;
    
    const file = bucket.file(fileName);
    
    // JSON 데이터를 문자열로 변환
    const jsonData = JSON.stringify(data, null, 2);
    
    // 파일 업로드
    await file.save(jsonData, {
      metadata: {
        contentType: 'application/json',
        metadata: {
          videoId: videoId,
          savedAt: new Date().toISOString()
        }
      }
    });

    console.log(`File saved to GCS: gs://${bucketName}/${fileName}`);
    
    return `gs://${bucketName}/${fileName}`;
  } catch (error) {
    console.error('Error saving to GCS:', error);
    throw new Error(`GCS 저장 중 오류 발생: ${error.message}`);
  }
}

/**
 * GCS에서 비디오 데이터 조회
 * @param {string} videoId - 유튜브 비디오 ID
 * @returns {Promise<Array>} 저장된 파일 목록
 */
async function listVideoFiles(videoId) {
  try {
    const prefix = `videos/${videoId}/`;
    const [files] = await bucket.getFiles({ prefix });
    
    return files.map(file => ({
      name: file.name,
      created: file.metadata.timeCreated,
      size: file.metadata.size
    }));
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

module.exports = {
  saveToGCS,
  listVideoFiles
};

