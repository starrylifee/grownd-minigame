/**
 * 🧮 연산 순서 클릭 게임 데이터
 *
 * display:    화면에 보여줄 식 (연산자가 왼쪽→오른쪽 순서로 ops 와 1:1 대응)
 * ops:        식에 등장하는 연산자 배열 (표시 순서)
 * clickOrder: 각 단계에서 클릭해야 할 "연산자 번호(1-based, 표시 순서 기준)"
 *             예) clickOrder[0] === 2  → 1단계에서 2번째 연산자를 클릭
 *             즉 괄호 → ×·÷ → +·- 의 실제 계산 순서와 일치한다.
 * answer:     식을 올바른 순서로 계산한 최종 값
 * level:      1(쉬움) · 2(보통) · 3(어려움)
 */

export const OPERATOR_ORDER_PROBLEMS = [
  { id: 1,  level: 1, display: '20 + (10 ÷ 2) × 7 - 24',   ops: ['+', '÷', '×', '-'], clickOrder: [2, 3, 1, 4], answer: 31 },
  { id: 2,  level: 1, display: '(7 + 11) × 5 - 20 ÷ 2',    ops: ['+', '×', '-', '÷'], clickOrder: [1, 2, 4, 3], answer: 80 },
  { id: 3,  level: 1, display: '3 × (19 + 11) - 24 ÷ 6',   ops: ['×', '+', '-', '÷'], clickOrder: [2, 1, 4, 3], answer: 86 },
  { id: 4,  level: 1, display: '23 - (5 + 7) ÷ 12 × 15',   ops: ['-', '+', '÷', '×'], clickOrder: [2, 3, 4, 1], answer: 8 },
  { id: 5,  level: 1, display: '17 + (13 - 12) × 19 ÷ 19', ops: ['+', '-', '×', '÷'], clickOrder: [2, 3, 4, 1], answer: 18 },
  { id: 6,  level: 1, display: '(11 × 2) + 3 - 12 ÷ 3',    ops: ['×', '+', '-', '÷'], clickOrder: [1, 4, 2, 3], answer: 21 },
  { id: 7,  level: 1, display: '10 × (8 - 5) + 16 ÷ 4',    ops: ['×', '-', '+', '÷'], clickOrder: [2, 1, 4, 3], answer: 34 },
  { id: 8,  level: 1, display: '20 + (8 ÷ 4) × 19 - 8',    ops: ['+', '÷', '×', '-'], clickOrder: [2, 3, 1, 4], answer: 50 },
  { id: 9,  level: 1, display: '(4 + 4) × 4 - 15 ÷ 5',     ops: ['+', '×', '-', '÷'], clickOrder: [1, 2, 4, 3], answer: 29 },
  { id: 10, level: 1, display: '3 × (9 + 24) - 16 ÷ 16',   ops: ['×', '+', '-', '÷'], clickOrder: [2, 1, 4, 3], answer: 98 },
  { id: 11, level: 1, display: '22 - (12 + 6) ÷ 6 × 3',    ops: ['-', '+', '÷', '×'], clickOrder: [2, 3, 4, 1], answer: 13 },
  { id: 12, level: 1, display: '9 + (11 - 5) × 3 ÷ 9',     ops: ['+', '-', '×', '÷'], clickOrder: [2, 3, 4, 1], answer: 11 },
  { id: 13, level: 1, display: '(4 × 18) + 19 - 18 ÷ 18',  ops: ['×', '+', '-', '÷'], clickOrder: [1, 4, 2, 3], answer: 90 },
  { id: 14, level: 1, display: '22 × (14 - 13) + 10 ÷ 2',  ops: ['×', '-', '+', '÷'], clickOrder: [2, 1, 4, 3], answer: 27 },
  { id: 15, level: 1, display: '15 + (21 ÷ 7) × 19 - 11',  ops: ['+', '÷', '×', '-'], clickOrder: [2, 3, 1, 4], answer: 61 },
  { id: 16, level: 2, display: '(33 - 32) × (20 + 36) ÷ 2',   ops: ['-', '×', '+', '÷'], clickOrder: [1, 3, 2, 4], answer: 28 },
  { id: 17, level: 2, display: '28 ÷ (34 - 32) + 5 × 10',     ops: ['÷', '-', '+', '×'], clickOrder: [2, 1, 4, 3], answer: 64 },
  { id: 18, level: 2, display: '32 - 8 × (10 + 2) ÷ 12',      ops: ['-', '×', '+', '÷'], clickOrder: [3, 2, 4, 1], answer: 24 },
  { id: 19, level: 2, display: '(24 ÷ 12) + 10 × (36 - 33)',  ops: ['÷', '+', '×', '-'], clickOrder: [1, 4, 3, 2], answer: 32 },
  { id: 20, level: 2, display: '17 + 16 × (21 - 7) ÷ 4',      ops: ['+', '×', '-', '÷'], clickOrder: [3, 2, 4, 1], answer: 73 },
  { id: 21, level: 2, display: '(15 + 17) ÷ 2 - 4 × 3',       ops: ['+', '÷', '-', '×'], clickOrder: [1, 2, 4, 3], answer: 4 },
  { id: 22, level: 2, display: '(36 - 22) ÷ 2 + 5 × 24',      ops: ['-', '÷', '+', '×'], clickOrder: [1, 2, 4, 3], answer: 127 },
  { id: 23, level: 2, display: '(35 - 27) × (36 + 14) ÷ 20',  ops: ['-', '×', '+', '÷'], clickOrder: [1, 3, 2, 4], answer: 20 },
  { id: 24, level: 2, display: '18 ÷ (30 - 29) + 23 × 4',     ops: ['÷', '-', '+', '×'], clickOrder: [2, 1, 4, 3], answer: 110 },
  { id: 25, level: 2, display: '36 - 14 × (9 + 6) ÷ 14',      ops: ['-', '×', '+', '÷'], clickOrder: [3, 2, 4, 1], answer: 21 },
  { id: 26, level: 2, display: '(25 ÷ 5) + 32 × (17 - 16)',   ops: ['÷', '+', '×', '-'], clickOrder: [1, 4, 3, 2], answer: 37 },
  { id: 27, level: 2, display: '29 + 22 × (27 - 13) ÷ 22',    ops: ['+', '×', '-', '÷'], clickOrder: [3, 2, 4, 1], answer: 43 },
  { id: 28, level: 2, display: '(25 + 33) ÷ 2 - 3 × 5',       ops: ['+', '÷', '-', '×'], clickOrder: [1, 2, 4, 3], answer: 14 },
  { id: 29, level: 2, display: '(26 - 6) ÷ 4 + 5 × 28',       ops: ['-', '÷', '+', '×'], clickOrder: [1, 2, 4, 3], answer: 145 },
  { id: 30, level: 2, display: '(8 - 6) × (2 + 4) ÷ 4',       ops: ['-', '×', '+', '÷'], clickOrder: [1, 3, 2, 4], answer: 3 },
  { id: 31, level: 2, display: '16 ÷ (28 - 24) + 2 × 21',     ops: ['÷', '-', '+', '×'], clickOrder: [2, 1, 4, 3], answer: 46 },
  { id: 32, level: 2, display: '22 - 21 × (15 + 5) ÷ 30',     ops: ['-', '×', '+', '÷'], clickOrder: [3, 2, 4, 1], answer: 8 },
  { id: 33, level: 2, display: '(30 ÷ 10) + 29 × (27 - 22)',  ops: ['÷', '+', '×', '-'], clickOrder: [1, 4, 3, 2], answer: 148 },
  { id: 34, level: 2, display: '12 + 11 × (30 - 16) ÷ 14',    ops: ['+', '×', '-', '÷'], clickOrder: [3, 2, 4, 1], answer: 23 },
  { id: 35, level: 2, display: '(29 + 19) ÷ 6 - 2 × 2',       ops: ['+', '÷', '-', '×'], clickOrder: [1, 2, 4, 3], answer: 4 },
  { id: 36, level: 3, display: '23 + (4 × 16 - 47) ÷ 17',  ops: ['+', '×', '-', '÷'], clickOrder: [2, 3, 4, 1], answer: 24 },
  { id: 37, level: 3, display: '48 - (47 ÷ 47 + 9) × 2',   ops: ['-', '÷', '+', '×'], clickOrder: [2, 3, 4, 1], answer: 28 },
  { id: 38, level: 3, display: '(22 + 15 × 6) - 45 ÷ 15',  ops: ['+', '×', '-', '÷'], clickOrder: [2, 1, 4, 3], answer: 109 },
  { id: 39, level: 3, display: '(39 - 40 ÷ 2) × 7 + 2',    ops: ['-', '÷', '×', '+'], clickOrder: [2, 1, 3, 4], answer: 135 },
  { id: 40, level: 3, display: '12 ÷ (19 + 25 - 41) × 32', ops: ['÷', '+', '-', '×'], clickOrder: [2, 3, 1, 4], answer: 128 },
  { id: 41, level: 3, display: '19 × (3 + 32 ÷ 16) - 31',  ops: ['×', '+', '÷', '-'], clickOrder: [3, 2, 1, 4], answer: 64 },
  { id: 42, level: 3, display: '47 + (18 × 3 - 22) ÷ 8',   ops: ['+', '×', '-', '÷'], clickOrder: [2, 3, 4, 1], answer: 51 },
  { id: 43, level: 3, display: '38 - (17 ÷ 17 + 3) × 7',   ops: ['-', '÷', '+', '×'], clickOrder: [2, 3, 4, 1], answer: 10 },
  { id: 44, level: 3, display: '(19 + 2 × 21) - 14 ÷ 7',   ops: ['+', '×', '-', '÷'], clickOrder: [2, 1, 4, 3], answer: 59 },
  { id: 45, level: 3, display: '(22 - 28 ÷ 2) × 4 + 42',   ops: ['-', '÷', '×', '+'], clickOrder: [2, 1, 3, 4], answer: 74 },
  { id: 46, level: 3, display: '21 ÷ (15 + 5 - 13) × 41',  ops: ['÷', '+', '-', '×'], clickOrder: [2, 3, 1, 4], answer: 123 },
  { id: 47, level: 3, display: '16 × (3 + 12 ÷ 12) - 4',   ops: ['×', '+', '÷', '-'], clickOrder: [3, 2, 1, 4], answer: 60 },
  { id: 48, level: 3, display: '41 + (40 × 4 - 25) ÷ 3',   ops: ['+', '×', '-', '÷'], clickOrder: [2, 3, 4, 1], answer: 86 },
  { id: 49, level: 3, display: '26 - (22 ÷ 22 + 9) × 2',   ops: ['-', '÷', '+', '×'], clickOrder: [2, 3, 4, 1], answer: 6 },
  { id: 50, level: 3, display: '(20 + 8 × 20) - 42 ÷ 3',   ops: ['+', '×', '-', '÷'], clickOrder: [2, 1, 4, 3], answer: 166 },
]

/** display 문자열을 텍스트/연산자 토큰으로 분해한다.
 *  연산자 토큰에는 표시 순서(opIndex, 0-based)를 부여해 클릭 판정에 사용한다. */
export function tokenizeDisplay(display) {
  const OPS = new Set(['+', '-', '×', '÷'])
  const tokens = []
  let buf = ''
  let opIndex = 0
  for (const ch of display) {
    if (OPS.has(ch)) {
      if (buf) { tokens.push({ type: 'text', value: buf }); buf = '' }
      tokens.push({ type: 'op', value: ch, opIndex })
      opIndex += 1
    } else {
      buf += ch
    }
  }
  if (buf) tokens.push({ type: 'text', value: buf })
  return tokens
}
