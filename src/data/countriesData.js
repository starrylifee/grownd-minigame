/**
 * 🌍 나라 수도 퀴즈 데이터
 *
 * ⚠️ 오타 주의 표시된 항목은 교사가 직접 풀에서 제외할 수 있습니다.
 * (TeacherDashboard → 게임 관리 → 나라 수도 퀴즈)
 */

export const COUNTRIES = [
  // ── 아시아 ────────────────────────────────────────────────
  { country: '일본',          capital: '도쿄',          flag: '🇯🇵' },
  { country: '중국',          capital: '베이징',         flag: '🇨🇳' },
  { country: '인도',          capital: '뉴델리',         flag: '🇮🇳' },
  { country: '인도네시아',    capital: '자카르타',        flag: '🇮🇩' },
  { country: '태국',          capital: '방콕',           flag: '🇹🇭' },
  { country: '베트남',        capital: '하노이',          flag: '🇻🇳' },
  { country: '필리핀',        capital: '마닐라',          flag: '🇵🇭' },
  { country: '북한',          capital: '평양',           flag: '🇰🇵' },
  { country: '미얀마',        capital: '네피도',          flag: '🇲🇲' },
  { country: '방글라데시',    capital: '다카',            flag: '🇧🇩' },
  { country: '말레이시아',    capital: '쿠알라룸푸르',    flag: '🇲🇾' }, // ⚠️ 6음절
  { country: '몽골',          capital: '울란바토르',       flag: '🇲🇳' }, // ⚠️ 생소

  // ── 중동 ──────────────────────────────────────────────────
  { country: '터키',          capital: '앙카라',          flag: '🇹🇷' },
  { country: '사우디아라비아', capital: '리야드',          flag: '🇸🇦' },
  { country: '이란',          capital: '테헤란',          flag: '🇮🇷' },
  { country: '이라크',        capital: '바그다드',         flag: '🇮🇶' },
  { country: '이스라엘',      capital: '예루살렘',         flag: '🇮🇱' },

  // ── 유럽 ──────────────────────────────────────────────────
  { country: '영국',          capital: '런던',            flag: '🇬🇧' },
  { country: '프랑스',        capital: '파리',            flag: '🇫🇷' },
  { country: '독일',          capital: '베를린',           flag: '🇩🇪' },
  { country: '이탈리아',      capital: '로마',            flag: '🇮🇹' },
  { country: '스페인',        capital: '마드리드',         flag: '🇪🇸' },
  { country: '러시아',        capital: '모스크바',         flag: '🇷🇺' },
  { country: '그리스',        capital: '아테네',           flag: '🇬🇷' },
  { country: '포르투갈',      capital: '리스본',           flag: '🇵🇹' },
  { country: '네덜란드',      capital: '암스테르담',        flag: '🇳🇱' },
  { country: '스웨덴',        capital: '스톡홀름',         flag: '🇸🇪' },
  { country: '노르웨이',      capital: '오슬로',           flag: '🇳🇴' },
  { country: '덴마크',        capital: '코펜하겐',         flag: '🇩🇰' },
  { country: '핀란드',        capital: '헬싱키',           flag: '🇫🇮' },
  { country: '스위스',        capital: '베른',            flag: '🇨🇭' },
  { country: '오스트리아',    capital: '빈',              flag: '🇦🇹' },
  { country: '폴란드',        capital: '바르샤바',         flag: '🇵🇱' },
  { country: '체코',          capital: '프라하',           flag: '🇨🇿' },
  { country: '헝가리',        capital: '부다페스트',        flag: '🇭🇺' },
  { country: '우크라이나',    capital: '키이우',           flag: '🇺🇦' },

  // ── 아프리카 ──────────────────────────────────────────────
  { country: '이집트',        capital: '카이로',           flag: '🇪🇬' },
  { country: '케냐',          capital: '나이로비',          flag: '🇰🇪' },
  { country: '모로코',        capital: '라바트',            flag: '🇲🇦' },

  // ── 아메리카 ──────────────────────────────────────────────
  { country: '미국',          capital: '워싱턴',           flag: '🇺🇸' },
  { country: '캐나다',        capital: '오타와',           flag: '🇨🇦' },
  { country: '멕시코',        capital: '멕시코시티',        flag: '🇲🇽' },
  { country: '칠레',          capital: '산티아고',          flag: '🇨🇱' },
  { country: '페루',          capital: '리마',             flag: '🇵🇪' },
  { country: '쿠바',          capital: '아바나',            flag: '🇨🇺' },
  { country: '브라질',        capital: '브라질리아',         flag: '🇧🇷' }, // ⚠️ 나라이름과 혼동
  { country: '아르헨티나',    capital: '부에노스아이레스',    flag: '🇦🇷' }, // ⚠️ 8음절 최고 난이도

  // ── 오세아니아 ────────────────────────────────────────────
  { country: '호주',          capital: '캔버라',            flag: '🇦🇺' },
  { country: '뉴질랜드',      capital: '웰링턴',            flag: '🇳🇿' },
]

