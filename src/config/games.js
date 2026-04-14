/**
 * 미니게임 레지스트리
 *
 * 새 미니게임을 추가할 때는 이 배열에 항목을 추가하세요.
 * 각 항목의 id는 Firestore activities/{classCode}_{id} 문서 키로 사용됩니다.
 */

import TypingGame from '../pages/games/TypingGame'
import MathQuiz   from '../pages/games/MathQuiz'
import OXQuiz     from '../pages/games/OXQuiz'

export const GAMES = [
  {
    id:          'typing',
    name:        '타자게임',
    icon:        '⌨️',
    description: '제시된 문장을 정확하게 입력하세요. 5문장을 완성하면 포인트를 받아요!',
    duration:    '약 2분',
    color:       'bg-carnival-sky',
    component:   TypingGame,
  },
  {
    id:          'math-quiz',
    name:        '수학퀴즈',
    icon:        '➗',
    description: '사칙연산 10문제를 풀어보세요. 모두 풀면 포인트를 받아요!',
    duration:    '약 3분',
    color:       'bg-carnival-purple',
    component:   MathQuiz,
  },
  {
    id:          'ox-quiz',
    name:        'OX퀴즈',
    icon:        '⭕',
    description: '선생님이 출제한 OX 문제를 풀어보세요. 10문제를 완료하면 포인트!',
    duration:    '약 2분',
    color:       'bg-carnival-coral',
    component:   OXQuiz,
  },
]

export function getGame(id) {
  return GAMES.find(g => g.id === id)
}
