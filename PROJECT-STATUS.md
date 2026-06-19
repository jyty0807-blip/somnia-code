# SOMNIA 프로젝트 진행 현황

> 마지막 업데이트: 2026-06-19

## 전체 진행도: 93%

```
[================================--] 93%
```

---

## 완료 항목

- [x] 브랜드 디자인 시스템 (19개 산출물)
- [x] 모바일 앱 UI 프로토타입 (13개 화면)
- [x] 다국어 지원 (KO/EN, 250+ 키)
- [x] 테마 시스템 (Dark / Light / Dawn)
- [x] Vite + ES 모듈 전환 (CDN Babel에서 이관)
- [x] 프로덕션 빌드 설정 (vite build)
- [x] Firebase 설정 (Firestore + Auth SDK, firebase.js)
- [x] 로그인 기능 (ScreenLogin, 데모 계정, onAuthStateChanged 연동, 로그아웃)
- [x] 주소 관리 CRUD (Firestore 연동, ScreenAddressForm, 기본배송지 토글)
- [x] CLAUDE.md 모듈 시스템 문서 갱신 (CDN Babel → Vite ES 모듈)
- [x] 주문 기능 상세화 (checkout Firestore 저장, 배송지 체크, 결제 로딩, .btn:disabled CSS)
- [x] 주문 내역 화면 (ScreenOrders, 상태 배지, formatDate 유틸, badge CSS 토큰 준수)
- [x] 제품 데이터 통일 (wear→pajama+socks 분리, mask→SOMNIA 수면 안대, oil/pajama/socks 상세 추가, 번들 교차참조 완성)
- [x] GitHub 배포 (firebase.js API키 분리, CREDENTIALS.md 로컬 전용, 민감정보 제외)
- [x] 앱 재고 연동 (seedStock, getStockMap, runTransaction 재고차감, orders_all dual write, 품절 UI)
- [x] 관리자 페이지 (admin.html, 주문 관리, 재고 수정, 기획세트 CRUD, 데스크톱 레이아웃)
- [x] 웹 상세페이지 개편 (슬립 기어 듀오→트리오, 양말 탭 추가, 잠옷 프리사이즈, 실크→썸니아 수면안대)
- [x] 관리자 로그인 에러 디버깅 (에러 코드 노출, 계정 자동생성 fallback)
- [x] 이미지 관리자 페이지 (전체 슬롯 조회·교체·줌·일괄 업로드)
- [x] QA 버그 수정 (주문 멈춤, 배송지 모달, 뒤로가기 CSS, bell 삭제, 재고 체인 분리, 장바구니 확인 모달, 로그인 fallback)

---

## TODO 체크리스트

### Phase 1: Firebase 설정 ✅
- [x] `npm install firebase` (v12.15.0)
- [x] `assets/app/firebase.js` 생성 (SDK 초기화)
- [x] Firebase Console 프로젝트 생성 (somnia-81398)
- [x] Firestore 컬렉션 설계 (users, orders, addresses)
- [ ] Firestore Security Rules 설정
- [ ] 데모 계정 생성 (demo@somnia.kr, admin@somnia.kr)

### Phase 2: 로그인 기능 ✅
- [x] `ScreenLogin` 컴포넌트 추가 (screens-shop.jsx)
- [x] `app.jsx`에 user 상태 + onAuthStateChanged
- [x] 온보딩 → 로그인 → 홈 흐름 연결
- [x] MY 탭 로그아웃 기능 연결 (signOut)
- [x] 코드 검토 완료 (개발 + 디자인)

### Phase 3: 주소 관리 CRUD ✅
- [x] `ScreenAddress` 개편 (하드코드 → Firestore)
- [x] `ScreenAddressForm` 추가 (추가/수정/삭제 폼)
- [x] app.jsx에 addressForm 오버레이 라우팅
- [x] 기본 배송지 토글 기능
- [x] i18n 키 추가

### Phase 4: 주문 기능 상세화 ✅
- [x] `checkout()` 개편 (주문번호 생성 + Firestore 저장)
- [x] ScreenCart 배송지 미설정 체크
- [x] ScreenCart 결제 로딩 상태
- [x] i18n 키 추가

### Phase 5: 주문 내역 화면 ✅
- [x] `ScreenOrders` 컴포넌트 추가
- [x] MY 탭 "주문 내역" 연결 활성화
- [x] 주문 상태 배지 스타일 (app.css)
- [x] i18n 키 추가

### Phase 6a: 앱 재고 연동 ✅
- [x] firebase.js 확장 (getStockMap, createOrder 재고 차감 + orders_all dual write)
- [x] app.jsx에 stockMap state + prop 전달
- [x] screens-shop.jsx 품절 UI (TabShop 배지, ScreenProduct 구매차단, ScreenCart 검증)
- [x] i18n 키 추가 (sold_out, stock_insufficient)
- [x] app.css 품절 오버레이 스타일

