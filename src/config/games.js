/**
 * 미니게임 레지스트리
 *
 * 새 미니게임을 추가할 때는 이 배열에 항목을 추가하세요.
 * 각 항목의 id는 Firestore activities/{classCode}_{id} 문서 키로 사용됩니다.
 */

import TypingGame     from '../pages/games/TypingGame'
import MathQuiz       from '../pages/games/MathQuiz'
import OXQuiz         from '../pages/games/OXQuiz'
import RaidTypingGame from '../pages/games/RaidTypingGame'

export const GAMES = [
  {
    id:               'typing',
    name:             '한글 타자',
    icon:             '⌨️',
    description:      '키보드 레벨에 맞는 문장을 입력하세요! 5문장을 완성하면 포인트를 받아요.',
    duration:         '약 2분',
    color:            'bg-carnival-sky',
    component:        TypingGame,
    defaultDailyLimit: 5,
    defaultPoints:    10,
  },
  {
    id:               'math-quiz',
    name:             '사칙연산',
    icon:             '➗',
    description:      '선생님이 설정한 유형의 수학 문제 10개를 풀어보세요!',
    duration:         '약 3분',
    color:            'bg-carnival-purple',
    component:        MathQuiz,
    defaultDailyLimit: 5,
    defaultPoints:    10,
  },
  {
    id:               'ox-quiz',
    name:             'OX퀴즈',
    icon:             '⭕',
    description:      '선생님이 출제한 OX 문제를 풀어보세요. 10문제를 완료하면 포인트!',
    duration:         '약 2분',
    color:            'bg-carnival-coral',
    component:        OXQuiz,
    defaultDailyLimit: 5,
    defaultPoints:    10,
  },
  {
    id:               'raid-typing',
    name:             '학급 레이드',
    icon:             '🐉',
    description:      '학급 전체가 힘을 합쳐 보스를 물리쳐요! 그라운드 드래곤이 함께 싸웁니다.',
    duration:         '약 5분',
    color:            'bg-gradient-to-r from-purple-600 to-indigo-600',
    component:        RaidTypingGame,
    defaultDailyLimit: 1,
    defaultPoints:    20,
  },
]

export function getGame(id) {
  return GAMES.find(g => g.id === id)
}
