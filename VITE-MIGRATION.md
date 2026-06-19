# Vite 전환 기록

## 배경

기존: CDN Babel 빌드리스 방식 (`<script type="text/babel">` + `window.*` 전역)  
변경: Vite + ES 모듈 방식 (`import`/`export` + 빌드 번들링)

**이유:** 포트폴리오 배포 시 런타임 Babel 변환의 성능 문제, CDN 의존성, `text/babel` 비표준 인상 해소

---

## 변경 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `vite.config.js` | Vite 설정 (React 플러그인) |
| `assets/app/main.jsx` | 앱 진입점 (CSS import, ReactDOM.createRoot, 뷰포트 스케일링) |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `react`, `react-dom`, `vite`, `@vitejs/plugin-react` 의존성 추가. `serve` 제거 |
| `.gitignore` | `dist/` 추가 |
| `SOMNIA App.html` | CDN script 3개 + `<script type="text/babel">` 7개 제거 → `<script type="module">` 1개 |
| `assets/app/i18n.js` | `window.SOMNIA_I18N` → `export const SOMNIA_I18N` 등 |
| `assets/app/products.js` | `window.SOMNIA_PRODUCTS` → `export const SOMNIA_PRODUCTS` 등 |
| `assets/app/icons.jsx` | `import React` 추가, `window.Ico` → `export const Ico` |
| `assets/app/ios-frame.jsx` | `import React` 추가, 7개 컴포넌트 `export` 추가, `Object.assign(window, ...)` 제거 |
| `assets/app/screens-sleep.jsx` | import 추가, hook alias 제거 (`useStateS`→`useState`), 9개 함수 export, `window.SOMNIA_DATA` → `SOMNIA_DATA` |
| `assets/app/screens-shop.jsx` | import 추가, hook alias 제거 (`useStateH`→`useState`), 이미지 import 전환, 8개 함수 export |
| `assets/app/app.jsx` | 모든 의존성 import 추가, `export function App`, 렌더링 코드를 `main.jsx`로 분리 |

---

## 의존성 그래프 (전환 후)

```
main.jsx (진입점)
├─ app.css → tokens.css
├─ image-slot.js (웹 컴포넌트)
└─ app.jsx
    ├─ icons.jsx
    ├─ i18n.js
    ├─ ios-frame.jsx
    ├─ screens-sleep.jsx
    │   ├─ icons.jsx
    │   └─ i18n.js
    └─ screens-shop.jsx
        ├─ icons.jsx
        ├─ i18n.js
        ├─ products.js
        ├─ screens-sleep.jsx (WheelCol)
        └─ 이미지 7개 (import)
```

순환 의존: 없음

---

## 이미지 처리

string path → Vite import으로 전환. 빌드 시 content hash 파일명 생성.

| 원본 경로 | import 변수 |
|-----------|------------|
| `assets/logo-full-white.png` | `logoFullWhite` |
| `assets/app/detail/jelly-detail-1.png` | `jellyDetail1` |
| `assets/app/detail/jelly-detail-2.gif` | `jellyDetail2` |
| `assets/app/detail/jelly-detail-3.gif` | `jellyDetail3` |
| `assets/app/detail/jelly-detail-4.png` | `jellyDetail4` |
| `assets/app/detail/mask-detail-1.gif` | `maskDetail1` |
| `assets/app/detail/mask-detail-2.png` | `maskDetail2` |

CSS 내 `url('onb-bg.jpg')` — Vite가 자동 처리.

---

## 빌드 결과

```
dist/
├─ SOMNIA App.html        (0.5 KB)
└─ assets/
    ├─ app-*.js            (245 KB, gzip 77 KB)
    ├─ app-*.css           (32 KB, gzip 7 KB)
    └─ 이미지 8개          (해시 파일명)
```

---

## 사용 방법

```bash
npm install          # 최초 1회
npm run dev          # 개발 서버 → http://localhost:5173/SOMNIA%20App.html
npm run build        # 프로덕션 빌드 → dist/
npm run preview      # 빌드 결과 미리보기
```

---

## 영향 범위

- `index.html` (디자인 시스템 쇼케이스): **변경 없음**
- 기타 정적 HTML 페이지: **변경 없음**
- React 앱 기능/UI: **동일** (모듈 방식만 변경)
