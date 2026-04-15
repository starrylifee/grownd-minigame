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
/**
 * @param {string}  classCode
 * @param {string}  studentCode
 * @param {string}  gameId
 * @param {number?} scoreRatio  - 0~1, 지정 시 포인트 비례 지급 (수학퀴즈 등)
 */
export async function awardPoints(classCode, studentCode, gameId, scoreRatio) {
  const fn = httpsCallable(functions, 'awardPoints')
  const result = await fn({ classCode, studentCode, gameId, scoreRatio })
  return result.data
}
