# SOMNIA 관리자 페이지 & 멤버십 가격 차등 — 종합 감사 보고서

> 작성일: 2026-06-24  
> 분석 대상: `assets/app/`, `assets/admin/`, `assets/app/firebase.js`  
> 방법론: 개발 코드 리뷰 + 실무 이커머스 어드민 표준 웹 리서치 병행

---

## 1. 멤버십 가격 차등 — 버그 분석

### 1-1. 현황 요약

| 항목 | 의도 | 실제 구현 |
|------|------|----------|
| 티어별 구매 가격 차등 | Cloud ~0%, Pastel ~5%, Lavender 15%, Midnight 20% | ❌ 모든 티어 동일 가격 (Lavender 고정) |
| 티어별 포인트 적립률 | 1% / 3% / 5% / 8% | ✅ 정상 구현 (`TIER_RATES`) |
| 현재 티어 판단 | Firebase 실 포인트 기반 동적 계산 | ❌ 하드코딩 `cur:true` (항상 Lavender) |

---

### 1-2. 버그 1 — 모든 회원이 동일 가격 (Lavender 고정) 🔴 HIGH

**문제**: `i18n.js`의 `member` 가격이 Lavender 티어 15% 할인값으로 하드코딩됨.

```
jelly:   28,000 → 23,800  (15.0% 할인) ← Lavender 기준
oil:     34,000 → 28,900  (15.0% 할인)
mask:    39,000 → 33,150  (15.0% 할인)
spray:   34,000 → 28,900  (15.0% 할인)
pajama:  59,000 → 50,150  (15.0% 할인)
socks:   19,000 → 16,150  (15.0% 할인)
```

**영향 코드 경로**:
```
screens-shop.jsx:325  subtotal  = ∑(product.price  × qty)   // 정가 합계
screens-shop.jsx:329  memberTotal = ∑(product.member × qty)  // 항상 동일
screens-shop.jsx:330  disc = subtotal - memberTotal           // 항상 Lavender 15% 할인
```

**Cloud 회원의 실제 흐름**:
- 설계 의도: 할인 없음 또는 소폭 할인 + 1% 적립
- 실제 동작: **15% 할인 + 1% 적립** → Cloud 회원이 Lavender 혜택을 무상 적용받음

---

### 1-3. 버그 2 — 현재 티어가 항상 Lavender 🔴 HIGH

**위치**: `i18n.js:250`
```js
{ key:'lavender', cur:true, ... }  // 영구적으로 고정
```

**문제**: 로그인한 실 사용자의 포인트(`users/{uid}.points`)를 읽어서 티어를 계산하는 로직이 없음.  
`app.jsx`에서 `SOMNIA_DATA.tiers`를 직접 참조하기 때문에 어떤 사용자든 항상 Lavender 등급으로 표시됨.

---

### 1-4. 버그 3 — Status Enum 불일치 🟡 MEDIUM

관리자 앱과 사용자 앱이 서로 다른 status 문자열을 사용함.

| 위치 | 값 |
|------|----|
| `admin/app.jsx:5` (관리자 저장) | `paid` / `ship` / `done` / `cancel` |
| `screens-shop.jsx:877` (앱 표시) | `paid` / `shipping` / `delivered` / `cancelled` |
| `firebase.js:92` (주문 생성) | `paid` (초기값만) |

**발생 시나리오**: 관리자가 `ship`으로 변경 → 앱 `STATUS_KEY`에 `ship` 키 없음 → 앱이 raw 문자열 `"ship"` 그대로 표시

**수정**: `admin/app.jsx:5` STATUSES 배열을 앱 기준에 맞춰 통일

```js
// 현재 (admin/app.jsx:5)
const STATUSES = ['paid','ship','done','cancel']

// 수정 후
const STATUSES = ['paid','shipping','delivered','cancelled']
const STATUS_LABEL = { paid:'결제완료', shipping:'배송중', delivered:'배송완료', cancelled:'취소' }
```

---

### 1-5. 가격 차등 구현 권장 방법

**Step 1**: `i18n.js`의 `tiers`에 할인율 필드 추가

