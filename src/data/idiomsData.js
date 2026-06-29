/**
 * 🀄 초성힌트 사자성어 퀴즈 데이터
 *
 * reading: 정답 (한글 음, 4글자 — 초성 표시·채점에 사용)
 * hanja:   한자 (2회 오답 시 힌트로 공개)
 * meaning: 뜻 (1회 오답 시 힌트로 공개)
 *
 * 채점은 띄어쓰기를 무시하고 reading 과 비교합니다.
 */

export const IDIOMS = [
  { reading: '각골난망', hanja: '刻骨難忘', meaning: '입은 은혜가 뼈에 새겨져 잊을 수 없음' },
  { reading: '고진감래', hanja: '苦盡甘來', meaning: '고생 끝에 즐거움이 옴' },
  { reading: '권선징악', hanja: '勸善懲惡', meaning: '착한 일은 권하고 나쁜 일은 벌함' },
  { reading: '다다익선', hanja: '多多益善', meaning: '많으면 많을수록 더 좋음' },
  { reading: '대기만성', hanja: '大器晩成', meaning: '큰 그릇은 늦게 이루어짐. 크게 될 사람은 늦게 성공함' },
  { reading: '동고동락', hanja: '同苦同樂', meaning: '괴로움과 즐거움을 함께함' },
  { reading: '마이동풍', hanja: '馬耳東風', meaning: '남의 말을 귀담아듣지 않고 흘려버림' },
  { reading: '사면초가', hanja: '四面楚歌', meaning: '사방이 적으로 둘러싸여 도움받을 데 없는 처지' },
  { reading: '새옹지마', hanja: '塞翁之馬', meaning: '인생의 좋고 나쁨은 미리 알 수 없음' },
  { reading: '십중팔구', hanja: '十中八九', meaning: '열 가운데 여덟이나 아홉. 거의 대부분' },
  { reading: '어부지리', hanja: '漁父之利', meaning: '둘이 다투는 사이에 엉뚱한 제삼자가 이익을 봄' },
  { reading: '우유부단', hanja: '優柔不斷', meaning: '망설이기만 하고 결단을 내리지 못함' },
  { reading: '유비무환', hanja: '有備無患', meaning: '미리 준비해 두면 걱정할 것이 없음' },
  { reading: '이심전심', hanja: '以心傳心', meaning: '마음에서 마음으로 뜻이 통함' },
  { reading: '인과응보', hanja: '因果應報', meaning: '좋은 일에는 좋은 결과, 나쁜 일에는 나쁜 결과가 따름' },
  { reading: '일거양득', hanja: '一擧兩得', meaning: '한 가지 일로 두 가지 이익을 얻음' },
  { reading: '일석이조', hanja: '一石二鳥', meaning: '돌 하나로 새 두 마리를 잡음. 한 번에 두 가지 이득' },
  { reading: '자업자득', hanja: '自業自得', meaning: '자기가 저지른 일의 결과를 자기가 받음' },
  { reading: '적반하장', hanja: '賊反荷杖', meaning: '잘못한 사람이 도리어 큰소리치며 나무람' },
  { reading: '죽마고우', hanja: '竹馬故友', meaning: '어릴 때부터 함께 놀며 자란 오랜 친구' },
  { reading: '천고마비', hanja: '天高馬肥', meaning: '하늘이 높고 말이 살찌는 좋은 가을' },
  { reading: '청출어람', hanja: '靑出於藍', meaning: '제자가 스승보다 나음' },
  { reading: '칠전팔기', hanja: '七顚八起', meaning: '여러 번 실패해도 굽히지 않고 다시 일어남' },
  { reading: '타산지석', hanja: '他山之石', meaning: '남의 잘못도 자기를 갈고닦는 데 도움이 됨' },
  { reading: '토사구팽', hanja: '兎死狗烹', meaning: '필요할 때 쓰다가 쓸모없어지면 버림' },
  { reading: '표리부동', hanja: '表裏不同', meaning: '겉으로 드러나는 것과 속마음이 다름' },
  { reading: '학수고대', hanja: '鶴首苦待', meaning: '학처럼 목을 빼고 간절히 기다림' },
  { reading: '형설지공', hanja: '螢雪之功', meaning: '어려운 환경에서도 부지런히 공부해 이룬 보람' },
  { reading: '화룡점정', hanja: '畵龍點睛', meaning: '가장 중요한 부분을 마무리해 일을 완성함' },
  { reading: '동병상련', hanja: '同病相憐', meaning: '처지가 비슷한 사람끼리 서로 가엾게 여김' },
  { reading: '백전백승', hanja: '百戰百勝', meaning: '싸울 때마다 모두 이김' },
  { reading: '견물생심', hanja: '見物生心', meaning: '물건을 보면 가지고 싶은 욕심이 생김' },
  { reading: '금시초문', hanja: '今時初聞', meaning: '바로 지금 처음으로 들음' },
  { reading: '다재다능', hanja: '多才多能', meaning: '재주와 능력이 여러 가지로 많음' },
  { reading: '막상막하', hanja: '莫上莫下', meaning: '실력이 비슷해 누가 낫고 못한지 가리기 어려움' },
  { reading: '산전수전', hanja: '山戰水戰', meaning: '세상의 온갖 고생과 어려움을 다 겪음' },
  { reading: '우왕좌왕', hanja: '右往左往', meaning: '이리저리 왔다 갔다 하며 갈팡질팡함' },
  { reading: '일사천리', hanja: '一瀉千里', meaning: '일이 거침없이 빠르게 진행됨' },
  { reading: '작심삼일', hanja: '作心三日', meaning: '한번 한 결심이 사흘을 가지 못함' },
  { reading: '호시탐탐', hanja: '虎視眈眈', meaning: '기회를 노리며 가만히 형세를 살핌' },
  { reading: '일편단심', hanja: '一片丹心', meaning: '변치 않는 한결같은 마음' },
  { reading: '감언이설', hanja: '甘言利說', meaning: '남의 비위를 맞추는 달콤한 말' },
  { reading: '결초보은', hanja: '結草報恩', meaning: '죽어서도 잊지 않고 은혜를 갚음' },
  { reading: '과유불급', hanja: '過猶不及', meaning: '지나친 것은 모자란 것과 같음' },
]
