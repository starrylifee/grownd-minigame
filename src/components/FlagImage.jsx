/**
 * 국기 이미지 렌더링
 *
 * Windows는 국기 이모지를 그리지 못해 ISO 코드 텍스트(예: PG)로 보인다.
 * 이모지를 ISO alpha-2 코드로 변환해 flagcdn.com SVG를 불러와 표시한다.
 * 변환 실패(코드 없음) 시에는 원래 값을 그대로 보여준다.
 */
import { flagToCode } from '../data/countriesData'

export default function FlagImage({ flag, className = 'h-24 w-auto' }) {
  const code = flagToCode(flag)
  if (!code) return <span>{flag}</span>
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      draggable={false}
      className={`inline-block rounded-lg shadow-sm border border-black/5 object-contain ${className}`}
    />
  )
}
