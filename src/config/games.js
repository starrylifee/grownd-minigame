/**
 * 미니게임 레지스트리
 *
 * 새 미니게임을 추가할 때는 이 배열에 항목을 추가하세요.
 * 각 항목의 id는 Firestore activities/{classCode}_{id} 문서 키로 사용됩니다.
 */

import WordTypingGame    from '../pages/games/WordTypingGame'
import TypingGame        from '../pages/games/TypingGame'
import MathQuiz          from '../pages/games/MathQuiz'
import RaidTypingGame    from '../pages/games/RaidTypingGame'
import VocabGame         from '../pages/games/VocabGame'
import CountryQuizGame   from '../pages/games/CountryQuizGame'
import CountryQuizGame2  from '../pages/games/CountryQuizGame2'
import FlagQuizGame      from '../pages/games/FlagQuizGame'
import ProverbChosungGame from '../pages/games/ProverbChosungGame'
import WordMeaningGame   from '../pages/games/WordMeaningGame'
// 레거시: 끝말잇기 (학생 난이도 문제로 비공개, 코드는 보존)
// import WordChainGame     from '../pages/games/WordChainGame'
// import WordChainGameEn   from '../pages/games/WordChainGameEn'
import LadybugGame       from '../pages/games/LadybugGame'
import SpaceDockingGame  from '../pages/games/SpaceDockingGame'
import ShapeRotationGame from '../pages/games/ShapeRotationGame'

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
    icon:              '🇬🇧',
    description:       '선생님이 설정한 Unit의 단어 10개! 한글 뜻을 보고 영어로 타이핑하세요.',
    duration:          '약 3분',
    color:             'bg-blue-400',
    component:         VocabGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'country-quiz',
    name:              '나라 수도',
    icon:              '🌍',
    description:       '세계 나라의 수도를 맞혀보세요! 국기를 보고 수도 이름을 입력하세요.',
    duration:          '약 3분',
    color:             'bg-emerald-400',
    component:         CountryQuizGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'country-quiz-2',
    name:              '나라 수도 2',
    icon:              '🗺️',
    description:       '나라 수도 퀴즈 두 번째 세트! 새로운 나라들의 수도를 맞혀보세요.',
    duration:          '약 3분',
    color:             'bg-teal-400',
    component:         CountryQuizGame2,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'flag-quiz',
    name:              '국기 퀴즈',
    icon:              '🚩',
    description:       '국기만 보고 어느 나라인지 맞혀보세요! 100여 개 나라의 국기가 출제됩니다.',
    duration:          '약 3분',
    color:             'bg-rose-400',
    component:         FlagQuizGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'proverb-chosung',
    name:              '속담 초성 퀴즈',
    icon:              '📜',
    description:       '초성만 보고 속담을 완성하세요! 막히면 뜻과 첫 글자 힌트가 나와요.',
    duration:          '약 4분',
    color:             'bg-amber-400',
    component:         ProverbChosungGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  {
    id:                'word-meaning',
    name:              '동형어·다의어',
    icon:              '📚',
    description:       '두 문장 속 같은 낱말이 동형어(동음이의어)인지 다의어인지 맞혀보세요!',
    duration:          '약 3분',
    color:             'bg-indigo-400',
    component:         WordMeaningGame,
    defaultDailyLimit: 5,
    defaultPoints:     10,
  },
  // ── 레거시: 끝말잇기 (학생 난이도 문제로 비공개) ──
  // 다시 살리려면 위 import 2줄과 아래 항목의 주석을 해제하세요.
  // {
  //   id:                'word-chain-ko',
  //   name:              '끝말잇기 (한글)',
  //   icon:              '🔗',
  //   description:       '컴퓨터와 끝말잇기 대결! 제한 시간 안에 단어를 이어 목표 개수를 달성하세요. 두음법칙도 인정됩니다.',
  //   duration:          '약 3분',
  //   color:             'bg-lime-500',
  //   component:         WordChainGame,
  //   defaultDailyLimit: 5,
  //   defaultPoints:     10,
  // },
  // {
  //   id:                'word-chain-en',
  //   name:              'Word Chain (영어)',
  //   icon:              '🔠',
  //   description:       '영어 끝말잇기! 단어의 마지막 알파벳으로 시작하는 단어를 제한 시간 안에 이어가세요.',
  //   duration:          '약 3분',
  //   color:             'bg-sky-500',
  //   component:         WordChainGameEn,
  //   defaultDailyLimit: 5,
  //   defaultPoints:     10,
  // },
  {
    id:                'ladybug',
    name:              '무당벌레 무늬',
    icon:              '🐞',
    description:       '좌표를 입력해 목표 무늬를 완성하세요! 5단계를 모두 클리어해야 포인트를 받을 수 있어요.',
    duration:          '약 5분',
    color:             'bg-red-400',
    component:         LadybugGame,
    defaultDailyLimit: 3,
    defaultPoints:     15,
  },
  {
    id:                'space-docking',
    name:              '우주 도킹',
    icon:              '🚀',
    description:       '우주선 모듈의 방향을 맞춰 도킹하세요! 10·15·20단계마다 포인트가 쌓입니다.',
    duration:          '약 5분',
    color:             'bg-gradient-to-r from-slate-800 to-cyan-900',
    component:         SpaceDockingGame,
    defaultDailyLimit: 3,
    defaultPoints:     15,
  },
  {
    id:                'shape-rotation',
    name:              '도형 돌리기',
    icon:              '🌀',
    description:       '사진을 16조각으로 나눠 돌려놓은 퍼즐! 90°·180°·270° 돌아간 조각을 클릭해서 모두 바른 방향으로 맞춰보세요.',
    duration:          '약 5분',
    color:             'bg-blue-500',
    component:         ShapeRotationGame,
    defaultDailyLimit: 3,
    defaultPoints:     15,
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
