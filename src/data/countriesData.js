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
  { country: '파키스탄',      capital: '이슬라마바드',    flag: '🇵🇰' }, // ⚠️ 6음절
  { country: '카자흐스탄',    capital: '아스타나',        flag: '🇰🇿' }, // ⚠️ 나라 이름 어려움

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
  { country: '나이지리아',    capital: '아부자',            flag: '🇳🇬' }, // ⚠️ 아부자 생소
  { country: '에티오피아',    capital: '아디스아바바',       flag: '🇪🇹' }, // ⚠️ 6음절
  { country: '남아프리카공화국', capital: '프리토리아',      flag: '🇿🇦' }, // ⚠️ 나라 이름 김

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
