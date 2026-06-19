# SOMNIA Changelog

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