```js
// i18n.js — tiers 배열
{ key:'cloud',    discountPct: 0,    ... },
{ key:'pastel',   discountPct: 0.05, ... },
{ key:'lavender', discountPct: 0.15, ... },
{ key:'midnight', discountPct: 0.20, ... },
```

**Step 2**: `screens-shop.jsx`에서 동적 계산

```js
// ScreenCart / ScreenCheckout 상단
const curTier = D.tiers.find(x=>x.cur) || D.tiers[0];
const memberPrice = (p) => Math.round(p.price * (1 - curTier.discountPct));

// 기존 p.member 참조를 memberPrice(p)로 교체
const memberTotal = productLines.reduce((a,c) => a + memberPrice(c.p) * c.q, 0);
```

**Step 3**: Firebase에서 실 포인트 읽어 티어 동적 결정 (`app.jsx`)

```js
// 로그인 후 users/{uid} 문서에서 points 읽기
const tierKey = getTierByPoints(userPoints); // cloud/pastel/lavender/midnight
// SOMNIA_DATA.tiers의 cur 플래그를 런타임에 설정
```

---

## 2. 관리자 페이지 — 현황 평가

### 2-1. 구현된 기능 (3개 탭)

| 탭 | 기능 | 평가 |
|----|------|------|
| 주문 관리 | 전체 주문 목록 조회, 상태 변경 드롭다운 | ✅ 기본 동작, Status enum 불일치 이슈 |
| 재고 관리 | 단품 6개 재고 조회 및 수정 | ✅ 정상 동작 |
| 기획세트 | 번들 CRUD (등록/수정/삭제) | ✅ 동작, 삭제 전 confirm 없음 |

### 2-2. 발견된 추가 버그

**버그 4 — 번들 재고가 주문 시 차감되지 않음** 🟡 MEDIUM

`firebase.js:83` `createOrder`의 트랜잭션은 개별 상품 재고(`products/{id}.stock`)만 감소시킴.  
번들 자체의 `bundles/{id}.stock`은 차감 로직이 없음.  
관리자 번들 탭에서 `stock`을 관리하지만 실제 주문과 연동되지 않음.

```js
// firebase.js:83 — 현재: 개별 상품만 차감
for (const it of items) {
  tx.update(pRef, { stock: stock - it.qty })  // ← bundle.stock 차감 없음
}
```

**버그 5 — LoginScreen `onLogin` 핸들러 공백** 🟢 LOW

`admin/app.jsx:240`:
```js
if (!user || user === 'denied') return <LoginScreen onLogin={() => {}} />
```
`onLogin`이 빈 함수. 로그인 성공 후 `onAuthStateChanged`가 자동으로 `setUser`를 트리거하므로 실제로는 작동하지만, 명시적 오류 처리가 없어 실패 시나리오에서 혼란 야기 가능.

---

### 2-3. 관리자 이메일 하드코딩 문제 🟡 MEDIUM

`firebase-admin.js:19`:
```js
export const ADMIN_EMAILS = ['admin@somnia.kr', 'jyty0807@somnia.kr']
```
관리자 추가/제거 시 코드 수정 + 재배포 필요. Firestore `admins` 컬렉션으로 외부화 권장.

---

## 3. 실무 이커머스 어드민 — 표준 기능 갭 분석

> 참고: 카페24, 고도몰, 스마트스토어, 사방넷 등 국내 이커머스 솔루션 기준 (평균 60~100개 기능 제공)

### 3-1. 우선순위별 미구현 기능

#### 🔴 즉시 구현 권장 (필수)

| # | 기능 | 이유 |
|---|------|------|
| 1 | **매출 대시보드** | 일/주/월 매출, 주문수, 객단가 한눈에 파악 |
| 2 | **상품 관리 (CRUD)** | 현재는 `i18n.js` 코드 수정만 가능 — 비기술 운영자 사용 불가 |
| 3 | **회원 목록 및 구매 이력** | 개별 고객의 주문 이력, 등급, 포인트 조회 |
| 4 | **쿠폰 관리** | 생성/발급 조건/사용 이력 — 현재 쿠폰은 앱에서 하드코딩 |
| 5 | **주문 검색 및 필터** | 날짜, 상태, 주문번호, 고객명으로 검색 |
| 6 | **송장 입력 및 배송 추적** | 현재 '배송중' 상태만 있고 송장번호 입력 기능 없음 |

