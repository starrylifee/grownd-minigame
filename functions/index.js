const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onSchedule }         = require('firebase-functions/v2/scheduler')
const { initializeApp }      = require('firebase-admin/app')
const { getFirestore }       = require('firebase-admin/firestore')
const fetch                  = require('node-fetch')

initializeApp()
const db = getFirestore()

const GROWND_BASE = 'https://growndcard.com/api/v1'

const DEFAULT_DAILY_LIMIT = { 'raid-typing': 1 }
const FALLBACK_LIMIT = 5

function todayKST() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

exports.awardPoints = onCall(
  { region: 'asia-northeast3' },
  async (request) => {
    const { classCode, studentCode, gameId, scoreRatio } = request.data

    if (!classCode || !studentCode || !gameId) {
      throw new HttpsError('invalid-argument', '필수 파라미터가 누락되었습니다.')
    }

    // 1. 학급 조회 (teacherUid 확보)
    const classSnap = await db.collection('classes').doc(classCode).get()
    if (!classSnap.exists) {
      throw new HttpsError('not-found', '학급을 찾을 수 없습니다.')
    }
    const { teacherUid } = classSnap.data()

    // 2. 활동 설정 조회 (포인트, 일일 제한)
    const actSnap = await db.collection('activities').doc(`${classCode}_${gameId}`).get()
    if (!actSnap.exists) {
      throw new HttpsError('not-found', '활동 설정을 찾을 수 없습니다.')
    }
    const actData = actSnap.data()
    const { pointsPerCompletion = 10, name = '미니게임' } = actData
    const dailyLimit = actData.dailyLimit ?? DEFAULT_DAILY_LIMIT[gameId] ?? FALLBACK_LIMIT

    // 3. ★ 일일 횟수 체크 + 원자적 증가 (API 키 확인보다 먼저 실행)
    //    → API 키 미설정 환경(테스트)에서도 횟수가 정상 누적됨
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

    // 4. 교사 정보 조회 (API 키)
    const teacherSnap = await db.collection('teachers').doc(teacherUid).get()
    if (!teacherSnap.exists) {
      throw new HttpsError('not-found', '교사 정보를 찾을 수 없습니다.')
    }
    const { growndApiKey, growndClassId } = teacherSnap.data()

    if (!growndApiKey || !growndClassId) {
      // API 키 미설정: 포인트 지급 없이 횟수만 차감하고 성공 처리
      return {
        success: true,
        points:  0,
        message: `${name} 완료! (그라운드 API 키 미설정 — 포인트 미지급)`,
      }
    }

    // 5. scoreRatio 비례 포인트 계산 (최대 2배까지 허용 — 레이드 격파 보너스 등)
    const finalPoints = (typeof scoreRatio === 'number' && scoreRatio >= 0 && scoreRatio <= 2)
      ? Math.round(pointsPerCompletion * scoreRatio)
      : pointsPerCompletion

    // 6. 그라운드 API 호출
    const url = `${GROWND_BASE}/classes/${growndClassId}/students/${studentCode}/points`
    const response = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    growndApiKey,
      },
      body: JSON.stringify({
        type:        'reward',
        points:      finalPoints,
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
      points:  finalPoints,
      message: `${name} 완료! ${finalPoints}P가 지급됐어요 🌱`,
      grownd:  data,
    }
  }
)

// ── 오늘의 순위 TOP3 보너스 — 매일 23:55 KST ──────────────────
const BONUS_GAME_ORDER = ['word-typing', 'typing', 'math-quiz', 'vocab']
const BONUS_POINTS     = 1
const BONUS_TOP_N      = 3

async function awardBonusPoint(apiKey, growndClassId, studentCode, gameId) {
  const url = `${GROWND_BASE}/classes/${growndClassId}/students/${studentCode}/points`
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({
      type:        'reward',
      points:      BONUS_POINTS,
      description: `오늘의 순위 TOP${BONUS_TOP_N} 보너스`,
    }),
  })
  if (!res.ok) throw new Error(`Grownd API error: ${await res.text()}`)
}

exports.dailyLeaderboardBonus = onSchedule(
  { schedule: '55 23 * * *', timeZone: 'Asia/Seoul', region: 'asia-northeast3' },
  async () => {
    const today = todayKST()

    // 전체 학급 조회
    const classesSnap = await db.collection('classes').get()

    for (const classDoc of classesSnap.docs) {
      const classCode = classDoc.id

      // 이미 오늘 처리 완료 여부 확인
      const bonusLogRef  = db.collection('bonusLogs').doc(`${classCode}_${today}`)
      const bonusLogSnap = await bonusLogRef.get()
      if (bonusLogSnap.exists) continue

      // 교사 API 키 조회
      const { teacherUid } = classDoc.data()
      if (!teacherUid) continue
      const teacherSnap = await db.collection('teachers').doc(teacherUid).get()
      if (!teacherSnap.exists) continue
      const { growndApiKey, growndClassId } = teacherSnap.data()
      if (!growndApiKey || !growndClassId) continue

      const alreadyRewarded = new Set()
      const recipients      = []

      for (const gameId of BONUS_GAME_ORDER) {
        const logSnap = await db.collection('scoreLogs').doc(`${classCode}_${gameId}_${today}`).get()
        if (!logSnap.exists) continue

        // 정확도 내림차순 → 동점 시 시간 오름차순
        const entries = Object.entries(logSnap.data())
          .map(([code, v]) => ({ studentCode: code, ...v }))
          .sort((a, b) => {
            if (b.scoreRatio !== a.scoreRatio) return b.scoreRatio - a.scoreRatio
            return (a.completionTime ?? 99999) - (b.completionTime ?? 99999)
          })

        let bonusCount = 0
        for (const entry of entries) {
          if (bonusCount >= BONUS_TOP_N) break
          if (alreadyRewarded.has(entry.studentCode)) continue  // 다른 게임에서 이미 받은 학생 스킵

          try {
            await awardBonusPoint(growndApiKey, growndClassId, entry.studentCode, gameId)
            alreadyRewarded.add(entry.studentCode)
            recipients.push({
              studentCode: entry.studentCode,
              name:        entry.name,
              gameId,
              rank:        bonusCount + 1,
            })
            bonusCount++
          } catch (err) {
            console.error(`bonus award failed: ${classCode}/${gameId}/${entry.studentCode}`, err)
          }
        }
      }

      // 처리 결과 저장 (중복 실행 방지)
      await bonusLogRef.set({
        processedAt: new Date().toISOString(),
        recipients,
      })

      console.log(`[bonus] ${classCode}: ${recipients.length}명 지급 완료`)
    }
  }
)
