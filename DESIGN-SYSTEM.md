# SOMNIA Design System

수면 라이프스타일 브랜드. 고요하고 몽환적인 분위기. "Sleep Deeper, Live Better."

**핵심 규칙:** 모든 색상·타이포 변수는 `assets/tokens.css`가 단일 소스. 빌드 프로세스 없음 (`npx serve .`).

---

## Color Tokens

```css
/* Brand Core */
--somnia-ink:       #0E1A3A   /* 최심 네이비 — 다크 섹션, 헤딩 */
--somnia-navy:      #13294f   /* 미드 네이비 */
--somnia-ocean:     #1958B2   /* 프라이머리 블루 — 액센트, 버튼, 링크 */
--somnia-plum:      #4B2E83   /* 세컨더리 액센트 */
--somnia-lavender:  #B8A7E6   /* 소프트 액센트 (radial glow 등) */
--somnia-mist:      #D0E6FA   /* 파스텔 블루 — 밝은 서피스 */
--somnia-ivory:     #F6F2EA   /* 따뜻한 밝은 서피스 (기본 배경) */
--somnia-white:     #FFFFFF

/* Text */
--somnia-text:      #10182e   /* 본문 잉크 */
--somnia-text-soft: #44597d   /* 뮤트 본문 */

/* Night Ramp (다크 섹션 그라디언트용) */
--somnia-night-700: #164a93
--somnia-night-800: #123a73
--somnia-night-900: #0E1A3A
--somnia-night-950: #0a1430
```

### 배경 패턴

**라이트 페이지:** `background: var(--somnia-ivory)`

**다크 히어로/헤더:**
```css
background:
  radial-gradient(80% 120% at 85% -10%, rgba(184,167,230,.22), transparent 55%),
  linear-gradient(160deg, var(--somnia-night-800), var(--somnia-night-900) 60%, var(--somnia-night-950));
```

**다크 포스트 카드 내부:**
```css
background:
  radial-gradient(80% 70% at 50% 12%, rgba(184,167,230,.22), transparent 60%),
  linear-gradient(165deg, var(--somnia-night-800), var(--somnia-night-950));
```

**피드 타일 변형:**
- `.t-navy` — `linear-gradient(160deg, night-800, night-950)` + `color: #fff`
- `.t-ivory` — `var(--somnia-ivory)` + border + `color: var(--somnia-ink)`
- `.t-mist` — `var(--somnia-mist)` + `color: var(--somnia-ink)`

---

## Typography

### 서체 패밀리

| 변수 | 서체 | 용도 |
|------|------|------|
| `--somnia-en` | Outfit | 라틴 문자·숫자·UI 레이블 |
| `--somnia-kr` | Pretendard / Noto Sans KR | 한글 |
| `--somnia-font` | Outfit + Pretendard | 기본 혼용 |

> 한글은 같은 weight에서 더 무거워 보이므로 본문 한글은 영문 대비 1 단계 낮은 weight 사용.

### 웨이트

```css
--w-light:   300
--w-regular: 400
--w-medium:  500
--w-semibold:600
--w-bold:    700
```

### 타입 스케일 (fluid)

| 변수 | 크기 (min→max) | 용도 |
|------|----------------|------|
| `--fs-display` | clamp(3rem, 6vw, 4rem) | 48→64px — 히어로 / 커버 |
| `--fs-h1` | clamp(2.2rem, 4vw, 2.875rem) | 35→46px — 페이지 타이틀 |
| `--fs-h2` | clamp(1.7rem, 3vw, 2.375rem) | 27→38px — 섹션 타이틀 |
| `--fs-h3` | clamp(1.35rem, 2vw, 1.625rem) | 22→26px — 서브헤드 |
| `--fs-lead` | clamp(1.125rem, 1.6vw, 1.3125rem) | 18→21px — 리드 / 인트로 |
| `--fs-body` | 1.0625rem | 17px — 본문 |
| `--fs-sm` | 0.9375rem | 15px — 소형 |
| `--fs-caption` | 0.8125rem | 13px — 캡션 |
| `--fs-eyebrow` | 0.8125rem | 13px — 오버라인 레이블 |

### 행간 / 자간

```css
/* 행간 */
--lh-tight:  1.15   /* display */
--lh-snug:   1.32   /* heading */
--lh-body:   1.7    /* body / lead */

/* 자간 */
--ls-tight:  -0.02em   /* 대형 display */
--ls-snug:   -0.01em   /* heading */
--ls-eyebrow: 0.28em   /* 대문자 오버라인 */
```

---

## 공통 컴포넌트 패턴

### Eyebrow (오버라인 레이블)

```css
font-family: var(--somnia-en);
font-size: var(--fs-eyebrow);
font-weight: var(--w-semibold);
letter-spacing: var(--ls-eyebrow);
text-transform: uppercase;
color: var(--somnia-ocean);
```

