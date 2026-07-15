import { useEffect, useState } from 'react'
import { signOut }             from 'firebase/auth'
import { useNavigate }         from 'react-router-dom'
import { auth }                from '../lib/firebase'
import { useAuth }             from '../context/AuthContext'
import {
  getTeacher, saveTeacher, getClass, saveClass,
  saveActivity, getActivity, hashPassword,
  getRaidBoss, resetRaidBoss, getTodayLeaderboard,
  getStudentRounds, todayKST,
  getStudentPlayCounts, resetTodayPlayCount,
} from '../lib/firestore'
import { GAMES } from '../config/games'
import { VOCAB_UNIT_NAMES } from '../data/vocabData'
import { HISTORY_ERAS } from '../data/historyData'
import { BOSS_PRESETS } from '../data/bossPresets'

const TABS = ['학급 설정', '학생 관리', '게임 관리', '학생 활동']

const TYPING_LEVEL_INFO = {
  1: '🌱 초급 — 홈 포지션 (ㅁㄴㅇㄹ / ㅓㅏㅣ)',
  2: '🌿 중급 — 윗 행 추가 (ㅂㅈㄷㄱ / ㅕㅑㅐㅔ)',
  3: '🌳 고급 — 아랫 행 추가 (ㅋㅌㅊ / ㅜㅡ)',
  4: '🏆 최고급 — 전체 자판 (ㅅㅎ / ㅗㅛㅠ)',
}

const MATH_TYPE_INFO = {
  'single-add':       '➕ 한 자리 덧셈 (1~9 + 1~9)',
  'double-add':       '📐 두 자리 덧셈 — 받아올림 없음',
  'double-add-carry': '🔢 두 자리 덧셈 — 받아올림 있음',
  'single-mul':       '✖️ 한 자리 곱셈 (2~9 × 2~9)',
}

function formatTime(secs) {
  if (!secs) return ''
  if (secs < 60) return `${secs}초`
  return `${Math.floor(secs / 60)}분 ${secs % 60}초`
}

