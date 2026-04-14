import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

/**
 * 학생에게 그라운드 포인트를 지급합니다.
 * 실제 API 키는 Cloud Function에서만 사용하므로 클라이언트에 노출되지 않습니다.
 *
 * @param {string} classCode - 플랫폼 학급 코드
 * @param {string} studentCode - 학생 번호
 * @param {string} gameId - 게임 ID (활동 ID)
 * @returns {Promise<{success: boolean, points: number, message: string}>}
 */
export async function awardPoints(classCode, studentCode, gameId) {
  const fn = httpsCallable(functions, 'awardPoints')
  const result = await fn({ classCode, studentCode, gameId })
  return result.data
}
