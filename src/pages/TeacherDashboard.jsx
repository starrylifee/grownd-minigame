import { useEffect, useState } from 'react'
import { signOut }             from 'firebase/auth'
import { useNavigate }         from 'react-router-dom'
import { auth }                from '../lib/firebase'
import { useAuth }             from '../context/AuthContext'
import {
  getTeacher, saveTeacher, getClass, saveClass,
  saveActivity, getActivity, hashPassword,
  getRaidBoss, resetRaidBoss,
} from '../lib/firestore'
import { GAMES } from '../config/games'
import { VOCAB_UNIT_NAMES } from '../data/vocabData'
import { BOSS_PRESETS } from '../data/bossPresets'

const TABS = ['학급 설정', '학생 관리', '게임 관리']

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
  if (game.id === 'math-quiz')   return { ...base, mathType: 'single-add' }
  if (game.id === 'vocab')       return { ...base, vocabUnit: 'UNIT 01' }
  if (game.id === 'raid-typing') return {
    ...base,
    dailyLimit:  1,
    bossHp:      1000,
    bossName:    '',
    bossEmoji:   '',
    bossStory:   '',
  }
  return base
}

export default function TeacherDashboard() {
  const { teacher } = useAuth()
  const navigate    = useNavigate()
  const [tab, setTab]     = useState(0)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState('')

  // 학급 설정
  const [apiKey, setApiKey]       = useState('')
  const [classId, setClassId]     = useState('')
  const [classCode, setClassCode] = useState('')
  const [className, setClassName] = useState('')

  // 학생 목록
  const [students, setStudents]   = useState({})
  const [newNum, setNewNum]       = useState('')
  const [newName, setNewName]     = useState('')
  const [newPw, setNewPw]         = useState('')
  const [bulkMode, setBulkMode]   = useState(false)
  const [bulkText, setBulkText]   = useState('')
  const [bulkError, setBulkError] = useState('')

  // 게임 설정
  const [gameSettings, setGameSettings] = useState({})

  // 레이드 보스 현황
  const [raidBossStatus, setRaidBossStatus] = useState(null)
  const [resettingBoss, setResettingBoss]   = useState(false)

  useEffect(() => {
    if (!teacher) return
    async function load() {
      const teacherData = await getTeacher(teacher.uid)
      if (teacherData) {
        setApiKey(teacherData.growndApiKey    || '')
        setClassId(teacherData.growndClassId  || '')
        setClassCode(teacherData.classCode    || '')
        setClassName(teacherData.className    || '')
      }
    }
    load()
  }, [teacher])

  useEffect(() => {
    if (!classCode) return
    async function loadClass() {
      const classData = await getClass(classCode)
      if (classData) setStudents(classData.students || {})

      // 게임 설정 로드
      const settings = {}
      for (const game of GAMES) {
        const act = await getActivity(classCode, game.id)
        settings[game.id] = { ...defaultSettingsFor(game), ...(act || {}) }
      }
      setGameSettings(settings)

      // 레이드 보스 현황 로드
      const boss = await getRaidBoss(classCode)
      setRaidBossStatus(boss)
    }
    loadClass()
  }, [classCode])

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  async function saveSettings() {
    setSaving(true)
    await saveTeacher(teacher.uid, { growndApiKey: apiKey, growndClassId: classId, classCode, className })
    await saveClass(classCode, { teacherUid: teacher.uid, className, students })
    flash('✅ 저장되었습니다!')
    setSaving(false)
  }

  async function addStudent() {
    if (!newNum || !newName || !newPw) return
    const hash    = await hashPassword(newPw)
    const updated = { ...students, [newNum]: { name: newName, passwordHash: hash } }
    setStudents(updated)
    await saveClass(classCode, { teacherUid: teacher.uid, className, students: updated })
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
    setBulkText('')
    flash(`✅ ${parsed.length}명의 학생이 추가되었습니다!`)
    setSaving(false)
  }

  async function removeStudent(num) {
    const updated = { ...students }
    delete updated[num]
    setStudents(updated)
    await saveClass(classCode, { teacherUid: teacher.uid, className, students: updated })
  }

  async function saveGameSettings() {
    setSaving(true)
    for (const game of GAMES) {
      const s = gameSettings[game.id]
      if (s) await saveActivity(classCode, game.id, { name: game.name, ...s })
    }
    flash('✅ 게임 설정이 저장되었습니다!')
    setSaving(false)
  }

  function updateGameSetting(gameId, field, value) {
    setGameSettings(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], [field]: value },
    }))
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

      <h1 className="text-2xl font-black text-carnival-navy mb-6">🎛️ 교사 대시보드</h1>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
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

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">학급 코드 (학생 로그인용)</label>
            <input value={classCode} onChange={e => setClassCode(e.target.value)}
              placeholder="예: class2025-3" className="input-field" />
            <p className="text-xs text-carnival-navy/30 mt-1">학생들이 로그인할 때 입력하는 코드입니다</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">학급 이름</label>
            <input value={className} onChange={e => setClassName(e.target.value)}
              placeholder="예: 3학년 2반" className="input-field" />
          </div>

          <hr className="border-gray-100" />
          <h3 className="font-bold text-carnival-navy/70">🌱 그라운드카드 연동</h3>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">API 키</label>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)}
              type="password" placeholder="growndcard.com에서 발급받은 API 키"
              className="input-field font-mono" />
            <p className="text-xs text-carnival-navy/30 mt-1">
              growndcard.com → 내 정보 → API 키 관리에서 발급
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">그라운드 학급 ID</label>
            <input value={classId} onChange={e => setClassId(e.target.value)}
              placeholder="그라운드카드 학급 ID" className="input-field" />
          </div>

          <button onClick={saveSettings} disabled={saving} className="btn-primary w-full">
            {saving ? '저장 중...' : '💾 저장'}
          </button>
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
            <p className="text-sm text-carnival-coral card">먼저 학급 설정 탭에서 학급 코드를 설정하세요.</p>
          )}

          {GAMES.map(game => {
            const s = gameSettings[game.id] || {}
            return (
              <div key={game.id} className="card space-y-3">
                {/* 게임 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{game.icon}</span>
                    <span className="font-black">{game.name}</span>
                    <span className="badge bg-gray-100 text-gray-500 text-xs">{game.duration}</span>
                  </div>
                  <button
                    onClick={() => updateGameSetting(game.id, 'enabled', !s.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      s.enabled ? 'bg-carnival-green' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      s.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* 공통 설정: 비밀번호 + 포인트 + 일일 횟수 */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">활동 비밀번호</label>
                    <input
                      value={s.activityPassword || ''}
                      onChange={e => updateGameSetting(game.id, 'activityPassword', e.target.value)}
                      placeholder="없으면 비워두기"
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">지급 포인트</label>
                    <input
                      type="number" min="0"
                      value={s.pointsPerCompletion ?? game.defaultPoints ?? 10}
                      onChange={e => updateGameSetting(game.id, 'pointsPerCompletion', Number(e.target.value))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-carnival-navy/50 mb-1">하루 횟수 제한</label>
                    <input
                      type="number" min="1" max="20"
                      value={s.dailyLimit ?? game.defaultDailyLimit ?? 5}
                      onChange={e => updateGameSetting(game.id, 'dailyLimit', Number(e.target.value))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                </div>

                {/* 연습 모드 허용 토글 */}
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-amber-800">✏️ 연습 모드 허용</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      횟수 초과 학생도 접속 가능 (포인트 미지급)
                    </p>
                  </div>
                  <button
                    onClick={() => updateGameSetting(game.id, 'practiceMode', !s.practiceMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      s.practiceMode ? 'bg-amber-400' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      s.practiceMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* ── 낱말 타자 / 문장 타자 레벨 설정 ── */}
                {(game.id === 'word-typing' || game.id === 'typing') && s.enabled && (
                  <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
                    <p className="font-bold text-sm">⌨️ 타자 레벨 설정</p>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(lv => (
                        <label key={lv}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                            s.typingLevel === lv
                              ? 'border-carnival-sky bg-carnival-sky/10'
                              : 'border-gray-100 bg-white'}`}>
                          <input
                            type="radio"
                            name={`typingLevel-${game.id}`}
                            checked={s.typingLevel === lv}
                            onChange={() => updateGameSetting(game.id, 'typingLevel', lv)}
                            className="accent-carnival-sky"
                          />
                          <span className="text-sm font-medium">{TYPING_LEVEL_INFO[lv]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 영어 단어 전용 설정 ── */}
                {game.id === 'vocab' && s.enabled && (
                  <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
                    <p className="font-bold text-sm">📚 단어 Unit 선택</p>
                    <div className="grid grid-cols-4 gap-2">
                      {VOCAB_UNIT_NAMES.map(unit => (
                        <label key={unit}
                          className={`flex items-center justify-center px-2 py-2 rounded-xl cursor-pointer border text-xs font-bold transition-all ${
                            s.vocabUnit === unit
                              ? 'border-blue-400 bg-blue-100 text-blue-700'
                              : 'border-gray-100 bg-white text-carnival-navy/60'}`}>
                          <input
                            type="radio"
                            name="vocabUnit"
                            checked={s.vocabUnit === unit}
                            onChange={() => updateGameSetting('vocab', 'vocabUnit', unit)}
                            className="sr-only"
                          />
                          {unit}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 사칙연산 전용 설정 ── */}
                {game.id === 'math-quiz' && s.enabled && (
                  <div className="bg-carnival-cream rounded-2xl p-4 space-y-3">
                    <p className="font-bold text-sm">➗ 문제 유형 설정</p>
                    <div className="space-y-2">
                      {Object.entries(MATH_TYPE_INFO).map(([key, label]) => (
                        <label key={key}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                            s.mathType === key
                              ? 'border-carnival-purple bg-carnival-purple/10'
                              : 'border-gray-100 bg-white'}`}>
                          <input
                            type="radio"
                            name="mathType"
                            checked={s.mathType === key}
                            onChange={() => updateGameSetting('math-quiz', 'mathType', key)}
                            className="accent-carnival-purple"
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}


                {/* ── 학급 레이드 전용 설정 ── */}
                {game.id === 'raid-typing' && s.enabled && (
                  <div className="bg-carnival-cream rounded-2xl p-4 space-y-4">
                    <p className="font-bold text-sm">🐉 레이드 보스 설정</p>

                    {/* 보스 현황 */}
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
                            <> · 참여 학생: <strong className="text-white">{Object.keys(raidBossStatus.contributions).length}명</strong></>
                          )}
                        </p>
                      </div>
                    )}

                    {/* 보스 HP 설정 */}
                    <div>
                      <label className="block text-xs font-bold text-carnival-navy/50 mb-1">보스 총 HP (학급 전체 목표)</label>
                      <input
                        type="number" min="100" step="100"
                        value={s.bossHp || 1000}
                        onChange={e => updateGameSetting('raid-typing', 'bossHp', Number(e.target.value))}
                        className="input-field text-sm py-2"
                      />
                      <p className="text-xs text-carnival-navy/40 mt-0.5">
                        학생 1명이 최대 {6 * 50}P 데미지 가능 (6문장 × 50)
                      </p>
                    </div>

                    {/* 보스 프리셋 선택 */}
                    <div>
                      <p className="text-xs font-bold text-carnival-navy/60 mb-2">🎭 보스 테마 선택</p>
                      <div className="grid grid-cols-4 gap-2">
                        {BOSS_PRESETS.map(preset => {
                          const selected = s.bossEmoji === preset.emoji && s.bossName === preset.name
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                updateGameSetting('raid-typing', 'bossEmoji',    preset.emoji)
                                updateGameSetting('raid-typing', 'bossName',     preset.name)
                                updateGameSetting('raid-typing', 'bossStory',    preset.story)
                                updateGameSetting('raid-typing', 'bossGradient', preset.gradient)
                              }}
                              className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-all ${
                                selected
                                  ? 'border-carnival-coral bg-carnival-coral/10'
                                  : 'border-gray-100 bg-white hover:border-carnival-sky'
                              }`}
                            >
                              <span style={{ fontSize: '1.6rem' }}>{preset.emoji}</span>
                              <span className="text-xs font-bold text-carnival-navy/70 mt-0.5 leading-tight text-center">
                                {preset.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 커스텀 직접 입력 */}
                    <div>
                      <p className="text-xs font-bold text-carnival-navy/60 mb-2">✏️ 직접 입력 (선택 후 수정 가능)</p>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          value={s.bossEmoji || ''}
                          onChange={e => updateGameSetting('raid-typing', 'bossEmoji', e.target.value)}
                          placeholder="이모지"
                          className="input-field text-sm py-2 text-center col-span-1"
                        />
                        <input
                          value={s.bossName || ''}
                          onChange={e => updateGameSetting('raid-typing', 'bossName', e.target.value)}
                          placeholder="보스 이름"
                          className="input-field text-sm py-2 col-span-3"
                        />
                      </div>
                      <input
                        value={s.bossStory || ''}
                        onChange={e => updateGameSetting('raid-typing', 'bossStory', e.target.value)}
                        placeholder="배경 스토리"
                        className="input-field text-sm py-2 mt-2"
                      />
                    </div>

                    <button
                      onClick={handleResetRaidBoss}
                      disabled={resettingBoss || !classCode}
                      className="btn-secondary w-full text-sm"
                    >
                      {resettingBoss ? '초기화 중...' : '🔄 보스 초기화 (새 보스 시작)'}
                    </button>
                    <p className="text-xs text-carnival-navy/40 text-center">
                      ⚠️ 초기화하면 현재 데미지가 모두 리셋됩니다
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={saveGameSettings} disabled={saving} className="btn-primary w-full">
            {saving ? '저장 중...' : '💾 게임 설정 저장'}
          </button>
        </div>
      )}
    </div>
  )
}
