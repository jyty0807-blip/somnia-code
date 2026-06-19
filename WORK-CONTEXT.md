# SOMNIA 작업 컨텍스트

> 새 대화에서 이 파일을 참고하여 이전 작업 상태를 이어받는다.
> 마지막 업데이트: 2026-06-19

---

## 프로젝트 개요

수면 라이프스타일 브랜드 **SOMNIA**의 모바일 앱 프로토타입 + 관리자 페이지.
- **기술 스택:** React 18 + Vite 6 + Firebase (Firestore + Auth)
- **GitHub:** https://github.com/jyty0807-blip/somnia-code
- **진행도:** 93% (Phase 1~7 완료, 7b부터 진행)

---

## 완료된 Phase

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | Firebase 설정 (Firestore + Auth SDK) | ✅ |
| 2 | 로그인 기능 (ScreenLogin, onAuthStateChanged) | ✅ |
| 3 | 주소 관리 CRUD (Firestore 연동, ScreenAddressForm) | ✅ |
| 4 | 주문 기능 (checkout → Firestore 저장, 배송지 체크, 결제 로딩) | ✅ |
| 5 | 주문 내역 화면 (ScreenOrders, 상태 배지) | ✅ |
| 6a | 앱 재고 연동 (seedStock, getStockMap, runTransaction, 품절 UI) | ✅ |
| 6b | 관리자 페이지 (주문/재고/번들 관리, 데스크톱 UI) | ✅ |
| - | Vite 전환 (CDN Babel → ES 모듈) | ✅ |
| - | 제품 데이터 통일 (6개 단품 + 4개 기획세트 확정) | ✅ |
| - | GitHub 배포 (민감정보 분리) | ✅ |

---

## 다음 작업: Phase 7b → 8

### Phase 7b: 긴급 수정
- 관리자 사이트 재고 조회 불가 (Firestore 권한 → 해결됨, 재고 시드 완료)
- 관리자 사이트 번들 미표시 (데이터 미등록 → 관리자에서 추가 필요)
- 앱 장바구니 확인 모달 배경 투명 → 불투명 흰색으로 변경
- 앱 배송지 추가 기능 수정 + 우편번호 조회 기능 추가

### Phase 8: 기능 보완
- 기획세트 쇼핑 앱 연동 (getBundles, 앱 번들 목록·상세·구매)
- 멤버십 적립금 로직 (등급별 적립률, 주문 시 적립, Firestore 포인트)

---

## 제품 데이터 구조

### 단품 (6개)
| ID | 카테고리 | 한글명 | 정가 | 회원가 (15%) |
|-----|---------|--------|------|-------------|
| jelly | beauty | SOMNIA 드림 젤리 | ₩28,000 | ₩23,800 |
| oil | aroma | 라벤더 아로마 오일 | ₩34,000 | ₩28,900 |
| mask | gear | SOMNIA 수면 안대 | ₩39,000 | ₩33,150 |
| spray | aroma | 슬립 웰 아로마 룸 스프레이 | ₩34,000 | ₩28,900 |
| pajama | gear | 클라우드 슬립웨어 | ₩59,000 | ₩50,150 |
| socks | gear | 슬립 소프트 양말 | ₩19,000 | ₩16,150 |

### 기획세트 (4개)
| 세트명 | 구성 | 등록된 제품 bundles |
|--------|------|-------------------|
| Dream Jelly 3 Flavor Set | 젤리 3맛 | jelly |
| Deep Night Routine Set | spray + jelly + mask | jelly, spray, mask |
| Aroma Therapy Duo | oil + spray | oil, spray |
| Sleep Gear Trio | pajama + socks + mask | pajama, socks, mask |

### 멤버십 등급별 가격
| 등급 | 포인트 | 적립 | 할인 | 적용 가격 |
|------|--------|------|------|-----------|
| Cloud | 0–999P | 1% | 0% | 정가 (`price`) |
| Pastel | 1,000–1,999P | 3% | 0% | 정가 (`price`) |
| Lavender | 2,000–3,499P | 5% | 15% | 회원가 (`member`) |
| Midnight | 3,500P+ | 8% | 15% | 회원가 (`member`) |

