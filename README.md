# 🎡 그라운드 미니게임 플랫폼

학생들이 미니게임을 완료하면 **그라운드카드(growndcard.com) 포인트**가 자동 지급되는 교육용 게임 플랫폼입니다.

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 Firebase 프로젝트 정보 입력

# 3. 개발 서버 실행
npm run dev
```

### Firebase 설정
1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Authentication → Google 제공업체 활성화
3. Firestore Database 생성
4. Functions 활성화 (Blaze 요금제 필요)
5. `firestore.rules` 파일 내용을 Firestore 보안 규칙에 적용

### Cloud Functions 배포
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## 사용 방법

### 교사
1. 메인 화면에서 **교사** 선택 → Google 로그인
2. **학급 설정** 탭: 학급 코드, 그라운드 API 키, 그라운드 학급 ID 입력
3. **학생 관리** 탭: 학생 번호·이름·초기 비밀번호 등록
4. **게임 관리** 탭: 게임별 활성화 토글, 활동 비밀번호, 지급 포인트 설정

### 학생
1. 메인 화면에서 **학생** 선택
2. 학급 코드 + 번호 + 비밀번호 입력
3. 활성화된 게임을 선택해서 플레이
4. 완료하면 그라운드카드 포인트 자동 지급!

---

## 구현된 미니게임

| 아이콘 | 이름 | 소요시간 | 완료 기준 | 교사 설정 가능 |
|--------|------|----------|-----------|----------------|
| ⌨️ | 타자게임 | ~2분 | 제시 문장 5개 완성 | 활성화, 지급 포인트 |
| ➗ | 수학퀴즈 | ~3분 | 사칙연산 10문제 풀기 | 활성화, 지급 포인트 |
| ⭕ | OX퀴즈 | ~2분 | OX 10문제 풀기 | 활성화, **문제 직접 설정**, 지급 포인트 |

---

## 새 미니게임 추가 가이드 (AI 참조용)

### 1. 인터페이스 규약 (반드시 준수)

모든 미니게임은 `src/pages/games/` 폴더에 위치하며 아래 props를 받아야 합니다:

```jsx
function MyGame({ activityId, activity, onComplete, onExit }) {
  /**
   * activityId : string — Firestore activities 문서 ID (예: "class2025_my-game")
   * activity   : object — Firestore에서 읽어온 활동 설정 데이터
   *   - activity.pointsPerCompletion : number (지급 포인트)
   *   - activity.activityPassword    : string (활동 비밀번호, 이미 검증 완료)
   *   - activity.enabled             : boolean
   *   - 게임별 커스텀 필드 (예: activity.questions)
   *
   * onComplete(result) : 게임 완료 시 호출. result = { score: any, passed: boolean }
   *   → 이 함수를 호출하면 플랫폼이 자동으로 Grownd API를 통해 포인트를 지급합니다.
   *   → 게임 컴포넌트에서 직접 포인트 지급 코드를 작성하지 마세요.
   *
   * onExit() : 학생이 중단하고 로비로 돌아갈 때 호출
   */
}
```

### 2. 새 게임 추가 체크리스트

- [ ] `src/pages/games/NewGame.jsx` 파일 생성 (위 규약 준수)
- [ ] `src/config/games.js`의 `GAMES` 배열에 항목 추가:

```js
{
  id:          'new-game',          // Firestore 문서 키 suffix로 사용
  name:        '게임 이름',
  icon:        '🎮',
  description: '학생에게 보여줄 설명 (한 문장)',
  duration:    '약 N분',
  color:       'bg-carnival-yellow', // 카드 배경색 (Tailwind 클래스)
  component:   NewGame,              // import한 컴포넌트
}
```

- [ ] 교사 대시보드 → 게임 관리 탭에 **자동으로 나타남** (별도 수정 불필요)
- [ ] 게임별 커스텀 설정이 필요하면 `TeacherDashboard.jsx`의 게임 설정 섹션에 추가

### 3. 파일 구조 참고

```
src/
├── config/
│   └── games.js              ← 게임 레지스트리 (새 게임 등록)
├── pages/
│   ├── GameRunner.jsx         ← 게임 실행 컨테이너 (수정 불필요)
│   └── games/
│       ├── TypingGame.jsx     ← 예시: 타자게임
│       ├── MathQuiz.jsx       ← 예시: 수학퀴즈
│       └── OXQuiz.jsx         ← 예시: OX퀴즈 (Firestore 연동 예시)
└── components/
    ├── ActivityPasswordModal.jsx  ← 자동 처리 (수정 불필요)
    └── PointRewardModal.jsx       ← 자동 처리 (수정 불필요)
```

### 4. Grownd API 스펙 (Cloud Functions 참고)

- 엔드포인트: `POST /api/v1/classes/{classId}/students/{studentCode}/points`
- 인증: `X-API-Key: {교사 API 키}` — **클라이언트 직접 호출 금지**
- 호출 경로: 클라이언트 → `lib/growndApi.js`의 `awardPoints()` → Cloud Function → Grownd API
- 호출 제한: 분당 60회 / 일일 500회

---

## 프로젝트 구조

```
├── src/
│   ├── config/games.js         # 미니게임 레지스트리
│   ├── context/AuthContext.jsx # 교사/학생 인증 상태
│   ├── lib/
│   │   ├── firebase.js         # Firebase 초기화
│   │   ├── firestore.js        # DB 헬퍼
│   │   └── growndApi.js        # 포인트 지급 (Functions 경유)
│   └── pages/
│       ├── Landing.jsx
│       ├── TeacherLogin.jsx
│       ├── TeacherDashboard.jsx
│       ├── StudentLogin.jsx
│       ├── GameLobby.jsx
│       ├── GameRunner.jsx      # 게임 실행 래퍼
│       └── games/              # 미니게임 컴포넌트
├── functions/index.js          # Cloud Functions (포인트 지급 프록시)
├── firestore.rules             # Firestore 보안 규칙
└── .env.example                # 환경변수 템플릿
```

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite |
| 스타일 | TailwindCSS (놀이동산 테마) |
| 데이터베이스 | Firebase Firestore |
| 인증 | Firebase Auth (교사: Google SSO / 학생: 커스텀) |
| 서버 로직 | Firebase Cloud Functions v2 |

---

## 보안 사항

- Grownd API 키는 Cloud Function에서만 읽히며 클라이언트에 노출되지 않음
- 학생 비밀번호는 SHA-256 해시로 저장
- Firestore 보안 규칙으로 교사-학급 소유권 보호
"# grownd-minigame" 
