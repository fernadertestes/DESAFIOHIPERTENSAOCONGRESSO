# Desafio Pressão — Roadmap de Evolução

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement **one phase at a time**. Each phase below should become its own detailed plan before coding. Checkboxes track phase completion.

**Goal:** Tornar o jogo sustentável pra manutenção, sala de aula e melhoria pedagógica — sem reescrever o produto do zero.

**Architecture:** Manter SPA Vite + React + Three.js. Extrair o monólito `pressao-quest-completo.jsx` em módulos por responsabilidade; adicionar persistência local; cobrir scoring com testes; só depois analytics/TS.

**Tech Stack:** React 18, Vite 5, Three.js 0.184, Vitest (a introduzir), localStorage, deploy estático (Vercel).

**Global Constraints:**
- Idioma UI: pt-BR, tom teen/sala de aula
- Mobile-first: `maxWidth: 440` no shell principal
- Não quebrar fluxo dos 6 módulos + quiz final + ReportScreen/SmartReport
- Não adicionar backend nesta fase (sem API, sem auth)
- Commits pequenos e frequentes por task; não commit sem pedido explícito do humano se a sessão exigir aprovação
- Arquivo legado `pressao-quest-completo.jsx` só some depois que o build + smoke manual passarem

**Horizon:** ~4–6 semanas em ritmo part-time (1 fase / semana). Ajuste se deadline de FOA for mais curto — priorize **P1 → P0 → P2**.

---

## Mapa de fases

| Fase | Nome | Impacto | Esforço | Depende de |
|------|------|---------|---------|------------|
| P0 | Fundação (docs + toolchains) | Baixo UX / alto DX | S | — |
| P1 | Split do monólito | Alto DX / risco controlado | L | P0 parcial |
| P2 | Persistência local | Alto UX sala de aula | M | P1 ideal |
| P3 | Testes de scoring | Alto confiança | M | P1 |
| P4 | Analytics pedagógico anônimo | Médio produto | M | P2 |
| P5 | TypeScript nas regras de score | Médio DX longo prazo | L | P3 |

```
P0 (docs/vitest) ──► P1 (split) ──► P3 (testes)
                         │
                         └──► P2 (localStorage) ──► P4 (analytics)
                                      │
P3 ───────────────────────────────────┴──► P5 (TS scoring) [opcional]
```

---

## File structure alvo (pós-P1)

```
src/
  main.jsx                 # entry (já existe)
  App.jsx                  # shell: screen FSM + TopBar + ThreeBackground
  theme.js                 # const C, GLOBAL_CSS, MODULE_ART, MEDIA
  data/
    quizBank.js            # QUIZ_QUESTIONS_BANK + pickQuizQuestions
    family.js              # FAM_* + calcInheritedRisk + calcExplorerScore
    prevention.js          # PREVENTION_CHALLENGES, M3_PLAN_DECKS, ALLIES
    symptoms.js            # M4_SYMPTOMS
    scenarios.js           # M5_SCENARIOS_BANK
    actions.js             # M6_ACTIONS
    finalQuiz.js           # FINAL_QUIZ_BANK + pickFinalQuiz
  scoring/
    risk.js                # calcRisk, calcScore, getRiskProfile, RISK_PROFILES
    smartReport.js         # buildSmartReport + MODULE_REPORT + CATEGORY_ACTIONS
  ui/
    primitives.jsx         # Btn, Tag, ProgressBar, TopBar, …
    ModuleArt.jsx
    ThreeBackground.jsx
    SoundToggle.jsx
  modules/
    m1/… m2/… m3/… m4/… m5/… m6/
    quiz/…
    report/ReportScreen.jsx
    victory/VictoryScreen.jsx
  audio/sfx.js
  persistence/save.js      # P2
pressao-quest-completo.jsx # deletar só no fim de P1
```

---

## P0 — Fundação (docs + toolchain)

**Goal:** Qualquer pessoa (ou agente) sobe o projeto e sabe o que existe.

**Success:** `npm run dev` documentado; README real; Vitest instalado com 1 smoke test verde.

