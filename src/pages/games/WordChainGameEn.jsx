/**
 * 🔠 Word Chain (영어 끝말잇기)
 *
 * 게임 로직은 WordChainGame을 그대로 사용하고 언어만 영어로 교체합니다.
 */
import WordChainGame from './WordChainGame'

export default function WordChainGameEn(props) {
  return <WordChainGame {...props} lang="en" />
}