---

## Firestore 데이터 모델

```
users/{uid}/addresses/{id}    — 배송지 CRUD
users/{uid}/orders/{id}       — 사용자별 주문 (앱에서 조회)
products/{productId}          — 재고 (seedStock으로 초기화, 주문 시 runTransaction 차감)
  └── stock: number
bundles/{bundleId}            — 기획세트 (관리자 페이지에서 CRUD)
  ├── name, desc, items[], price, originalPrice, stock, active
orders_all/{docId}            — 관리자 전체 주문 조회용 (createOrder에서 dual write)
```

---

## 파일 구조 (주요 파일)

```
assets/app/
  main.jsx           — Vite 진입점
  app.jsx            — App 루트 (라우팅, 상태 관리, stockMap)
  firebase.js        — Firebase SDK 초기화 + CRUD 함수 (gitignored)
  firebase.js.example — API 키 없는 템플릿
  i18n.js            — 다국어 (KO/EN) + SOMNIA_DATA + SOMNIA_PRICE + formatDate
  products.js        — SOMNIA_PRODUCTS (상세정보) + SOMNIA_NOTICE
  screens-shop.jsx   — TabShop, ScreenProduct, ScreenCart, TabMy, ScreenAddress, ScreenAddressForm, ScreenOrders, ScreenLogin 등
  screens-sleep.jsx  — TabHome, TabReport, ScreenBedPrep, ScreenBedtime, ScreenSummary, ScreenRecord
  icons.jsx          — Ico 아이콘 맵
  ios-frame.jsx      — IOSDevice 프레임
  app.css            — 앱 전체 스타일

assets/admin/
  main.jsx           — 관리자 Vite 진입점
  app.jsx            — AdminApp (로그인 + 주문/재고/번들 3탭)
  firebase-admin.js  — 관리자 Firebase CRUD (gitignored)
  firebase-admin.js.example — API 키 없는 템플릿
  admin.css          — 데스크톱 레이아웃 (SOMNIA 디자인 토큰)
```

---

## 작업 규칙 (반드시 따를 것)

### 피드백 루프 (강제 사이클)
```
구현 완료 → /phase-review (개발 + 디자인 리뷰 + 빌드 검증)
  → 결과 보고 → 사용자 승인 대기
  → 🔴 수정 요청 시 수정 후 다시 보고
  → 승인 시 → /phase-approve (진행도 + CHANGELOG 자동 업데이트)
  → /phase-approve 완료 후에만 다음 작업 가능
```

### 절대 금지
- `/phase-approve` 없이 PROJECT-STATUS.md나 CHANGELOG.md 수동 수정
- 승인 없이 다음 Phase 시작
- 설명 없이 바로 코드 수정 (항상 한국어로 무엇을 할지 먼저 설명)

### 코드 규칙
- 기존 코드 최소 수정, 새 기능은 기존 패턴에 맞춰 추가
- 토큰 절약: 필요한 부분만 읽기, 에이전트 남발 금지
- 모든 모듈은 `import/export` 사용 (window.* 전역 아님)

---

## 민감 파일 (gitignored)
- `assets/app/firebase.js` — Firebase API 키
- `assets/admin/firebase-admin.js` — Firebase API 키 (관리자)
- `CREDENTIALS.md` — 데모 계정 비밀번호
- `*.code-workspace` — IDE 설정

---

## 참고 문서
- `PROJECT-STATUS.md` — 전체 진행도 + Phase별 체크리스트
- `CHANGELOG.md` — Phase별 변경 이력
- `PRODUCT-AUDIT.md` — 제품 데이터 검토 보고서
- `CLAUDE.md` — 코드 작업 지침
- `DESIGN-SYSTEM.md` — 디자인 토큰 레퍼런스
