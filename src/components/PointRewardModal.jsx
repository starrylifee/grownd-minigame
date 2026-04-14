import { useEffect, useState } from 'react'

export default function PointRewardModal({ points, message, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 마운트 직후 애니메이션 트리거
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div
        className={`card w-full max-w-sm text-center transition-all duration-500
          ${visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
      >
        {/* 폭죽 이모지 애니메이션 */}
        <div className="text-5xl animate-bounce mb-2">🎉</div>
        <div className="text-6xl font-black text-carnival-coral mb-1">
          +{points}P
        </div>
        <p className="text-carnival-navy font-bold text-lg mb-1">포인트 획득!</p>
        <p className="text-carnival-navy/50 text-sm mb-6">{message}</p>

        <div className="flex justify-center gap-2 mb-4 text-2xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>⭐</span>
        </div>

        <button onClick={onClose} className="btn-primary w-full">
          🏠 로비로 돌아가기
        </button>
      </div>
    </div>
  )
}
