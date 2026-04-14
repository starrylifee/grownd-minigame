const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp }      = require('firebase-admin/app')
const { getFirestore }       = require('firebase-admin/firestore')
const fetch                  = require('node-fetch')

initializeApp()
const db = getFirestore()

const GROWND_BASE = 'https://api.growndcard.com/api/v1'

/**
 * 학생에게 그라운드 포인트를 지급합니다.
 *
 * 클라이언트는 classCode, studentCode, gameId 만 전달하면 됩니다.
 * API 키는 이 Function 안에서만 읽히므로 클라이언트에 노출되지 않습니다.
 */
exports.awardPoints = onCall(
  { region: 'asia-northeast3' },
  async (request) => {
    const { classCode, studentCode, gameId } = request.data

    if (!classCode || !studentCode || !gameId) {
      throw new HttpsError('invalid-argument', '필수 파라미터가 누락되었습니다.')
    }

    // 1. 교사 정보 조회 (API 키, 그라운드 학급 ID)
    const classSnap = await db.collection('classes').doc(classCode).get()
    if (!classSnap.exists) {
      throw new HttpsError('not-found', '학급을 찾을 수 없습니다.')
    }
    const { teacherUid } = classSnap.data()

    const teacherSnap = await db.collection('teachers').doc(teacherUid).get()
    if (!teacherSnap.exists) {
      throw new HttpsError('not-found', '교사 정보를 찾을 수 없습니다.')
    }
    const { growndApiKey, growndClassId } = teacherSnap.data()

    if (!growndApiKey || !growndClassId) {
      throw new HttpsError('failed-precondition', '교사가 그라운드 API 키를 설정하지 않았습니다.')
    }

    // 2. 활동 설정 조회 (지급 포인트)
    const actSnap = await db.collection('activities').doc(`${classCode}_${gameId}`).get()
    if (!actSnap.exists) {
      throw new HttpsError('not-found', '활동 설정을 찾을 수 없습니다.')
    }
    const { pointsPerCompletion = 10, name = '미니게임' } = actSnap.data()

    // 3. 그라운드 API 호출
    const url = `${GROWND_BASE}/classes/${growndClassId}/students/${studentCode}/points`
    const response = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    growndApiKey,
      },
      body: JSON.stringify({
        type:        'reward',
        points:      pointsPerCompletion,
        description: `${name} 완료`,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Grownd API error:', errText)
      throw new HttpsError('internal', '포인트 지급 중 오류가 발생했습니다.')
    }

    const data = await response.json()

    return {
      success: true,
      points:  pointsPerCompletion,
      message: `${name} 완료! ${pointsPerCompletion}P가 지급됐어요 🌱`,
      grownd:  data,
    }
  }
)