### Task P0.1: README real

**Files:**
- Modify: `README.md`
- Modify: `package.json` (scripts se faltar `test`)

- [ ] **Step 1:** Substituir `README.md` por conteúdo com: título Desafio Pressão, o que é, pré-req Node 18+, `npm i` / `npm run dev` / `npm run build` / `npm run preview`, estrutura de pastas atual, fluxo dos 6 módulos em 1 parágrafo, link do remote.
- [ ] **Step 2:** Confirmar `npm run build` ainda passa.
- [ ] **Step 3:** Commit: `docs: write real README for Desafio Pressão`

### Task P0.2: Vitest smoke

**Files:**
- Create: `vitest.config.js`
- Create: `src/scoring/risk.test.js` (pode temporariamente importar helpers ainda no monólito via extract mínimo, ou testar função pura copiada — preferir extrair `calcScore`/`calcRisk` só se trivial; senão smoke de `shuffle`/`pct` após P1)
- Modify: `package.json` — scripts `"test": "vitest run"`, `"test:watch": "vitest"`, deps `vitest`

**Minimal P0 smoke (sem split):**

```js
// src/smoke.test.js
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 1:** `npm i -D vitest` e adicionar scripts.
- [ ] **Step 2:** Criar `src/smoke.test.js` como acima.
- [ ] **Step 3:** `npm test` → PASS.
- [ ] **Step 4:** Commit: `chore: add vitest smoke test`

---

## P1 — Split do monólito

**Goal:** `pressao-quest-completo.jsx` deixa de ser o único arquivo editável; comportamento idêntico.

**Success:** `npm run build` + smoke manual home→M1→…→report sem regressão visual grave; bundle ainda carrega; DevPanel funciona.

**Strategy:** Extrair **de fora pra dentro** (data → scoring → ui → modules → App), mantendo `export default function PressaoQuest` como re-export até o fim.

### Task P1.1: Extrair `theme` + assets maps

**Files:**
- Create: `src/theme.js` — `C`, `MODULE_ART`, `MEDIA`, `GLOBAL_CSS`
- Modify: `pressao-quest-completo.jsx` — importar de `./src/theme.js` (ou mover entry e re-export)

- [ ] **Step 1:** Mover constantes sem lógica.
- [ ] **Step 2:** `npm run build` PASS.
- [ ] **Step 3:** Commit: `refactor: extract theme and media maps`

### Task P1.2: Extrair bancos de dados

**Files:**
- Create: `src/data/quizBank.js`, `family.js`, `prevention.js`, `symptoms.js`, `scenarios.js`, `actions.js`, `finalQuiz.js`
- Modify: monólito → imports

**Interfaces:**
- Produz: `QUIZ_QUESTIONS_BANK`, `pickQuizQuestions()`, `pickPreventionChallenges()`, `pickFinalQuiz()`, `FAM_*`, `M3_PLAN_DECKS`, `M4_SYMPTOMS`, `M5_SCENARIOS_BANK`, `M6_ACTIONS`, `ALLIES`

- [ ] **Step 1:** Mover um arquivo de data por vez; build após cada um.
- [ ] **Step 2:** Commit por banco ou um commit `refactor: extract game data banks`.

### Task P1.3: Extrair scoring

**Files:**
- Create: `src/scoring/risk.js` — `calcRisk`, `calcScore`, `getRiskProfile`, `RISK_PROFILES`, `LB_SEED`
- Create: `src/scoring/smartReport.js` — `buildSmartReport`, `MODULE_REPORT`, `CATEGORY_ACTIONS`, `CAT_TIPS`, `pct`, `levelColor`, `levelLabel`

- [ ] **Step 1:** Extrair funções puras sem JSX.
- [ ] **Step 2:** Build PASS.
- [ ] **Step 3:** Commit: `refactor: extract scoring and smart report`

### Task P1.4: Extrair UI primitives + Three + SFX

**Files:**
- Create: `src/ui/primitives.jsx`, `ModuleArt.jsx`, `ThreeBackground.jsx`, `SoundToggle.jsx`
- Create: `src/audio/sfx.js`

- [ ] **Step 1:** Mover componentes sem estado de jogo.
- [ ] **Step 2:** Build + abrir home (Three canvas presente).
- [ ] **Step 3:** Commit: `refactor: extract UI primitives and SFX`

### Task P1.5: Extrair módulos M1–M6 + quiz + report + victory

**Files:**
- Create: `src/modules/m1/*.jsx` … `m6/*.jsx`, `quiz/*.jsx`, `report/ReportScreen.jsx`, `victory/VictoryScreen.jsx`, `dev/DevPanel.jsx`
- Create: `src/App.jsx` — FSM `screen` + handlers atuais de `PressaoQuest`
- Modify: `src/main.jsx` → import `App`
- Modify: `pressao-quest-completo.jsx` → `export { default } from "./src/App.jsx"` (shim) **ou** deletar e apontar main só pra App

- [ ] **Step 1:** Extrair um módulo por commit (M1, M2, …).
- [ ] **Step 2:** Smoke manual DevPanel saltando cada módulo.
- [ ] **Step 3:** Remover shim do monólito quando `main.jsx` só usa `App`.
- [ ] **Step 4:** Commit final: `refactor: replace monolith with modular App`

**Gate P1:** não iniciar P2/P3 até smoke manual completo.

---

## P2 — Persistência local

**Goal:** Refresh / fechar aba não perde progresso no meio da aula.

**Success:** Após M3, F5 → volta na mesma `screen` com scores/nome; botão “Novo jogo” limpa save.

### Task P2.1: Schema + API

**Files:**
- Create: `src/persistence/save.js`

**Interfaces:**
```js
export const SAVE_KEY = "desafio-pressao-v1";

export function loadSave() // → null | SaveState
export function writeSave(state) // void
export function clearSave() // void

// SaveState shape (mínimo):
// {
//   version: 1,
//   screen: string,
//   playerName: string,
//   m1Answers, m1Questions, m1Score, m1Risk,
//   members, extraMembers, m2InheritedRisk,
//   m3Challenges, m3Responses, m3ChalIdx, m3UnlockedAllies, m3Combo,
//   m4Score, m4Perfect, m5Score, m6Score,
//   finalQuiz, quizScore, quizAnswers,
//   soundOn: boolean,
// }
```

- [ ] **Step 1:** Implementar load/write/clear com `try/catch` (quota / private mode → no-op).
- [ ] **Step 2:** Teste unitário: round-trip JSON (mock `localStorage` no Vitest).
- [ ] **Step 3:** Commit: `feat: add local save load/write helpers`

### Task P2.2: Wire no App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1:** `useState` inicializado via `loadSave()` quando `version===1`.
- [ ] **Step 2:** `useEffect` debounced (300ms) chama `writeSave` em mudanças de estado relevante.
- [ ] **Step 3:** `restart()` chama `clearSave()`.
- [ ] **Step 4:** UI home: botão “Continuar” se save existe; “Novo jogo” limpa.
- [ ] **Step 5:** Smoke: jogar até m3result → F5 → mesma tela.
- [ ] **Step 6:** Commit: `feat: persist game progress in localStorage`

---

## P3 — Testes de scoring

**Goal:** Regressões em SmartScore / M3 / M5 falham no CI local antes do jogador.

**Success:** `npm test` cobre casos tabela abaixo; ≥1 teste por domínio de score.

### Casos obrigatórios

| Função | Caso | Esperado |
|--------|------|----------|
| `calcRisk` | todas opts risco 0 | 0 |
| `calcScore` | todas opts pts máx | 0 (pior hábito) |
| `calcExplorerScore` | 0 membros | 0 |
| `buildSmartReport` | m1Risk=0, quiz 100%, m3/m4/m5/m6 máx | smartScore alto (≥85) |
| `buildSmartReport` | m1Risk=100, quiz 0, scores 0 | perfil “Começo de jornada” |
| M5 score logic | dano 0 | 60 |
| M5 | dano ≥60 | 0 |
| M4 | 5 certos 0 errados | 80 + perfect |
| M6 | 6 commits | 90 |

**Files:**
- Create: `src/scoring/risk.test.js`, `smartReport.test.js`
- Create: `src/modules/m4/score.test.js`, `m5/score.test.js`, `m6/score.test.js` (extrair helpers puros se scoring estiver inline no JSX)

- [ ] **Step 1:** Se lógica de M4/M5/M6 ainda inline no componente, extrair `computeM4Score(hits)`, `computeM5Score(damage)`, `computeM6Score(committedSize)` primeiro.
- [ ] **Step 2:** Escrever testes que falham → implementar/ajustar → PASS.
- [ ] **Step 3:** Commit: `test: cover core scoring and smart report`

---

## P4 — Analytics pedagógico anônimo

**Goal:** Saber quais perguntas/módulos mais erram — sem PII.

**Success:** Eventos disparados em quiz errado / módulo completo; opt-out; nada de nome do jogador nos payloads.

### Eventos mínimos

```js
{ type: "module_complete", module: "M3", score: number, ts: number }
{ type: "quiz_item", module: "Módulo 1", correct: boolean, qid: number }
{ type: "session_end", smartScore: number, profile: string }
```

**Files:**
- Create: `src/analytics/track.js` — buffer em memória + `localStorage` queue; stub `send()` no-op ou `navigator.sendBeacon` pra endpoint futuro
- Modify: App / QuizFinal / finish handlers

**Constraints:**
- Sem `playerName` no evento
- Flag `analyticsEnabled` default true + toggle em DevPanel ou Settings mínimo
- Sem dependência paga obrigatória (Plausible/GA opcional depois)

- [ ] **Step 1:** API `track(event)` + testes de que nome não vaza.
- [ ] **Step 2:** Instrumentar finishM1…finishQuiz + ReportScreen mount.
- [ ] **Step 3:** Commit: `feat: add anonymous learning analytics stubs`

---

## P5 — TypeScript nas regras de score (opcional)

**Goal:** Bancos e scoring tipados; UI pode continuar JSX.

**Success:** `src/scoring/*` e `src/data/*` em `.ts`; `tsc --noEmit` limpo; build Vite ok.

**Files:**
- Add: `tsconfig.json`, `typescript`, tipos `Question`, `PlanCard`, `SmartReport`
- Migrate: data + scoring first; modules depois se valer a pena

- [ ] **Step 1:** TS incremental (`allowJs: true`).
- [ ] **Step 2:** Tipar `buildSmartReport` e banks.
- [ ] **Step 3:** Commit: `refactor: type scoring and data banks`

---

## Fora de escopo (agora)

- Backend / login / multiplayer / leaderboard real (LB_SEED fica decorativo)
- App nativo / PWA completa (pode ser fase futura P6)
- Tradução EN
- Redesign visual total
- Conteúdo médico novo sem revisão humana

---

## Definition of Done por fase

Cada fase só marca `[x]` quando:
1. `npm run build` passa
2. `npm test` passa (a partir de P0.2)
3. Smoke manual do fluxo crítico (pelo menos home → M1 result → … ou DevPanel jumps)
4. README atualizado se a fase mudar como rodar o projeto

---

## Ordem de execução recomendada

1. **P0** agora (1–2h)
2. **P1** em fatias (maior risco — commits pequenos)
3. **P2** antes de qualquer demo em sala
4. **P3** logo após P1 (protege refactors)
5. **P4** se houver interesse em iterar conteúdo
6. **P5** só se o time for manter o projeto meses

**Atalho FOA / demo urgente:** P2 (persistência) + P0 (README) antes de P1 completo — aceitar dívida do monólito se deadline < 1 semana.

---

## Handoff

Plan saved to `docs/superpowers/plans/2026-07-27-desafio-pressao-roadmap.md`.

**Próximo passo:** escolher fase e abrir plan detalhado task-by-task (P0 ou P1).

**Execução:**
1. **Subagent-Driven** — um subagente por task, review entre tasks
2. **Inline** — executar nesta sessão com checkpoints

Qual fase começar?