/**
 * 🗺️ 나라 수도 퀴즈 SET 2
 * SET 1을 다 외운 학생들을 위한 새로운 나라 풀 (SET 1과 겹치지 않음)
 */
export const COUNTRIES_SET2 = [
  // ── 아시아 ────────────────────────────────────────────────
  { country: '싱가포르',        capital: '싱가포르',        flag: '🇸🇬' }, // ⚠️ 나라이름과 동일
  { country: '캄보디아',        capital: '프놈펜',          flag: '🇰🇭' },
  { country: '라오스',          capital: '비엔티안',        flag: '🇱🇦' },
  { country: '네팔',            capital: '카트만두',        flag: '🇳🇵' },
  { country: '우즈베키스탄',    capital: '타슈켄트',        flag: '🇺🇿' },
  { country: '아프가니스탄',    capital: '카불',            flag: '🇦🇫' },
  { country: '대만',            capital: '타이베이',        flag: '🇹🇼' },
  { country: '부탄',            capital: '팀부',            flag: '🇧🇹' },
  { country: '몰디브',          capital: '말레',            flag: '🇲🇻' },

  // ── 중동 ──────────────────────────────────────────────────
  { country: '요르단',          capital: '암만',            flag: '🇯🇴' },
  { country: '레바논',          capital: '베이루트',        flag: '🇱🇧' },
  { country: '시리아',          capital: '다마스쿠스',      flag: '🇸🇾' },
  { country: '카타르',          capital: '도하',            flag: '🇶🇦' },
  { country: '아랍에미리트',    capital: '아부다비',        flag: '🇦🇪' },
  { country: '오만',            capital: '무스카트',        flag: '🇴🇲' },
  { country: '바레인',          capital: '마나마',          flag: '🇧🇭' },

  // ── 유럽 ──────────────────────────────────────────────────
  { country: '아일랜드',        capital: '더블린',          flag: '🇮🇪' },
  { country: '벨기에',          capital: '브뤼셀',          flag: '🇧🇪' },
  { country: '불가리아',        capital: '소피아',          flag: '🇧🇬' },
  { country: '루마니아',        capital: '부쿠레슈티',      flag: '🇷🇴' }, // ⚠️ 오타 주의
  { country: '세르비아',        capital: '베오그라드',      flag: '🇷🇸' },
  { country: '크로아티아',      capital: '자그레브',        flag: '🇭🇷' },
  { country: '에스토니아',      capital: '탈린',            flag: '🇪🇪' },
  { country: '라트비아',        capital: '리가',            flag: '🇱🇻' },
  { country: '리투아니아',      capital: '빌뉴스',          flag: '🇱🇹' },
  { country: '벨라루스',        capital: '민스크',          flag: '🇧🇾' },
  { country: '아이슬란드',      capital: '레이캬비크',      flag: '🇮🇸' }, // ⚠️ 오타 주의
  { country: '룩셈부르크',      capital: '룩셈부르크',      flag: '🇱🇺' }, // ⚠️ 나라이름과 동일
  { country: '알바니아',        capital: '티라나',          flag: '🇦🇱' },
  { country: '몰타',            capital: '발레타',          flag: '🇲🇹' },

  // ── 아프리카 ──────────────────────────────────────────────
  { country: '알제리',          capital: '알제',            flag: '🇩🇿' },
  { country: '튀니지',          capital: '튀니스',          flag: '🇹🇳' },
  { country: '리비아',          capital: '트리폴리',        flag: '🇱🇾' },
  { country: '가나',            capital: '아크라',          flag: '🇬🇭' },
  { country: '세네갈',          capital: '다카르',          flag: '🇸🇳' },
  { country: '우간다',          capital: '캄팔라',          flag: '🇺🇬' },
  { country: '잠비아',          capital: '루사카',          flag: '🇿🇲' },
  { country: '짐바브웨',        capital: '하라레',          flag: '🇿🇼' },
  { country: '르완다',          capital: '키갈리',          flag: '🇷🇼' },
  { country: '앙골라',          capital: '루안다',          flag: '🇦🇴' },
  { country: '탄자니아',        capital: '도도마',          flag: '🇹🇿' },

  // ── 아메리카 ──────────────────────────────────────────────
  { country: '콜롬비아',        capital: '보고타',          flag: '🇨🇴' },
  { country: '베네수엘라',      capital: '카라카스',        flag: '🇻🇪' },
  { country: '에콰도르',        capital: '키토',            flag: '🇪🇨' },
  { country: '우루과이',        capital: '몬테비데오',      flag: '🇺🇾' },
  { country: '파라과이',        capital: '아순시온',        flag: '🇵🇾' },
  { country: '과테말라',        capital: '과테말라시티',    flag: '🇬🇹' }, // ⚠️ 나라이름과 혼동
  { country: '파나마',          capital: '파나마시티',      flag: '🇵🇦' }, // ⚠️ 나라이름과 혼동
  { country: '코스타리카',      capital: '산호세',          flag: '🇨🇷' },
  { country: '도미니카공화국',  capital: '산토도밍고',      flag: '🇩🇴' },
  { country: '자메이카',        capital: '킹스턴',          flag: '🇯🇲' },
  { country: '니카라과',        capital: '마나과',          flag: '🇳🇮' },
  { country: '엘살바도르',      capital: '산살바도르',      flag: '🇸🇻' },

  // ── 오세아니아 ────────────────────────────────────────────
  { country: '피지',            capital: '수바',            flag: '🇫🇯' },
  { country: '파푸아뉴기니',    capital: '포트모르즈비',    flag: '🇵🇬' }, // ⚠️ 오타 주의
]

/**
 * 🚩 국기 퀴즈에서 나라 이름의 허용 가능한 다른 표기
 * key: COUNTRIES/COUNTRIES_SET2의 country 값
 */
export const COUNTRY_ALIASES = {
  '터키':         ['튀르키예'],
  '호주':         ['오스트레일리아'],
  '대만':         ['타이완'],
  '아랍에미리트': ['아랍에미리트연합국'],
  '도미니카공화국': ['도미니카'],
}

/**
 * 국기 이모지(지역표시문자 2개) → ISO 3166-1 alpha-2 소문자 코드
 *   '🇯🇵' → 'jp', '🇵🇬' → 'pg'
 * Windows는 국기 이모지를 글리프로 못 그려 코드 텍스트(JP, PG)로 보이므로,
 * 이 코드로 번들된 flag-icons SVG를 그려 OS와 무관하게 국기를 표시한다.
 */
export function flagToCode(flag) {
  if (!flag) return ''
  return [...flag]
    .map(c => c.codePointAt(0))
    .filter(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF)
    .map(cp => String.fromCharCode(cp - 0x1F1E6 + 97))
    .join('')
}
