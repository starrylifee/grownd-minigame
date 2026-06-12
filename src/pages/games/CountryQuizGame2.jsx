/**
 * 🗺️ 나라 수도 퀴즈 SET 2
 *
 * SET 1을 다 외운 학생들을 위한 새로운 나라 풀.
 * 게임 로직은 CountryQuizGame을 그대로 사용하고 데이터만 교체합니다.
 */
import CountryQuizGame from './CountryQuizGame'
import { COUNTRIES_SET2 } from '../../data/countriesData'

export default function CountryQuizGame2(props) {
  return (
    <CountryQuizGame
      {...props}
      countries={COUNTRIES_SET2}
      title="🗺️ 나라 수도 퀴즈 2"
      badge="세계 수도 SET 2"
    />
  )
}
