# SOMNIA Changelog

## Phase 7: QA 버그 수정 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/app.jsx` | seedStock/refreshStock 체인 분리, 장바구니 재고 체크 + 확인 모달, SOMNIA_DATA import |
| `assets/app/screens-shop.jsx` | doCheckout try-catch 전체 감싸기, 배송지 커스텀 모달, 로그인 Firebase v12+ 대응 |
| `assets/app/screens-sleep.jsx` | TabReport bell 아이콘 삭제 |
| `assets/app/app.css` | .prep .bt-top CSS (top:72px, z-index:10), .modal-overlay/.modal-box 스타일 |
| `assets/app/firebase.js` | seedStock 강제 리셋 (매 로드 시 재고 초기화) |
| `assets/app/i18n.js` | 모달 관련 i18n 키 추가 (cart_confirm_title, cancel 등) |

### 수정 이슈
- 주문 버튼 "주문 처리 중..." 멈춤 → try-catch 전체 감싸기
- 배송지 미설정 시 토스트 → SOMNIA 디자인 커스텀 모달
- 취침준비 뒤로가기 버튼 CSS 누락 → .prep .bt-top 추가 + 위치 조정
- 리포트 탭 기능 없는 bell 아이콘 → 삭제
- 전 상품 품절 (stockMap 로드 실패) → 체인 분리 + 빈 stockMap 방어
- 장바구니 연타 무제한 담기 → 재고 체크 + 확인 모달 필수
- 로그인 실패 (Firebase v12 에러코드 변경) → auth/invalid-credential fallback

---

## Phase 6b: 관리자 페이지 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `SOMNIA Admin.html` | 관리자 페이지 진입점 (tokens.css 로드) |
| `assets/admin/main.jsx` | Vite 진입점 |
| `assets/admin/app.jsx` | 관리자 앱 — 로그인 + 3탭 (주문/재고/번들), 모달 CRUD |
| `assets/admin/firebase-admin.js` | 관리자 Firebase CRUD (gitignored) |
| `assets/admin/firebase-admin.js.example` | API 키 없는 템플릿 |
| `assets/admin/admin.css` | SOMNIA 디자인 토큰 기반 데스크톱 레이아웃 |
| `vite.config.js` | 멀티페이지 빌드 (admin 추가) |
| `index.html` | Admin 카드 추가, 산출물 19→20 |
| `.gitignore` | firebase-admin.js 제외 추가 |
| `CLAUDE.md` | 관리자 모듈 테이블 추가 |

### 리뷰 수정사항
- `ADMIN_EMAIL` 하드코딩 중복 → firebase-admin.js에서 export, app.jsx에서 import
- 테이블 인라인 스타일 → `.tbl__strong`, `.tbl__code`, `.tbl__sm` CSS 클래스로 전환

---

## Phase 6a: 앱 재고 연동 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/firebase.js` | `seedStock()`, `getStockMap()` 추가, `createOrder` → `runTransaction` (재고 차감 + `orders_all` dual write) |
| `assets/app/app.jsx` | `stockMap` state 추가, seedStock/getStockMap 초기화, TabShop/ScreenProduct/ScreenCart에 prop 전달, 주문 후 refreshStock |
| `assets/app/screens-shop.jsx` | TabShop 품절 배지, ScreenProduct 구매 버튼 차단, ScreenCart 재고 부족 체크 + 결제 차단 |
| `assets/app/i18n.js` | `sold_out`, `stock_insufficient` 키 추가 (KO/EN) |
| `assets/app/app.css` | `.prod--oos`, `.prod__oos-badge`, `.btn--disabled` 스타일 추가 |

### 리뷰 수정사항
- 품절 배지 배경색 `rgba(0,0,0,.55)` → `rgba(110,91,203,.85)` (라벤더 디자인 시스템 준수)
- `.btn--disabled` 하드코딩 색상 → `var(--surface2)/var(--faint)` 디자인 토큰 사용, 중복 속성 제거

---

## GitHub 배포 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `.gitignore` | `firebase.js`, `CREDENTIALS.md`, `*.code-workspace` 제외 추가 |
| `assets/app/firebase.js.example` | API 키 없는 템플릿 신규 생성 |
| `CREDENTIALS.md` | 데모 계정 비밀번호 로컬 전용 파일 (gitignored) |
| `PROJECT-STATUS.md` | 비밀번호 행 삭제 (공개 안전) |

