/**
 * 🔗 끝말잇기 타자 (한글 / 영어)
 *
 * [게임 방식]
 * - 컴퓨터가 첫 단어 제시 → 학생과 컴퓨터가 번갈아 단어를 이어감 (AI 없이 내장 사전만 사용)
 * - 학생 단어 검증: 내장 사전에 있는 단어 + 끝 글자로 시작 + 재사용 금지
 *   · 한글: 두음법칙 허용 (력→역, 로→노 등), 2글자 이상
 *   · 영어: 마지막 알파벳 → 첫 알파벳, 3글자 이상
 * - 제한 시간(타이머) 안에 입력해야 함 — 교사가 난이도(초)를 설정
 * - 목표 단어 수(n개)를 달성하면 완료 → scoreRatio = 성공 수 / 목표
 * - 컴퓨터가 이을 단어를 못 찾으면 항복하고 새 단어로 다시 시작 (학생에게 유리)
 *
 * [교사 설정] activity.chainTimer (턴 제한 초), activity.chainTarget (목표 단어 수)
 */
import { useState, useEffect, useRef } from 'react'
import { KO_WORDS } from '../../data/wordChainKoData'
import { EN_WORDS } from '../../data/wordChainEnData'

// ── 한글 두음법칙: 이어야 하는 글자의 허용 변형 목록 ──
const IEUNG_VOWELS = [2, 6, 7, 12, 17, 20]  // ㅑ ㅕ ㅖ ㅛ ㅠ ㅣ

function dueumAlternatives(syl) {
  const code = syl.charCodeAt(0) - 0xAC00
  if (code < 0 || code > 11171) return [syl]
  const cho  = Math.floor(code / 588)
  const rest = code % 588
  const jung = Math.floor(rest / 28)
  const alts = [syl]
  if (cho === 5) {  // ㄹ → ㅇ(ㅑㅕㅖㅛㅠㅣ) / ㄴ(그 외)
    const newCho = IEUNG_VOWELS.includes(jung) ? 11 : 2
    alts.push(String.fromCharCode(0xAC00 + newCho * 588 + rest))
  }
  if (cho === 2 && IEUNG_VOWELS.includes(jung)) {  // ㄴ → ㅇ
    alts.push(String.fromCharCode(0xAC00 + 11 * 588 + rest))
  }
  return [...new Set(alts)]
}

const LANG_CONFIG = {
  ko: {
    words:      [...new Set(KO_WORDS)],
    minLen:     2,
    pattern:    /^[가-힣]+$/,
    startsFor:  word => dueumAlternatives(word[word.length - 1]),
    normalize:  s => s.trim(),
    title:      '🔗 끝말잇기 (한글)',
    badge:      '한글 낱말',
    placeholder: '이어지는 낱말을 입력하세요',
    lenError:   '2글자 이상의 낱말만 쓸 수 있어요',
    charError:  '한글 낱말만 쓸 수 있어요',
  },
  en: {
    words:      [...new Set(EN_WORDS)],
    minLen:     3,
    pattern:    /^[a-zA-Z]+$/,
    startsFor:  word => [word[word.length - 1]],
    normalize:  s => s.trim().toLowerCase(),
    title:      '🔗 Word Chain (영어)',
    badge:      'English Words',
    placeholder: 'Type the next word',
    lenError:   '3글자 이상의 단어만 쓸 수 있어요',
    charError:  '영어 단어만 쓸 수 있어요',
  },
}