#### 🟡 단기 구현 권장 (높음)

| # | 기능 | 이유 |
|---|------|------|
| 7 | **멤버십 등급 관리** | 회원별 포인트/등급 조회·수동 조정 |
| 8 | **포인트 발급/차감** | 이벤트, CS 보상, 오류 수동 보정 |
| 9 | **반품/환불 처리** | 현재 상태를 'cancelled'로만 바꿀 수 있음, 환불액 처리 로직 없음 |
| 10 | **상품 리뷰 관리** | 앱에 리뷰(★4.9 / 1,284) 표시는 하드코딩 — 실 리뷰 관리 불가 |
| 11 | **상품별 매출 분석** | 어떤 제품이 실제로 팔리는지 파악 |
| 12 | **권한 분리 (Role)** | 재고 담당/CS 담당/마케터 등 역할별 접근 제한 |

#### 🟢 중장기 구현 권장 (중간)

| # | 기능 | 설명 |
|---|------|------|
| 13 | 고객 세분화 (RFM) | 구매 빈도·금액·최근성 기반 그룹 분류 |
| 14 | 이메일/SMS 발송 | 주문 확인, 배송 알림, 마케팅 발송 |
| 15 | 자동 등급 갱신 | 월/분기별 구매액 기준 등급 자동 변경 |
| 16 | 생일 쿠폰 자동 발급 | Firebase Function + 스케줄 트리거 |
| 17 | 감사 로그 | 관리자 변경 이력 기록 |
| 18 | 외부 마켓 연동 | 스마트스토어 주문 동기화 |
| 19 | 배송사 API 연동 | CJ대한통운/로젠 송장 자동 생성 |
| 20 | 채널별 매출 비교 | 자사앱 vs 브로셔 vs 오프라인 비교 |

---

### 3-2. 기능 완성도 비교

```
현재 SOMNIA 어드민:  ███░░░░░░░░░░░░░░  ~18%
중소몰 평균 (카페24): ██████████████████  100%
MVP 최소 기준:       ██████████░░░░░░░░  ~55%
```

---

## 4. 수정 우선순위 요약

| 우선순위 | 항목 | 예상 공수 |
|---------|------|---------|
| 🔴 즉시 | Status enum 통일 (`admin/app.jsx` STATUSES 수정) | 5분 |
| 🔴 즉시 | 번들 삭제 전 confirm 추가 | 5분 |
| 🔴 단기 | 가격 차등 로직 구현 (tiers에 discountPct 추가) | 2~3시간 |
| 🔴 단기 | 주문 검색/날짜 필터 추가 | 2시간 |
| 🟡 단기 | 번들 재고 주문 시 차감 연동 | 1시간 |
| 🟡 단기 | 매출 대시보드 탭 추가 | 1일 |
| 🟡 중기 | 회원 관리 탭 (포인트, 등급, 구매이력) | 2일 |
| 🟡 중기 | 쿠폰 관리 탭 | 1일 |
| 🟢 장기 | 상품 관리 탭 (CRUD) | 2일 |
| 🟢 장기 | 리뷰 관리 탭 | 1일 |

---

## 5. 결론

SOMNIA 어드민은 **MVP 수준의 운영 기능**은 갖추고 있으나, 실무 이커머스 기준으로는 핵심 비즈니스 로직에 두 가지 중요한 결함이 있습니다:

1. **멤버십 가격 차등이 전혀 작동하지 않음** — 모든 회원이 Lavender 15% 할인을 받고 있어 브랜드가 의도한 등급 차별화 전략이 무의미한 상태
2. **주문 상태 데이터 불일치** — 관리자가 변경한 배송 상태가 앱에서 올바르게 표시되지 않음

이 두 가지를 먼저 수정한 뒤, 매출 대시보드 → 회원 관리 → 쿠폰 관리 순서로 기능을 확충하는 것을 권장합니다.
