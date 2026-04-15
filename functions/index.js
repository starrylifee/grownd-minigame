const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp }      = require('firebase-admin/app')
const { getFirestore }       = require('firebase-admin/firestore')
const fetch                  = require('node-fetch')

initializeApp()
const db = getFirestore()

const GROWND_BASE = 'https://growndcard.com/api/v1'

// 기본 일일 횟수 제한 (Firestore에 설정값 없을 때 fallback)
const DEFAULT_DAILY_LIMIT = { 'raid-typing': 1 }
const FALLBACK_LIMIT = 5

/**
 * KST(UTC+9) 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 */
function todayKST() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

/**
 * 학생에게 그라운드 포인트를 지급합니다.
 *
 * 클라이언트는 classCode, studentCode, gameId 만 전달하면 됩니다.
 * API 키는 이 Function 안에서만 읽히므로 클라이언트에 노출되지 않습니다.
 *
 * 일일 플레이 횟수 초과 시 'resource-exhausted' 오류를 반환합니다.
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

    // 2. 활동 설정 조회 (지급 포인트, 일일 횟수 제한)
    const actSnap = await db.collection('activities').doc(`${classCode}_${gameId}`).get()
    if (!actSnap.exists) {
      throw new HttpsError('not-found', '활동 설정을 찾을 수 없습니다.')
    }
    const actData = actSnap.data()
    const { pointsPerCompletion = 10, name = '미니게임' } = actData

    const dailyLimit = actData.dailyLimit
      ?? DEFAULT_DAILY_LIMIT[gameId]
      ?? FALLBACK_LIMIT

    // 3. 일일 플레이 횟수 체크 + 원자적 증가 (트랜잭션)
    const today  = todayKST()
    const logRef = db.collection('playLogs').doc(`${classCode}_${gameId}_${studentCode}_${today}`)

    let playCount = 0
    await db.runTransaction(async (t) => {
      const logSnap = await t.get(logRef)
      playCount = logSnap.exists ? (logSnap.data().count || 0) : 0
      if (playCount < dailyLimit) {
        t.set(
          logRef,
          { count: playCount + 1, classCode, gameId, studentCode, date: today },
          { merge: true }
        )
      }
    })

    if (playCount >= dailyLimit) {
      throw new HttpsError(
        'resource-exhausted',
        `오늘 이미 ${dailyLimit}번 플레이했습니다. 내일 다시 도전하세요!`
      )
    }

    // 4. 그라운드 API 호출
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
