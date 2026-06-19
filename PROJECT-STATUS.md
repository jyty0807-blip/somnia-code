# SOMNIA 프로젝트 진행 현황

> 마지막 업데이트: 2026-06-19

## 전체 진행도: 75%

```
[==========================--------] 75%
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

### Phase 6a: 앱 재고 연동
- [ ] firebase.js 확장 (getStockMap, createOrder 재고 차감 + orders_all dual write)
- [ ] app.jsx에 stockMap state + prop 전달
- [ ] screens-shop.jsx 품절 UI (TabShop 배지, ScreenProduct 구매차단, ScreenCart 검증)
- [ ] i18n 키 추가 (sold_out, stock_insufficient)
- [ ] app.css 품절 오버레이 스타일

### Phase 6b: 관리자 페이지
- [ ] admin.html + vite.config.js 멀티페이지 빌드
- [ ] assets/admin/main.jsx 생성
- [ ] assets/admin/app.jsx 생성 (관리자 로그인 + 탭 라우팅)
- [ ] assets/admin/firebase-admin.js 생성 (주문/재고/번들 CRUD)
- [ ] assets/admin/admin.css 생성 (데스크톱 레이아웃)
- [ ] 주문 관리 테이블 (orders_all 조회, 상태 변경)
- [ ] 재고 관리 (단품 6개 수량 수정)
- [ ] 기획세트 CRUD (번들 등록/수정/삭제)
- [ ] index.html Admin 카드 추가 + 산출물 수 업데이트 (19→20)

### Phase 7: Vercel 배포
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
| 6a | 앱 재고 연동 | ⬜ 대기 | 7% |
| 6b | 관리자 페이지 | ⬜ 대기 | 8% |
| 7 | Vercel 배포 | ⬜ 대기 | 3% |
| 8 | index.html 업데이트 | ⬜ 대기 | 2% |