function formatPlayedAt(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatRoundResult(gameId, round) {
  if (gameId === 'raid-typing') {
    const dmg = round.score ?? 0
    return round.scoreRatio >= 1.5 ? `🏆 ${dmg}` : `⚔️ ${dmg}`
  }
  if (gameId === 'math-quiz') return `${Math.round((round.scoreRatio ?? 0) * 10)}/10`
  if (gameId === 'verb-forms') return `${round.score ?? 0}/10`
  if (gameId === 'word-typing' || gameId === 'typing') {
    return round.completionTime ? formatTime(round.completionTime) : '완료'
  }
  if (gameId === 'space-docking') {
    const r = round.scoreRatio ?? 0
    if (r >= 1.0) return '🚀 20단계 완주'
    if (r >= 0.66) return '⭐ 15단계 클리어'
    if (r >= 0.33) return '🎉 10단계 클리어'
    return `${round.score ?? 0}단계`
  }
  if (gameId === 'word-chain-ko' || gameId === 'word-chain-en') {
    return `${round.score ?? 0}단어`
  }
  return `${Math.round((round.scoreRatio ?? 0) * 100)}%`
}

function formatActivity(gameId, entry) {
  if (!entry) return null
  if (gameId === 'raid-typing') {
    const dmg = entry.score ?? 0
    return entry.scoreRatio >= 1.5 ? `🏆 ${dmg}` : `⚔️ ${dmg}`
  }
  if (gameId === 'math-quiz') return `${Math.round((entry.scoreRatio ?? 0) * 10)}/10`
  if (gameId === 'verb-forms') return `${entry.score ?? 0}/10`
  if (gameId === 'word-typing' || gameId === 'typing') {
    return entry.completionTime ? formatTime(entry.completionTime) : '완료'
  }
  if (gameId === 'space-docking') {
    const r = entry.scoreRatio ?? 0
    if (r >= 1.0) return '🚀 완주'
    if (r >= 0.66) return '⭐ 15단계'
    if (r >= 0.33) return '🎉 10단계'
    return `${entry.score ?? 0}단계`
  }
  if (gameId === 'word-chain-ko' || gameId === 'word-chain-en') {
    return `${entry.score ?? 0}단어`
  }
  return `${Math.round((entry.scoreRatio ?? 0) * 100)}%`
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange(!on) }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? 'bg-carnival-green' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function defaultSettingsFor(game) {
  const base = {
    enabled:             false,
    activityPassword:    '',
    pointsPerCompletion: game.defaultPoints    || 10,
    dailyLimit:          game.defaultDailyLimit || 5,
    practiceMode:        false,
  }
  if (game.id === 'word-typing') return { ...base, typingLevel: 1 }
  if (game.id === 'typing')      return { ...base, typingLevel: 1 }
  if (game.id === 'word-chain-ko' || game.id === 'word-chain-en') {
    return { ...base, chainTimer: 20, chainTarget: 10 }
  }
  if (game.id === 'math-quiz')   return { ...base, mathType: 'single-add' }
  if (game.id === 'verb-forms')  return { ...base, verbMode: 'mc' }
  if (game.id === 'operator-order') return { ...base, opOrderLevel: 1 }
  if (game.id === 'vocab')       return { ...base, vocabUnit: 'UNIT 01' }
  if (game.id === 'flag-quiz')   return { ...base, flagDifficulty: 'easy' }
  if (game.id === 'history-quiz') return { ...base, historyEras: HISTORY_ERAS.map(e => e.key) }
  if (game.id === 'space-docking') return {
    ...base,
    pointsPerCompletion: 15,  // 세 마일스톤 합산 (자동 계산)
    milestone10: 5,
    milestone15: 5,
    milestone20: 5,
  }
  if (game.id === 'raid-typing') return {
    ...base,
    dailyLimit:      1,
    bossHp:          1000,
    bossName:        '',
    bossEmoji:       '',
    bossStory:       '',
    customSentences: '',
  }
  return base
}

export default function TeacherDashboard() {
  const { teacher } = useAuth()
  const navigate    = useNavigate()
  const [tab, setTab]       = useState(0)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  // 교사 학급 목록 / 활성 학급
  const [classList, setClassList]       = useState([])  // [{ classCode, className, growndClassId }]
  const [activeIdx, setActiveIdx]       = useState(-1)
  const [addingClass, setAddingClass]   = useState(false)
  const [newClassCode, setNewClassCode] = useState('')
  const [newClassName, setNewClassName] = useState('')

  // 활성 학급 설정
  const [apiKey, setApiKey]               = useState('')       // API 키는 교사 단위(모든 학급 공용)
  const [growndClassId, setGrowndClassId] = useState('')       // 그라운드 학급 ID는 학급 단위
  const [classCode, setClassCode]         = useState('')
  const [className, setClassName]         = useState('')
  const [weekendLock, setWeekendLock]     = useState(false)   // 주말(토·일) 학생 게임 잠금

  // 학생 목록
  const [students, setStudents]   = useState({})
  const [newNum, setNewNum]       = useState('')
  const [newName, setNewName]     = useState('')
  const [newPw, setNewPw]         = useState('')
  const [bulkMode, setBulkMode]   = useState(false)
  const [bulkText, setBulkText]   = useState('')
  const [bulkError, setBulkError] = useState('')

  // 게임 설정
  const [gameSettings, setGameSettings]   = useState({})
  const [selectedGameId, setSelectedGameId] = useState(null)

  // 레이드 보스 현황
  const [raidBossStatus, setRaidBossStatus] = useState(null)
  const [resettingBoss, setResettingBoss]   = useState(false)

  // 학생 활동
  const [activityMap, setActivityMap]       = useState({})  // { studentCode: { gameId: entry } }
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityDate, setActivityDate]     = useState(todayKST())  // 조회 일자 (YYYY-MM-DD)

  // 회차별 상세 모달
  const [roundModal, setRoundModal] = useState(null) // { studentNum, studentName, game, rounds, loading }

  // 횟수 초기화 모달
  const [countModal, setCountModal] = useState(null) // { studentNum, studentName, counts, loading }

  const isToday = activityDate === todayKST()

  async function openCountModal(num, name) {
    setCountModal({ studentNum: num, studentName: name, counts: {}, loading: true })
    const counts = await getStudentPlayCounts(classCode, num, GAMES.map(g => g.id))
    setCountModal(prev => prev ? { ...prev, counts, loading: false } : null)
  }

  async function resetCount(gameId) {
    if (!countModal) return
    const game = GAMES.find(g => g.id === gameId)
    if (!window.confirm(`${countModal.studentName} 학생의 '${game?.name}' 오늘 횟수를 초기화할까요?\n(처음부터 다시 도전하고 포인트도 다시 받을 수 있게 됩니다)`)) return
    await resetTodayPlayCount(classCode, gameId, countModal.studentNum)
    setCountModal(prev => prev
      ? { ...prev, counts: { ...prev.counts, [gameId]: { count: 0, awarded: 0 } } }
      : null)
    flash('🔄 횟수가 초기화되었습니다.')
  }

  async function openRoundModal(num, name, game) {
    setRoundModal({ studentNum: num, studentName: name, game, rounds: [], loading: true })
    const rounds = await getStudentRounds(classCode, game.id, num, activityDate)
    setRoundModal(prev => prev ? { ...prev, rounds, loading: false } : null)
  }

  useEffect(() => {
    if (!teacher) return
    async function load() {
      const teacherData = await getTeacher(teacher.uid)
      if (!teacherData) { setClassList([]); applyActive([], -1); return }
      setApiKey(teacherData.growndApiKey || '')

      // 학급 목록: classes 배열 우선. 없으면 단일 학급 시절 필드에서 마이그레이션.
      let list = Array.isArray(teacherData.classes) ? teacherData.classes : null
      if (!list || !list.length) {
        list = teacherData.classCode
          ? [{
              classCode:     teacherData.classCode,
              className:     teacherData.className     || '',
              growndClassId: teacherData.growndClassId || '',
            }]
          : []
      }
      setClassList(list)

      // 마지막으로 선택했던 학급을 복원 (없으면 첫 학급)
      let idx = list.length ? 0 : -1
      if (teacherData.activeClassCode) {
        const i = list.findIndex(c => c.classCode === teacherData.activeClassCode)
        if (i >= 0) idx = i
      }
      applyActive(list, idx)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher])

  // 활성 학급(인덱스)을 적용해 관련 상태를 동기화한다.
  function applyActive(list, idx) {
    setActiveIdx(idx)
    const c = list[idx]
    setClassCode(c?.classCode || '')
    setClassName(c?.className || '')
    setGrowndClassId(c?.growndClassId || '')
  }

  useEffect(() => {
    if (!classCode) return
    async function loadClass() {
      const classData = await getClass(classCode)
      setStudents(classData?.students || {})  // 학급 전환 시 이전 학급 학생이 남지 않도록 항상 초기화
      setWeekendLock(classData?.weekendLock ?? false)

      const settings = {}
      for (const game of GAMES) {
        const act = await getActivity(classCode, game.id)
        settings[game.id] = { ...defaultSettingsFor(game), ...(act || {}) }
      }
      setGameSettings(settings)

      const boss = await getRaidBoss(classCode)
      setRaidBossStatus(boss)
    }
    loadClass()
  }, [classCode])

  // 학생 활동 탭 로드 (탭/학급/일자 변경 시)
  useEffect(() => {
    if (tab !== 3 || !classCode) return
    reloadActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, classCode, activityDate])

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  // 주말 잠금 토글: 즉시 저장
  async function toggleWeekendLock(v) {
    if (!classCode) return
    setWeekendLock(v)
    await saveClass(classCode, { weekendLock: v })
    flash(v ? '🔒 주말 잠금이 켜졌습니다. 토·일요일에 학생 게임이 잠깁니다.' : '🔓 주말 잠금이 꺼졌습니다.')
  }

  // 학생/활동을 저장할 때마다 교사 문서의 학급 목록을 동기화한다.
  // (학급설정 '저장' 버튼을 누르지 않고 학생만 등록해도 teachers/{uid}.classes에
  //  현재 학급이 남도록 보장 → 재로그인 시 학급이 사라진 것처럼 보이던 문제 방지)
  async function linkClassToTeacher() {
    if (!teacher || !classCode) return
    let list = classList
    if (!list.some(c => c.classCode === classCode)) {
      list = [...list, { classCode, className, growndClassId }]
      setClassList(list)
      applyActive(list, list.length - 1)
    }
    await saveTeacher(teacher.uid, { classes: list, activeClassCode: classCode })
  }

  // 학급 전환
  async function selectClass(idx) {
    if (idx === activeIdx) return
    applyActive(classList, idx)
    setSelectedGameId(null)
    const code = classList[idx]?.classCode
    if (code) await saveTeacher(teacher.uid, { activeClassCode: code })
  }

  // 새 학급 추가
  async function confirmAddClass() {
    const code = newClassCode.trim()
    const name = newClassName.trim()
    if (!code) { flash('학급 코드를 입력하세요.'); return }
    if (classList.some(c => c.classCode === code)) { flash('이미 등록된 학급 코드입니다.'); return }
    setSaving(true)
    const list = [...classList, { classCode: code, className: name, growndClassId: '' }]
    setClassList(list)
    await saveClass(code, { teacherUid: teacher.uid, className: name, students: {} })
    await saveTeacher(teacher.uid, { classes: list, activeClassCode: code })
    applyActive(list, list.length - 1)
    setAddingClass(false); setNewClassCode(''); setNewClassName('')
    setTab(0)
    flash('✅ 학급이 추가되었습니다!')
    setSaving(false)
  }

  // 학급을 목록에서 제거 (학생/활동 데이터는 보존)
  async function deleteClass(idx) {
    const entry = classList[idx]
    if (!entry) return
    if (!window.confirm(`'${entry.className || entry.classCode}' 학급을 목록에서 제거할까요?\n(학생·활동 데이터는 삭제되지 않으며, 같은 코드로 다시 추가하면 복구됩니다)`)) return
    const list = classList.filter((_, i) => i !== idx)
    setClassList(list)
    const newIdx = list.length ? Math.min(idx, list.length - 1) : -1
    applyActive(list, newIdx)
    await saveTeacher(teacher.uid, { classes: list, activeClassCode: list[newIdx]?.classCode || '' })
    flash('🗑️ 학급이 목록에서 제거되었습니다.')
  }

  async function saveSettings() {
    if (!classCode) { flash('먼저 학급을 추가하세요.'); return }
    setSaving(true)
    // 활성 학급의 이름·그라운드 학급 ID 편집 내용을 목록에 반영
    const list = classList.map((c, i) =>
      i === activeIdx ? { ...c, className, growndClassId } : c)
    setClassList(list)
    await saveTeacher(teacher.uid, { growndApiKey: apiKey, classes: list, activeClassCode: classCode })
    await saveClass(classCode, { teacherUid: teacher.uid, className, growndClassId, students })
    flash('✅ 저장되었습니다!')
    setSaving(false)
  }

  async function addStudent() {
    if (!newNum || !newName || !newPw) return
    const hash    = await hashPassword(newPw)
    const updated = { ...students, [newNum]: { name: newName, passwordHash: hash } }
    setStudents(updated)
    await saveClass(classCode, { teacherUid: teacher.uid, className, students: updated })
    await linkClassToTeacher()
    setNewNum(''); setNewName(''); setNewPw('')
    flash('✅ 학생이 추가되었습니다!')
  }

  async function addStudentsBulk() {
    setBulkError('')
    const lines = bulkText.trim().split('\n').filter(l => l.trim())
    if (!lines.length) { setBulkError('데이터를 입력해주세요.'); return }
    const parsed = []
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim())
      if (parts.length < 3) { setBulkError(`${i + 1}번째 줄: 형식 오류 (번호,이름,비밀번호)`); return }
      const [num, name, pw] = parts
      if (!num || !name || !pw) { setBulkError(`${i + 1}번째 줄: 빈 항목이 있습니다.`); return }
      parsed.push({ num, name, pw })
    }
    setSaving(true)
    const updated = { ...students }
    for (const { num, name, pw } of parsed) {
      const hash = await hashPassword(pw)
      updated[num] = { name, passwordHash: hash }
    }
    setStudents(updated)
    await saveClass(classCode, { teacherUid: teacher.uid, className, students: updated })
    await linkClassToTeacher()
    setBulkText('')
    flash(`✅ ${parsed.length}명의 학생이 추가되었습니다!`)
    setSaving(false)
  }

  async function removeStudent(num) {
    const updated = { ...students }
    delete updated[num]
    setStudents(updated)
    await saveClass(classCode, { teacherUid: teacher.uid, className, students: updated })
    await linkClassToTeacher()
  }

  function updateGameSetting(gameId, field, value) {
    setGameSettings(prev => {
      const next = { ...prev[gameId], [field]: value }
      // space-docking: 마일스톤 변경 시 pointsPerCompletion 자동 합산
      if (gameId === 'space-docking' && ['milestone10', 'milestone15', 'milestone20'].includes(field)) {
        next.pointsPerCompletion = (next.milestone10 ?? 5) + (next.milestone15 ?? 5) + (next.milestone20 ?? 5)
      }
      return { ...prev, [gameId]: next }
    })
  }

  // 토글: 즉시 저장
  async function toggleGameEnabled(gameId) {
    if (!classCode) return
    const game     = GAMES.find(g => g.id === gameId)
    const newVal   = !(gameSettings[gameId]?.enabled)
    const newS     = { ...gameSettings[gameId], enabled: newVal }
    setGameSettings(prev => ({ ...prev, [gameId]: newS }))
    await saveActivity(classCode, gameId, { name: game.name, ...newS })
    await linkClassToTeacher()
  }

  // 개별 게임 저장
  async function saveOneGame(gameId) {
    if (!classCode) return
    setSaving(true)
    const game = GAMES.find(g => g.id === gameId)
    const s    = { ...gameSettings[gameId] }
    // space-docking: pointsPerCompletion 항상 마일스톤 합산으로 덮어쓰기
    if (gameId === 'space-docking') {
      s.pointsPerCompletion = (s.milestone10 ?? 5) + (s.milestone15 ?? 5) + (s.milestone20 ?? 5)
    }
    if (s) await saveActivity(classCode, gameId, { name: game.name, ...s })
    await linkClassToTeacher()
    flash('✅ 저장되었습니다!')
    setSaving(false)
  }

  async function handleResetRaidBoss() {
    const s = gameSettings['raid-typing'] || {}
    if (!classCode) return
    setResettingBoss(true)
    await resetRaidBoss(classCode, {
      bossName:  s.bossName  || '그림자 몬스터',
      bossEmoji: s.bossEmoji || '👾',
      bossStory: s.bossStory || '학급의 타자 실력으로 보스를 물리쳐요!',
      totalHp:   s.bossHp   || 1000,
    })
    const boss = await getRaidBoss(classCode)
    setRaidBossStatus(boss)
    flash('✅ 레이드 보스가 초기화되었습니다!')
    setResettingBoss(false)
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  // 활동 새로고침
  async function reloadActivity() {
    if (!classCode) return
    setActivityLoading(true)
    const map = {}
    await Promise.all(GAMES.map(async game => {
      try {
        const entries = await getTodayLeaderboard(classCode, game.id, activityDate)
        entries.forEach(entry => {
          if (!map[entry.studentCode]) map[entry.studentCode] = {}
          map[entry.studentCode][game.id] = entry
        })
      } catch {}
    }))
    setActivityMap(map)
    setActivityLoading(false)
  }

  // 선택된 게임 상세 패널
  const selectedGame = selectedGameId ? GAMES.find(g => g.id === selectedGameId) : null
  const selectedS    = selectedGameId ? (gameSettings[selectedGameId] || {}) : {}

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src={teacher?.photoURL} alt="" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-carnival-navy">{teacher?.displayName}</p>
            <p className="text-xs text-carnival-navy/40">{teacher?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
          로그아웃
        </button>
      </div>

      <h1 className="text-2xl font-black text-carnival-navy mb-4">🎛️ 교사 대시보드</h1>

      {/* ── 학급 전환 바 ── */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {classList.map((c, i) => (
          <button key={c.classCode} onClick={() => selectClass(i)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all
              ${i === activeIdx
                ? 'bg-carnival-navy text-white shadow'
                : 'bg-white text-carnival-navy/50 hover:bg-carnival-navy/10'}`}>
            🏫 {c.className || c.classCode}
          </button>
        ))}
        <button onClick={() => { setAddingClass(v => !v); setNewClassCode(''); setNewClassName('') }}
          className="px-3 py-1.5 rounded-full text-sm font-bold border-2 border-dashed border-carnival-navy/20 text-carnival-navy/50 hover:border-carnival-sky hover:text-carnival-sky transition-all">
          ＋ 학급 추가
        </button>
      </div>

      {/* 새 학급 추가 폼 */}
      {addingClass && (
        <div className="card mb-4 space-y-3 border-2 border-carnival-sky/40">
          <p className="font-bold text-sm">🏫 새 학급 추가</p>
          <div className="flex gap-2">
            <input value={newClassCode} onChange={e => setNewClassCode(e.target.value)}
              placeholder="학급 코드 (예: class2025-4)" className="input-field flex-1 text-sm" autoCapitalize="none" />
            <input value={newClassName} onChange={e => setNewClassName(e.target.value)}
              placeholder="학급 이름 (예: 3학년 4반)" className="input-field flex-1 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={confirmAddClass} disabled={saving} className="btn-sky flex-1 text-sm py-2">
              {saving ? '추가 중...' : '➕ 추가'}
            </button>
            <button onClick={() => setAddingClass(false)}
              className="flex-1 text-sm py-2 rounded-2xl bg-gray-100 text-carnival-navy/50 font-bold">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all
              ${tab === i
                ? 'bg-carnival-coral text-white shadow-lg'
                : 'bg-white text-carnival-navy/50 hover:bg-carnival-coral/10'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* 메시지 */}
      {msg && (
        <div className="bg-carnival-green/20 text-green-700 rounded-2xl px-4 py-3 text-sm mb-4 font-medium">
          {msg}
        </div>
      )}

      {/* ── 탭 0: 학급 설정 ── */}
      {tab === 0 && (
        <div className="card space-y-4">
          <h2 className="font-black text-lg">📋 학급 설정</h2>

          {!classCode ? (
            <p className="text-sm text-carnival-coral">
              위 <strong>＋ 학급 추가</strong> 버튼으로 학급을 먼저 만드세요. 학급은 2개 이상 추가할 수 있습니다.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-carnival-navy/60 mb-1">학급 코드 (학생 로그인용)</label>
                <div className="input-field bg-gray-50 text-carnival-navy/60 font-mono">{classCode}</div>
                <p className="text-xs text-carnival-navy/30 mt-1">
                  학생들이 로그인할 때 입력하는 코드입니다. 코드를 바꾸려면 학급을 삭제 후 다시 추가하세요.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-carnival-navy/60 mb-1">학급 이름</label>
                <input value={className} onChange={e => setClassName(e.target.value)}
                  placeholder="예: 3학년 2반" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold text-carnival-navy/60 mb-1">그라운드 학급 ID</label>
                <input value={growndClassId} onChange={e => setGrowndClassId(e.target.value)}
                  placeholder="그라운드카드 학급 ID" className="input-field" />
                <p className="text-xs text-carnival-navy/30 mt-1">학급마다 다른 그라운드 학급 ID를 입력하세요</p>
              </div>

              <div className="flex items-center justify-between bg-indigo-50 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-indigo-900">🌙 주말 잠금</p>
                  <p className="text-xs text-indigo-900/50 mt-0.5">켜면 토·일요일(한국 시간)에는 학생들이 게임을 할 수 없어요.</p>
                </div>
                <Toggle on={weekendLock} onChange={toggleWeekendLock} />
              </div>
            </>
          )}

          <hr className="border-gray-100" />
          <h3 className="font-bold text-carnival-navy/70">🌱 그라운드카드 연동</h3>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">API 키 <span className="font-normal text-carnival-navy/30">(모든 학급 공용)</span></label>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)}
              type="password" placeholder="growndcard.com에서 발급받은 API 키"
              className="input-field font-mono" />
            <p className="text-xs text-carnival-navy/30 mt-1">
              growndcard.com → 내 정보 → API 키 관리에서 발급
            </p>
          </div>

          <button onClick={saveSettings} disabled={saving || !classCode} className="btn-primary w-full">
            {saving ? '저장 중...' : '💾 저장'}
          </button>

          {classCode && (
            <button onClick={() => deleteClass(activeIdx)}
              className="w-full text-sm text-carnival-navy/30 hover:text-carnival-coral transition-colors py-1">
              이 학급을 목록에서 제거
            </button>
          )}
        </div>
      )}

      {/* ── 탭 1: 학생 관리 ── */}
      {tab === 1 && (
        <div className="card space-y-4">
          <h2 className="font-black text-lg">👥 학생 관리</h2>
          {!classCode && (
            <p className="text-sm text-carnival-coral">먼저 학급 설정 탭에서 학급 코드를 설정하세요.</p>
          )}

          <div className="flex gap-2">
            <button onClick={() => setBulkMode(false)}
              className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-all ${
                !bulkMode ? 'bg-carnival-sky text-white shadow' : 'bg-gray-100 text-carnival-navy/50'}`}>
              개별 추가
            </button>
            <button onClick={() => setBulkMode(true)}
              className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-all ${
                bulkMode ? 'bg-carnival-sky text-white shadow' : 'bg-gray-100 text-carnival-navy/50'}`}>
              📋 일괄 등록
            </button>
          </div>

          {!bulkMode && (
            <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
              <p className="font-bold text-sm">새 학생 추가</p>
              <div className="flex gap-2">
                <input value={newNum}  onChange={e => setNewNum(e.target.value)}  placeholder="번호" className="input-field w-20" />
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="이름" className="input-field flex-1" />
                <input value={newPw}   onChange={e => setNewPw(e.target.value)}   placeholder="초기 비밀번호" type="password" className="input-field flex-1" />
              </div>
              <button onClick={addStudent} className="btn-sky w-full text-sm py-2">➕ 추가</button>
            </div>
          )}

          {bulkMode && (
            <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
              <p className="font-bold text-sm">📋 일괄 등록</p>
              <p className="text-xs text-carnival-navy/50">한 줄에 하나씩: <strong>번호,이름,비밀번호</strong></p>
              <textarea
                value={bulkText}
                onChange={e => { setBulkText(e.target.value); setBulkError('') }}
                placeholder={`1,김철수,1234\n2,이영희,5678`}
                className="input-field text-sm font-mono min-h-[160px] resize-y"
                rows={6}
              />
              {bulkError && <p className="text-red-500 text-sm">❌ {bulkError}</p>}
              <button onClick={addStudentsBulk} disabled={saving} className="btn-sky w-full text-sm py-2">
                {saving ? '등록 중...' : '➕ 일괄 등록'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {Object.entries(students).sort(([a], [b]) => Number(a) - Number(b)).map(([num, s]) => (
              <div key={num}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="badge bg-carnival-yellow text-carnival-navy">{num}번</span>
                  <span className="font-bold">{s.name}</span>
                </div>
                <button onClick={() => removeStudent(num)}
                  className="text-xs text-carnival-navy/30 hover:text-carnival-coral transition-colors">
                  삭제
                </button>
              </div>
            ))}
            {Object.keys(students).length === 0 && (
              <p className="text-center text-carnival-navy/30 py-6 text-sm">등록된 학생이 없습니다</p>
            )}
          </div>
        </div>
      )}

      {/* ── 탭 2: 게임 관리 ── */}
      {tab === 2 && (
        <div className="space-y-4">
          {!classCode && (
            <div className="card text-sm text-carnival-coral">먼저 학급 설정 탭에서 학급 코드를 설정하세요.</div>
          )}

          {/* 게임 아이콘 그리드 */}
          <div className="grid grid-cols-3 gap-3">
            {GAMES.map(game => {
              const s          = gameSettings[game.id] || {}
              const isSelected = selectedGameId === game.id
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(isSelected ? null : game.id)}
                  className={`card p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-carnival-coral shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 ${game.color} rounded-xl flex items-center justify-center text-xl mb-2 shadow-sm`}>
                    {game.icon}
                  </div>
                  <p className="text-xs font-black text-carnival-navy leading-tight mb-2">{game.name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${s.enabled ? 'text-green-600' : 'text-gray-300'}`}>
                      {s.enabled ? '활성' : '비활성'}
                    </span>
                    <Toggle on={s.enabled} onChange={() => toggleGameEnabled(game.id)} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* 선택된 게임 상세 설정 패널 */}
          {selectedGame && (
            <div className="card space-y-4 border-2 border-carnival-coral/30">

              {/* 패널 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${selectedGame.color} rounded-lg flex items-center justify-center text-lg`}>
                    {selectedGame.icon}
                  </div>
                  <span className="font-black text-carnival-navy">{selectedGame.name} 설정</span>
                </div>
                <button
                  onClick={() => setSelectedGameId(null)}
                  className="text-carnival-navy/30 hover:text-carnival-coral text-xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 공통 설정 */}
              <div className={`grid gap-2 ${selectedGameId === 'space-docking' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <div>
                  <label className="block text-xs font-bold text-carnival-navy/50 mb-1">활동 비밀번호</label>
                  <input
                    value={selectedS.activityPassword || ''}
                    onChange={e => updateGameSetting(selectedGameId, 'activityPassword', e.target.value)}
                    placeholder="없으면 비워두기"
                    className="input-field text-sm py-2"
                  />
                </div>
                {selectedGameId !== 'space-docking' && (
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">지급 포인트</label>
                    <input
                      type="number" min="0"
                      value={selectedS.pointsPerCompletion ?? selectedGame.defaultPoints ?? 10}
                      onChange={e => updateGameSetting(selectedGameId, 'pointsPerCompletion', Number(e.target.value))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-carnival-navy/50 mb-1">하루 횟수 제한</label>
                  <input
                    type="number" min="1" max="20"
                    value={selectedS.dailyLimit ?? selectedGame.defaultDailyLimit ?? 5}
                    onChange={e => updateGameSetting(selectedGameId, 'dailyLimit', Number(e.target.value))}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>

              {/* ── 우주 도킹 마일스톤 포인트 ── */}
              {selectedGameId === 'space-docking' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">🚀 단계별 지급 포인트</p>
                    <span className="text-xs text-carnival-navy/40 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                      합계 <strong className="text-carnival-coral">{(selectedS.milestone10 ?? 5) + (selectedS.milestone15 ?? 5) + (selectedS.milestone20 ?? 5)}</strong>점
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { field: 'milestone10', label: '🎉 10단계', color: 'text-yellow-600' },
                      { field: 'milestone15', label: '⭐ 15단계', color: 'text-orange-500' },
                      { field: 'milestone20', label: '🚀 20단계', color: 'text-red-500' },
                    ].map(({ field, label, color }) => (
                      <div key={field}>
                        <label className={`block text-xs font-bold mb-1 ${color}`}>{label}</label>
                        <input
                          type="number" min="0"
                          value={selectedS[field] ?? 5}
                          onChange={e => updateGameSetting('space-docking', field, Number(e.target.value))}
                          className="input-field text-sm py-2 text-center"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-carnival-navy/40">각 단계 클리어 시 해당 포인트가 누적 지급돼요. 숫자 제한 없이 자유롭게 설정하세요.</p>
                </div>
              )}

              {/* 연습 모드 */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-amber-800">✏️ 연습 모드 허용</p>
                  <p className="text-xs text-amber-600 mt-0.5">횟수 초과 학생도 접속 가능 (포인트 미지급)</p>
                </div>
                <Toggle
                  on={selectedS.practiceMode}
                  onChange={v => updateGameSetting(selectedGameId, 'practiceMode', v)}
                />
              </div>

              {/* ── 낱말/문장 타자 레벨 ── */}
              {(selectedGameId === 'word-typing' || selectedGameId === 'typing') && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">⌨️ 타자 레벨 설정</p>
                  {[1, 2, 3, 4].map(lv => (
                    <label key={lv}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                        selectedS.typingLevel === lv
                          ? 'border-carnival-sky bg-carnival-sky/10'
                          : 'border-gray-100 bg-white'}`}>
                      <input
                        type="radio"
                        name={`typingLevel-${selectedGameId}`}
                        checked={selectedS.typingLevel === lv}
                        onChange={() => updateGameSetting(selectedGameId, 'typingLevel', lv)}
                        className="accent-carnival-sky"
                      />
                      <span className="text-sm font-medium">{TYPING_LEVEL_INFO[lv]}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ── 영어 단어 Unit ── */}
              {selectedGameId === 'vocab' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">📚 단어 Unit 선택</p>
                  <div className="grid grid-cols-4 gap-2">
                    {VOCAB_UNIT_NAMES.map(unit => (
                      <label key={unit}
                        className={`flex items-center justify-center px-2 py-2 rounded-xl cursor-pointer border text-xs font-bold transition-all ${
                          selectedS.vocabUnit === unit
                            ? 'border-blue-400 bg-blue-100 text-blue-700'
                            : 'border-gray-100 bg-white text-carnival-navy/60'}`}>
                        <input
                          type="radio"
                          name="vocabUnit"
                          checked={selectedS.vocabUnit === unit}
                          onChange={() => updateGameSetting('vocab', 'vocabUnit', unit)}
                          className="sr-only"
                        />
                        {unit}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 사칙연산 유형 ── */}
              {selectedGameId === 'math-quiz' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">➗ 문제 유형 설정</p>
                  {Object.entries(MATH_TYPE_INFO).map(([key, label]) => (
                    <label key={key}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                        selectedS.mathType === key
                          ? 'border-carnival-purple bg-carnival-purple/10'
                          : 'border-gray-100 bg-white'}`}>
                      <input
                        type="radio"
                        name="mathType"
                        checked={selectedS.mathType === key}
                        onChange={() => updateGameSetting('math-quiz', 'mathType', key)}
                        className="accent-carnival-purple"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ── 동사 변화 난이도 ── */}
              {selectedGameId === 'verb-forms' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">🔁 난이도 설정</p>
                  {[
                    { key: 'mc',     label: '🔘 객관식 — 보기 중 알맞은 과거·과거분사형 선택 (쉬움)' },
                    { key: 'typing', label: '⌨️ 타이핑 — 과거·과거분사형 직접 입력 (어려움)' },
                  ].map(({ key, label }) => (
                    <label key={key}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                        (selectedS.verbMode || 'mc') === key
                          ? 'border-fuchsia-400 bg-fuchsia-50'
                          : 'border-gray-100 bg-white'}`}>
                      <input
                        type="radio"
                        name="verbMode"
                        checked={(selectedS.verbMode || 'mc') === key}
                        onChange={() => updateGameSetting('verb-forms', 'verbMode', key)}
                        className="accent-fuchsia-500"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ── 연산 순서 난이도 ── */}
              {selectedGameId === 'operator-order' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">🧮 난이도 설정</p>
                  {[
                    { key: 1,     label: '🟢 쉬움 — 괄호 1개 (문제당 20초)' },
                    { key: 2,     label: '🟡 보통 — 괄호 위치 다양 (문제당 25초)' },
                    { key: 3,     label: '🔴 어려움 — 괄호 안 2연산 (문제당 30초)' },
                    { key: 'all', label: '🎲 전체 — 모든 난이도 섞기' },
                  ].map(({ key, label }) => (
                    <label key={key}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                        (selectedS.opOrderLevel ?? 1) === key
                          ? 'border-cyan-400 bg-cyan-50'
                          : 'border-gray-100 bg-white'}`}>
                      <input
                        type="radio"
                        name="opOrderLevel"
                        checked={(selectedS.opOrderLevel ?? 1) === key}
                        onChange={() => updateGameSetting('operator-order', 'opOrderLevel', key)}
                        className="accent-cyan-500"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ── 국기 퀴즈 난이도 ── */}
              {selectedGameId === 'flag-quiz' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">🚩 난이도 설정</p>
                  {[
                    { key: 'easy', label: '🌟 쉬움 — 익숙한 50개국만 출제' },
                    { key: 'hard', label: '🔥 어려움 — 전체 100여 개국 출제' },
                  ].map(({ key, label }) => (
                    <label key={key}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                        (selectedS.flagDifficulty || 'easy') === key
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-100 bg-white'}`}>
                      <input
                        type="radio"
                        name="flagDifficulty"
                        checked={(selectedS.flagDifficulty || 'easy') === key}
                        onChange={() => updateGameSetting('flag-quiz', 'flagDifficulty', key)}
                        className="accent-rose-500"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ── 역사 퀴즈 시대 선택 (멀티셀렉트) ── */}
              {selectedGameId === 'history-quiz' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm">🏛️ 출제 시대 선택 (여러 개 가능)</p>
                  <p className="text-xs text-carnival-navy/40">선택한 시대의 문제만 모아 10문제가 출제돼요. 최소 1개는 선택해야 해요.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {HISTORY_ERAS.map(era => {
                      const selected = (selectedS.historyEras || HISTORY_ERAS.map(e => e.key))
                      const checked  = selected.includes(era.key)
                      return (
                        <label key={era.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border text-sm font-medium transition-all ${
                            checked
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-gray-100 bg-white text-carnival-navy/60'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? selected.filter(k => k !== era.key)
                                : [...selected, era.key]
                              if (next.length === 0) return  // 최소 1개 유지
                              updateGameSetting('history-quiz', 'historyEras', next)
                            }}
                            className="accent-amber-500"
                          />
                          <span>{era.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── 끝말잇기 설정 ── */}
              {(selectedGameId === 'word-chain-ko' || selectedGameId === 'word-chain-en') && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
                  <p className="font-bold text-sm">🔗 끝말잇기 설정</p>
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">
                      ⏱️ 타이핑 타이머 (난이도) — 턴당 제한 시간
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { sec: 30, label: '🐢 여유', desc: '30초' },
                        { sec: 20, label: '🙂 보통', desc: '20초' },
                        { sec: 12, label: '🏃 빠름', desc: '12초' },
                        { sec: 8,  label: '🔥 도전', desc: '8초' },
                      ].map(({ sec, label, desc }) => (
                        <label key={sec}
                          className={`flex flex-col items-center px-2 py-2 rounded-xl cursor-pointer border text-xs font-bold transition-all ${
                            (selectedS.chainTimer ?? 20) === sec
                              ? 'border-lime-500 bg-lime-100 text-lime-700'
                              : 'border-gray-100 bg-white text-carnival-navy/60'}`}>
                          <input
                            type="radio"
                            name={`chainTimer-${selectedGameId}`}
                            checked={(selectedS.chainTimer ?? 20) === sec}
                            onChange={() => updateGameSetting(selectedGameId, 'chainTimer', sec)}
                            className="sr-only"
                          />
                          <span>{label}</span>
                          <span className="text-[10px] opacity-70">{desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">
                      🎯 목표 단어 수 — 이 개수를 이으면 점수 지급
                    </label>
                    <input
                      type="number" min="3" max="30"
                      value={selectedS.chainTarget ?? 10}
                      onChange={e => updateGameSetting(selectedGameId, 'chainTarget', Number(e.target.value))}
                      className="input-field text-sm py-2 w-28 text-center"
                    />
                  </div>
                </div>
              )}

              {/* ── 학급 레이드 ── */}
              {selectedGameId === 'raid-typing' && (
                <div className="bg-carnival-cream rounded-2xl p-4 space-y-4">
                  <p className="font-bold text-sm">🐉 레이드 보스 설정</p>

                  {raidBossStatus && (
                    <div className="bg-slate-800 rounded-xl p-3 text-white space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{raidBossStatus.bossEmoji || '👾'}</span>
                        <span className="font-bold text-sm">{raidBossStatus.bossName || '보스'}</span>
                        {raidBossStatus.defeated && (
                          <span className="badge bg-yellow-400 text-yellow-900 text-xs">격파됨!</span>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">보스 HP</span>
                          <span>{Math.max(0, (raidBossStatus.totalHp || 0) - (raidBossStatus.currentDamage || 0)).toLocaleString()} / {(raidBossStatus.totalHp || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-red-500 transition-all"
                            style={{ width: `${Math.max(0, 100 - ((raidBossStatus.currentDamage || 0) / (raidBossStatus.totalHp || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        누적 데미지: <strong className="text-white">{(raidBossStatus.currentDamage || 0).toLocaleString()}</strong>
                        {raidBossStatus.contributions && (
                          <> · 참여: <strong className="text-white">{Object.keys(raidBossStatus.contributions).length}명</strong></>
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">보스 총 HP</label>
                    <input
                      type="number" min="100" step="100"
                      value={selectedS.bossHp || 1000}
                      onChange={e => updateGameSetting('raid-typing', 'bossHp', Number(e.target.value))}
                      className="input-field text-sm py-2"
                    />
                    <p className="text-xs text-carnival-navy/40 mt-0.5">학생 1명 최대 {6 * 50} 데미지 (6문장 × 50)</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-carnival-navy/60 mb-2">🎭 보스 테마</p>
                    <div className="grid grid-cols-4 gap-2">
                      {BOSS_PRESETS.map(preset => {
                        const selected = selectedS.bossEmoji === preset.emoji && selectedS.bossName === preset.name
                        return (
                          <button key={preset.id} type="button"
                            onClick={() => {
                              updateGameSetting('raid-typing', 'bossEmoji',    preset.emoji)
                              updateGameSetting('raid-typing', 'bossName',     preset.name)
                              updateGameSetting('raid-typing', 'bossStory',    preset.story)
                              updateGameSetting('raid-typing', 'bossGradient', preset.gradient)
                            }}
                            className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-all ${
                              selected ? 'border-carnival-coral bg-carnival-coral/10' : 'border-gray-100 bg-white hover:border-carnival-sky'
                            }`}
                          >
                            <span style={{ fontSize: '1.6rem' }}>{preset.emoji}</span>
                            <span className="text-xs font-bold text-carnival-navy/70 mt-0.5 leading-tight text-center">{preset.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-carnival-navy/60 mb-2">✏️ 직접 입력</p>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        value={selectedS.bossEmoji || ''}
                        onChange={e => updateGameSetting('raid-typing', 'bossEmoji', e.target.value)}
                        placeholder="이모지"
                        className="input-field text-sm py-2 text-center col-span-1"
                      />
                      <input
                        value={selectedS.bossName || ''}
                        onChange={e => updateGameSetting('raid-typing', 'bossName', e.target.value)}
                        placeholder="보스 이름"
                        className="input-field text-sm py-2 col-span-3"
                      />
                    </div>
                    <input
                      value={selectedS.bossStory || ''}
                      onChange={e => updateGameSetting('raid-typing', 'bossStory', e.target.value)}
                      placeholder="배경 스토리"
                      className="input-field text-sm py-2 mt-2"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-carnival-navy/60 mb-1">✏️ 커스텀 문장 (비워두면 기본 8문장)</p>
                    <textarea
                      value={selectedS.customSentences || ''}
                      onChange={e => updateGameSetting('raid-typing', 'customSentences', e.target.value)}
                      placeholder={`한 줄에 하나씩 입력하세요\n예: 우리 반은 최고입니다`}
                      className="input-field text-sm font-mono min-h-[120px] resize-y"
                      rows={5}
                    />
                    {(() => {
                      const lines = (selectedS.customSentences || '').split('\n').filter(l => l.trim())
                      return lines.length > 0 && lines.length < 6
                        ? <p className="text-xs text-red-400 mt-1">⚠️ 최소 6문장 필요 (현재 {lines.length}개)</p>
                        : lines.length >= 6
                        ? <p className="text-xs text-green-600 mt-1">✅ {lines.length}개 문장 등록됨</p>
                        : null
                    })()}
                  </div>

                  <button
                    onClick={handleResetRaidBoss}
                    disabled={resettingBoss || !classCode}
                    className="btn-secondary w-full text-sm"
                  >
                    {resettingBoss ? '초기화 중...' : '🔄 보스 초기화 (새 보스 시작)'}
                  </button>
                  <p className="text-xs text-carnival-navy/40 text-center">⚠️ 초기화하면 현재 데미지가 모두 리셋됩니다</p>
                </div>
              )}

              {/* 저장 버튼 */}
              <button
                onClick={() => saveOneGame(selectedGameId)}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? '저장 중...' : `💾 ${selectedGame.name} 설정 저장`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 탭 3: 학생 활동 ── */}
      {tab === 3 && (
        <div className="space-y-4">
          {!classCode ? (
            <div className="card text-sm text-carnival-coral">먼저 학급 설정 탭에서 학급 코드를 설정하세요.</div>
          ) : (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg">📊 {isToday ? '오늘의' : ''} 학생 활동</h2>
                <button
                  onClick={reloadActivity}
                  disabled={activityLoading}
                  className="text-xs text-carnival-navy/40 hover:text-carnival-sky transition-colors font-bold"
                >
                  {activityLoading ? '로딩 중...' : '🔄 새로고침'}
                </button>
              </div>

              {/* 일자 선택 */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-carnival-navy/50">📅 조회 일자</label>
                <input
                  type="date"
                  value={activityDate}
                  max={todayKST()}
                  onChange={e => setActivityDate(e.target.value || todayKST())}
                  className="input-field text-sm py-1.5 w-auto"
                />
                {!isToday && (
                  <button
                    onClick={() => setActivityDate(todayKST())}
                    className="text-xs font-bold text-carnival-sky hover:underline"
                  >
                    오늘로
                  </button>
                )}
              </div>

              {/* 게임 범례 */}
              <div className="flex flex-wrap gap-1.5">
                {GAMES.map(g => (
                  <span key={g.id} className="text-xs bg-gray-100 rounded-full px-2 py-0.5 font-medium text-carnival-navy/50">
                    {g.icon} {g.name}
                  </span>
                ))}
              </div>

              <hr className="border-gray-100" />

              {activityLoading ? (
                <div className="text-center py-8 text-2xl animate-bounce-slow">🎡</div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(students)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([num, s]) => {
                      const studentActivity = activityMap[num] || {}
                      const playedGames     = GAMES.filter(g => studentActivity[g.id])
                      const hasAny          = playedGames.length > 0
                      return (
                        <div key={num}
                          className={`rounded-2xl px-4 py-3 border transition-all ${
                            hasAny ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="badge bg-carnival-yellow text-carnival-navy text-xs">{num}번</span>
                              <span className={`font-bold text-sm ${hasAny ? 'text-carnival-navy' : 'text-carnival-navy/30'}`}>
                                {s.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!hasAny && (
                                <span className="text-xs text-gray-300">{isToday ? '오늘 ' : ''}플레이 없음</span>
                              )}
                              {isToday && (
                                <button
                                  onClick={() => openCountModal(num, s.name)}
                                  className="text-xs font-bold text-carnival-navy/30 hover:text-carnival-sky transition-colors"
                                >
                                  🔄 횟수
                                </button>
                              )}
                            </div>
                          </div>

                          {hasAny && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {playedGames.map(game => {
                                const entry = studentActivity[game.id]
                                return (
                                  <button
                                    key={game.id}
                                    onClick={() => openRoundModal(num, s.name, game)}
                                    className="flex items-center gap-1 bg-carnival-cream rounded-xl px-2.5 py-1 hover:bg-carnival-sky/20 transition-colors"
                                  >
                                    <span className="text-sm">{game.icon}</span>
                                    <span className="text-xs font-bold text-carnival-navy">
                                      {formatActivity(game.id, entry)}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}

                  {Object.keys(students).length === 0 && (
                    <p className="text-center text-carnival-navy/30 py-8 text-sm">등록된 학생이 없습니다</p>
                  )}

                  {/* 등록되지 않은 학생이 플레이한 경우 */}
                  {Object.entries(activityMap)
                    .filter(([code]) => !students[code])
                    .map(([code, activity]) => {
                      const playedGames = GAMES.filter(g => activity[g.id])
                      return (
                        <div key={code} className="rounded-2xl px-4 py-3 border border-dashed border-gray-200 bg-white">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge bg-gray-100 text-gray-500 text-xs">미등록</span>
                            <span className="font-bold text-sm text-carnival-navy/50">{code}번</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {playedGames.map(game => (
                              <div key={game.id} className="flex items-center gap-1 bg-gray-100 rounded-xl px-2.5 py-1">
                                <span className="text-sm">{game.icon}</span>
                                <span className="text-xs font-bold text-gray-500">
                                  {formatActivity(game.id, activity[game.id])}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── 회차별 상세 모달 ── */}
      {roundModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setRoundModal(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${roundModal.game.color} rounded-lg flex items-center justify-center text-lg`}>
                  {roundModal.game.icon}
                </div>
                <div>
                  <p className="font-black text-carnival-navy text-sm">{roundModal.studentNum}번 {roundModal.studentName}</p>
                  <p className="text-xs text-carnival-navy/40">{roundModal.game.name} 회차 기록 · {activityDate}</p>
                </div>
              </div>
              <button
                onClick={() => setRoundModal(null)}
                className="text-carnival-navy/30 hover:text-carnival-coral text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {roundModal.loading ? (
              <div className="text-center py-6 text-2xl animate-bounce-slow">🎡</div>
            ) : roundModal.rounds.length === 0 ? (
              <p className="text-center text-carnival-navy/30 py-6 text-sm">{isToday ? '오늘 ' : '해당 일자에 '}플레이 기록이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {[...roundModal.rounds]
                  .sort((a, b) => a.ts - b.ts)
                  .map((round, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                      round.isPractice ? 'bg-amber-50 border border-amber-100' : 'bg-carnival-cream'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="badge bg-carnival-yellow text-carnival-navy text-xs">{i + 1}회차</span>
                        {round.isPractice && (
                          <span className="text-xs text-amber-600 font-bold">연습</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-carnival-navy">
                          {formatRoundResult(roundModal.game.id, round)}
                        </p>
                        <p className="text-xs text-carnival-navy/40 font-mono">
                          {formatPlayedAt(round.ts)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 횟수 초기화 모달 ── */}
      {countModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setCountModal(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-carnival-navy text-sm">{countModal.studentNum}번 {countModal.studentName}</p>
                <p className="text-xs text-carnival-navy/40">오늘 게임별 사용 횟수</p>
              </div>
              <button
                onClick={() => setCountModal(null)}
                className="text-carnival-navy/30 hover:text-carnival-coral text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {countModal.loading ? (
              <div className="text-center py-6 text-2xl animate-bounce-slow">🎡</div>
            ) : GAMES.filter(g => (countModal.counts[g.id]?.count || 0) > 0).length === 0 ? (
              <p className="text-center text-carnival-navy/30 py-6 text-sm">오늘 사용한 횟수가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {GAMES.filter(g => (countModal.counts[g.id]?.count || 0) > 0).map(g => {
                  const c     = countModal.counts[g.id]
                  const limit = gameSettings[g.id]?.dailyLimit ?? g.defaultDailyLimit ?? 5
                  return (
                    <div key={g.id} className="flex items-center justify-between bg-carnival-cream rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{g.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-carnival-navy">{g.name}</p>
                          <p className="text-xs text-carnival-navy/40">{c.count}/{limit}회 사용 · 포인트 {c.awarded}회 지급</p>
                        </div>
                      </div>
                      <button
                        onClick={() => resetCount(g.id)}
                        className="text-xs font-bold bg-white rounded-xl px-3 py-1.5 text-carnival-coral hover:bg-carnival-coral hover:text-white transition-colors shadow-sm"
                      >
                        초기화
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