---

## 제품 데이터 통일 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/i18n.js` | `wear` → `pajama`(₩59,000) + `socks`(₩19,000) 분리, `mask` 이름 "SOMNIA 수면 안대"로 변경, spray 회원가 ₩29,000→₩28,900 수정 |
| `assets/app/products.js` | `oil`, `pajama`, `socks` 상세정보 신규 등록, 번들 교차참조 완성 (spray에 Aroma Duo, jelly에 Deep Night), "실크 안대"→"SOMNIA 수면 안대" 전체 통일, Sleep Gear Trio 번들 추가 |
| `PRODUCT-AUDIT.md` | 제품 데이터 검토 보고서 생성 |

### 검토 수정사항
- spray 회원가 15% 할인 정확도 수정 (₩29,000→₩28,900)
- spray bundles에 Aroma Therapy Duo 누락 추가
- jelly bundles에 Deep Night Routine Set 누락 추가

---

## Phase 5: 주문 내역 화면 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/firebase.js` | `getOrders(uid)` 함수 추가 (createdAt desc 정렬) |
| `assets/app/i18n.js` | `ord_title`, `ord_empty`, `ord_paid/ship/done/cancel`, `ord_items`, `ord_num` 키 추가 + `formatDate()` 유틸 함수 추가 |
| `assets/app/screens-shop.jsx` | `ScreenOrders` 컴포넌트 추가, MY 탭 주문 내역 연결, `emptyStyle` 상위 이동, P2 중복 제거 |
| `assets/app/app.jsx` | `ScreenOrders` import + `orders` 오버레이 라우팅 |
| `assets/app/app.css` | `.badge`, `.badge--info/warn/ok/dim` 스타일 추가 |

### 리뷰 수정사항
- 카드 내부 여백 8px grid 준수 (marginBottom 8→12, 6→8)
- `.badge` CSS DESIGN-SYSTEM 토큰 준수 (padding 5px, letter-spacing .12em, uppercase)
- P2 단축명 ScreenOrders 내부 중복 제거 (파일 전역 사용)
- line-height 1.4 추가, 상품수/금액 좌우 분리 (flex space-between)
- 날짜 포맷 `formatDate()` 유틸 함수화 (i18n.js)

---

## Phase 4: 주문 기능 상세화 — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/firebase.js` | `getDefaultAddress()`, `createOrder()` 함수 추가 |
| `assets/app/i18n.js` | `cart_no_addr`, `cart_ordering` 키 추가 (KO/EN) |
| `assets/app/screens-shop.jsx` | `ScreenCart` — Firestore 주문 저장, 배송지 미등록 체크, 결제 로딩 상태 |
| `assets/app/app.jsx` | `ScreenCart`에 `uid`, `go`, `showToast` prop 전달 |
| `assets/app/app.css` | `.btn:disabled` 스타일 추가 |

### 리뷰 수정사항
- `.btn:disabled` CSS 추가 (opacity, cursor, pointer-events)
- `alert()` → `showToast()` 통일
- 영문 `cart_ordering`: `'Processing…'` → `'Placing order…'`

---

## Phase 3: 주소 관리 CRUD — 2026-06-19

### 변경 파일
| 파일 | 변경 내용 |
|------|-----------|
| `assets/app/firebase.js` | `getAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, `clearDefault` 추가 |
| `assets/app/i18n.js` | 주소 폼 관련 13개 키 추가 (KO/EN) |
| `assets/app/screens-shop.jsx` | `ScreenAddress` Firestore 연동 개편, `ScreenAddressForm` 신규 추가 |
| `assets/app/app.jsx` | `ScreenAddressForm` import, `addressForm` 오버레이 라우팅 |
| `CLAUDE.md` | 모듈 시스템 문서 갱신 (CDN Babel → Vite ES 모듈) |

### 리뷰 수정사항
- 인라인 스타일 중복 제거 (`addrLabelStyle`, `addrInputStyle`, `emptyStyle` 상수 추출)
- CSS 변수 수정 (`--line` → `--border`, `--bg` → `--surface`)
- `uid` 가드 추가 (`save()`, `reload()`)