### Phase 6b: 관리자 페이지 ✅
- [x] admin.html + vite.config.js 멀티페이지 빌드
- [x] assets/admin/main.jsx 생성
- [x] assets/admin/app.jsx 생성 (관리자 로그인 + 탭 라우팅)
- [x] assets/admin/firebase-admin.js 생성 (주문/재고/번들 CRUD)
- [x] assets/admin/admin.css 생성 (데스크톱 레이아웃)
- [x] 주문 관리 테이블 (orders_all 조회, 상태 변경)
- [x] 재고 관리 (단품 6개 수량 수정)
- [x] 기획세트 CRUD (번들 등록/수정/삭제)
- [x] index.html Admin 카드 추가 + 산출물 수 업데이트 (19→20)

### Phase 6c: 웹 상세페이지 개편 ✅
- [x] 슬립 기어 듀오 → 트리오 (파일 리네임, 전체 텍스트·가격)
- [x] 양말 선택 탭 + 상세 섹션 + 스펙 추가
- [x] 구성 선택 시 갤러리 썸네일 전환 JS
- [x] 잠옷 사이즈 S/M/L 제거 → 프리사이즈 고정
- [x] 실크 수면안대 → 썸니아 수면안대 (HTML + 브로셔 + Detail Studio)
- [x] index.html, SOMNIA.html 참조 링크 업데이트

### Phase 6d: 관리자 로그인 디버깅 ✅
- [x] 에러 코드 화면 노출 (catch에서 e.code 표시)
- [x] 계정 미존재 시 자동 생성 fallback (admin + consumer)

### Phase 6e: 이미지 관리자 페이지 ✅
- [x] `SOMNIA Image Manager.html` 생성 (루트)
- [x] `assets/imgmgr/imgmgr.js` — 상태 파일 CRUD, 슬롯 인벤토리 (55개), 줌 슬라이더, 일괄 업로드
- [x] `assets/imgmgr/imgmgr.css` — 다크 그리드 레이아웃, 필터 탭
- [x] index.html 카드 추가 + 산출물 20→21

### Phase 7: QA 버그 수정 ✅
- [x] 주문 처리 에러 핸들링 (doCheckout 전체 try-catch)
- [x] 취침준비 뒤로가기 버튼 수정 (.prep .bt-top CSS + top:72px)
- [x] 리포트 탭 알림 아이콘 제거 (bell 버튼 삭제)
- [x] 배송지 미설정 시 커스텀 모달 (토스트→SOMNIA 스타일 다이얼로그)
- [x] seedStock/refreshStock 체인 분리 (전 상품 품절 버그 수정)
- [x] 장바구니 재고 체크 + 확인 모달 (연타 무제한 담기 방지)
- [x] 로그인 Firebase v12+ 에러코드 대응 (auth/invalid-credential fallback)

### Phase 7b: 긴급 수정
- [ ] 관리자 사이트 재고 조회 불가 (Firestore 권한 문제)
- [ ] 관리자 사이트 번들 미표시 ("등록된 번들 없음")
- [ ] 앱 장바구니 확인 모달 배경 투명 → 불투명 흰색으로 변경
- [ ] 앱 배송지 추가 기능 수정 + 우편번호 조회 기능 추가

### Phase 8: 기능 보완
- [ ] 기획세트 쇼핑 앱 연동 (firebase.js getBundles, 앱 번들 목록·상세·구매)
- [ ] 멤버십 적립금 로직 (등급별 적립률 계산, 주문 완료 시 적립 알림, Firestore 포인트 저장)

### Phase 9: Vercel 배포
- [ ] `vercel.json` 생성
- [ ] GitHub 연동
- [ ] 프로덕션 배포
- [ ] 배포 URL 확인

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프론트엔드 | React 18 + Vite 6 |
| 백엔드/DB | Firebase (Firestore + Auth) |
| 로그인 | 데모 계정 (이메일/비번) |
| 배포 | Vercel |
| 관리자 | 별도 admin.html |

## 데모 계정

| 용도 | 이메일 |
|------|--------|
| 앱 시연 | demo@somnia.kr |
| 관리자 | admin@somnia.kr |

---

## Phase별 진행도

| Phase | 설명 | 상태 | 비중 |
|-------|------|------|------|
| 1 | Firebase 설정 | ✅ 완료 | 10% |
| 2 | 로그인 기능 | ✅ 완료 | 10% |
| 3 | 주소 관리 CRUD | ✅ 완료 | 10% |
| 4 | 주문 기능 상세화 | ✅ 완료 | 10% |
| 5 | 주문 내역 화면 | ✅ 완료 | 5% |
| 6a | 앱 재고 연동 | ✅ 완료 | 7% |
| 6b | 관리자 페이지 | ✅ 완료 | 8% |
| 6c | 웹 상세페이지 개편 | ✅ 완료 | 3% |
| 6d | 관리자 로그인 디버깅 | ✅ 완료 | 2% |
| 6e | 이미지 관리자 페이지 | ✅ 완료 | 3% |
| 7 | QA 버그 수정 | ✅ 완료 | 5% |
| 8 | 기능 보완 (번들·적립금) | ⬜ 대기 | 8% |
| 9 | Vercel 배포 | ⬜ 대기 | 3% |
| 10 | index.html 업데이트 | ⬜ 대기 | 2% |
