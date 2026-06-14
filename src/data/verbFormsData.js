/**
 * 영어 불규칙 동사 변화 데이터 (현재 - 과거 - 과거분사)
 *
 * present        : 현재형(원형)
 * past           : 과거형
 * pastParticiple : 과거분사형 (대체형은 ' / '로 구분)
 */
export const VERB_FORMS = [
  { present: 'beat',       past: 'beat',       pastParticiple: 'beaten' },
  { present: 'become',     past: 'became',     pastParticiple: 'become' },
  { present: 'begin',      past: 'began',      pastParticiple: 'begun' },
  { present: 'bend',       past: 'bent',       pastParticiple: 'bent' },
  { present: 'bite',       past: 'bit',        pastParticiple: 'bitten' },
  { present: 'blow',       past: 'blew',       pastParticiple: 'blown' },
  { present: 'break',      past: 'broke',      pastParticiple: 'broken' },
  { present: 'bring',      past: 'brought',    pastParticiple: 'brought' },
  { present: 'buy',        past: 'bought',     pastParticiple: 'bought' },
  { present: 'catch',      past: 'caught',     pastParticiple: 'caught' },
  { present: 'choose',     past: 'chose',      pastParticiple: 'chosen' },
  { present: 'come',       past: 'came',       pastParticiple: 'come' },
  { present: 'cut',        past: 'cut',        pastParticiple: 'cut' },
  { present: 'dig',        past: 'dug',        pastParticiple: 'dug' },
  { present: 'do',         past: 'did',        pastParticiple: 'done' },
  { present: 'draw',       past: 'drew',       pastParticiple: 'drawn' },
  { present: 'drink',      past: 'drank',      pastParticiple: 'drunk' },
  { present: 'eat',        past: 'ate',        pastParticiple: 'eaten' },
  { present: 'fall',       past: 'fell',       pastParticiple: 'fallen' },
  { present: 'feel',       past: 'felt',       pastParticiple: 'felt' },
  { present: 'fight',      past: 'fought',     pastParticiple: 'fought' },
  { present: 'forget',     past: 'forgot',     pastParticiple: 'forgotten' },
  { present: 'forgive',    past: 'forgave',    pastParticiple: 'forgiven' },
  { present: 'get',        past: 'got',        pastParticiple: 'got / gotten' },
  { present: 'give',       past: 'gave',       pastParticiple: 'given' },
  { present: 'go',         past: 'went',       pastParticiple: 'gone' },
  { present: 'grow',       past: 'grew',       pastParticiple: 'grown' },
  { present: 'hang',       past: 'hung',       pastParticiple: 'hung' },
  { present: 'hear',       past: 'heard',      pastParticiple: 'heard' },
  { present: 'hurt',       past: 'hurt',       pastParticiple: 'hurt' },
  { present: 'know',       past: 'knew',       pastParticiple: 'known' },
  { present: 'leave',      past: 'left',       pastParticiple: 'left' },
  { present: 'lend',       past: 'lent',       pastParticiple: 'lent' },
  { present: 'make',       past: 'made',       pastParticiple: 'made' },
  { present: 'mean',       past: 'meant',      pastParticiple: 'meant' },
  { present: 'pay',        past: 'paid',       pastParticiple: 'paid' },
  { present: 'read',       past: 'read',       pastParticiple: 'read' },
  { present: 'ride',       past: 'rode',       pastParticiple: 'ridden' },
  { present: 'rise',       past: 'rose',       pastParticiple: 'risen' },
  { present: 'see',        past: 'saw',        pastParticiple: 'seen' },
  { present: 'sell',       past: 'sold',       pastParticiple: 'sold' },
  { present: 'shake',      past: 'shook',      pastParticiple: 'shaken' },
  { present: 'sing',       past: 'sang',       pastParticiple: 'sung' },
  { present: 'sink',       past: 'sank',       pastParticiple: 'sunk' },
  { present: 'sit',        past: 'sat',        pastParticiple: 'sat' },
  { present: 'sleep',      past: 'slept',      pastParticiple: 'slept' },
  { present: 'speak',      past: 'spoke',      pastParticiple: 'spoken' },
  { present: 'steal',      past: 'stole',      pastParticiple: 'stolen' },
  { present: 'swim',       past: 'swam',       pastParticiple: 'swum' },
  { present: 'take',       past: 'took',       pastParticiple: 'taken' },
  { present: 'teach',      past: 'taught',     pastParticiple: 'taught' },
  { present: 'tear',       past: 'tore',       pastParticiple: 'torn' },
  { present: 'tell',       past: 'told',       pastParticiple: 'told' },
  { present: 'think',      past: 'thought',    pastParticiple: 'thought' },
  { present: 'throw',      past: 'threw',      pastParticiple: 'thrown' },
  { present: 'understand', past: 'understood', pastParticiple: 'understood' },
  { present: 'wake',       past: 'woke',       pastParticiple: 'woken' },
  { present: 'wear',       past: 'wore',       pastParticiple: 'worn' },
]

// 타이핑 정답 비교: 'got / gotten' 같은 대체형 처리
export function verbAnswers(form) {
  return form.split('/').map(s => s.trim().toLowerCase()).filter(Boolean)
}