### Masthead (페이지 헤더)

라이트 버전:
```css
border-bottom: 1px solid rgba(14,26,58,.14);
padding-bottom: 40px;
margin-bottom: 56px;
/* 안에: .eyebrow + h1 (--fs-display, --w-semibold) + p (--fs-lead, --w-light) */
```

다크 버전 (index.html 히어로):
```css
/* 다크 그라디언트 배경 적용, color: #fff */
/* eyebrow: color: var(--somnia-mist), opacity: .85 */
/* p: color: rgba(214,236,250,.82) */
```

### Sec-label (섹션 구분선)

```css
font-family: var(--somnia-en);
font-size: var(--fs-eyebrow);
font-weight: var(--w-semibold);
letter-spacing: var(--ls-eyebrow);
text-transform: uppercase;
color: var(--somnia-ocean);
padding-bottom: 16px;
margin-bottom: 28px;
border-bottom: 1px solid rgba(14,26,58,.12);
```

### Card (화이트 카드)

```css
background: var(--somnia-white);
border: 1px solid rgba(14,26,58,.08);
border-radius: 16px;
padding: 24px 24px 20px;
transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
/* hover: translateY(-4px), box-shadow 0 22px 44px -28px rgba(14,26,58,.45), border-color rgba(25,88,178,.35) */
```

### Badge (필 배지)

```css
font-family: var(--somnia-en);
font-size: 11px;
font-weight: var(--w-semibold);
letter-spacing: .12em;
text-transform: uppercase;
padding: 5px 10px;
border-radius: 999px;
```

| 클래스 | 배경 | 텍스트 |
|--------|------|--------|
| `.b-page` | `rgba(25,88,178,.12)` | `var(--somnia-ocean)` |
| `.b-tool` | `rgba(75,46,131,.12)` | `var(--somnia-plum)` |
| `.b-asset` | `rgba(14,26,58,.08)` | `var(--somnia-text-soft)` |
| `.b-system` | `rgba(184,167,230,.22)` | `#5a3fa0` |

### Social 포스트 포맷 (Social System)

| 클래스 | Aspect Ratio | 용도 |
|--------|------|------|
| `.fmt--1` | 1:1 | 피드 정방형 |
| `.fmt--2` | 4:5 | 피드 세로형 |
| `.fmt--3` | 9:16 | 스토리 / 릴스 |

---

## 파일 맵

| 파일 | 설명 |
|------|------|
| `index.html` | 작업물 목차 (다크 히어로 + 카드 그리드) |
| `SOMNIA.html` | 메인 랜딩 |
| `SOMNIA App.html` | 모바일 앱 프로토타입 (React/JSX) |
| `SOMNIA Type System.html` | 타이포그래피 레퍼런스 |
| `SOMNIA Social System.html` | 소셜 비주얼 시스템 |
| `SOMNIA Brochure.html` | 브로셔 에디터 |
| `SOMNIA Brochure Studio.html` | 브로셔 스튜디오 |
| `SOMNIA Card News.html` | 카드뉴스 |
| `SOMNIA Detail Studio.html` | 필로우 상세 스튜디오 |
| `SOMNIA Detail Studio - Aroma.html` | 아로마 상세 스튜디오 |
| `SOMNIA Detail Studio - Sleepwear.html` | 슬립웨어 상세 스튜디오 |
| `SOMNIA Product.html` | 상품 페이지 |
| `SOMNIA Aroma Duo.html` | 아로마 듀오 |
| `SOMNIA Sleep Gear Duo.html` | 슬립 기어 듀오 |
| `SOMNIA Jelly Mockup.html` | 젤리 목업 |
| `SOMNIA Label Studio.html` | 라벨 스튜디오 |
| `SOMNIA Card Export.html` | 카드 익스포트 |
| `assets/tokens.css` | **디자인 토큰 단일 소스** |
| `assets/image-slot.js` | 드래그앤드롭 이미지 웹 컴포넌트 (GIF 지원) |
| `assets/app/` | React 앱 (한/영 i18n) |
| `assets/detail/` | 필로우 Detail Studio JS/CSS |
| `assets/aroma-detail/` | 아로마 Detail Studio JS/CSS |
| `assets/sleepwear-detail/` | 슬립웨어 Detail Studio JS/CSS |
| `assets/brochure/` | 브로셔 에디터 + wordmark 전용 파일 |

**주의:** `assets/brochure/wordmark.png`(6,966B)와 `wordmark-white.png`(14,852B)는 루트 로고와 **다른 파일** — 삭제 금지.

---

## 언어 / i18n

- Outfit → 영문·숫자
- Pretendard → 한글
- `localStorage` 언어 토글 (KR / EN)
- 양국어 병기 시 한글은 weight 1단계 낮춰 시각적 균형 유지
