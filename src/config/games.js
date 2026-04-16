/**
 * 미니게임 레지스트리
 *
 * 새 미니게임을 추가할 때는 이 배열에 항목을 추가하세요.
 * 각 항목의 id는 Firestore activities/{classCode}_{id} 문서 키로 사용됩니다.
 */

import WordTypingGame from '../pages/games/WordTypingGame'
import TypingGame     from '../pages/games/TypingGame'
import MathQuiz       from '../pages/games/MathQuiz'
import RaidTypingGame from '../pages/games/RaidTypingGame'
import VocabGame      from '../pages/games/VocabGame'

export const GAMES = [
  {
    id:                'word-typing',
    name:              '낱말 타자',
    icon:              '🔤',
    description:       '레벨에 맞는 낱말 10개를 정확히 입력하세요!',
    duration:          '약 1분',
    color:             'bg-carnival-green',
    component:         WordTypingGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'typing',
    name:              '문장 타자',
    icon:              '⌨️',
    description:       '레벨에 맞는 문장 5개를 정확하게 입력하세요!',
    duration:          '약 2분',
    color:             'bg-carnival-sky',
    component:         TypingGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'math-quiz',
    name:              '사칙연산',
    icon:              '➗',
    description:       '선생님이 설정한 유형의 수학 문제 10개를 풀어보세요!',
    duration:          '약 3분',
    color:             'bg-carnival-purple',
    component:         MathQuiz,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'vocab',
    name:              '영어 단어',
    icon:              '🔤',
    description:       '선생님이 설정한 Unit의 단어 10개! 한글 뜻을 보고 영어로 타이핑하세요.',
    duration:          '약 3분',
    color:             'bg-blue-400',
    component:         VocabGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'raid-typing',
    name:              '학급 레이드',
    icon:              '🐉',
    description:       '학급 전체가 힘을 합쳐 보스를 물리쳐요! 그라운드 드래곤이 함께 싸웁니다.',
    duration:          '약 5분',
    color:             'bg-gradient-to-r from-purple-600 to-indigo-600',
    component:         RaidTypingGame,
    defaultDailyLimit: 1,
    defaultPoints:     20,
  },
]

export function getGame(id) {
  return GAMES.find(g => g.id === id)
}
