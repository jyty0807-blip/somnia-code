# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

**핵심 지침:** 기존 코드를 최소로 수정한다. 새 기능은 기존 구조·패턴·스타일에 맞춰 추가하고, 동작하는 코드를 리팩터링하지 않는다.

**토큰 절약:** 설명은 최소한으로. 코드 읽을 때 필요한 부분만 읽는다. 에이전트 남발 금지. 같은 파일 반복 읽기 금지. 작업 전 파일 전체를 읽지 말고, 수정할 부분만 확인한다.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Token Efficiency

**Minimize reads. Prefer diffs over full files.**

- Never re-read a file that was just edited or created.
- Use `git diff` instead of reading full files to review changes.
- Only inspect files directly related to the current task.
- Warn the user when the session appears to exceed ~100k tokens.

## 6. SOMNIA Project Rules

**새 페이지/파일 추가 시 반드시 함께 처리할 것:**

- `index.html` 브랜드 섹션에 카드 추가 (배지 타입: Page / Tool / Asset / System)
- 카드 내용: 이름, 한글 설명, 한 줄 desc, 파일명
- 산출물 수(`<b>N</b> 산출물`) 업데이트
- 기존 페이지에서 해당 페이지로 진입하는 링크가 있다면 함께 연결

**`assets/app/` React 앱 모듈 규칙:**

앱은 Vite 6 + ES 모듈 빌드 기반이다. 파일 간 공유 값은 `import/export`로 전달한다.
새 파일을 추가할 때는 해당 파일에서 `export`하고, 사용하는 파일에서 `import`한다.

| 모듈 | 정의 파일 | export 방식 |
|------|-----------|-------------|
| `SOMNIA_I18N` | `i18n.js` | named export |
| `SOMNIA_PRICE` | `i18n.js` | named export |
| `SOMNIA_DATA` | `i18n.js` | named export |
| `SOMNIA_PRODUCTS` | `products.js` | named export |
| `SOMNIA_NOTICE` | `products.js` | named export |
| `Ico` | `icons.jsx` | named export |
| `WheelCol` | `screens-sleep.jsx` | named export |
| `db`, `auth` + CRUD 함수 | `firebase.js` | named export |

**진입점:** `main.jsx` → Vite가 번들링.

- 새 모듈을 추가할 때는 이 표에 행을 추가한다.
- 순환 import에 주의할 것 (screens-sleep ↔ screens-shop 간 교차 import 금지).

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