export default function WordChainGame({ activity, onComplete, onExit, lang = 'ko' }) {
  const cfg = LANG_CONFIG[lang]

  const turnSeconds = activity?.chainTimer  ?? 20
  const target      = activity?.chainTarget ?? 10

  const [phase, setPhase]   = useState('intro')   // intro | play | win | over
  const [turn, setTurn]     = useState('computer') // player | computer
  const [chain, setChain]   = useState([])         // [{ word, by: 'player'|'computer' }]
  const [count, setCount]   = useState(0)          // 학생 성공 단어 수
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(null)
  const [notice, setNotice] = useState(null)       // 컴퓨터 항복 등 안내
  const [remaining, setRemaining] = useState(turnSeconds)

  const usedRef      = useRef(new Set())
  const inputRef     = useRef(null)
  const startTimeRef = useRef(null)
  const finishedRef  = useRef(false)

  const lastWord       = chain.length ? chain[chain.length - 1].word : null
  const requiredStarts = lastWord ? cfg.startsFor(lastWord) : []

  // ── 사전 탐색 헬퍼 ──
  function availableWords(startsList) {
    return cfg.words.filter(w =>
      !usedRef.current.has(w) &&
      (!startsList || startsList.some(s => w.startsWith(s)))
    )
  }

  function countContinuations(word) {
    return availableWords(cfg.startsFor(word)).length
  }

  // 컴퓨터 단어 선택: 학생이 이어갈 단어가 많은 쪽을 선호
  function pickComputerWord(prevWord) {
    let candidates = availableWords(prevWord ? cfg.startsFor(prevWord) : null)
    if (candidates.length === 0) return null
    if (candidates.length > 60) {
      candidates = [...candidates].sort(() => Math.random() - 0.5).slice(0, 60)
    }
    const scored = candidates.map(w => ({ w, c: countContinuations(w) }))
    const good   = scored.filter(s => s.c >= 3)
    const pool   = good.length > 0
      ? good
      : [...scored].sort((a, b) => b.c - a.c).slice(0, 10)
    return pool[Math.floor(Math.random() * pool.length)].w
  }

  function pushWord(word, by) {
    usedRef.current.add(word)
    setChain(prev => [...prev, { word, by }])
  }

  function finish(finalCount, result) {
    if (finishedRef.current) return
    finishedRef.current = true
    setPhase(result)
    const scoreRatio     = Math.min(1, finalCount / target)
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
    setTimeout(() => onComplete({
      score: finalCount, scoreRatio, completionTime, passed: result === 'win',
    }), 1600)
  }

  // ── 컴퓨터 턴 ──
  useEffect(() => {
    if (phase !== 'play' || turn !== 'computer') return
    const t = setTimeout(() => {
      const prev = chain.length ? chain[chain.length - 1].word : null
      const word = pickComputerWord(prev)
      if (word === null) {
        // 항복 → 새 단어로 체인 재시작
        setNotice('🏳️ 컴퓨터가 이을 단어를 찾지 못했어요! 새 단어로 다시 시작합니다.')
        const fresh = pickComputerWord(null)
        pushWord(fresh, 'computer')
      } else {
        setNotice(null)
        pushWord(word, 'computer')
      }
      setTurn('player')
    }, 800)
    return () => clearTimeout(t)
  }, [phase, turn])

  // ── 학생 턴 타이머 ──
  useEffect(() => {
    if (phase !== 'play' || turn !== 'player') return
    setRemaining(turnSeconds)
    inputRef.current?.focus()
    const deadline = Date.now() + turnSeconds * 1000
    const iv = setInterval(() => {
      const left = (deadline - Date.now()) / 1000
      if (left <= 0) {
        clearInterval(iv)
        setRemaining(0)
        finish(count, 'over')
      } else {
        setRemaining(left)
      }
    }, 100)
    return () => clearInterval(iv)
  }, [phase, turn])

  function handleStart() {
    startTimeRef.current = Date.now()
    setPhase('play')
    setTurn('computer')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (phase !== 'play' || turn !== 'player') return

    const word = cfg.normalize(input)
    if (!word) return

    if (!cfg.pattern.test(word)) { setError(cfg.charError); return }
    if (word.length < cfg.minLen) { setError(cfg.lenError); return }
    if (!requiredStarts.some(s => word.startsWith(s))) {
      setError(`'${requiredStarts.join("' 또는 '")}'(으)로 시작해야 해요`)
      return
    }
    if (usedRef.current.has(word)) { setError('이미 나온 단어예요!'); return }
    if (!cfg.words.includes(word)) {
      setError('이 게임 사전에 없는 단어예요. 다른 단어를 써보세요!')
      return
    }

    // 성공!
    setError(null)
    setNotice(null)
    setInput('')
    pushWord(word, 'player')
    const newCount = count + 1
    setCount(newCount)

    if (newCount >= target) {
      finish(newCount, 'win')
    } else {
      setTurn('computer')
    }
  }

  const timerRatio = Math.max(0, remaining / turnSeconds)
  const timerColor = timerRatio > 0.5 ? 'bg-green-400' : timerRatio > 0.25 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">{cfg.title}</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-lime-300 bg-lime-50 text-lime-700 text-sm font-bold">
            <span>🔤</span><span>{cfg.badge}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-carnival-navy/60 text-sm font-bold">
            <span>⏱️</span><span>턴당 {turnSeconds}초</span>
          </div>
        </div>

        {/* 진행 바 (성공 단어 수) */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>내가 이은 단어 {count} / {target}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-lime-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
            />
          </div>
        </div>

        {/* ── 시작 화면 ── */}
        {phase === 'intro' && (
          <div className="card text-center py-10 space-y-4">
            <div className="text-5xl">🔗</div>
            <p className="font-black text-xl text-carnival-navy">끝말잇기 대결!</p>
            <div className="text-sm text-carnival-navy/60 space-y-1">
              <p>컴퓨터와 번갈아 단어를 이어가요.</p>
              <p><strong className="text-carnival-coral">{turnSeconds}초</strong> 안에 입력하지 못하면 게임이 끝나요.</p>
              <p>단어 <strong className="text-carnival-coral">{target}개</strong>를 이으면 성공!</p>
              {lang === 'ko' && <p className="text-xs text-carnival-navy/40">두음법칙 OK (력→역, 로→노) · 2글자 이상</p>}
              {lang === 'en' && <p className="text-xs text-carnival-navy/40">마지막 알파벳으로 시작하는 단어 · 3글자 이상</p>}
            </div>
            <button onClick={handleStart} className="btn-primary w-full text-lg">시작하기 →</button>
          </div>
        )}

        {/* ── 종료 화면 ── */}
        {phase === 'win' && (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">🏆</div>
            <p className="font-black text-xl text-carnival-navy">목표 달성!</p>
            <p className="text-carnival-navy/50 text-sm">단어 {count}개를 모두 이었어요</p>
          </div>
        )}
        {phase === 'over' && (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">⏰</div>
            <p className="font-black text-xl text-carnival-navy">시간 초과!</p>
            <p className="text-carnival-navy/50 text-sm">
              단어 {count}개를 이었어요 {count > 0 ? `(목표 ${target}개의 ${Math.round((count / target) * 100)}%)` : ''}
            </p>
          </div>
        )}

        {/* ── 게임 화면 ── */}
        {phase === 'play' && (
          <>
            {/* 단어 체인 */}
            <div className="card mb-4 py-5 px-4">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {chain.slice(-6).map((item, i, arr) => (
                  <span key={`${item.word}-${i}`} className="flex items-center gap-1.5">
                    <span className={`px-3 py-1.5 rounded-xl text-base font-black ${
                      item.by === 'player'
                        ? 'bg-lime-100 border border-lime-300 text-lime-800'
                        : 'bg-gray-100 border border-gray-200 text-carnival-navy'
                    } ${i === arr.length - 1 ? 'text-xl' : 'opacity-60'}`}>
                      {item.word}
                    </span>
                    {i < arr.length - 1 && <span className="text-carnival-navy/30">→</span>}
                  </span>
                ))}
                {turn === 'computer' && (
                  <span className="text-carnival-navy/40 text-sm font-bold animate-pulse ml-1">
                    🤖 생각 중...
                  </span>
                )}
              </div>

              {/* 이어야 하는 글자 */}
              {turn === 'player' && lastWord && (
                <p className="text-center text-sm text-carnival-navy/50 mt-3">
                  <span className="font-black text-2xl text-carnival-coral">
                    {requiredStarts.join(' / ')}
                  </span>
                  {lang === 'ko' ? ' (으)로 시작하는 낱말!' : ' 로 시작하는 단어!'}
                </p>
              )}
            </div>

            {/* 안내 (컴퓨터 항복 등) */}
            {notice && (
              <p className="text-center text-sm text-amber-600 font-bold mb-3">{notice}</p>
            )}

            {/* 타이머 바 */}
            {turn === 'player' && (
              <div className="mb-3">
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${timerColor}`}
                    style={{ width: `${timerRatio * 100}%`, transition: 'width 0.1s linear' }}
                  />
                </div>
                <p className="text-right text-xs font-bold text-carnival-navy/40 mt-1">
                  {remaining.toFixed(1)}초
                </p>
              </div>
            )}

            {/* 입력 */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setError(null) }}
                onPaste={e => e.preventDefault()}
                type="text"
                placeholder={turn === 'player' ? cfg.placeholder : '컴퓨터 차례...'}
                disabled={turn !== 'player'}
                autoComplete="off"
                spellCheck="false"
                className="input-field flex-1 text-xl text-center font-bold disabled:opacity-50"
              />
              <button type="submit" disabled={turn !== 'player'}
                className="btn-secondary px-6 text-xl disabled:opacity-50">→</button>
            </form>

            {/* 오류 메시지 */}
            {error && (
              <p className="text-center text-carnival-coral font-bold text-sm mt-3">❌ {error}</p>
            )}

            {/* 예상 포인트 */}
            {turn === 'player' && !error && count > 0 && (
              <p className="text-center text-xs text-carnival-navy/30 mt-3">
                현재 {count}/{target}개 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * Math.min(1, count / target))}P
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
