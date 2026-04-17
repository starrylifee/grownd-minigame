import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc,
  increment, onSnapshot, arrayUnion
} from 'firebase/firestore'
import { db } from './firebase'

// ── 비밀번호 해시 ──────────────────────────────────────────
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── 교사 ──────────────────────────────────────────────────
export async function getTeacher(uid) {
  const snap = await getDoc(doc(db, 'teachers', uid))
  return snap.exists() ? snap.data() : null
}

export async function saveTeacher(uid, data) {
  await setDoc(doc(db, 'teachers', uid), data, { merge: true })
}

// ── 학급 ──────────────────────────────────────────────────
export async function getClass(classCode) {
  const snap = await getDoc(doc(db, 'classes', classCode))
  return snap.exists() ? snap.data() : null
}

export async function saveClass(classCode, data) {
  await setDoc(doc(db, 'classes', classCode), data, { merge: true })
}

// 학생 비밀번호 검증
export async function verifyStudent(classCode, studentCode, password) {
  const classData = await getClass(classCode)
  if (!classData) return null
  const student = classData.students?.[studentCode]
  if (!student) return null
  const hash = await hashPassword(password)
  if (hash !== student.passwordHash) return null
  return { ...student, studentCode, classCode, teacherUid: classData.teacherUid }
}

// ── 활동(게임) 설정 ────────────────────────────────────────
function activityId(classCode, gameId) {
  return `${classCode}_${gameId}`
}

export async function getActivity(classCode, gameId) {
  const snap = await getDoc(doc(db, 'activities', activityId(classCode, gameId)))
  return snap.exists() ? snap.data() : null
}

export async function getAllActivities(classCode) {
  const snap = await getDoc(doc(db, 'activityGroups', classCode))
  return snap.exists() ? snap.data() : {}
}

export async function saveActivity(classCode, gameId, data) {
  const id = activityId(classCode, gameId)
  await setDoc(doc(db, 'activities', id), { ...data, classCode, gameId }, { merge: true })
  await setDoc(
    doc(db, 'activityGroups', classCode),
    { [gameId]: { enabled: data.enabled, pointsPerCompletion: data.pointsPerCompletion } },
    { merge: true }
  )
}

// OX퀴즈 문제 저장
export async function saveOXQuestions(classCode, questions) {
  await setDoc(
    doc(db, 'activities', activityId(classCode, 'ox-quiz')),
    { questions },
    { merge: true }
  )
}

// ── 일일 플레이 횟수 추적 ─────────────────────────────────
function todayKST() {
  // UTC+9 기준 날짜 YYYY-MM-DD
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

function playLogId(classCode, gameId, studentCode) {
  return `${classCode}_${gameId}_${studentCode}_${todayKST()}`
}

export async function getTodayPlayCount(classCode, gameId, studentCode) {
  const snap = await getDoc(doc(db, 'playLogs', playLogId(classCode, gameId, studentCode)))
  return snap.exists() ? (snap.data().count || 0) : 0
}

export async function savePlayRound(classCode, gameId, studentCode, roundData) {
  const ref = doc(db, 'playLogs', playLogId(classCode, gameId, studentCode))
  await setDoc(ref, { rounds: arrayUnion({ ts: Date.now(), ...roundData }) }, { merge: true })
}

export async function getStudentRounds(classCode, gameId, studentCode) {
  const snap = await getDoc(doc(db, 'playLogs', playLogId(classCode, gameId, studentCode)))
  return snap.exists() ? (snap.data().rounds || []) : []
}

// ── 레이드 보스 ────────────────────────────────────────────
export async function getRaidBoss(classCode) {
  const snap = await getDoc(doc(db, 'raidBoss', classCode))
  return snap.exists() ? snap.data() : null
}

/**
 * 레이드 보스에 데미지를 추가합니다 (클라이언트 → Firestore 실시간 누적).
 * @param {string} classCode
 * @param {string} studentCode
 * @param {number} damage
 */
export async function contributeToRaid(classCode, studentCode, damage) {
  const ref = doc(db, 'raidBoss', classCode)
  await updateDoc(ref, {
    currentDamage: increment(damage),
    [`contributions.${studentCode}`]: increment(damage),
  })
}

/**
 * 레이드 보스를 초기화합니다 (교사 대시보드 전용).
 */
export async function resetRaidBoss(classCode, { bossName, bossEmoji, bossStory, totalHp }) {
  await setDoc(doc(db, 'raidBoss', classCode), {
    classCode,
    bossName,
    bossEmoji,
    bossStory,
    totalHp,
    currentDamage: 0,
    defeated: false,
    contributions: {},
    resetAt: new Date().toISOString(),
  })
}

/**
 * 레이드 보스 상태를 실시간으로 구독합니다.
 * @returns unsubscribe 함수
 */
export function subscribeToRaidBoss(classCode, callback) {
  return onSnapshot(doc(db, 'raidBoss', classCode), (snap) => {
    callback(snap.exists() ? snap.data() : null)
  })
}

// ── 당일 리더보드 ────────────────────────────────────────────
function scoreLogId(classCode, gameId) {
  return `${classCode}_${gameId}_${todayKST()}`
}

/**
 * 게임 결과를 오늘의 리더보드에 저장합니다.
 */
export async function saveGameScore(classCode, gameId, studentCode, studentName, scoreRatio, points, completionTime, score) {
  const ref  = doc(db, 'scoreLogs', scoreLogId(classCode, gameId))
  const snap = await getDoc(ref)

  // 기존 기록이 더 좋으면 덮어쓰지 않음
  if (snap.exists()) {
    const prev = snap.data()[studentCode]
    if (prev) {
      if (gameId === 'raid-typing') {
        // 레이드는 데미지 높은 쪽이 좋은 기록
        if ((prev.score ?? 0) >= (score ?? 0)) return
      } else {
        const prevBetter = prev.scoreRatio > scoreRatio ||
          (prev.scoreRatio === scoreRatio && (prev.completionTime ?? 99999) <= (completionTime ?? 99999))
        if (prevBetter) return
      }
    }
  }

  const entry = { name: studentName, scoreRatio, points, ts: Date.now() }
  if (completionTime != null) entry.completionTime = completionTime
  if (score != null) entry.score = score
  await setDoc(ref, { [studentCode]: entry }, { merge: true })
}

/**
 * 오늘의 리더보드를 가져옵니다.
 * @returns {{ studentCode: string, name: string, scoreRatio: number, points: number }[]}
 */
export async function getTodayLeaderboard(classCode, gameId) {
  const snap = await getDoc(doc(db, 'scoreLogs', scoreLogId(classCode, gameId)))
  if (!snap.exists()) return []
  const entries = Object.entries(snap.data())
    .map(([code, v]) => ({ studentCode: code, ...v }))

  if (gameId === 'raid-typing') {
    // 레이드는 데미지(score) 높은 순, 동점이면 격파 보너스(scoreRatio 1.5) 우선
    entries.sort((a, b) => {
      if (b.score !== a.score) return (b.score ?? 0) - (a.score ?? 0)
      return b.scoreRatio - a.scoreRatio
    })
  } else {
    entries.sort((a, b) => {
      if (b.scoreRatio !== a.scoreRatio) return b.scoreRatio - a.scoreRatio
      // 정확도 동점이면 빠른 시간 순
      return (a.completionTime ?? 99999) - (b.completionTime ?? 99999)
    })
  }

  return entries
}
