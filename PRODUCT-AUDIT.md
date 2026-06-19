# SOMNIA 제품 데이터 통일 검토 보고서

> 검토일: 2026-06-19

---

## 1. 변경 이력

### 단품 변경
| 변경 | 변경 전 | 변경 후 |
|------|---------|---------|
| `wear` 분리 | 1개 (₩79,000) | `pajama` (₩59,000) + `socks` (₩19,000) |
| `mask` 이름 | 벨벳 수면 안대 | SOMNIA 수면 안대 |
| `oil` 상세 | SOMNIA_PRODUCTS 미등록 | 등록 완료 (features, spec, howto, bundles) |
| `pajama` 상세 | 없음 | 신규 등록 |
| `socks` 상세 | 없음 | 신규 등록 |

### 최종 단품 목록 (6개)
| ID | 카테고리 | 한글명 | 정가 | 회원가 (15%) | SOMNIA_PRODUCTS |
|-----|---------|--------|------|-------------|----------------|
| jelly | beauty | SOMNIA 드림 젤리 | ₩28,000 | ₩23,800 | O |
| oil | aroma | 라벤더 아로마 오일 | ₩34,000 | ₩28,900 | O |
| mask | gear | SOMNIA 수면 안대 | ₩39,000 | ₩33,150 | O |
| spray | aroma | 슬립 웰 아로마 룸 스프레이 | ₩34,000 | ₩28,900 | O |
| pajama | gear | 클라우드 슬립웨어 | ₩59,000 | ₩50,150 | O |
| socks | gear | 슬립 소프트 양말 | ₩19,000 | ₩16,150 | O |

### 기획세트 (4개)
| 세트명 | 구성 | 등록된 제품 bundles |
|--------|------|-------------------|
| Dream Jelly 3 Flavor Set | 젤리 3맛 | jelly |
| Deep Night Routine Set | spray + jelly + mask | jelly, spray, mask |
| Aroma Therapy Duo | oil + spray | oil, spray |
| Sleep Gear Trio | pajama + socks + mask | pajama, socks, mask |

---

## 2. 검토 결과

### 수정 완료 (3건)
- [x] spray 회원가 ₩29,000 → ₩28,900 (정확히 15% 할인)
- [x] spray bundles에 Aroma Therapy Duo 추가
- [x] jelly bundles에 Deep Night Routine Set 추가

### 현재 양호 (5건)
- [x] 제품 ID 6개 — i18n.js / products.js 1:1 대응 완벽
- [x] 가격 일관성 — 전 제품 정확히 15% 할인 적용
- [x] mask 이름 — "SOMNIA 수면 안대" 전체 통일 (i18n, products, 번들 설명)
- [x] `wear` ID 완전 제거 — grep 확인, 코드상 참조 없음
- [x] 번들 교차 참조 — 모든 기획세트가 구성 제품 모두에 등록됨

---

## 3. 추후 예상 문제 (Phase 6 진행 시)

### 3-1. 번들 구성 제품 ID 누락
- **현황:** 번들은 `name`/`desc` 텍스트만 존재. 구성 제품 ID 배열 없음
- **영향:** 관리자 페이지에서 번들 재고/가격을 관리하려면 구성 제품을 프로그래밍적으로 알아야 함
- **해결:** Phase 6b Firestore `bundles` 컬렉션에 `items: ['pajama','socks','mask']` 배열로 저장

### 3-2. 번들 장바구니 구조
- **현황:** cart는 `{id, qty}` 단품만 지원. 번들을 단독 아이템으로 담을 수 없음
- **영향:** 사용자가 "Sleep Gear Trio"를 한 번에 담으려면 cart 구조 확장 필요
- **해결:** Phase 6b에서 cart에 `type: 'product'|'bundle'` 구분 추가, 또는 번들 구매 시 구성 단품 3개를 자동으로 cart에 추가

### 3-3. 재고 이중 차감
- **시나리오:** 사용자가 mask 단품 + Sleep Gear Trio를 동시 주문 → mask 재고가 2번 차감되어야 함
- **해결:** `runTransaction`에서 각 item의 qty 합산 후 재고 차감

### 3-4. 주문 데이터 번들 구분
- **현황:** 주문 items에 `type` 필드 없음 → 관리자가 "이 주문이 세트 구매인지" 판단 불가
- **해결:** createOrder 시 items에 `bundleId` 또는 `type` 필드 추가

---

## 4. 멤버십 등급별 가격 정책

| 등급 | 포인트 | 적립 | 할인 | 적용 가격 |
|------|--------|------|------|-----------|
| Cloud | 0–999P | 1% | 0% | 정가 (`price`) |
| Pastel | 1,000–1,999P | 3% | 0% | 정가 (`price`) |
| Lavender | 2,000–3,499P | 5% | 15% | 회원가 (`member`) |
| Midnight | 3,500P+ | 8% | 15% | 회원가 (`member`) |

현재 앱은 Lavender 등급 기준으로 회원가를 표시. 등급별 차등 가격 UI는 미구현.

---

## 5. 빌드 검증

- **결과:** 성공 (955.45 KB, 4.06s)
- **에러:** 없음
