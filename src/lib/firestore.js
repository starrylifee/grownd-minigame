import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc
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
  // 해당 학급의 모든 활동 가져오기
  const snap = await getDoc(doc(db, 'activityGroups', classCode))
  return snap.exists() ? snap.data() : {}
}

export async function saveActivity(classCode, gameId, data) {
  const id = activityId(classCode, gameId)
  await setDoc(doc(db, 'activities', id), { ...data, classCode, gameId }, { merge: true })
  // activityGroups에도 요약 저장 (로비 조회용)
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
