# SOMNIA 작업 컨텍스트

> 새 대화에서 이 파일을 참고하여 이전 작업 상태를 이어받는다.
> 마지막 업데이트: 2026-06-19

---

## 프로젝트 개요

수면 라이프스타일 브랜드 **SOMNIA**의 모바일 앱 프로토타입 + 관리자 페이지.
- **기술 스택:** React 18 + Vite 6 + Firebase (Firestore + Auth)
- **GitHub:** https://github.com/jyty0807-blip/somnia-code
- **진행도:** 100% (Phase 1~8b 완료, 9부터 진행)

---

## 6월 19일 작업 요약

### 커밋 2건
| 커밋 | 내용 |
|------|------|
| `0bf041a` | CREDENTIALS.md gitignore 추가 |
| `c421be9` | Phase 6c~7 완료 (26 파일, +1,379/-164) |

### Phase 6c: 웹 상세페이지 개편
- 슬립 기어 듀오→트리오 (파일 리네임, 양말 탭 추가)
- 잠옷 사이즈 → 프리사이즈, 실크 수면안대 → 썸니아 수면안대

### Phase 6d: 관리자 로그인 디버깅
- 에러 코드 화면 노출, 계정 미존재 시 자동생성 fallback

### Phase 6e: 이미지 관리자 페이지
- `SOMNIA Image Manager.html` + `assets/imgmgr/` (55개 슬롯 관리)

### Phase 7: QA 버그 수정 7건
1. 주문 버튼 멈춤 → `doCheckout` 전체 try-catch
2. 배송지 미설정 → 커스텀 모달 (SOMNIA 디자인)
3. 취침준비 뒤로가기 → `.prep .bt-top` CSS + top:72px
4. 리포트 bell 아이콘 삭제
5. 전 상품 품절 → seedStock/refreshStock 체인 분리 + 빈 stockMap 방어
6. 장바구니 연타 → 재고 체크 + 확인 모달 필수
7. 로그인 실패 → Firebase v12+ `auth/invalid-credential` fallback

### 인프라
- **Firestore Security Rules 설정 완료** (products/bundles 읽기 허용, 로그인 시 쓰기)
- **Firestore 재고 시드 완료** (jelly:100, oil:50, mask:80, spray:50, pajama:30, socks:100)

---

## 다음 작업: Phase 9

### Phase 9: Vercel 배포
- [ ] 기획세트 쇼핑 앱 연동 (getBundles, 앱 번들 목록·상세·구매)
  - **결정사항: B. 구성 단품 재고 차감** — 번들 주문 시 items[]의 products 재고를 각각 차감
  - 단품 품절 시 해당 번들도 자동 품절
  - 기존 `createOrder`의 `runTransaction` 패턴 확장
- [ ] 멤버십 적립금 로직 (등급별 적립률, 주문 시 적립, Firestore 포인트)

### Phase 9: Vercel 배포
### Phase 10: index.html 최종 업데이트

---

## 주의사항 (이번 세션에서 배운 교훈)

### 버그 수정 시 근본 원인 먼저
- 코드 수정 전에 **콘솔 에러 → DB 연결 → 권한** 순서로 확인
- `.catch(()=>{})` 에러 삼킴 패턴 의심
- 증상 땜빵 (방어 로직, 값 덮어쓰기) 금지

### 워크플로우
- 구현 완료 → 코드+디자인 리뷰 에이전트 통과 → 사용자 승인 → /phase-approve
- 승인 전에 반드시 리뷰 에이전트 먼저 실행

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
| 세트명 | 구성 | items[] |
|--------|------|---------|
| Dream Jelly 3 Flavor Set | 젤리 3맛 | jelly |
| Deep Night Routine Set | spray + jelly + mask | jelly, spray, mask |
| Aroma Therapy Duo | oil + spray | oil, spray |
| Sleep Gear Trio | pajama + socks + mask | pajama, socks, mask |

---

## Firestore 데이터 모델

```
users/{uid}/addresses/{id}    — 배송지 CRUD
users/{uid}/orders/{id}       — 사용자별 주문 (앱에서 조회)
products/{productId}          — 재고 (seedStock 최초 1회 초기화, 주문 시 runTransaction 차감)
  └── stock: number
bundles/{bundleId}            — 기획세트 (관리자 CRUD, 앱에서 조회)
  ├── name, desc, items[], price, originalPrice, active
orders_all/{docId}            — 관리자 전체 주문 조회용 (dual write)
```

---

## 파일 구조 (주요 파일)

```
assets/app/
  main.jsx           — Vite 진입점
  app.jsx            — App 루트 (라우팅, 상태, stockMap, cartConfirm 모달)
  firebase.js        — Firebase SDK + CRUD (gitignored)
  i18n.js            — 다국어 (KO/EN) + SOMNIA_DATA + SOMNIA_PRICE
  products.js        — SOMNIA_PRODUCTS (상세정보) + SOMNIA_NOTICE
  screens-shop.jsx   — TabShop, ScreenProduct, ScreenCart, TabMy, ScreenAddress, ScreenAddressForm, ScreenOrders, ScreenLogin
  screens-sleep.jsx  — TabHome, TabReport, ScreenBedPrep, ScreenBedtime, ScreenSummary, ScreenRecord
  icons.jsx          — Ico 아이콘 맵
  app.css            — 앱 전체 스타일 (.modal-overlay, .modal-box 포함)

assets/admin/
  app.jsx            — AdminApp (로그인 + 주문/재고/번들 3탭)
  firebase-admin.js  — 관리자 Firebase CRUD (gitignored)
  admin.css          — 데스크톱 레이아웃
```

---

## 민감 파일 (gitignored)
- `assets/app/firebase.js` — Firebase API 키
- `assets/admin/firebase-admin.js` — Firebase API 키 (관리자)
- `CREDENTIALS.md` — 데모 계정 비밀번호

## 참고 문서
- `PROJECT-STATUS.md` — 전체 진행도 + Phase별 체크리스트
- `CHANGELOG.md` — Phase별 변경 이력
- `CLAUDE.md` — 코드 작업 지침 + 모듈 시스템 규칙
- `DESIGN-SYSTEM.md` — 디자인 토큰 레퍼런스
