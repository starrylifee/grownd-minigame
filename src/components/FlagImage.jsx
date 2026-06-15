/**
 * 국기 이미지 렌더링
 *
 * Windows는 국기 이모지를 그리지 못해 ISO 코드 텍스트(예: PG)로 보인다.
 * 이모지를 ISO alpha-2 코드로 변환한 뒤, 번들된 flag-icons SVG를 배경으로 표시한다.
 * 외부 CDN에 의존하지 않으므로 방화벽/광고차단/오프라인 환경에서도 항상 보인다.
 * 변환 실패(코드 없음) 시에는 원래 값을 그대로 보여준다.
 */
import { flagToCode } from '../data/countriesData'

export default function FlagImage({ flag, className = 'h-24' }) {
  const code = flagToCode(flag)
  if (!code) return <span>{flag}</span>
  return (
    <span
      role="img"
      aria-label={flag}
      className={`fi fi-${code} inline-block rounded-lg shadow-sm border border-black/5 ${className}`}
      style={{ width: 'auto', aspectRatio: '4 / 3', backgroundSize: 'contain' }}
    />
  )
}
