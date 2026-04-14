import { useState } from 'react'

export default function ActivityPasswordModal({ correctPassword, onSuccess, onCancel }) {
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (input === correctPassword) {
      onSuccess()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setInput('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className={`card w-full max-w-sm text-center ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}
        style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}>
        <div className="text-4xl mb-3">🔑</div>
        <h3 className="font-black text-xl text-carnival-navy mb-1">활동 비밀번호</h3>
        <p className="text-carnival-navy/50 text-sm mb-5">
          선생님이 알려준 활동 비밀번호를 입력하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            type="password"
            placeholder="비밀번호"
            className={`input-field text-center text-lg tracking-widest ${error ? 'border-red-400' : ''}`}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm">비밀번호가 틀렸어요 😅</p>
          )}
          <button type="submit" className="btn-primary w-full">확인</button>
          <button type="button" onClick={onCancel}
            className="w-full text-sm text-carnival-navy/40 hover:text-carnival-navy transition-colors">
            취소
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-8px); }
          40%,80%  { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
