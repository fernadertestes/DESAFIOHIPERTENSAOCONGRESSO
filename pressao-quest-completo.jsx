import { Component, useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  MODULE_MAX_POINTS,
  calculateActionScore,
  calculateAlertScore,
  calculateDecisionScore,
  calculateFamilyExplorerScore,
  calculateHabitRisk,
  calculateHabitScore,
  calculateLearningScore,
  calculatePreventionPerformance,
  calculateScenarioProgress,
  createPreventionSubmission,
  toPercent,
} from "./src/scoring.js";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
const C = {
  bg:"#07090f",surface:"#0d1320",card:"#111827",border:"#1a2540",borderHi:"#2a3a5a",
  red:"#ff4d6d",redL:"#ff7590",orange:"#ff9d5c",yellow:"#ffd166",
  green:"#00f5a0",teal:"#00c9ff",purple:"#a855f7",amber:"#f59e0b",
  navy:"#60a5fa",white:"#f0f4ff",gray:"#a7b3c6",grayDk:"#8d9bb0",grayLt:"#cbd5e1",
};

const APP_VERSION = "1.5.0";

const MODULE_ART = {
  1: "/modules/m1-quiz-risco.webp",
  2: "/modules/m2-familia.webp",
  3: "/modules/m3-prevencao.webp",
  4: "/modules/m4-sintomas.webp",
  5: "/modules/m5-consequencias.webp",
  6: "/modules/m6-como-ajudar.webp",
};

const MEDIA = {
  cover: "/media/capa-desafio-hipertensao.webp",
  trophyStill: "/media/trophy-still.webp",
  trophyVideo: "/media/trophy-victory.mp4",
};

function ModuleArt({ mod, size = 120, color, style }) {
  const original = MODULE_ART[mod];
  const src = size <= 96 ? original?.replace("/modules/","/modules/thumbs/").replace(".webp",".jpg") : original;
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading={size<=96?"lazy":"eager"}
      decoding="async"
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: Math.max(10, size * 0.12),
        display: "block",
        boxShadow: color ? `0 0 28px ${color}44` : "none",
        ...style,
      }}
    />
  );
}

const GLOBAL_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#07090f;min-height:100%;overscroll-behavior-y:none}
  body{min-width:320px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
  @keyframes hb{0%,100%{transform:scale(1)}14%{transform:scale(1.12)}28%{transform:scale(1)}42%{transform:scale(1.07)}56%{transform:scale(1)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
  @keyframes burst{0%{transform:scale(0);opacity:1}100%{transform:scale(3);opacity:0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes ripple{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:0}}
  @keyframes screenEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes neonSweep{0%{transform:translateX(-120%) skewX(-18deg)}100%{transform:translateX(220%) skewX(-18deg)}}
  @keyframes auraPulse{0%,100%{opacity:.38;transform:scale(.96)}50%{opacity:.8;transform:scale(1.04)}}
  @keyframes correctPop{0%{transform:scale(.98)}45%{transform:scale(1.035)}100%{transform:scale(1)}}
  @keyframes wrongBuzz{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  @keyframes unlockGlow{0%{opacity:0;transform:scale(.9) rotate(-2deg)}55%{opacity:1;transform:scale(1.04) rotate(1deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
  @keyframes badgeFlip{0%{opacity:0;transform:rotateY(80deg) scale(.8)}100%{opacity:1;transform:rotateY(0) scale(1)}}
  @keyframes beatLine{0%{transform:translateX(-10%)}100%{transform:translateX(110%)}}
  @keyframes trophyIn{0%{transform:scale(0) rotate(-15deg);opacity:0}55%{transform:scale(1.25) rotate(6deg);opacity:1}75%{transform:scale(0.93) rotate(-3deg)}100%{transform:scale(1) rotate(0)}}
  @keyframes trophyGlow{0%,100%{filter:drop-shadow(0 0 12px #ffd166) drop-shadow(0 0 30px #ffd16660)}50%{filter:drop-shadow(0 0 24px #ffd166) drop-shadow(0 0 60px #ffd16699)}}
  @keyframes confettiFall{0%{transform:translateY(-30px) rotate(0deg) scale(1);opacity:1}85%{opacity:.8}100%{transform:translateY(110vh) rotate(800deg) scale(.5);opacity:0}}
  @keyframes starPop{0%{transform:scale(0) rotate(0deg);opacity:0}60%{transform:scale(1.3) rotate(180deg);opacity:1}100%{transform:scale(1) rotate(360deg);opacity:1}}
  @keyframes celebPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
  @keyframes textReveal{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
  button{transition:all .18s cubic-bezier(.4,0,.2,1);cursor:pointer}
  button,input,textarea{min-height:44px}
  button:active{transform:scale(.97)!important}
  button:focus-visible,input:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid ${C.teal};outline-offset:3px}
  input,textarea{transition:border-color .2s}
  .sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
  .skip-link{position:fixed;left:12px;top:12px;z-index:10000;padding:10px 14px;background:#fff;color:#000;border-radius:8px;transform:translateY(-180%)}
  .skip-link:focus{transform:translateY(0)}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${C.borderHi};border-radius:99px}
  @media (prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}
    canvas{display:none!important}
    .motion-video{display:none!important}
  }
  @media (max-width:360px){
    button{letter-spacing:0!important}
  }
  .print-letterhead,.print-page-footer,.print-congress-summary{display:none}
  @media print{
    @page{size:A4 portrait;margin:13mm 13mm 16mm}
    html,body,#root{width:100%!important;min-width:0!important;background:#fff!important;color:#000!important}
    body{font-family:"Palatino Linotype","Book Antiqua",Palatino,serif!important;font-size:9pt;line-height:1.38}
    .no-print{display:none!important}
    canvas{display:none!important}
    body *{visibility:hidden}
    [data-report],[data-report] *{visibility:visible}
    [data-report]{
      position:static!important;top:auto!important;left:auto!important;width:100%!important;
      padding:0!important;gap:0!important;animation:none!important;background:#fff!important;color:#000!important;
      -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;
    }
    [data-report]::before{
      content:"DESAFIO HIPERTENSÃO";position:fixed;left:50%;top:52%;z-index:-1;
      transform:translate(-50%,-50%) rotate(-35deg);font:700 34pt/1 Georgia,serif;
      letter-spacing:4pt;white-space:nowrap;color:#f0f0f0!important;
    }
    [data-report],[data-report] *{
      color:#000!important;background-color:transparent!important;background-image:none!important;
      box-shadow:none!important;text-shadow:none!important;filter:grayscale(1)!important;
    }
    [data-report] p{orphans:3;widows:3}
    [data-report] > div:not(.print-letterhead):not(.no-print){
      margin:0 0 4.5mm!important;padding:3.5mm!important;border:1px solid #b7b7b7!important;
      border-radius:0!important;break-inside:avoid;page-break-inside:avoid;
    }
    [data-report] > div[style*="display: grid"],
    [data-report] > div[style*="display:grid"]{border:0!important;padding:0!important}
    [data-report] [style*="border-radius"]{border-radius:0!important}
    [data-report] [style*="border-left"]{border-left:2px solid #222!important}
    [data-report] [style*="font-family"]{font-family:Georgia,"Times New Roman",serif!important;letter-spacing:.7pt!important}
    [data-report] .screen-report-header{display:none!important}
    [data-report] .print-letterhead{
      display:grid!important;grid-template-columns:17mm 1fr auto;align-items:center;gap:4mm;
      margin:0 0 6mm!important;padding:0 0 4mm!important;border:0!important;border-bottom:2px solid #111!important;
      break-inside:avoid;page-break-inside:avoid;
    }
    .print-letterhead__mark{
      display:flex!important;align-items:center;justify-content:center;width:17mm;height:17mm;
      border:1.5px solid #111!important;border-radius:50%!important;
    }
    .print-letterhead__mark svg{width:12mm;height:12mm;stroke:#000!important;fill:none!important;filter:none!important}
    .print-letterhead__brand{font:700 16pt/1 Georgia,"Times New Roman",serif!important;letter-spacing:1.8pt!important}
    .print-letterhead__subtitle{margin-top:1.5mm;font:600 7.5pt/1.2 Arial,sans-serif!important;letter-spacing:1.6pt!important;text-transform:uppercase}
    .print-letterhead__meta{text-align:right;font:400 7.5pt/1.45 Arial,sans-serif!important;color:#333!important}
    .print-letterhead__title{grid-column:1/-1;padding-top:4mm;border-top:1px solid #aaa!important}
    .print-letterhead__title h1{margin:0 0 1mm;font:700 16pt/1.1 Georgia,"Times New Roman",serif!important;letter-spacing:.3pt!important}
    .print-letterhead__title p{margin:0;font:700 8pt/1.3 Arial,sans-serif!important;letter-spacing:1.3pt!important;text-transform:uppercase}
    [data-report] .print-congress-summary{display:block!important;margin-bottom:5mm!important;text-align:center}
    [data-report] .print-congress-summary strong{display:block;font:700 22pt/1 Georgia,"Times New Roman",serif!important;margin-bottom:1.5mm}
    [data-report] .print-congress-summary span{font:700 8pt/1.3 Arial,sans-serif!important;letter-spacing:1pt!important;text-transform:uppercase}
    [data-report] .report-progress{height:5px!important;background:#fff!important;border:1px solid #222!important}
    [data-report] .report-progress__fill{background:#222!important;background-image:none!important}
    [data-report] .report-progress__marker{display:none!important}
    [data-report] .report-card{break-inside:avoid;page-break-inside:avoid}
    [data-report] .report-footer{border-top:2px solid #111!important;border-right:0!important;border-bottom:0!important;border-left:0!important;padding-top:4mm!important}
    [data-report] .report-footer::after{
      content:"DESAFIO HIPERTENSÃO · EDUCAÇÃO EM SAÚDE";display:block;margin-top:3mm;
      font:700 7pt/1 Arial,sans-serif!important;letter-spacing:1.4pt!important;
    }
    .print-page-footer{
      display:block!important;position:fixed;left:0;right:0;bottom:-11mm;padding-top:2mm;
      border-top:1px solid #777!important;text-align:center;font:700 6.5pt/1.2 Arial,sans-serif!important;
      letter-spacing:.5pt!important;background:#fff!important;color:#000!important;
    }
    .print-page-footer::after{content:""}
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1 — QUIZ DE RISCO PESSOAL
// ═══════════════════════════════════════════════════════════════════════════════
// Banco completo — 60 perguntas. A cada jogo, 10 são sorteadas.
export const QUIZ_QUESTIONS_BANK = [
  // ── Alimentação ──────────────────────────────────────────────────────────
  {id:1,cat:"🍔 Alimentação",q:"Com que frequência você come ultraprocessados?",sub:"(salgadinhos, fast food, macarrão instantâneo)",
   opts:[{t:"Raramente ou nunca",pts:0,risk:0},{t:"1–2x por semana",pts:10,risk:5},{t:"Quase todo dia",pts:20,risk:15},{t:"Todo dia, várias vezes",pts:30,risk:25}]},
  {id:11,cat:"🍔 Alimentação",q:"Você costuma pular o café da manhã antes da escola?",sub:"Pular o café da manhã não define sozinho o risco de hipertensão; observe a qualidade da alimentação ao longo do dia",
   opts:[{t:"Nunca, como todo dia",pts:0,risk:0},{t:"Às vezes pulo",pts:8,risk:4},{t:"Frequentemente pulo",pts:16,risk:10},{t:"Quase nunca como de manhã",pts:24,risk:16}]},
  {id:12,cat:"🍔 Alimentação",q:"Na cantina da escola, o que você costuma pedir?",sub:"Escolhas no intervalo impactam sua saúde",
   opts:[{t:"Frutas ou sanduíche natural",pts:0,risk:0},{t:"Misto quente ou lanche simples",pts:8,risk:4},{t:"Salgado frito ou coxinha",pts:18,risk:12},{t:"Chips, chocolate ou biscoito recheado",pts:26,risk:18}]},
  // ── Sal ──────────────────────────────────────────────────────────────────
  {id:2,cat:"🧂 Sal",q:"Como você usa o sal nas refeições?",sub:"Incluindo sal de mesa e temperos prontos",
   opts:[{t:"Nunca adiciono sal extra",pts:0,risk:0},{t:"Às vezes coloco um pouco",pts:8,risk:5},{t:"Sempre coloco antes de provar",pts:20,risk:12},{t:"Adoro comida bem salgada",pts:30,risk:20}]},
  {id:13,cat:"🧂 Sal",q:"Com que frequência você come Miojo ou macarrão instantâneo?",sub:"Macarrão instantâneo costuma concentrar muito sódio; confira o rótulo",
   opts:[{t:"Raramente ou nunca",pts:0,risk:0},{t:"1–2x por mês",pts:8,risk:5},{t:"1–2x por semana",pts:20,risk:14},{t:"Vários dias da semana",pts:30,risk:22}]},
  {id:14,cat:"🧂 Sal",q:"Você come salgadinhos de pacote com frequência?",sub:"Chips, Doritos e similares têm sódio oculto",
   opts:[{t:"Quase nunca",pts:0,risk:0},{t:"Só no final de semana",pts:8,risk:5},{t:"Várias vezes por semana",pts:18,risk:13},{t:"Todo dia",pts:28,risk:20}]},
  // ── Exercício ─────────────────────────────────────────────────────────────
  {id:3,cat:"🏃 Exercício",q:"Quantos dias por semana você faz atividade física?",sub:"(caminhada rápida, esporte, academia, dança...)",
   opts:[{t:"5 dias ou mais",pts:0,risk:0},{t:"3–4 dias",pts:5,risk:3},{t:"1–2 dias",pts:15,risk:10},{t:"Não faço atividade física",pts:25,risk:20}]},
  {id:15,cat:"🏃 Exercício",q:"Você participa ativamente das aulas de Educação Física?",sub:"EF na escola conta como atividade física!",
   opts:[{t:"Sim, jogo e me esforço sempre",pts:0,risk:0},{t:"Às vezes participo",pts:8,risk:5},{t:"Fico parado na maioria das aulas",pts:18,risk:12},{t:"Sempre fico de fora ou no celular",pts:26,risk:18}]},
  // ── Sono ──────────────────────────────────────────────────────────────────
  {id:4,cat:"😴 Sono",q:"Quantas horas você dorme por noite?",sub:"Para 13–18 anos, a recomendação geral é 8–10 horas de sono por noite",
   opts:[{t:"8–10 horas",pts:0,risk:0},{t:"7–8 horas",pts:5,risk:3},{t:"5–7 horas",pts:15,risk:12},{t:"Menos de 5 horas",pts:25,risk:20}]},
  {id:16,cat:"😴 Sono",q:"Você fica no celular depois de deitar para dormir?",sub:"Tela e estímulo perto da hora de dormir podem atrasar o sono e reduzir sua duração",
   opts:[{t:"Não, apago o celular antes de deitar",pts:0,risk:0},{t:"Fico uns 15 min só",pts:8,risk:5},{t:"Fico 1–2 horas deitado no celular",pts:18,risk:14},{t:"Fico até dormir, sem horário",pts:28,risk:22}]},
  {id:17,cat:"😴 Sono",q:"Como você se sente ao acordar para a escola?",sub:"Sono adequado faz parte de uma rotina que favorece a saúde cardiovascular",
   opts:[{t:"Descansado e pronto",pts:0,risk:0},{t:"Cansado, mas acordo bem",pts:6,risk:3},{t:"Precisando de muito mais sono",pts:16,risk:10},{t:"Exausto — durmo na aula às vezes",pts:26,risk:18}]},
  // ── Tela ──────────────────────────────────────────────────────────────────
  {id:5,cat:"📱 Tela",q:"Quantas horas parado usando telas por dia?",sub:"(celular, computador, TV — somando tudo)",
   opts:[{t:"Menos de 2 horas",pts:0,risk:0},{t:"2–4 horas",pts:8,risk:5},{t:"4–8 horas",pts:18,risk:12},{t:"Mais de 8 horas",pts:28,risk:18}]},
  {id:18,cat:"📱 Tela",q:"Quanto tempo você passa no TikTok, Instagram ou YouTube por dia?",sub:"Muito tempo sentado reduz o espaço para movimento, sono e outras rotinas saudáveis",
   opts:[{t:"Menos de 1 hora",pts:0,risk:0},{t:"1–3 horas",pts:10,risk:6},{t:"3–5 horas",pts:20,risk:14},{t:"Mais de 5 horas",pts:30,risk:20}]},
  // ── Estresse ──────────────────────────────────────────────────────────────
  {id:6,cat:"😤 Estresse",q:"Seu nível de estresse e ansiedade:",sub:"Estresse persistente pode elevar a pressão temporariamente e prejudicar hábitos de saúde",
   opts:[{t:"Tranquilo, raramente estresso",pts:0,risk:0},{t:"Estresso às vezes, passa logo",pts:8,risk:5},{t:"Estressado frequentemente",pts:20,risk:15},{t:"Ansiedade constante",pts:30,risk:22}]},
  {id:19,cat:"😤 Estresse",q:"Como provas, ENEM e trabalhos te afetam?",sub:"Estresse escolar persistente pode afetar sono, bem-estar e pressão arterial",
   opts:[{t:"Fico nervoso mas passa logo",pts:0,risk:0},{t:"Tenho insônia perto das provas",pts:10,risk:7},{t:"Fico ansioso por semanas",pts:20,risk:15},{t:"Ansiedade constante ao longo do ano",pts:30,risk:22}]},
  {id:20,cat:"😤 Estresse",q:"Você tem conflitos frequentes com amigos, família ou no relacionamento?",sub:"Conflitos relacionais são fonte de estresse crônico",
   opts:[{t:"Relacionamentos tranquilos em geral",pts:0,risk:0},{t:"Alguns conflitos, mas resolvo",pts:8,risk:5},{t:"Conflitos frequentes me afetam bastante",pts:20,risk:13},{t:"Ambiente muito difícil no dia a dia",pts:30,risk:22}]},
  // ── Peso ──────────────────────────────────────────────────────────────────
  {id:7,cat:"⚖️ Peso",q:"Algum profissional de saúde já conversou com você sobre acompanhar seu crescimento ou peso?",sub:"Em adolescentes, essa avaliação usa idade, sexo, curva de crescimento e contexto clínico — aparência não fecha diagnóstico",
   opts:[{t:"Não, ou disseram que está tudo bem",pts:0,risk:0},{t:"Não sei / prefiro não responder",pts:0,risk:0},{t:"Sim, recomendaram acompanhamento",pts:12,risk:8},{t:"Sim, já faço acompanhamento",pts:0,risk:0}]},
  {id:21,cat:"⚖️ Peso",q:"Você já deixou de participar de atividades físicas por causa do seu peso?",sub:"Vergonha do corpo pode afastar a pessoa do movimento; acolhimento e atividade prazerosa ajudam",
   opts:[{t:"Não, participo normalmente",pts:0,risk:0},{t:"Às vezes me sinto desconfortável mas vou",pts:8,risk:4},{t:"Frequentemente evito por causa disso",pts:20,risk:14},{t:"Sempre evito por causa do peso",pts:30,risk:22}]},
  // ── Família ───────────────────────────────────────────────────────────────
  {id:8,cat:"🧬 Família",q:"Alguém na sua família tem hipertensão?",sub:"Pai, mãe, avós, tios",
   opts:[{t:"Ninguém que eu saiba",pts:0,risk:0},{t:"Avós ou tios distantes",pts:10,risk:8},{t:"Pai ou mãe tem hipertensão",pts:20,risk:15},{t:"Pai E mãe têm hipertensão",pts:30,risk:25}]},
  {id:25,cat:"🧬 Família",q:"Você conhece o histórico de saúde dos seus avós?",sub:"Conhecer a história familiar é poder agir preventivamente",
   opts:[{t:"Sim, sei bem o histórico deles",pts:0,risk:0},{t:"Sei algumas coisas",pts:5,risk:3},{t:"Sei muito pouco",pts:12,risk:7},{t:"Não sei nada sobre isso",pts:18,risk:12}]},
  // ── Bebidas ───────────────────────────────────────────────────────────────
  {id:9,cat:"🥤 Bebidas",q:"Frequência de energéticos ou refrigerantes?",sub:"Energéticos podem elevar pressão e frequência cardíaca; bebidas açucaradas em excesso também prejudicam a saúde",
   opts:[{t:"Nunca ou raramente",pts:0,risk:0},{t:"Finais de semana",pts:8,risk:5},{t:"Várias vezes por semana",pts:18,risk:12},{t:"Todo dia",pts:28,risk:18}]},
  {id:22,cat:"🥤 Bebidas",q:"Com que frequência você toma energéticos (Monster, Red Bull)?",sub:"Energéticos com cafeína podem elevar temporariamente PA e frequência cardíaca",
   opts:[{t:"Nunca tomei",pts:0,risk:0},{t:"Raramente, em ocasiões especiais",pts:6,risk:3},{t:"Às vezes — antes de provas ou jogos",pts:18,risk:12},{t:"Regularmente, várias vezes por semana",pts:30,risk:22}]},
  {id:23,cat:"🥤 Bebidas",q:"Quanto refrigerante você consome por semana?",sub:"Refrigerantes açucarados em excesso favorecem ganho de peso e pior saúde cardiovascular",
   opts:[{t:"Quase nunca bebo",pts:0,risk:0},{t:"Só no final de semana",pts:8,risk:4},{t:"A maioria dos dias",pts:18,risk:12},{t:"Todo dia, como bebida principal",pts:28,risk:20}]},
  // ── Saúde ─────────────────────────────────────────────────────────────────
  {id:10,cat:"🩺 Saúde",q:"Você já mediu sua pressão arterial?",sub:"Hipertensão pode não causar sintomas; medir a pressão é a forma de detectá-la",
   opts:[{t:"Sim, regularmente — normal",pts:0,risk:0},{t:"Medi uma vez, estava normal",pts:5,risk:3},{t:"Nunca medi na vida",pts:15,risk:10},{t:"Sim, e já tive valores altos",pts:35,risk:30}]},
  {id:24,cat:"🩺 Saúde",q:"Você faz acompanhamento médico pelo menos 1x por ano?",sub:"A pressão deve ser aferida corretamente nas avaliações de saúde; alterações precisam ser confirmadas",
   opts:[{t:"Sim, vou ao médico todo ano",pts:0,risk:0},{t:"Só quando estou doente",pts:10,risk:6},{t:"Fui ao médico uma vez, faz tempo",pts:18,risk:12},{t:"Nunca fui com regularidade",pts:28,risk:20}]},
  {id:26,cat:"🍔 Alimentação",q:"Depois da escola, qual lanche aparece mais na sua rotina?",sub:"O lanche da tarde pode virar hábito de risco ou proteção",
   opts:[{t:"Fruta, iogurte ou comida de verdade",pts:0,risk:0},{t:"Pão ou lanche simples",pts:7,risk:4},{t:"Biscoito recheado ou salgadinho",pts:18,risk:12},{t:"Fast food ou fritura quase sempre",pts:28,risk:20}]},
  {id:27,cat:"🍔 Alimentação",q:"Quantas vezes por semana você come comida de fast food?",sub:"Hambúrguer, batata frita, pizza, nuggets e similares",
   opts:[{t:"Quase nunca",pts:0,risk:0},{t:"1 vez por semana",pts:8,risk:5},{t:"2–3 vezes por semana",pts:18,risk:13},{t:"4 vezes ou mais",pts:30,risk:22}]},
  {id:28,cat:"🧂 Sal",q:"Você costuma usar temperos prontos em casa?",sub:"Caldo em cubo, sachês e molhos prontos podem ter muito sódio",
   opts:[{t:"Quase nunca usamos",pts:0,risk:0},{t:"Às vezes",pts:8,risk:5},{t:"Na maioria das refeições",pts:18,risk:13},{t:"Sempre, em tudo",pts:28,risk:20}]},
  {id:29,cat:"🧂 Sal",q:"Você lê no rótulo se o alimento tem muito sódio?",sub:"Olhar o rótulo ajuda a escolher melhor",
   opts:[{t:"Sim, olho com frequência",pts:0,risk:0},{t:"Às vezes olho",pts:6,risk:3},{t:"Quase nunca olho",pts:14,risk:9},{t:"Nem sei onde ver isso",pts:22,risk:15}]},
  {id:30,cat:"🏃 Exercício",q:"No fim de semana, você costuma se movimentar?",sub:"Vale caminhada, dança, bike, futebol, vôlei ou qualquer esporte",
   opts:[{t:"Sim, quase sempre",pts:0,risk:0},{t:"Às vezes",pts:7,risk:4},{t:"Raramente",pts:16,risk:11},{t:"Fico parado quase o tempo todo",pts:25,risk:18}]},
  {id:31,cat:"🏃 Exercício",q:"Como você vai para a escola ou lugares próximos?",sub:"Pequenos deslocamentos também contam como movimento",
   opts:[{t:"Vou a pé ou de bicicleta quando dá",pts:0,risk:0},{t:"Misturo caminhada e transporte",pts:6,risk:3},{t:"Quase sempre vou sentado em transporte",pts:14,risk:9},{t:"Evito andar até distâncias curtas",pts:24,risk:17}]},
  {id:32,cat:"😴 Sono",q:"Seu horário de dormir muda muito entre semana e fim de semana?",sub:"Rotina irregular bagunça sono e estresse",
   opts:[{t:"Quase não muda",pts:0,risk:0},{t:"Muda 1–2 horas",pts:6,risk:4},{t:"Muda 3–4 horas",pts:16,risk:11},{t:"Viro a noite com frequência",pts:28,risk:21}]},
  {id:33,cat:"😴 Sono",q:"Você toma cafeína à noite?",sub:"Café, energético, refrigerante cola ou pré-treino",
   opts:[{t:"Não tomo à noite",pts:0,risk:0},{t:"Raramente",pts:6,risk:3},{t:"Algumas noites por semana",pts:16,risk:11},{t:"Quase toda noite",pts:26,risk:18}]},
  {id:34,cat:"📱 Tela",q:"Você faz pausas quando passa muito tempo sentado?",sub:"Levantar por poucos minutos já ajuda a quebrar o sedentarismo",
   opts:[{t:"Sim, levanto bastante",pts:0,risk:0},{t:"Às vezes lembro",pts:7,risk:4},{t:"Quase nunca lembro",pts:16,risk:11},{t:"Fico horas sem levantar",pts:26,risk:18}]},
  {id:35,cat:"📱 Tela",q:"Durante refeições, você costuma comer olhando tela?",sub:"Comer distraído pode aumentar quantidade e escolhas ruins",
   opts:[{t:"Quase nunca",pts:0,risk:0},{t:"Às vezes",pts:6,risk:3},{t:"Na maioria das refeições",pts:15,risk:10},{t:"Sempre como com tela",pts:24,risk:16}]},
  {id:36,cat:"😤 Estresse",q:"Quando você fica estressado, como costuma lidar?",sub:"Estratégias de alívio influenciam coração e pressão",
   opts:[{t:"Converso, respiro ou faço algo saudável",pts:0,risk:0},{t:"Ouço música ou tento descansar",pts:5,risk:3},{t:"Desconto em comida/tela",pts:16,risk:11},{t:"Guardo tudo e fico muito ansioso",pts:26,risk:19}]},
  {id:37,cat:"😤 Estresse",q:"Você sente pressão para dar conta de tudo?",sub:"Escola, futuro, família, aparência e redes sociais",
   opts:[{t:"Raramente",pts:0,risk:0},{t:"Às vezes",pts:7,risk:4},{t:"Frequentemente",pts:18,risk:13},{t:"Quase todos os dias",pts:28,risk:21}]},
  {id:38,cat:"⚖️ Peso",q:"Você percebe ganho de peso nos últimos meses?",sub:"Mudanças rápidas podem indicar rotina desregulada",
   opts:[{t:"Não, está estável",pts:0,risk:0},{t:"Pouco, sem grande mudança",pts:6,risk:4},{t:"Sim, ganhei um pouco",pts:16,risk:11},{t:"Ganhei bastante peso",pts:28,risk:20}]},
  {id:39,cat:"⚖️ Peso",q:"Como você se sente com fôlego em escadas ou jogos?",sub:"Fôlego baixo pode sinalizar sedentarismo e peso em excesso",
   opts:[{t:"Subo/jogo bem",pts:0,risk:0},{t:"Canso um pouco",pts:7,risk:4},{t:"Canso rápido",pts:17,risk:12},{t:"Evito porque fico sem ar",pts:28,risk:21}]},
  {id:40,cat:"🧬 Família",q:"Alguém da sua família teve AVC ou infarto cedo?",sub:"Homens antes de 55 anos ou mulheres antes de 65 anos",
   opts:[{t:"Não que eu saiba",pts:0,risk:0},{t:"Parente distante",pts:8,risk:5},{t:"Avô/avó ou tio/tia",pts:18,risk:13},{t:"Pai, mãe ou irmão/irmã",pts:30,risk:24}]},
  {id:41,cat:"🧬 Família",q:"Na sua casa, as pessoas falam sobre pressão alta e saúde?",sub:"Conversar ajuda a descobrir riscos escondidos",
   opts:[{t:"Sim, falamos e acompanhamos",pts:0,risk:0},{t:"Falamos às vezes",pts:5,risk:3},{t:"Quase nunca falamos",pts:12,risk:8},{t:"Ninguém sabe ou evita o assunto",pts:20,risk:14}]},
  {id:42,cat:"🥤 Bebidas",q:"O que você costuma beber nas refeições?",sub:"Trocar bebida açucarada por água faz diferença",
   opts:[{t:"Água na maioria das vezes",pts:0,risk:0},{t:"Suco natural às vezes",pts:6,risk:3},{t:"Refrigerante ou suco de caixinha",pts:18,risk:12},{t:"Bebida doce quase sempre",pts:28,risk:20}]},
  {id:43,cat:"🥤 Bebidas",q:"Você usa pré-treino ou estimulante para estudar/treinar?",sub:"Estimulantes podem subir pressão e batimentos",
   opts:[{t:"Nunca uso",pts:0,risk:0},{t:"Usei uma ou duas vezes",pts:8,risk:5},{t:"Uso em semanas puxadas",pts:20,risk:14},{t:"Uso com frequência",pts:32,risk:24}]},
  {id:44,cat:"🩺 Saúde",q:"Se você medisse pressão alta uma vez, o que faria?",sub:"A atitude certa evita susto e atraso",
   opts:[{t:"Repetiria e procuraria orientação",pts:0,risk:0},{t:"Avisaria alguém, mas sem pressa",pts:6,risk:4},{t:"Ignoraria se eu estivesse bem",pts:18,risk:13},{t:"Tomaria remédio de outra pessoa",pts:32,risk:24}]},
  {id:45,cat:"🩺 Saúde",q:"Você sabe onde medir pressão perto de casa?",sub:"UBS, farmácia e ações de saúde podem ajudar",
   opts:[{t:"Sim, sei exatamente onde",pts:0,risk:0},{t:"Tenho uma ideia",pts:5,risk:3},{t:"Não sei direito",pts:14,risk:9},{t:"Nunca pensei nisso",pts:22,risk:15}]},

  // ── Anabolizantes / estimulantes ─────────────────────────────────────────
  {id:46,cat:"💉 Anabolizantes",q:"Você já usou ou pensou em usar anabolizante para 'secar' ou ganhar músculo?",sub:"Anabolizantes podem elevar pressão e prejudicar coração/fígado",
   opts:[{t:"Nunca usei e não penso nisso",pts:0,risk:0},{t:"Já pensei, mas não usei",pts:8,risk:5},{t:"Usei poucas vezes",pts:24,risk:18},{t:"Uso ou usaria com frequência",pts:36,risk:30}]},
  {id:47,cat:"💉 Anabolizantes",q:"Alguém já te ofereceu anabolizante, 'bomba' ou ciclo sem receita?",sub:"Oferta informal é comum e perigosa na adolescência",
   opts:[{t:"Nunca me ofereceram",pts:0,risk:0},{t:"Já ouvi falar, mas recusei",pts:6,risk:3},{t:"Já fiquei em dúvida",pts:16,risk:12},{t:"Já aceitei ou quase aceitei",pts:30,risk:24}]},
  {id:48,cat:"💉 Anabolizantes",q:"O que você acha sobre usar anabolizante sem orientação médica?",sub:"O uso não médico pode elevar pressão e causar outros danos cardiovasculares",
   opts:[{t:"É perigoso e eu evito",pts:0,risk:0},{t:"Só usaria com médico",pts:6,risk:4},{t:"Se der resultado rápido, vale a pena",pts:22,risk:16},{t:"Todo mundo usa, não deve ser tão ruim",pts:34,risk:28}]},
  {id:49,cat:"💉 Anabolizantes",q:"Você usa ou usaria 'termogênico' / estimulante forte para emagrecer?",sub:"Muitos elevam batimentos e pressão arterial",
   opts:[{t:"Não uso esse tipo de produto",pts:0,risk:0},{t:"Usei 1–2 vezes",pts:10,risk:7},{t:"Uso em fases de dieta",pts:22,risk:16},{t:"Uso com frequência",pts:34,risk:26}]},
  {id:50,cat:"💉 Anabolizantes",q:"Se um amigo quiser começar anabolizante por conta própria, o que você faria?",sub:"Rede de apoio também protege saúde cardiovascular",
   opts:[{t:"Desencorajaria e sugeriria falar com profissional",pts:0,risk:0},{t:"Diria para pesquisar bem",pts:8,risk:5},{t:"Acharia normal e não interferiria",pts:18,risk:13},{t:"Ajudaria a conseguir ou usaria junto",pts:32,risk:25}]},
  // ── Mais hábitos / risco ─────────────────────────────────────────────────
  {id:51,cat:"🍔 Alimentação",q:"Com que frequência você come embutidos (salsicha, mortadela, bacon)?",sub:"Embutidos costumam ter muito sódio oculto",
   opts:[{t:"Raramente ou nunca",pts:0,risk:0},{t:"1–2x por semana",pts:8,risk:5},{t:"Quase todo dia",pts:20,risk:14},{t:"Várias vezes por dia",pts:30,risk:22}]},
  {id:52,cat:"🧂 Sal",q:"Você costuma pedir comida com 'mais sal' ou bem temperada de sal?",sub:"Preferência por alimentos muito salgados pode aumentar o consumo de sódio ao longo do tempo",
   opts:[{t:"Peço sem sal extra",pts:0,risk:0},{t:"Às vezes peço um pouco",pts:8,risk:5},{t:"Quase sempre peço mais sal",pts:20,risk:14},{t:"Sem sal extra a comida 'não tem gosto'",pts:30,risk:22}]},
  {id:53,cat:"🏃 Exercício",q:"Depois de treinar, você usa estimulante ou anabolizante 'pra recuperar'?",sub:"Recuperação não precisa de substância que sobe pressão",
   opts:[{t:"Não uso nada disso",pts:0,risk:0},{t:"Só proteína/comida normal",pts:4,risk:2},{t:"Já usei estimulante pós-treino",pts:18,risk:13},{t:"Uso estimulante/anabolizante com frequência",pts:34,risk:26}]},
  {id:54,cat:"😴 Sono",q:"Você usa remédio para dormir ou ficar acordado sem orientação?",sub:"Automedicação bagunça sono e pode afetar pressão",
   opts:[{t:"Não uso",pts:0,risk:0},{t:"Já usei uma vez",pts:8,risk:5},{t:"Uso em semanas de prova",pts:18,risk:13},{t:"Uso com frequência",pts:28,risk:20}]},
  {id:55,cat:"📱 Tela",q:"Quantas horas seguidas você fica no jogo/celular sem levantar?",sub:"Maratonas sentado somam sedentarismo",
   opts:[{t:"No máximo 1 hora",pts:0,risk:0},{t:"2–3 horas",pts:8,risk:5},{t:"4–5 horas",pts:18,risk:13},{t:"6 horas ou mais",pts:28,risk:20}]},
  {id:56,cat:"😤 Estresse",q:"Você já sentiu coração acelerado por ansiedade ou estimulante?",sub:"Palpitação + estimulante merece atenção",
   opts:[{t:"Raramente ou nunca",pts:0,risk:0},{t:"Às vezes, sem estimulante",pts:8,risk:5},{t:"Já, depois de energético/pré-treino",pts:20,risk:15},{t:"Acontece com frequência",pts:30,risk:22}]},
  {id:57,cat:"⚖️ Peso",q:"Você já fez dieta radical ou jejum extremo para emagrecer rápido?",sub:"Dietas extremas podem causar mal-estar e piorar a relação com alimentação e corpo",
   opts:[{t:"Não, evito extremos",pts:0,risk:0},{t:"Já tentei por poucos dias",pts:8,risk:5},{t:"Faço com alguma frequência",pts:18,risk:13},{t:"É meu padrão principal",pts:28,risk:20}]},
  {id:58,cat:"🧬 Família",q:"Alguém na família usa remédio contínuo para pressão?",sub:"Tratamento na família é uma pista importante para conversar sobre prevenção e acompanhamento",
   opts:[{t:"Não que eu saiba",pts:0,risk:0},{t:"Parente distante",pts:6,risk:4},{t:"Avô/avó ou tio/tia",pts:14,risk:10},{t:"Pai, mãe ou irmão/irmã",pts:24,risk:18}]},
  {id:59,cat:"🥤 Bebidas",q:"Você mistura energético com exercício intenso?",sub:"Cafeína + esforço pode elevar batimentos e pressão",
   opts:[{t:"Nunca",pts:0,risk:0},{t:"Já fiz uma ou duas vezes",pts:10,risk:7},{t:"Faço em treinos fortes",pts:22,risk:16},{t:"Faço quase sempre",pts:34,risk:26}]},
  {id:60,cat:"🩺 Saúde",q:"Se sua pressão der alta em uma medição, qual atitude faz mais sentido?",sub:"Uma medida isolada não fecha diagnóstico; o valor precisa ser confirmado do jeito certo",
   opts:[{t:"Contar para um adulto e buscar orientação",pts:0,risk:0},{t:"Repetir corretamente em outro momento",pts:4,risk:2},{t:"Ignorar porque não senti nada",pts:18,risk:12},{t:"Tomar o remédio de outra pessoa",pts:32,risk:24}]},

];

// Sorteia array sem mutar o original
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// Seleciona perguntas equilibradas entre as categorias do radar de hábitos.
function pickQuizQuestions(count=10){
  const byCat={};
  QUIZ_QUESTIONS_BANK.forEach(q=>{if(!byCat[q.cat])byCat[q.cat]=[];byCat[q.cat].push(q);});
  const cats=shuffle(Object.keys(byCat));
  const picked=[];
  cats.forEach(cat=>{const pool=shuffle(byCat[cat]);picked.push(pool[0]);});
  if(picked.length<count){
    const rest=shuffle(QUIZ_QUESTIONS_BANK.filter(q=>!picked.includes(q)));
    while(picked.length<count&&rest.length)picked.push(rest.shift());
  }
  return shuffle(picked).slice(0,count);
}

const RISK_PROFILES=[
  {min:0,max:15,title:"ROTINA PROTETORA",emoji:"🛡️",color:C.green,rank:"S",rankColor:"#ffd700",desc:"Boa! Suas respostas mostram vários hábitos que jogam a favor da sua saúde.",tip:"Segue nessa! E usa as próximas fases pra descobrir onde ainda dá pra evoluir."},
  {min:16,max:30,title:"BOA BASE",emoji:"⚔️",color:C.teal,rank:"A",rankColor:C.teal,desc:"Você tá com uma base boa. Tem só alguns pontos que dá pra ajustar.",tip:"Escolhe um hábito do jogo pra colocar em prática nesta semana."},
  {min:31,max:50,title:"PONTOS PRA AJUSTAR",emoji:"🎯",color:C.yellow,rank:"B",rankColor:C.yellow,desc:"Tem algumas escolhas do dia a dia pedindo mais atenção.",tip:"Dá uma olhada no que mais marcou pontos e escolhe uma mudança que caiba na sua rotina."},
  {min:51,max:70,title:"MISSÃO HÁBITOS",emoji:"🧭",color:C.orange,rank:"C",rankColor:C.orange,desc:"O jogo achou vários hábitos que ainda podem subir de nível.",tip:"Usa o relatório pra puxar esse papo com sua família ou com alguém da equipe de saúde."},
  {min:71,max:100,title:"HORA DE REORGANIZAR",emoji:"🧩",color:C.red,rank:"D",rankColor:C.red,desc:"Várias respostas mostraram hábitos que não estão jogando muito a favor da sua saúde.",tip:"Sem tentar mudar tudo de uma vez: escolhe um passo possível. E, se sua pressão já apareceu alta em alguma medida, vale conversar com um profissional de saúde."},
];

function getRiskProfile(r){return RISK_PROFILES.find(p=>r>=p.min&&r<=p.max)||RISK_PROFILES[0];}
// Índice educativo de hábitos: serve à no desafio e NÃO estima probabilidade clínica de hipertensão.
function calcRisk(ans,qs){return calculateHabitRisk(ans,qs||QUIZ_QUESTIONS_BANK);}
function calcScore(ans,qs){return calculateHabitScore(ans,qs||QUIZ_QUESTIONS_BANK);}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2 — MISSÃO FAMÍLIA
// ═══════════════════════════════════════════════════════════════════════════════
const FAM_FACTORS=[
  {id:"hypertension",label:"Hipertensão arterial",icon:"💉"},
  {id:"diabetes",label:"Diabetes mellitus",icon:"🩸"},
  {id:"dyslipidemia",label:"Colesterol alto",icon:"🫀"},
  {id:"smoking",label:"Fumante / ex-fumante",icon:"🚬"},
  {id:"obesity",label:"Obesidade",icon:"⚖️"},
  {id:"sedentary",label:"Pouca atividade física",icon:"🛋️"},
  {id:"heartAttack",label:"Infarto do miocárdio",icon:"💔"},
  {id:"stroke",label:"AVC / derrame",icon:"🧠"},
  {id:"heartFailure",label:"Insuf. cardíaca",icon:"🫁"},
  {id:"earlyCAD",label:"Doença cardiovascular precoce",icon:"⚡"},
  {id:"alcoholism",label:"Uso excessivo de álcool",icon:"🍺"},
  {id:"kidneyDisease",label:"Doença renal",icon:"🫘"},
];
const FAM_DEFS=[
  {id:"father",label:"Responsável ou figura parental 1",icon:"🧑",side:"direto"},
  {id:"mother",label:"Responsável ou figura parental 2",icon:"🧑",side:"direto"},
  {id:"grandpa",label:"Familiar mais velho 1",icon:"🧓",side:"paterno"},
  {id:"grandma",label:"Familiar mais velho 2",icon:"🧓",side:"materno"},
  {id:"brother",label:"Irmão, irmã ou familiar próximo 1",icon:"🧑",side:"direto"},
  {id:"sister",label:"Irmão, irmã ou familiar próximo 2",icon:"🧑",side:"direto"},
];
function classifyMember(factors){
  const count=(factors||[]).length;
  if(count===0)return{level:"sem_registro",color:C.grayDk,label:"Sem registro",score:0};
  if(count===1)return{level:"atencao",color:C.yellow,label:"1 antecedente",score:1};
  if(count===2)return{level:"atencao",color:C.orange,label:"2 antecedentes",score:2};
  return{level:"atencao",color:C.red,label:`${count} antecedentes`,score:count};
}
// Percentual descritivo: parentes mapeados com pelo menos um antecedente marcado.
// Não é risco genético, risco cardiovascular nem probabilidade de doença.
function calcFamilyAttentionIndex(members){
  const mapped=members.filter(m=>m.visited);
  if(!mapped.length)return 0;
  return Math.round((mapped.filter(m=>m.factors&&m.factors.length>0).length/mapped.length)*100);
}
function calcExplorerScore(members){return calculateFamilyExplorerScore(members);}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3 — BATALHA DA PREVENÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

// Desafios com perguntas abertas e palavras-chave aceitas
export const PREVENTION_CHALLENGES = [
  {
    id: 1,
    type: "open",
    icon: "🏃",
    category: "Exercício",
    categoryColor: C.green,
    question: "Como você evitaria pressão alta através da atividade física?",
    subtitle: "Conta aí: o que você faria no dia a dia pra se mexer mais?",
    hint: "Pense em frequência, tipo de exercício e quanto tempo...",
    keywords: ["exercício","exercício físico","atividade física","caminhar","caminhada","correr","corrida","esporte","academia","nadar","natação","dançar","dança","pedalar","bicicleta","ginástica","60 minutos","atividade física","aeróbico","treinar","treino","musculação","futebol","vôlei","basquete","handebol","tênis","yoga","pilates","movimento"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["60 minutos","aeróbico","atividade física","exercício físico"],
    bonusPoints: 10,
    tip: "💡 Para adolescentes, a OMS recomenda em média pelo menos 60 minutos por dia de atividade física moderada a vigorosa ao longo da semana.",
    perfect: "🏆 Mandou bem! Você puxou várias ideias que batem com as recomendações de saúde.",
  },
  {
    id: 2,
    type: "open",
    icon: "🥗",
    category: "Alimentação",
    categoryColor: C.yellow,
    question: "Que mudanças na alimentação ajudam a prevenir hipertensão?",
    subtitle: "Na prática: o que sairia e o que entraria no seu prato?",
    hint: "Pense em sal, frutas, vegetais, ultraprocessados...",
    keywords: ["sal","sódio","fruta","frutas","vegetal","vegetais","verdura","verduras","dieta","alimentação","saudável","ultraprocessado","ultraprocessados","processado","refrigerante","açúcar","potássio","banana","feijão","grão","integral","fibra","fibras","menos sal","pouco sal","sem sal","tempero natural","DASH","mediterrânea","legumes","proteína","peixe","ômega"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["sódio","potássio","DASH","ultraprocessado","menos sal","sem sal","sódio"],
    bonusPoints: 10,
    tip: "💡 A dieta DASH prioriza frutas, vegetais, feijões, grãos integrais e alimentos pouco processados, com menos sódio. A Diretriz Brasileira de Hipertensão 2025 a recomenda também para crianças e adolescentes, especialmente quando há obesidade.",
    perfect: "🏆 Boa! Você pegou a ideia: mais comida de verdade e menos excesso de sódio.",
  },
  {
    id: 3,
    type: "open",
    icon: "😴",
    category: "Sono & Estresse",
    categoryColor: C.teal,
    question: "Como o sono e o controle do estresse protegem seu coração?",
    subtitle: "Qual seria seu plano pra dormir melhor e aliviar o estresse?",
    hint: "Pense em rotina, tempo de tela, técnicas de relaxamento...",
    keywords: ["dormir","sono","descanso","horas de sono","8 horas","relaxar","relaxamento","meditação","meditar","respiração","ansiedade","estresse","stress","desligar","celular","tela","rotina","hora de dormir","descansar","calma","yoga","mindfulness","conversar","psicólogo","terapia","natureza","lazer","hobby","música","pausas","descompressão"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["8 horas","meditação","mindfulness","estresse","ansiedade","respiração","rotina"],
    bonusPoints: 10,
    tip: "💡 Para adolescentes de 13–18 anos, dormir regularmente 8–10 horas por noite é a recomendação geral. Sono insuficiente se associa a pior saúde cardiometabólica.",
    perfect: "🏆 Aí sim! Sono e manejo do estresse entraram no seu plano.",
  },
  {
    id: 4,
    type: "open",
    icon: "🚭",
    category: "Hábitos Tóxicos",
    categoryColor: C.orange,
    question: "Quais substâncias ou hábitos você evitaria para proteger sua pressão?",
    subtitle: "Quais coisas você deixaria fora dessa missão?",
    hint: "Pense em cigarro, álcool, energéticos, drogas...",
    keywords: ["cigarro","fumar","fumo","tabaco","álcool","bebida","beber","energético","energéticos","cafeína","droga","drogas","substância","vício","cocaína","anfetamina","corticoide","anabolizante","sal","sódio","gordura","trans","açúcar","refrigerante","tóxico","prejudicial","fazer mal","evitar","parar de fumar","não fumar","não beber"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["tabaco","cigarro","álcool","energético","anabolizante","não fumar","parar de fumar"],
    bonusPoints: 10,
    tip: "💡 Nicotina pode aumentar temporariamente a frequência cardíaca e a pressão, além de causar dependência. Vape também não é inofensivo.",
    perfect: "🏆 Boa leitura! Você reconheceu escolhas que podem pesar contra a saúde cardiovascular.",
  },
  {
    id: 5,
    type: "open",
    icon: "👥",
    category: "Aliados",
    categoryColor: C.purple,
    question: "Quem são seus ALIADOS nessa batalha contra a hipertensão?",
    subtitle: "Quem poderia fechar com você nessa missão?",
    hint: "Pense em pessoas ao redor, profissionais de saúde, ambientes...",
    keywords: ["médico","cardiologista","pediatra","enfermeiro","enfermeira","nutricionista","psicólogo","professor","educador físico","personal","família","pais","mãe","pai","amigos","amigo","equipe","escola","posto de saúde","UBS","SUS","academia","time","parceiro","parceira","apoio","parceria","rede","comunidade","app","tecnologia","PressãoCheck","farmacêutico"],
    minKeywords: 1,
    points: 30,
    bonusKeywords: ["médico","cardiologista","nutricionista","educador físico","família","psicólogo","UBS","SUS"],
    bonusPoints: 15,
    tip: "💡 Aliados-chave: médico/pediatra (triagem), nutricionista (dieta), educador físico (exercício), família (ambiente saudável) e você mesmo!",
    perfect: "🏆 É isso! Cuidar da saúde fica mais fácil quando você sabe com quem contar.",
  },
  {
    id: 6,
    type: "open",
    icon: "📊",
    category: "Monitoramento",
    categoryColor: C.amber,
    question: "Como você acompanharia sua pressão de um jeito seguro?",
    subtitle: "Como você acompanharia isso sem cair em achismo?",
    hint: "Pense em medição regular, sinais de alerta, check-up...",
    keywords: ["medir","medição","medir pressão","esfigmomanômetro","aparelho","MAPA","MRPA","monitorar","acompanhar","consulta","médico","enfermeiro","UBS","diagnóstico","regularmente","histórico","registro","anotar","repetir","manguito","braço"],
    minKeywords: 1,
    points: 30,
    bonusKeywords: ["MAPA","MRPA","esfigmomanômetro","medir pressão","monitorar","repetir","UBS"],
    bonusPoints: 15,
    tip: "💡 Em adolescentes, pressão alta precisa ser confirmada com técnica adequada. A Diretriz Brasileira 2025 recomenda MAPA em situações específicas de confirmação; a MRPA pode ajudar no acompanhamento.",
    perfect: "🏆 Mandou bem! Você entendeu que medir e acompanhar do jeito certo vale mais que tentar adivinhar pelos sintomas.",
  },
  {
    id: 7,
    type: "open",
    icon: "🧠",
    category: "Educação",
    categoryColor: C.navy,
    question: "Como você ensinaria outras pessoas sobre hipertensão?",
    subtitle: "Se você fosse contar isso pra galera, o que não poderia faltar?",
    hint: "Pense em redes sociais, conversas, escola, família...",
    keywords: ["redes sociais","instagram","tiktok","youtube","compartilhar","postar","falar","conversar","ensinar","explicar","escola","aula","família","amigos","palestra","vídeo","conteúdo","educação","informar","conscientizar","campanha","post","história","story","viral","prevenção","consciência","alertar","divulgar","blog","podcast"],
    minKeywords: 1,
    points: 20,
    bonusKeywords: ["instagram","tiktok","redes sociais","escola","conscientizar","campanha","prevenção"],
    bonusPoints: 10,
    tip: "💡 Redes sociais podem ajudar a compartilhar educação em saúde quando o conteúdo é confiável, claro e não substitui orientação profissional.",
    perfect: "🏆 Boa! Informação certa também vira cuidado quando circula.",
  },
  {
    id: 8,
    type: "open",
    icon: "💉",
    category: "Anabolizantes",
    categoryColor: C.red,
    question: "Como você protegeria sua pressão longe de anabolizantes e 'bombas'?",
    subtitle: "Chegou aquele papo de “ciclo”. Qual seria sua resposta?",
    hint: "Pense em recusar, buscar profissional, não compartilhar...",
    keywords: ["anabolizante","anabolizantes","bomba","ciclo","recusar","não usar","médico","profissional","perigoso","pressão","coração","orientação","sem receita","evitar","não aceitar","academia","coach","personal"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["anabolizante","médico","recusar","orientação","sem receita"],
    bonusPoints: 10,
    tip: "💡 Anabolizantes sem acompanhamento podem elevar a PA, sobrecarregar o coração e trazer danos hepáticos.",
    perfect: "🏆 Boa escolha: atalho sem orientação não entra no seu jogo.",
  },
  {
    id: 9,
    type: "open",
    icon: "🥤",
    category: "Energéticos",
    categoryColor: C.purple,
    question: "Como reduzir o risco dos energéticos na sua rotina?",
    subtitle: "Estudo, treino e rolê sem depender de estimulante.",
    hint: "Água, sono, limitar cafeína, não misturar com exercício extremo...",
    keywords: ["energético","cafeína","água","sono","limitar","reduzir","evitar","pré-treino","estimulante","misturar","exercício","noite","prova","estudar"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["energético","cafeína","água","evitar","limitar"],
    bonusPoints: 10,
    tip: "💡 Energéticos podem conter doses altas de cafeína e outros estimulantes, elevando batimentos e pressão em algumas pessoas. Para adolescentes, a melhor escolha é evitar esse tipo de bebida.",
    perfect: "🏆 Boa! Dá pra render sem transformar estimulante em combustível.",
  },
  {
    id: 10,
    type: "open",
    icon: "🧂",
    category: "Sódio oculto",
    categoryColor: C.amber,
    question: "Como você cortaria sódio escondido nos industrializados?",
    subtitle: "Miojo, embutidos, molhos e temperos prontos: onde o sódio se esconde?",
    hint: "Rótulo, tempero natural, menos embutido...",
    keywords: ["sódio","sal","rótulo","miojo","embutido","temperos","alho","cebola","ervas","industrializado","ultraprocessado","menos sal","molho","shoyu"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["sódio","rótulo","temperos","embutido","miojo"],
    bonusPoints: 10,
    tip: "💡 Grande parte do sódio não vem do saleiro — vem de produtos prontos.",
    perfect: "🏆 Mandou bem! O sódio escondido não passou batido.",
  },
  {
    id: 11,
    type: "open",
    icon: "🎮",
    category: "Sedentarismo digital",
    categoryColor: C.navy,
    question: "Como jogar ou usar tela sem virar risco cardiovascular?",
    subtitle: "Pausa, água, movimento e horário: monta seu combo.",
    hint: "Levantar a cada hora, hidratar, não virar a noite...",
    keywords: ["pausa","pausas","levantar","água","hidratar","sono","horário","caminhar","alongar","tela","jogo","sentado","intervalo","1 hora"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["pausa","levantar","água","sono","1 hora"],
    bonusPoints: 10,
    tip: "💡 O problema não é jogar — é horas sentado + sal + pouco sono.",
    perfect: "🏆 Boa! Jogar não precisa significar ficar horas sem levantar.",
  },
  {
    id: 12,
    type: "open",
    icon: "🧠",
    category: "Saúde mental",
    categoryColor: C.purple,
    question: "Como cuidar da pressão emocional para proteger o coração?",
    subtitle: "Ansiedade, bullying, prova, cobrança... como não deixar tudo acumular?",
    hint: "Conversar, respirar, pedir ajuda, terapia...",
    keywords: ["conversar","ajuda","adulto","psicólogo","respiração","ansiedade","estresse","bullying","apoio","escola","família","terapia","confiança"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["psicólogo","conversar","ansiedade","apoio","respiração"],
    bonusPoints: 10,
    tip: "💡 Estresse persistente pode afetar temporariamente a pressão, o sono e outros hábitos; apoio de alguém de confiança ou profissional pode ajudar.",
    perfect: "🏆 Aí sim! Cabeça e corpo entram no mesmo time.",
  },
  {
    id: 13,
    type: "open",
    icon: "🏥",
    category: "UBS e SUS",
    categoryColor: C.teal,
    question: "Como usar a UBS/SUS para prevenir hipertensão na prática?",
    subtitle: "Pressão, UBS, família: como você buscaria ajuda?",
    hint: "Posto de saúde, medição gratuita, acompanhamento...",
    keywords: ["UBS","SUS","posto","medir","pressão","gratuito","família","consulta","check-up","farmácia","acompanhamento","saúde"],
    minKeywords: 1,
    points: 30,
    bonusKeywords: ["UBS","SUS","medir","pressão","check-up"],
    bonusPoints: 15,
    tip: "💡 UBS mede pressão de graça no Brasil — dá para ir com a família.",
    perfect: "🏆 Boa! Você sabe onde procurar ajuda quando precisa.",
  },
  {
    id: 14,
    type: "open",
    icon: "🏋️",
    category: "Treino seguro",
    categoryColor: C.orange,
    question: "Como montar um treino que fortalece sem sabotagem cardiovascular?",
    subtitle: "Sem atalho perigoso: como treinar e evoluir de verdade?",
    hint: "Progressão, professor, alimentação, descanso...",
    keywords: ["treino","progressão","professor","educador físico","descanso","sono","alimentação","água","sem anabolizante","sem estimulante","técnica","aquecimento"],
    minKeywords: 1,
    points: 25,
    bonusKeywords: ["educador físico","progressão","sem anabolizante","descanso"],
    bonusPoints: 10,
    tip: "💡 Resultado sustentável vem de treino + sono + comida — não de ciclo informal.",
    perfect: "🏆 Fechou: evolução de verdade não precisa de atalho perigoso.",
  },
];

// Quantos desafios jogar por partida (sorteados do banco)
const M3_CHALLENGES_PER_GAME = 7;
function pickPreventionChallenges(){
  return shuffle(PREVENTION_CHALLENGES).slice(0, Math.min(M3_CHALLENGES_PER_GAME, PREVENTION_CHALLENGES.length));
}

// Aliados especiais — cartas desbloqueáveis
const ALLIES = [
  {id:"medic",name:"Dr. Coração",icon:"👨‍⚕️",color:C.teal,power:"Ajuda a interpretar o histórico da família",unlockWords:["médico","cardiologista","pediatra","clínico"],desc:"O profissional de saúde confirma medidas, investiga quando necessário e orienta o cuidado."},
  {id:"nutri",name:"Nutricionista",icon:"🥗",color:C.green,power:"Aliado para escolhas alimentares",unlockWords:["nutricionista","dieta","alimentação","DASH","nutrição"],desc:"Pode ajudar a adaptar a alimentação à rotina, preferências e necessidades de cada pessoa."},
  {id:"prof",name:"Prof. Educação Física",icon:"🏋️",color:C.orange,power:"Aliado para movimento seguro",unlockWords:["educador físico","personal","professor","academia","treino","esporte"],desc:"Pode ajudar a planejar atividade física com progressão, técnica e segurança."},
  {id:"psico",name:"Psicólogo",icon:"🧠",color:C.purple,power:"Aliado para saúde mental",unlockWords:["psicólogo","terapia","saúde mental","ansiedade","mindfulness","meditação"],desc:"Pode ajudar a reconhecer fontes de estresse e construir estratégias saudáveis para lidar com elas."},
  {id:"family",name:"Rede de apoio",icon:"🤝",color:C.amber,power:"Aliada para mudanças compartilhadas",unlockWords:["família","pais","mãe","pai","apoio","casa","lar"],desc:"Uma rede de apoio pode facilitar mudanças de rotina e cuidados compartilhados."},
  {id:"school",name:"Escola Aliada",icon:"🏫",color:C.navy,power:"Aliada para educação em saúde",unlockWords:["escola","professor","aula","educação","UBS","posto","comunidade"],desc:"A escola pode ser um espaço de educação em saúde, conversa e construção de hábitos."},
];

// Verifica keywords no texto (normalizado)
function checkKeywords(text, keywords) {
  const norm = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const found = [];
  keywords.forEach(kw => {
    const normKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (norm.includes(normKw)) found.push(kw);
  });
  return found;
}

function checkAllies(text) {
  const unlocked = [];
  ALLIES.forEach(ally => {
    const found = checkKeywords(text, ally.unlockWords);
    if (found.length > 0) unlocked.push(ally.id);
  });
  return unlocked;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES COMPARTILHADOS
// ═══════════════════════════════════════════════════════════════════════════════
function Btn({children,onClick,color=C.teal,outline,disabled,style={},size="md",...buttonProps}){
  const p=size==="sm"?"6px 12px":size==="lg"?"16px 24px":"10px 18px";
  const f=size==="sm"?12:size==="lg"?17:14;
  const handleClick=(e)=>{
    if(disabled)return;
    SFX.click();
    const btn=e.currentTarget;
    const ripple=document.createElement("span");
    const rect=btn.getBoundingClientRect();
    const sz=Math.max(rect.width,rect.height)*2;
    ripple.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${outline?color+"55":"#ffffff44"};left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px;animation:ripple .55s ease forwards;pointer-events:none;z-index:0`;
    btn.appendChild(ripple);
    setTimeout(()=>ripple.remove(),560);
    onClick&&onClick(e);
  };
  return <button {...buttonProps} onClick={handleClick} disabled={disabled} style={{minHeight:44,padding:p,fontSize:f,fontWeight:800,letterSpacing:.5,background:outline?"transparent":color,color:outline?color:"#000",border:`2px solid ${color}`,borderRadius:11,opacity:disabled?.45:1,boxShadow:!outline?`0 0 16px ${color}44`:"none",position:"relative",overflow:"hidden",...style}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 0 28px ${color}77`;}}}
    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=!outline?`0 0 16px ${color}44`:"none";}}
  >{children}</button>;
}

function Tag({label,color}){return <span style={{background:`${color}22`,color,border:`1px solid ${color}55`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>{label}</span>;}

function RiskBadge({color,label}){return <div style={{background:`${color}22`,border:`2px solid ${color}`,borderRadius:8,padding:"3px 10px",color,fontSize:12,fontWeight:900,boxShadow:`0 0 10px ${color}44`,whiteSpace:"nowrap"}}>{label}</div>;}

function ProgressBar({value,max=100,color,h=6,label="Progresso"}){
  const pct=max>0?Math.max(0,Math.min(100,(value/max)*100)):0;
  return <div className="report-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(max,Math.max(0,value))} style={{width:"100%",height:h,background:C.border,borderRadius:99,overflow:"hidden",position:"relative",boxShadow:`inset 0 0 0 1px ${color}22`}}>
    <div className="report-progress__fill" style={{width:`${pct}%`,height:"100%",backgroundImage:`linear-gradient(90deg,${color}99,${color},#fff,${color})`,backgroundSize:"220% 100%",borderRadius:99,transition:"width .7s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 14px ${color}cc`,animation:"shimmer 1.5s linear infinite"}}/>
    {pct>0&&<div className="report-progress__marker" style={{position:"absolute",left:`calc(${pct}% - 7px)`,top:"50%",width:14,height:14,borderRadius:"50%",background:color,transform:"translateY(-50%)",boxShadow:`0 0 18px ${color}`,animation:"auraPulse 1.2s ease infinite"}}/>}
  </div>;
}

function SoundToggle({on, onToggle}){
  return(
    <button onClick={onToggle} title={on?"Desligar som":"Ligar som"} aria-label={on?"Desligar som":"Ligar som"} aria-pressed={on}
      style={{position:"fixed",right:14,bottom:14,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:12,background:on?`${C.teal}22`:C.surface,border:`1px solid ${on?C.teal:C.borderHi}`,color:on?C.teal:C.gray,boxShadow:on?`0 0 20px ${C.teal}44`:"none",fontSize:19}}>
      {on?"🔊":"🔇"}
    </button>
  );
}

function usePrefersReducedMotion(){
  const [reduced,setReduced]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(media.matches);
    media.addEventListener?.("change",update);
    return()=>media.removeEventListener?.("change",update);
  },[]);
  return reduced;
}

function useAccessibleDialog(open,onClose){
  const dialogRef=useRef(null);
  const closeRef=useRef(onClose);
  closeRef.current=onClose;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement;
    const dialog=dialogRef.current;
    const focusable=()=>[...(dialog?.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')||[])];
    const timer=setTimeout(()=>focusable()[0]?.focus(),0);
    const onKeyDown=(event)=>{
      if(event.key==="Escape"){event.preventDefault();closeRef.current?.();return;}
      if(event.key!=="Tab")return;
      const items=focusable();
      if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKeyDown);
    return()=>{clearTimeout(timer);document.removeEventListener("keydown",onKeyDown);previous?.focus?.();};
  },[open]);
  return dialogRef;
}

function MotionMedia({video,poster,style}){
  const reduced=usePrefersReducedMotion();
  return reduced
    ? <img src={poster} alt="" aria-hidden="true" style={style}/>
    : <video className="motion-video" src={video} poster={poster} autoPlay muted loop playsInline aria-hidden="true" tabIndex={-1} style={style}/>;
}

function ModuleAura({color,label}){
  return(
    <div aria-hidden="true" style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      <div style={{position:"absolute",left:"50%",top:70,width:360,height:360,borderRadius:"50%",background:`radial-gradient(circle,${color}26 0%,${color}10 42%,transparent 70%)`,filter:"blur(4px)",transform:"translateX(-50%)",animation:"auraPulse 3s ease infinite"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${color},transparent)`,animation:"beatLine 2.8s linear infinite",opacity:.7}}/>
      <div style={{position:"absolute",left:14,top:86,color:`${color}55`,fontFamily:"Impact,sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",writingMode:"vertical-rl"}}>{label}</div>
    </div>
  );
}

function UnlockCard({icon,title,body,color,children,mod}){
  return(
    <div style={{background:`linear-gradient(135deg,${color}16,${C.teal}0f)`,border:`1px solid ${color}55`,borderRadius:18,padding:20,textAlign:"center",position:"relative",overflow:"hidden",animation:"unlockGlow .55s cubic-bezier(.34,1.56,.64,1)"}}>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${color}22,transparent)`,animation:"neonSweep 1.6s ease .2s both"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10,animation:"float 2s ease infinite"}}>
          {mod
            ? <ModuleArt mod={mod} size={96} color={color}/>
            : <div style={{fontSize:40}}>{icon}</div>}
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:16,letterSpacing:4,color,marginBottom:6}}>{title}</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.6,margin:"0 0 14px"}}>{body}</p>
        {children}
      </div>
    </div>
  );
}

function CountUp({target,suffix="",duration=1200}){
  const [v,setV]=useState(0);
  useEffect(()=>{let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/duration,1);setV(Math.round((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);},[target]);
  return <>{v}{suffix}</>;
}

function TopBar({module,score,onBack}){
  const colors={"1":C.red,"2":C.amber,"3":C.green,"4":C.red,"5":C.orange,"6":C.teal,quiz:C.purple,report:C.teal};
  const icons={"1":"❤️","2":"🧬","3":"🛡️","4":"🔍","5":"⚠️","6":"🏥",quiz:"🎯",report:"📊"};
  const labels={"1":"Pressão Quest","2":"Missão Família","3":"Batalha da Prevenção","4":"Caçador de Alertas","5":"Consequências","6":"Como Ajudar",quiz:"Quiz Final",report:"Relatório"};
  const col=colors[module]||C.white;
  const artMod = MODULE_ART[module] ? Number(module) : null;
  return(
    <div style={{position:"sticky",top:0,zIndex:200,background:`${C.bg}ee`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
      {onBack&&<button onClick={onBack} aria-label="Voltar" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",color:C.gray,fontSize:12}}>←</button>}
      {artMod
        ? <ModuleArt mod={artMod} size={28} color={col} style={{borderRadius:8,flexShrink:0}}/>
        : <span style={{fontSize:18}}>{icons[module]}</span>}
      <span style={{fontFamily:"Impact,sans-serif",fontSize:16,letterSpacing:3,background:`linear-gradient(135deg,${col},${col}aa)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{labels[module]}</span>
      <span style={{marginLeft:"auto",color:C.yellow,fontWeight:800,fontSize:14}}>⭐ {score}</span>
    </div>
  );
}

function XPPopup({points,x,y,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1000);return()=>clearTimeout(t);},[]);
  return <div style={{position:"fixed",left:x,top:y,pointerEvents:"none",zIndex:999,fontFamily:"Impact,sans-serif",fontSize:26,color:C.yellow,fontWeight:900,animation:"fadeUp .8s ease forwards",filter:`drop-shadow(0 0 8px ${C.yellow})`}}>+{points} XP!</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREE.JS BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════
function ThreeBackground({ moduleColor }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const probe=document.createElement("canvas");
    const webglAvailable=Boolean(probe.getContext("webgl2")||probe.getContext("webgl"));
    if(!webglAvailable)return;
    let cancelled=false;
    let dispose=()=>{};
    const init=async()=>{
      const THREE=await import("three");
      if(cancelled)return;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,100);
      camera.position.z=10;
      let renderer;
      try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});}
      catch(error){console.info("Fundo WebGL indisponível; usando fundo estático.",error);return;}
      renderer.setSize(window.innerWidth,window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));

      const COUNT=300;
      const positions=new Float32Array(COUNT*3);
      const colors=new Float32Array(COUNT*3);
      const velY=new Float32Array(COUNT);
      const phases=new Float32Array(COUNT);
      const brightnesses=new Float32Array(COUNT);
      const initCol=new THREE.Color(moduleColor||C.red);
      const currentCol=initCol.clone();
      for(let i=0;i<COUNT;i++){
        positions[i*3]=(Math.random()-.5)*22;
        positions[i*3+1]=(Math.random()-.5)*22;
        positions[i*3+2]=-1+Math.random()*-9;
        velY[i]=.008+Math.random()*.022;
        phases[i]=Math.random()*Math.PI*2;
        brightnesses[i]=.12+Math.random()*.88;
        colors[i*3]=initCol.r*brightnesses[i];
        colors[i*3+1]=initCol.g*brightnesses[i];
        colors[i*3+2]=initCol.b*brightnesses[i];
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.BufferAttribute(positions,3));
      geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
      const mat=new THREE.PointsMaterial({size:.18,vertexColors:true,transparent:true,opacity:.75,sizeAttenuation:true});
      scene.add(new THREE.Points(geo,mat));
      stateRef.current={THREE,scene,camera,renderer,geo,mat,positions,colors,velY,phases,brightnesses,COUNT,currentCol};

      let rafId,tick=0;
      const animate=()=>{
        rafId=requestAnimationFrame(animate);tick++;
        const pos=geo.attributes.position.array;
        for(let i=0;i<COUNT;i++){
          pos[i*3+1]+=velY[i];
          pos[i*3]+=Math.sin(tick*.012+phases[i])*.003;
          if(pos[i*3+1]>12){pos[i*3+1]=-12;pos[i*3]=(Math.random()-.5)*22;}
        }
        geo.attributes.position.needsUpdate=true;
        renderer.render(scene,camera);
      };
      animate();
      const onResize=()=>{
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
      };
      window.addEventListener("resize",onResize);
      dispose=()=>{
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize",onResize);
        stateRef.current=null;
        geo.dispose();mat.dispose();renderer.dispose();
      };
    };
    init();
    return()=>{cancelled=true;dispose();};
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = new s.THREE.Color(moduleColor || C.red);
    const { currentCol, colors, brightnesses, COUNT, geo, renderer, scene, camera } = s;
    let rafId2, frame = 0;
    const lerp = () => {
      currentCol.r += (target.r - currentCol.r) * 0.045;
      currentCol.g += (target.g - currentCol.g) * 0.045;
      currentCol.b += (target.b - currentCol.b) * 0.045;
      for (let i = 0; i < COUNT; i++) {
        colors[i * 3]     = currentCol.r * brightnesses[i];
        colors[i * 3 + 1] = currentCol.g * brightnesses[i];
        colors[i * 3 + 2] = currentCol.b * brightnesses[i];
      }
      geo.attributes.color.needsUpdate = true;
      renderer.render(scene,camera);
      if (++frame < 90) rafId2 = requestAnimationFrame(lerp);
    };
    rafId2 = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(rafId2);
  }, [moduleColor]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1 SCREENS
// ═══════════════════════════════════════════════════════════════════════════════
function M1Home({onStart,onShowcase,playerName,onDevUnlock}){
  const devEnabled=import.meta.env.DEV&&new URLSearchParams(window.location.search).has("dev");
  const [showDevModal,setShowDevModal]=useState(false);
  const [showSources,setShowSources]=useState(false);
  const [devInput,setDevInput]=useState("");
  const [devErr,setDevErr]=useState(false);
  const closeDevModal=()=>{setShowDevModal(false);setDevInput("");setDevErr(false);};
  const closeSources=()=>setShowSources(false);
  const devDialogRef=useAccessibleDialog(showDevModal,closeDevModal);
  const sourcesDialogRef=useAccessibleDialog(showSources,closeSources);
  const openDevModal=()=>{setShowDevModal(true);setDevErr(false);setDevInput("");};
  const tryUnlock=()=>{
    if(devInput==="1806"){setShowDevModal(false);setDevInput("");setDevErr(false);onDevUnlock();}
    else{setDevErr(true);setDevInput("");}
  };
  return(
    <div style={{position:"relative",minHeight:"100vh",animation:"fadeUp .4s ease"}}>
      {/* Background da apresentação — capa full-bleed */}
      <div aria-hidden style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <img
          src={MEDIA.cover}
          alt=""
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block",filter:"saturate(1.05) brightness(0.72)"}}
        />
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${C.bg}55 0%,${C.bg}88 35%,${C.bg}cc 70%,${C.bg}f2 100%)`}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 18%,${C.red}22 0%,transparent 55%)`}}/>
      </div>

      <div style={{position:"relative",zIndex:1,padding:"16px 16px 28px",display:"flex",flexDirection:"column",gap:16,minHeight:"100vh"}}>
        {devEnabled&&<button onClick={openDevModal} style={{position:"fixed",left:10,bottom:10,zIndex:20,background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:9,padding:"6px 9px",color:C.gray}} title="Abrir modo dev">⚙️</button>}

        {/* Hero sobre o background — título já está na capa */}
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:14,padding:"12vh 8px 24px",textAlign:"center"}}>
          <div style={{width:"100%",maxWidth:360,aspectRatio:"9 / 14",maxHeight:"42vh",borderRadius:20,overflow:"hidden",border:`1px solid ${C.red}44`,boxShadow:`0 0 50px ${C.red}33`,position:"relative"}}>
            <img src={MEDIA.cover} alt="Desafio Hipertensão" fetchPriority="high" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          </div>
          <Tag label="6 Módulos · Game educativo" color={C.red}/>
          <Btn onClick={onStart} color={C.red} size="lg" style={{width:"100%",maxWidth:320,boxShadow:`0 0 28px ${C.red}66`}}>INICIAR QUEST ▶</Btn>
          <Btn onClick={onShowcase} color={C.teal} outline size="lg" style={{width:"100%",maxWidth:320,background:`${C.bg}bb`,backdropFilter:"blur(10px)"}}>🎓 VERSÃO CONGRESSO · PRÉVIA DOS 6 MÓDULOS</Btn>
        </div>

        {showDevModal&&(
          <div ref={devDialogRef} role="dialog" aria-modal="true" aria-labelledby="dev-dialog-title" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
            <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:28,width:280,display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
              <div style={{fontSize:32}}>🔧</div>
              <div id="dev-dialog-title" style={{fontFamily:"Impact,sans-serif",fontSize:20,letterSpacing:3,color:C.white}}>MODO DEV</div>
              <div style={{color:C.gray,fontSize:13}}>Senha de acesso</div>
              <input
                autoFocus
                type="password"
                value={devInput}
                onChange={e=>{setDevInput(e.target.value);setDevErr(false);}}
                onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
                placeholder="••••"
                style={{width:"100%",padding:"11px 14px",background:C.surface,border:`2px solid ${devErr?C.red:C.borderHi}`,borderRadius:10,color:C.white,fontSize:20,textAlign:"center",outline:"none",letterSpacing:6}}
              />
              {devErr&&<div style={{color:C.red,fontSize:12}}>Senha incorreta</div>}
              <div style={{display:"flex",gap:10,width:"100%"}}>
                <Btn onClick={closeDevModal} color={C.gray} style={{flex:1,fontSize:13}}>Cancelar</Btn>
                <Btn onClick={tryUnlock} color={C.teal} style={{flex:1,fontSize:13}}>Entrar</Btn>
              </div>
            </div>
          </div>
        )}

        <div style={{background:`${C.card}cc`,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:18,backdropFilter:"blur(12px)"}}>
          <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7,margin:0}}>
            Em <strong style={{color:C.white}}>6 módulos</strong>, você toma decisões, recebe feedback e descobre como hábitos, família e prevenção se conectam à hipertensão.
          </p>
        </div>
        <div style={{background:`${C.teal}0d`,border:`1px solid ${C.teal}33`,borderRadius:14,padding:"12px 14px"}}>
          <div style={{color:C.teal,fontWeight:800,fontSize:12,marginBottom:5}}>🔒 PRIVACIDADE NESTA VERSÃO</div>
          <p style={{color:C.grayLt,fontSize:12,lineHeight:1.55,margin:0}}>As respostas ficam somente neste navegador durante a partida: não há conta, servidor ou analytics. Atualizar ou fechar a página apaga o progresso. Use apelido e informe apenas o que se sentir confortável em registrar.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
          {[[1,"Módulo 1","Radar de Hábitos",C.red],[2,"Módulo 2","Família",C.amber],[3,"Módulo 3","Prevenção",C.green],[4,"Módulo 4","Sinais de Alerta",C.red],[5,"Módulo 5","Consequências",C.orange],[6,"Módulo 6","Como Ajudar",C.teal]].map(([mod,m,sub,col])=>(
            <div key={m} style={{background:`${C.surface}dd`,border:`1px solid ${col}44`,borderRadius:14,padding:"8px 6px 10px",textAlign:"center",overflow:"hidden",boxShadow:`0 0 18px ${col}18`,backdropFilter:"blur(10px)"}}>
              <ModuleArt mod={mod} size={84} color={col} style={{margin:"0 auto 7px",borderRadius:12,maxWidth:"100%",height:"auto",aspectRatio:"1 / 1"}}/>
              <div style={{color:col,fontWeight:800,fontSize:11}}>{m}</div>
              <div style={{color:C.grayDk,fontSize:10}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <p style={{color:C.grayDk,fontSize:11,textAlign:"center",margin:0}}>⚕️ Ferramenta educativa — não substitui avaliação profissional</p>
          <button onClick={()=>setShowSources(true)} style={{background:"transparent",border:0,color:C.teal,fontSize:11,fontWeight:800,textDecoration:"underline",cursor:"pointer"}}>Referências científicas e nota metodológica</button>
        </div>
        {showSources&&(
          <div ref={sourcesDialogRef} role="dialog" aria-modal="true" aria-label="Referências científicas" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
            <div style={{width:"100%",maxWidth:420,maxHeight:"82vh",overflowY:"auto",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:14}}><strong style={{fontSize:18}}>Base científica</strong><button onClick={closeSources} aria-label="Fechar referências" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.white,borderRadius:9,padding:"6px 10px",cursor:"pointer"}}>✕</button></div>
              <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6}}>O conteúdo foi revisado para educação em saúde de adolescentes. Pontuações e índices são recursos do desafio: não são escores clínicos validados, não estimam risco individual, não fazem diagnóstico e não orientam tratamento.</p>
              <div style={{color:C.grayLt,fontSize:12,lineHeight:1.65,display:"grid",gap:10}}>
                <div><strong style={{color:C.white}}>Hipertensão:</strong> Diretriz Brasileira de Hipertensão Arterial, 2025. Arquivos Brasileiros de Cardiologia. DOI 10.36660/abc.20250624.</div>
                <div><strong style={{color:C.white}}>Atividade física:</strong> World Health Organization. Guidelines on Physical Activity and Sedentary Behaviour. 2020.</div>
                <div><strong style={{color:C.white}}>Sono:</strong> Paruthi S et al. Recommended Amount of Sleep for Pediatric Populations. J Clin Sleep Med. 2016;12(6):785-786. DOI 10.5664/jcsm.5866.</div>
                <div><strong style={{color:C.white}}>AVC:</strong> American Heart Association/American Stroke Association. Guideline for the Early Management of Patients With Acute Ischemic Stroke. 2026.</div>
              </div>
              <p style={{color:C.grayDk,fontSize:11,lineHeight:1.5,marginTop:16}}>Em caso de sintomas graves ou emergência, procure atendimento. No Brasil, SAMU: 192.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DevPanel({onJump,onClose}){
  const modules=[
    {label:"M1 — Quiz de Risco",color:C.red,screens:[
      {name:"m1quiz",icon:"❤️",label:"Quiz"},
      {name:"m1result",icon:"📊",label:"Resultado M1"},
    ]},
    {label:"M2 — Família",color:C.amber,screens:[
      {name:"m2sel",icon:"👨‍👩‍👧",label:"Seletor"},
      {name:"m2tree",icon:"🧬",label:"Árvore"},
    ]},
    {label:"M3 — Prevenção",color:C.green,screens:[
      {name:"m3intro",icon:"🛡️",label:"Intro"},
      {name:"m3challenge",icon:"⚔️",label:"Desafio"},
      {name:"m3result",icon:"🏆",label:"Resultado M3"},
    ]},
    {label:"M4 — Sintomas",color:C.orange,screens:[
      {name:"m4intro",icon:"🔍",label:"Intro"},
      {name:"m4game",icon:"🎯",label:"Game"},
      {name:"m4result",icon:"✅",label:"Resultado M4"},
    ]},
    {label:"M5 — Consequências",color:C.red,screens:[
      {name:"m5intro",icon:"⚠️",label:"Intro"},
      {name:"m5game",icon:"💥",label:"Game"},
      {name:"m5result",icon:"📈",label:"Resultado M5"},
    ]},
    {label:"M6 — Como Ajudar",color:C.teal,screens:[
      {name:"m6intro",icon:"🏥",label:"Intro"},
      {name:"m6game",icon:"🤝",label:"Game"},
    ]},
    {label:"Quiz Final + Vitória",color:C.purple,screens:[
      {name:"quizfinalintro",icon:"📝",label:"Quiz Intro"},
      {name:"quizfinal",icon:"🧠",label:"Quiz"},
      {name:"victory",icon:"🎉",label:"Vitória"},
      {name:"report",icon:"📊",label:"Relatório"},
    ]},
  ];
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:28}}>🔧</div>
        <div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:22,letterSpacing:3,color:C.white}}>MODO DEV</div>
          <div style={{color:C.grayDk,fontSize:11}}>Acesso direto aos módulos</div>
        </div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.border}`,color:C.gray,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕ Sair</button>
      </div>
      {modules.map(({label,color,screens})=>(
        <div key={label} style={{background:C.card,border:`1px solid ${color}33`,borderRadius:14,padding:12}}>
          <div style={{color,fontWeight:800,fontSize:12,letterSpacing:1,marginBottom:8}}>{label}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {screens.map(({name,icon,label:sl})=>(
              <button key={name} onClick={()=>onJump(name)}
                style={{background:C.surface,border:`1px solid ${color}55`,borderRadius:10,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:C.white,fontSize:13,fontWeight:600}}>
                <span style={{fontSize:16}}>{icon}</span>{sl}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function M1Name({onConfirm}){
  const [name,setName]=useState("");
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 16px",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:60}}>🎮</div>
      <div style={{fontFamily:"Impact,sans-serif",fontSize:26,letterSpacing:4,color:C.white,textAlign:"center"}}>QUAL SEU NOME?</div>
      <p style={{color:C.grayLt,fontSize:13,lineHeight:1.5,textAlign:"center",maxWidth:320}}>Pode usar seu nome ou um apelido. Ele serve apenas para personalizar esta partida.</p>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Nickname..." maxLength={16}
        style={{width:"100%",maxWidth:320,padding:"13px 16px",background:C.surface,border:`2px solid ${C.borderHi}`,borderRadius:13,color:C.white,fontSize:18,textAlign:"center",outline:"none",fontFamily:"Impact,sans-serif",letterSpacing:2}}
        onFocus={e=>e.target.style.borderColor=C.red} onBlur={e=>e.target.style.borderColor=C.borderHi}
        onKeyDown={e=>e.key==="Enter"&&onConfirm(name||"Anônimo")}/>
      <Btn onClick={()=>onConfirm(name||"Anônimo")} color={C.red} size="lg" style={{width:"100%",maxWidth:320}}>ENTRAR →</Btn>
      <button onClick={()=>onConfirm("Anônimo")} style={{background:"transparent",border:"none",color:C.grayDk,fontSize:13}}>Jogar anônimo</button>
    </div>
  );
}

function M1Quiz({onFinish,questionCount=10}){
  const [selected]=useState(()=>pickQuizQuestions(questionCount));
  const [qi,setQi]=useState(0);const [answers,setAnswers]=useState(Array(questionCount).fill(null));const [sel,setSel]=useState(null);
  const [locked,setLocked]=useState(false);
  const lockedRef=useRef(false);
  const advanceTimerRef=useRef(null);
  useEffect(()=>()=>clearTimeout(advanceTimerRef.current),[]);
  const catColors={"🍔 Alimentação":C.orange,"🧂 Sal":C.yellow,"🏃 Exercício":C.green,"😴 Sono":C.teal,"📱 Tela":C.purple,"😤 Estresse":C.red,"⚖️ Peso":C.orange,"🧬 Família":C.teal,"🥤 Bebidas":C.yellow,"🩺 Saúde":C.green};
  const q=selected[qi];const cc=catColors[q.cat]||C.white;
  const questions=selected;
  const choose=(i,opt)=>{
    if(lockedRef.current)return;
    lockedRef.current=true;
    setLocked(true);
    SFX.click();
    const na=[...answers];na[qi]=opt;setAnswers(na);setSel(i);
    advanceTimerRef.current=setTimeout(()=>{
      if(qi<selected.length-1){
        setQi(v=>v+1);setSel(null);setLocked(false);lockedRef.current=false;
      }
      else onFinish(na,selected);
    },600);
  };
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"slideIn .35s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Tag label={q.cat} color={cc}/>
        <span style={{color:C.gray,fontSize:13,marginLeft:"auto"}}>{qi+1}/{questions.length}</span>
      </div>
      <ProgressBar value={qi+1} max={questions.length} color={cc}/>
      <div style={{background:C.card,border:`1px solid ${cc}33`,borderRadius:16,padding:18,boxShadow:`0 0 20px ${cc}12`}}>
        <p style={{color:C.white,fontSize:17,fontWeight:800,lineHeight:1.4,margin:"0 0 8px"}}>{q.q}</p>
        <p style={{color:C.gray,fontSize:13,margin:0,lineHeight:1.5}}>{q.sub}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {q.opts.map((opt,i)=>{
          const isS=sel===i;const oc=[C.green,C.teal,C.yellow,C.red][i];
          return(
            <button key={i} onClick={()=>choose(i,opt)} aria-pressed={isS} disabled={locked} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:isS?`${oc}22`:C.surface,border:`2px solid ${isS?oc:C.border}`,borderRadius:13,textAlign:"left",boxShadow:isS?`0 0 18px ${oc}44`:"none",opacity:locked&&!isS?.65:1}}
              onMouseEnter={e=>{if(!isS){e.currentTarget.style.border=`2px solid ${oc}55`;e.currentTarget.style.background=`${oc}0d`;}}}
              onMouseLeave={e=>{if(!isS){e.currentTarget.style.border=`2px solid ${C.border}`;e.currentTarget.style.background=C.surface;}}}>
              <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:isS?oc:`${oc}22`,border:`2px solid ${oc}`,display:"flex",alignItems:"center",justifyContent:"center",color:isS?"#000":oc,fontWeight:900,fontSize:13}}>
                {isS?"✓":String.fromCharCode(65+i)}
              </div>
              <span style={{color:isS?C.white:C.grayLt,fontWeight:isS?700:500,fontSize:14,lineHeight:1.4}}>{opt.t}</span>
              {isS&&<span style={{marginLeft:"auto",color:oc,fontSize:11,fontWeight:700,flexShrink:0}}>{opt.risk===0?"✅ seguro":`⚠️ +${opt.risk} pts`}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function M1Result({answers,score,risk,onNext,questions}){
  const prof=getRiskProfile(risk);
  const [phase,setPhase]=useState(0);
  useEffect(()=>{SFX.levelUp();const t1=setTimeout(()=>setPhase(1),800);const t2=setTimeout(()=>setPhase(2),2000);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  const qs=questions||QUIZ_QUESTIONS_BANK.slice(0,10);
  const worst=answers.map((a,i)=>({q:qs[i],a,risk:a?.risk||0})).filter(x=>x.q).sort((x,y)=>y.risk-x.risk).slice(0,3);
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${prof.color}11`,border:`1px solid ${prof.color}33`,borderRadius:20,padding:"24px 16px",boxShadow:`0 0 40px ${prof.color}18`}}>
        <div style={{fontSize:64,marginBottom:8}}>{prof.emoji}</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:prof.rankColor,filter:`drop-shadow(0 0 12px ${prof.rankColor})`,lineHeight:1}}>{prof.rank}</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:prof.color,letterSpacing:2,margin:"8px 0"}}>{prof.title}</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.6,margin:0}}>{prof.desc}</p>
      </div>
      {phase>=1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"popIn .4s ease"}}>
          <div style={{background:C.card,border:`1px solid ${C.green}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTUAÇÃO</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:48,color:score>=70?C.green:score>=50?C.yellow:C.red,lineHeight:1,filter:`drop-shadow(0 0 8px ${score>=70?C.green:score>=50?C.yellow:C.red})`}}><CountUp target={score}/></div>
            <div style={{color:C.gray,fontSize:12}}>de 100 pts</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${prof.color}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTOS DE HÁBITOS</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:48,color:prof.color,lineHeight:1,filter:`drop-shadow(0 0 8px ${prof.color})`}}><CountUp target={risk} suffix=" pts"/></div>
            <div style={{color:C.gray,fontSize:12}}>pontos educativos de hábitos</div>
          </div>
        </div>
      )}
      {phase>=2&&(
        <>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,animation:"fadeUp .4s ease"}}>
            <div style={{color:C.gray,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:12}}>📊 HÁBITOS QUE MAIS SOMARAM PONTOS</div>
            {worst.map(({q,a,risk:r})=>(
              <div key={q.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.grayLt,fontSize:13}}>{q.cat}</span>
                  <span style={{color:r>15?C.red:C.yellow,fontWeight:700,fontSize:13}}>+{r} pts</span>
                </div>
                <ProgressBar value={r} max={30} color={r>15?C.red:C.yellow}/>
              </div>
            ))}
          </div>
          <div style={{background:`${prof.color}11`,border:`1px solid ${prof.color}33`,borderRadius:14,padding:14}}>
            <div style={{color:prof.color,fontWeight:800,fontSize:13,marginBottom:6}}>💡 O que fazer agora:</div>
            <p style={{color:C.grayLt,fontSize:14,margin:0,lineHeight:1.6}}>{prof.tip}</p>
          </div>
          <UnlockCard mod={2} icon="🔓" title="MÓDULO 2 DESBLOQUEADO!" body="Agora mapeie sua família e veja quais antecedentes merecem atenção preventiva." color={C.amber}>
            <Btn onClick={onNext} color={C.amber} size="lg" style={{width:"100%",color:"#000"}}>🧬 MISSÃO FAMÍLIA →</Btn>
          </UnlockCard>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2 SCREENS (compacto)
// ═══════════════════════════════════════════════════════════════════════════════
function initMembers(){return FAM_DEFS.map(d=>({id:d.id,factors:[],age:null,deceased:false,visited:false}));}

function M2Selector({members,onEdit,onFinish}){
  const configured=members.filter(m=>m.visited).length;
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <ModuleArt mod={2} size={72} color={C.amber}/>
        <div>
          <Tag label="Módulo 2" color={C.amber}/>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:22,color:C.white,letterSpacing:2,marginTop:6}}>MISSÃO FAMÍLIA</div>
          <div style={{color:C.gray,fontSize:13,marginTop:4}}>Selecione um familiar e registre apenas o que você souber sobre o histórico dele</div>
        </div>
      </div>
      <div style={{background:`${C.amber}10`,border:`1px solid ${C.amber}33`,borderRadius:12,padding:"10px 12px",color:C.grayLt,fontSize:12,lineHeight:1.55}}>
        Os cartões são exemplos de vínculos. Use apenas os que fizerem sentido para sua família, responsável ou rede de cuidado. Você pode pular o que não souber ou não quiser informar.
      </div>
      {configured>0&&(
        <div style={{background:`${C.amber}11`,border:`1px solid ${C.amber}44`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>✅</span>
          <div style={{flex:1}}>
            <div style={{color:C.white,fontWeight:800,fontSize:14}}>{configured} de {FAM_DEFS.length} familiares configurados</div>
            <div style={{color:C.gray,fontSize:12}}>Seu mapa até aqui</div>
          </div>
          <span style={{fontFamily:"Impact,sans-serif",fontSize:20,color:C.yellow}}>{configured}/{FAM_DEFS.length}</span>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {FAM_DEFS.map(def=>{
          const m=members.find(f=>f.id===def.id);
          const hasFactors=m?.factors&&m.factors.length>0;
          const risk=hasFactors?classifyMember(m.factors):null;
          return(
            <button key={def.id} onClick={()=>onEdit(def.id)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:m?.visited?`${C.amber}11`:C.surface,border:`2px solid ${m?.visited?C.amber+"55":C.border}`,borderRadius:14,textAlign:"left",boxShadow:m?.visited?`0 0 12px ${C.amber}22`:"none"}}>
              <span style={{fontSize:32,flexShrink:0}}>{def.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:16,color:C.white}}>{def.label}</div>
                <div style={{fontSize:12,color:C.gray,marginTop:2}}>
                  {hasFactors
                    ?<span style={{color:risk.color}}>{risk.label} atenção · {m.factors.length} fator{m.factors.length>1?"es":""}</span>
                    :m?.visited?"Sem fatores registrados":"Toque para configurar"}
                </div>
              </div>
              {hasFactors&&<RiskBadge color={risk.color} label="registrado"/>}
              <span style={{color:C.amber,fontSize:20,flexShrink:0}}>{m?.visited?"✏️":"›"}</span>
            </button>
          );
        })}
      </div>
      <Btn onClick={onFinish} disabled={configured===0} color={C.amber} size="lg" style={{width:"100%",color:"#000"}}>
        🏁 FINALIZAR MÓDULO 2
      </Btn>
    </div>
  );
}

function M2Detail({member,memberDef,onSave,onBack,saveLabel="💾 SALVAR E VOLTAR À LISTA"}){
  const [factors,setFactors]=useState(member.factors||[]);
  const [age,setAge]=useState(member.age||"");
  const [deceased,setDeceased]=useState(member.deceased||false);
  const toggle=id=>setFactors(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const risk=classifyMember(factors);
  const cats=[
    {label:"🩺 Condições",ids:["hypertension","diabetes","dyslipidemia","kidneyDisease"]},
    {label:"💔 Eventos CV",ids:["heartAttack","stroke","heartFailure","earlyCAD"]},
    {label:"🚩 Comportamentais",ids:["smoking","obesity","sedentary","alcoholism"]},
  ];
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"slideIn .35s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",color:C.gray,fontSize:12}}>← Voltar</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:44}}>{memberDef.icon}</span>
        <div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:22,color:C.white,letterSpacing:2}}>{memberDef.label.toUpperCase()}</div>
          <div style={{color:C.gray,fontSize:12}}>Mapeie o que você sabe. Não precisa adivinhar.</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <label style={{flex:1,color:C.gray,fontSize:13}}>Idade
          <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="Ex: 52" min="1" max="110"
            style={{display:"block",width:"100%",marginTop:5,padding:"9px 11px",background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:9,color:C.white,fontSize:15,outline:"none"}}/>
        </label>
        <div style={{flex:1}}>
          <div style={{color:C.gray,fontSize:13,marginBottom:5}}>Status</div>
          <button onClick={()=>setDeceased(d=>!d)} aria-pressed={deceased} style={{width:"100%",padding:"9px 11px",background:deceased?`${C.red}22`:C.surface,border:`1px solid ${deceased?C.red+"66":C.borderHi}`,borderRadius:9,color:deceased?C.red:C.gray,fontWeight:700,fontSize:13}}>{deceased?"💀 Falecido":"❤️ Vivo"}</button>
        </div>
      </div>
      <div style={{background:`${risk.color}11`,border:`1px solid ${risk.color}33`,borderRadius:13,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{textAlign:"center",flexShrink:0}}>
          <div style={{color:C.gray,fontSize:10,fontWeight:700}}>ANTECEDENTES</div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:28,color:risk.color,filter:`drop-shadow(0 0 6px ${risk.color})`}}>{factors.length}</div>
          <RiskBadge color={risk.color} label={risk.label}/>
        </div>
        <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>{factors.length===0?"Marque os antecedentes que você conhece.":`${factors.length} fator${factors.length>1?"es":""} identificado${factors.length>1?"s":""}.`}</p>
      </div>
      {cats.map(cat=>(
        <div key={cat.label}>
          <div style={{color:C.grayLt,fontSize:13,fontWeight:700,marginBottom:7}}>{cat.label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {cat.ids.map(fid=>{
              const f=FAM_FACTORS.find(r=>r.id===fid);const sel=factors.includes(fid);
              return(
                <button key={fid} onClick={()=>toggle(fid)} aria-pressed={sel} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 13px",background:sel?`${C.redL}15`:C.surface,border:`1.5px solid ${sel?C.redL+"66":C.border}`,borderRadius:10,textAlign:"left",boxShadow:sel?`0 0 12px ${C.redL}22`:"none"}}
                  onMouseEnter={e=>{if(!sel)e.currentTarget.style.border=`1.5px solid ${C.borderHi}`;}}
                  onMouseLeave={e=>{if(!sel)e.currentTarget.style.border=`1.5px solid ${C.border}`;}}>
                  <span style={{fontSize:18,flexShrink:0}}>{f.icon}</span>
                  <span style={{color:sel?C.white:C.grayLt,fontWeight:sel?700:500,fontSize:14,flex:1}}>{f.label}</span>
                  {sel&&<span style={{color:C.redL,fontSize:14}}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Btn onClick={()=>onSave({...member,factors,age:age?parseInt(age):null,deceased,visited:true})} color={factors.length>=2?C.orange:C.green} size="lg" style={{width:"100%",color:"#000"}}>
        {saveLabel}
      </Btn>
    </div>
  );
}

function M2Tree({members,onEdit,onFinish}){
  const added=members.filter(m=>m.visited);
  const inh=calcFamilyAttentionIndex(added);
  const exp=calcExplorerScore(added);
  const rc=inh>60?C.orange:inh>30?C.yellow:C.green;
  const sides={paterno:members.filter(m=>FAM_DEFS.find(f=>f.id===m.id)?.side==="paterno"),materno:members.filter(m=>FAM_DEFS.find(f=>f.id===m.id)?.side==="materno"),direto:members.filter(m=>FAM_DEFS.find(f=>f.id===m.id)?.side==="direto")};
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .4s ease"}}>
      <div><Tag label="Árvore Familiar" color={C.amber}/><div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:C.white,letterSpacing:2,marginTop:6}}>MAPA DE HISTÓRIA FAMILIAR</div></div>
      <div style={{background:`${rc}11`,border:`1px solid ${rc}33`,borderRadius:16,padding:18,boxShadow:`0 0 24px ${rc}15`}}>
        <div style={{color:C.gray,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:12}}>MAPA DE ANTECEDENTES</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:52,color:rc,filter:`drop-shadow(0 0 10px ${rc})`,flexShrink:0}}><CountUp target={inh} suffix="%"/></div>
          <div style={{flex:1}}>
            <div style={{color:C.grayLt,fontSize:12,marginBottom:5}}>dos parentes mapeados têm pelo menos um antecedente marcado</div>
            <ProgressBar value={inh} max={100} color={rc} h={7}/>
          </div>
        </div>
        <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>Este número descreve apenas o que você marcou na árvore. <strong style={{color:C.white}}>Não calcula risco genético nem cardiovascular.</strong> História familiar é uma pista para prevenção e acompanhamento, não uma sentença.</p>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.yellow}33`,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:28}}>🏅</span>
        <div style={{flex:1}}><div style={{color:C.white,fontWeight:800,fontSize:14}}>Pontuação de Explorador</div><div style={{color:C.gray,fontSize:12}}>{added.length} de {FAM_DEFS.length} familiares mapeados</div></div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:28,color:C.yellow,filter:`drop-shadow(0 0 8px ${C.yellow})`}}>{exp}</div>
      </div>
      {[{key:"paterno",label:"🧓 Referência familiar A",color:C.navy},{key:"materno",label:"🧓 Referência familiar B",color:C.purple},{key:"direto",label:"🤝 Rede próxima e responsáveis",color:C.teal}].map(({key,label,color})=>sides[key].length>0&&(
        <div key={key}>
          <div style={{color:C.grayLt,fontSize:13,fontWeight:700,marginBottom:7}}>{label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {sides[key].map(m=>{const def=FAM_DEFS.find(f=>f.id===m.id);const risk=classifyMember(m.factors);const hf=m.factors&&m.factors.length>0;
              return(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:hf?`${risk.color}0d`:C.surface,border:`1px solid ${hf?risk.color+"44":C.border}`,borderRadius:11}}>
                  <span style={{fontSize:24,flexShrink:0}}>{def.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:C.white,fontWeight:700,fontSize:13}}>{def.label} {m.deceased?"💀":""} {m.age?`· ${m.age}a`:""}</div>
                    <div style={{color:C.gray,fontSize:11}}>{hf?m.factors.map(fid=>FAM_FACTORS.find(r=>r.id===fid)?.icon).join(" "):"Sem fatores"}</div>
                  </div>
                  {hf?<RiskBadge color={risk.color} label={risk.label}/>:<Tag label="Sem dados" color={C.grayDk}/>}
                  <button onClick={()=>onEdit(m.id)} style={{background:"transparent",border:`1px solid ${C.borderHi}`,borderRadius:7,padding:"3px 9px",color:C.gray,fontSize:12}}>✏️</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <UnlockCard mod={3} icon="🔓" title="MÓDULO 3 DESBLOQUEADO!" body="Hora de lutar contra a hipertensão! Prove que sabe como se prevenir." color={C.green}>
        <Btn onClick={onFinish} color={C.green} size="lg" style={{width:"100%",color:"#000"}}>🛡️ BATALHA DA PREVENÇÃO →</Btn>
      </UnlockCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3 — BATALHA DA PREVENÇÃO (screens)
// ═══════════════════════════════════════════════════════════════════════════════

function M3Intro({playerRisk,onStart}){
  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12,animation:"float 2s ease infinite"}}>
          <ModuleArt mod={3} size={160} color={C.green}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:34,letterSpacing:4,background:`linear-gradient(135deg,${C.green},${C.teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>BATALHA DA</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:34,letterSpacing:4,color:C.white}}>PREVENÇÃO</div>
        <div style={{color:C.gray,fontSize:14,marginTop:8}}>Módulo 3 · O mais desafiador</div>
      </div>
      <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:16,padding:18}}>
        <div style={{color:C.green,fontSize:13,fontWeight:800,letterSpacing:2,marginBottom:10}}>⚔️ COMO FUNCIONA</div>
        {[["🃏","Monte um plano com cartas","Escolha 1 ação, 1 frequência e 1 motivo. Sem precisar escrever."],["🎯","Cartas boas somam pontos","Quanto mais coerente o plano, maior a pontuação."],["⚡","Combos multiplicam pontos","Planos completos e fortes acumulam combo."],["🤝","Desbloqueie Aliados","Algumas cartas chamam aliados especiais para sua missão."]].map(([ic,t,d])=>(
          <div key={t} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{ic}</span>
            <div><div style={{color:C.white,fontWeight:700,fontSize:14}}>{t}</div><div style={{color:C.gray,fontSize:12,lineHeight:1.5}}>{d}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[["🎯","7 Desafios","crescentes"],["🤝","6 Aliados","desbloqueáveis"],["🏆","200+ pts","possíveis"]].map(([ic,v,l])=>(
          <div key={v} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontSize:22}}>{ic}</div>
            <div style={{color:C.white,fontWeight:800,fontSize:14}}>{v}</div>
            <div style={{color:C.grayDk,fontSize:11}}>{l}</div>
          </div>
        ))}
      </div>
      <Btn onClick={onStart} color={C.green} size="lg" style={{width:"100%",color:"#000",fontSize:18}}>⚔️ INICIAR BATALHA →</Btn>
    </div>
  );
}

const M3_PLAN_DECKS={
  1:{
    action:[
      {label:"Caminhar, dançar ou jogar esporte",detail:"Movimento aeróbico no dia a dia",ok:true,bonus:true},
      {label:"Fazer só alongamento sentado",detail:"Ajuda o corpo, mas não basta para pressão",ok:false},
      {label:"Trocar toda atividade por descanso",detail:"Descanso é bom, sedentarismo não",ok:false},
    ],
    frequency:[
      {label:"30 min por dia, 5 dias/semana",detail:"Meta simples e forte",ok:true,bonus:true},
      {label:"1 vez por mês",detail:"Muito pouco para proteger vasos",ok:false},
      {label:"Só quando lembrar",detail:"Sem rotina, efeito cai",ok:false},
    ],
    reason:[
      {label:"Ajuda coração, vasos e controle de peso",detail:"Prevenção completa",ok:true,bonus:true},
      {label:"Porque cansa menos que estudar",detail:"Motivo não conecta com saúde",ok:false},
      {label:"Porque aumenta pressão para treinar melhor",detail:"Ideia perigosa",ok:false},
    ],
  },
  2:{
    action:[
      {label:"Comer mais frutas, verduras e comida de verdade",detail:"Base alimentar protetora",ok:true,bonus:true},
      {label:"Trocar água por refrigerante diet",detail:"Não resolve sódio nem hábito",ok:false},
      {label:"Pular refeições para compensar",detail:"Pode piorar escolhas depois",ok:false},
    ],
    frequency:[
      {label:"Na maioria das refeições",detail:"Rotina vence exceção",ok:true,bonus:true},
      {label:"Só depois de passar mal",detail:"Prevenção vem antes",ok:false},
      {label:"Uma semana por ano",detail:"Efeito não sustenta",ok:false},
    ],
    reason:[
      {label:"Menos sódio e mais potássio protegem vasos",detail:"Conexão direta com pressão",ok:true,bonus:true},
      {label:"Porque sal sempre dá energia",detail:"Sal em excesso aumenta risco",ok:false},
      {label:"Porque ultraprocessado é sempre leve",detail:"Pode ter muito sódio escondido",ok:false},
    ],
  },
  3:{
    action:[
      {label:"Criar rotina de sono e reduzir tela à noite",detail:"Sono mais estável",ok:true,bonus:true},
      {label:"Virar noite para terminar tudo",detail:"Aumenta estresse fisiológico",ok:false},
      {label:"Tomar energético para aguentar",detail:"Pode subir batimentos e pressão",ok:false},
    ],
    frequency:[
      {label:"Todo dia de escola",detail:"Consistência ajuda corpo",ok:true,bonus:true},
      {label:"Só no domingo à noite",detail:"Pouco para regular sono",ok:false},
      {label:"Depois da meia-noite",detail:"Tarde demais para muita gente",ok:false},
    ],
    reason:[
      {label:"Reduzir o estresse ajuda sono, rotina e bem-estar",detail:"Estratégia protetora sem prometer efeito individual",ok:true,bonus:true},
      {label:"Porque dormir pouco não muda nada",detail:"Sono ruim mexe com pressão",ok:false},
      {label:"Porque ansiedade sempre passa sozinha",detail:"Às vezes precisa apoio e cuidado",ok:false},
    ],
  },
  4:{
    action:[
      {label:"Evitar cigarro, álcool, energético e anabolizante",detail:"Vilões cardiovasculares",ok:true,bonus:true},
      {label:"Usar estimulante para render mais",detail:"Pode acelerar coração e pressão",ok:false},
      {label:"Fumar só quando estiver estressado",detail:"Cigarro contrai vasos",ok:false},
    ],
    frequency:[
      {label:"Evitar sempre que possível",detail:"Proteção contínua",ok:true,bonus:true},
      {label:"Só evitar antes de medir pressão",detail:"Risco acontece no dia a dia",ok:false},
      {label:"Usar em semana de prova",detail:"Estresse + estimulante não combina",ok:false},
    ],
    reason:[
      {label:"Essas substâncias podem contrair vasos e subir pressão",detail:"Explicação correta",ok:true,bonus:true},
      {label:"Porque deixam a pressão mais saudável",detail:"Errado e perigoso",ok:false},
      {label:"Porque só fazem mal em adultos",detail:"Adolescente também sofre efeito",ok:false},
    ],
  },
  5:{
    action:[
      {label:"Chamar família, médico, nutricionista e professor",detail:"Rede de apoio real",ok:true,bonus:true},
      {label:"Resolver tudo sozinho",detail:"Saúde precisa rede",ok:false},
      {label:"Seguir dica aleatória da internet",detail:"Pode ter informação errada",ok:false},
    ],
    frequency:[
      {label:"Quando surgir dúvida ou risco",detail:"Pedir ajuda cedo",ok:true,bonus:true},
      {label:"Só em emergência grave",detail:"Prevenção precisa chegar antes",ok:false},
      {label:"Nunca falar sobre isso",detail:"Silêncio atrasa cuidado",ok:false},
    ],
    reason:[
      {label:"Apoio torna mudança mais fácil e segura",detail:"Ninguém cuida sozinho",ok:true,bonus:true},
      {label:"Porque profissional complica tudo",detail:"Profissional orienta com segurança",ok:false},
      {label:"Porque família não influencia hábitos",detail:"Casa influencia muito",ok:false},
    ],
  },
  6:{
    action:[
      {label:"Medir pressão e anotar resultado",detail:"Monitoramento simples",ok:true,bonus:true},
      {label:"Adivinhar pela dor de cabeça",detail:"Hipertensão pode não dar sintoma",ok:false},
      {label:"Tomar remédio de outra pessoa",detail:"Perigoso sem orientação",ok:false},
    ],
    frequency:[
      {label:"Pelo menos 1x por ano ou quando houver alerta",detail:"Acompanhamento preventivo",ok:true,bonus:true},
      {label:"Só quando desmaiar",detail:"Tarde demais",ok:false},
      {label:"Nunca, se estiver se sentindo bem",detail:"Pressão alta pode ser silenciosa",ok:false},
    ],
    reason:[
      {label:"Medir corretamente permite identificar alterações",detail:"Diagnóstico exige confirmação adequada",ok:true,bonus:true},
      {label:"Porque sintoma sempre avisa antes",detail:"Nem sempre avisa",ok:false},
      {label:"Porque aparelho substitui consulta",detail:"Medição ajuda, consulta orienta",ok:false},
    ],
  },
  7:{
    action:[
      {label:"Explicar em casa, escola ou redes com fonte confiável",detail:"Informação vira proteção",ok:true,bonus:true},
      {label:"Assustar todo mundo com fake news",detail:"Medo não educa",ok:false},
      {label:"Receitar remédio para amigos",detail:"Só profissional pode orientar remédio",ok:false},
    ],
    frequency:[
      {label:"Quando aprender algo útil ou ver risco",detail:"Compartilhar no momento certo",ok:true,bonus:true},
      {label:"Só depois de alguém passar mal",detail:"Prevenção chega antes",ok:false},
      {label:"Nunca tocar no assunto",detail:"Silêncio mantém risco escondido",ok:false},
    ],
    reason:[
      {label:"Conhecimento ajuda pessoas a medir e buscar cuidado",detail:"Educação salva tempo",ok:true,bonus:true},
      {label:"Porque hipertensão é assunto só de idoso",detail:"Tema vale para família toda",ok:false},
      {label:"Porque curtida importa mais que cuidado",detail:"Objetivo é saúde real",ok:false},
    ],
  },
  8:{
    action:[
      {label:"Recusar anabolizante e buscar orientação profissional",detail:"Sem ciclo informal",ok:true,bonus:true},
      {label:"Aceitar 'só um ciclo curto'",detail:"Mesmo curto pode subir pressão",ok:false},
      {label:"Comprar bomba por indicação de amigo",detail:"Sem receita = alto risco",ok:false},
    ],
    frequency:[
      {label:"Nunca usar sem médico",detail:"Regra de ouro",ok:true,bonus:true},
      {label:"Usar só antes de campeonato",detail:"Atalho perigoso",ok:false},
      {label:"Usar quando a academia pressionar",detail:"Pressão social ≠ indicação clínica",ok:false},
    ],
    reason:[
      {label:"Anabolizante pode elevar PA e sobrecarregar o coração",detail:"Risco cardiovascular real",ok:true,bonus:true},
      {label:"Porque deixa a pressão mais estável",detail:"Falso e perigoso",ok:false},
      {label:"Porque só faz mal depois dos 40",detail:"Adolescente também sofre efeito",ok:false},
    ],
  },
  9:{
    action:[
      {label:"Trocar energético por água e dormir melhor",detail:"Menos cafeína, mais recuperação",ok:true,bonus:true},
      {label:"Dobrar o energético na semana de prova",detail:"Dispara batimentos e pressão",ok:false},
      {label:"Misturar energético com treino pesado",detail:"Combinação de risco",ok:false},
    ],
    frequency:[
      {label:"Evitar no dia a dia; no máximo raro",detail:"Limite claro",ok:true,bonus:true},
      {label:"Todo dia antes da escola",detail:"Estimulante virando rotina",ok:false},
      {label:"Sempre que sentir sono",detail:"Sono se resolve dormindo",ok:false},
    ],
    reason:[
      {label:"Cafeína em excesso eleva frequência cardíaca e PA",detail:"Fisiologia correta",ok:true,bonus:true},
      {label:"Porque energético hidrata melhor que água",detail:"Falso",ok:false},
      {label:"Porque adolescente tolera qualquer dose",detail:"Não tolera sem risco",ok:false},
    ],
  },
  10:{
    action:[
      {label:"Ler rótulo e trocar tempero pronto por ervas",detail:"Menos sódio oculto",ok:true,bonus:true},
      {label:"Trocar sal por shoyu à vontade",detail:"Shoyu também tem sódio alto",ok:false},
      {label:"Comer miojo todo dia sem o caldo",detail:"Ainda é ultraprocessado frequente",ok:false},
    ],
    frequency:[
      {label:"Na maioria das compras e refeições",detail:"Hábito sustentável",ok:true,bonus:true},
      {label:"Só quando o médico brigar",detail:"Prevenção chega tarde",ok:false},
      {label:"Nunca olhar rótulo",detail:"Sódio passa batido",ok:false},
    ],
    reason:[
      {label:"Sódio escondido eleva pressão sem você perceber",detail:"Conexão correta",ok:true,bonus:true},
      {label:"Porque só o saleiro importa",detail:"Industrializados pesam mais",ok:false},
      {label:"Porque adolescente não sente efeito do sal",detail:"Efeito acumula cedo",ok:false},
    ],
  },
  11:{
    action:[
      {label:"Pausar a cada hora, beber água e alongar",detail:"Quebra sedentarismo",ok:true,bonus:true},
      {label:"Jogar 6h seguidas sem levantar",detail:"Tela + imobilidade",ok:false},
      {label:"Virar a noite na ranked",detail:"Sono e pressão sofrem",ok:false},
    ],
    frequency:[
      {label:"Em toda sessão longa de tela",detail:"Regra prática",ok:true,bonus:true},
      {label:"Só quando der dor de cabeça",detail:"Tarde demais",ok:false},
      {label:"Nunca preciso pausar",detail:"Corpo precisa de movimento",ok:false},
    ],
    reason:[
      {label:"Pausas quebram longos períodos sentado",detail:"Motivo certo",ok:true,bonus:true},
      {label:"Porque ficar sentado treina o coração",detail:"Falso",ok:false},
      {label:"Porque jogo substitui exercício",detail:"Não substitui",ok:false},
    ],
  },
  12:{
    action:[
      {label:"Conversar com adulto de confiança e pedir apoio",detail:"Rede emocional protege",ok:true,bonus:true},
      {label:"Guardar tudo e se isolar",detail:"Estresse cronifica",ok:false},
      {label:"Usar estimulante para 'agitar e esquecer'",detail:"Piora ansiedade e PA",ok:false},
    ],
    frequency:[
      {label:"Sempre que o estresse pesar",detail:"Pedir ajuda cedo",ok:true,bonus:true},
      {label:"Só depois de crise forte",detail:"Prevenção emocional também conta",ok:false},
      {label:"Nunca falar de sentimento",detail:"Silêncio aumenta carga",ok:false},
    ],
    reason:[
      {label:"Buscar apoio para estresse persistente",detail:"Protege sono, bem-estar e rotina",ok:true,bonus:true},
      {label:"Porque saúde mental não mexe com pressão",detail:"Mexe sim",ok:false},
      {label:"Porque aguentar sozinho fortalece o coração",detail:"Isolamento não é força",ok:false},
    ],
  },
  13:{
    action:[
      {label:"Ir à UBS medir pressão e levar a família",detail:"Cuidado gratuito e acessível",ok:true,bonus:true},
      {label:"Só ir ao hospital em emergência",detail:"Perde chance de prevenção",ok:false},
      {label:"Ignorar porque 'posto é só para doente'",detail:"UBS também previne",ok:false},
    ],
    frequency:[
      {label:"Pelo menos 1x ao ano ou com sintomas/alerta",detail:"Rotina preventiva",ok:true,bonus:true},
      {label:"Nunca, se estiver se sentindo bem",detail:"HAS pode ser silenciosa",ok:false},
      {label:"Só quando alguém da casa desmaiar",detail:"Tarde demais",ok:false},
    ],
    reason:[
      {label:"Medir corretamente ajuda a reconhecer alterações e buscar acompanhamento",detail:"SUS como aliado",ok:true,bonus:true},
      {label:"Porque UBS não mede pressão",detail:"Mede sim, de graça",ok:false},
      {label:"Porque só particular serve",detail:"SUS cobre prevenção básica",ok:false},
    ],
  },
  14:{
    action:[
      {label:"Treinar com progressão, sono e sem atalho químico",detail:"Ganho sustentável",ok:true,bonus:true},
      {label:"Acelerar resultado com anabolizante",detail:"Atalho de alto risco",ok:false},
      {label:"Treinar em jejum extremo + pré-treino forte",detail:"Estresse metabólico + estimulante",ok:false},
    ],
    frequency:[
      {label:"3–5 sessões/semana com descanso",detail:"Frequência saudável",ok:true,bonus:true},
      {label:"Todo dia sem descanso",detail:"Overtraining e estresse",ok:false},
      {label:"Só quando quiser 'secar rápido'",detail:"Sem consistência",ok:false},
    ],
    reason:[
      {label:"Treino + recuperação protege coração sem substâncias perigosas",detail:"Fórmula correta",ok:true,bonus:true},
      {label:"Porque atalho químico é mais seguro que treino longo",detail:"Falso",ok:false},
      {label:"Porque descanso atrapalha resultado",detail:"Descanso faz parte do treino",ok:false},
    ],
  },
};

const PLAN_GROUPS=[
  {id:"action",title:"1. Ação",icon:"⚡"},
  {id:"frequency",title:"2. Frequência",icon:"⏱️"},
  {id:"reason",title:"3. Motivo",icon:"🧠"},
];

function getPlanDeck(challenge){
  return M3_PLAN_DECKS[challenge.id]||M3_PLAN_DECKS[1];
}

function shufflePlanDeck(challenge){
  const baseDeck=getPlanDeck(challenge);
  return Object.fromEntries(
    PLAN_GROUPS.map(group=>[group.id,shuffle(baseDeck[group.id])])
  );
}

// Challenge card com cartas de plano
function M3Challenge({challenge,onSubmit,challengeIndex,totalChallenges,unlockedAllies,combo}){
  const [selected,setSelected]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [result,setResult]=useState(null);const [shake,setShake]=useState(false);
  const [miss,setMiss]=useState("");
  const [deck]=useState(()=>shufflePlanDeck(challenge));

  const handleSubmit=()=>{
    if(submitted)return;
    const cards=PLAN_GROUPS.map(g=>selected[g.id]).filter(Boolean);
    if(cards.length<PLAN_GROUPS.length){setMiss("Escolha 1 carta de cada linha para montar seu plano.");SFX.wrong();setShake(true);setTimeout(()=>setShake(false),600);return;}
    const correctCards=cards.filter(c=>c.ok);
    const bonusCards=cards.filter(c=>c.bonus);
    const hit=correctCards.length>=2;
    if(!hit){setMiss("Plano fraco. Troque cartas até ter pelo menos 2 escolhas que protegem a pressão.");SFX.wrong();setShake(true);setTimeout(()=>setShake(false),600);return;}
    const text=`Eu faria: ${selected.action.label}. Frequência: ${selected.frequency.label}. Motivo: ${selected.reason.label}.`;
    const found=correctCards.map(c=>c.label);
    const bonus=bonusCards.length===PLAN_GROUPS.length?bonusCards.map(c=>c.label):[];
    const newAllies=checkAllies(text);
    const basePoints=Math.round(challenge.points*(correctCards.length/PLAN_GROUPS.length));
    const bonusPoints=bonus.length>0?challenge.bonusPoints:0;
    const comboMultiplier=combo>=3?1.5:combo>=2?1.25:1;
    const total=Math.round((basePoints+bonusPoints)*comboMultiplier);
    const maxPoints=Math.round((challenge.points+challenge.bonusPoints)*comboMultiplier);
    setResult({hit,found,bonus,newAllies,total,maxPoints,basePoints,bonusPoints,comboMultiplier,text,cards,correctCount:correctCards.length});
    if(comboMultiplier>=1.5)SFX.combo();else SFX.correct();
    setSubmitted(true);
    setMiss("");
  };

  const complete=PLAN_GROUPS.every(g=>selected[g.id]);

  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"slideIn .35s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Tag label={challenge.category} color={challenge.categoryColor}/>
        <span style={{color:C.gray,fontSize:13,marginLeft:"auto"}}>{challengeIndex+1}/{totalChallenges}</span>
        {combo>=2&&<span style={{background:`${C.orange}22`,color:C.orange,border:`1px solid ${C.orange}44`,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:800,animation:"float 1s ease infinite"}}>×{combo} COMBO!</span>}
      </div>
      <ProgressBar value={challengeIndex+1} max={totalChallenges} color={challenge.categoryColor}/>

      {/* Aliados desbloqueados */}
      {unlockedAllies.length>0&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {unlockedAllies.map(aid=>{const a=ALLIES.find(x=>x.id===aid);return a?(
            <div key={aid} style={{background:`${a.color}22`,border:`1px solid ${a.color}44`,borderRadius:10,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,animation:"popIn .3s ease"}}>
              <span style={{fontSize:16}}>{a.icon}</span>
              <span style={{color:a.color,fontSize:12,fontWeight:700}}>{a.name}</span>
            </div>
          ):null;})}
        </div>
      )}

      {/* Question card */}
      <div style={{background:C.card,border:`1px solid ${challenge.categoryColor}33`,borderRadius:16,padding:18,boxShadow:`0 0 24px ${challenge.categoryColor}10`}}>
        <div style={{fontSize:40,marginBottom:8}}>{challenge.icon}</div>
        <p style={{color:C.white,fontSize:17,fontWeight:800,lineHeight:1.4,margin:"0 0 8px"}}>{challenge.question}</p>
        <p style={{color:C.gray,fontSize:13,margin:0,lineHeight:1.5}}>{challenge.subtitle}</p>
      </div>

      {/* Plan cards */}
      {!submitted?(
        <div style={{animation:shake?"shake .5s ease":"none"}}>
          <div style={{color:C.gray,fontSize:12,marginBottom:10,display:"flex",justifyContent:"space-between",gap:10}}>
            <span>Monte seu plano: 1 ação + 1 frequência + 1 motivo</span>
            <span style={{color:complete?C.green:C.grayDk}}>{Object.keys(selected).length}/3 cartas</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {PLAN_GROUPS.map(group=>(
              <div key={group.id} style={{background:C.surface,border:`1px solid ${challenge.categoryColor}22`,borderRadius:14,padding:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                  <span style={{fontSize:17}}>{group.icon}</span>
                  <span style={{color:challenge.categoryColor,fontWeight:900,fontSize:12,letterSpacing:1.5}}>{group.title}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {deck[group.id].map(card=>{
                    const isSelected=selected[group.id]?.label===card.label;
                    return(
                      <button key={card.label} aria-pressed={isSelected} onClick={()=>{SFX.click();setSelected(p=>({...p,[group.id]:card}));setMiss("");}}
                        style={{width:"100%",display:"flex",alignItems:"flex-start",gap:10,padding:"10px 11px",background:isSelected?`${challenge.categoryColor}22`:C.card,border:`2px solid ${isSelected?challenge.categoryColor:C.border}`,borderRadius:12,textAlign:"left",boxShadow:isSelected?`0 0 14px ${challenge.categoryColor}33`:"none"}}>
                        <span style={{width:24,height:24,borderRadius:7,background:isSelected?challenge.categoryColor:`${challenge.categoryColor}18`,border:`1px solid ${challenge.categoryColor}66`,color:isSelected?"#000":challenge.categoryColor,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,flexShrink:0}}>
                          {isSelected?"✓":"+"}
                        </span>
                        <span>
                          <span style={{display:"block",color:isSelected?C.white:C.grayLt,fontSize:13,fontWeight:800,lineHeight:1.35}}>{card.label}</span>
                          <span style={{display:"block",color:C.gray,fontSize:11,lineHeight:1.35,marginTop:2}}>{card.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {miss&&<div role="alert" style={{marginTop:10,background:`${C.red}12`,border:`1px solid ${C.red}44`,borderRadius:10,padding:"8px 10px",color:C.red,fontSize:12,fontWeight:800}}>{miss}</div>}
          <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>
            <div style={{flex:1,height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
              <div style={{width:`${(Object.keys(selected).length/3)*100}%`,height:"100%",background:complete?challenge.categoryColor:C.grayDk,borderRadius:99,transition:"width .3s"}}/>
            </div>
            <Btn onClick={handleSubmit} disabled={!complete} color={challenge.categoryColor} size="lg" style={{color:"#000",minWidth:140}}>
              MONTAR ⚡
            </Btn>
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12,animation:"popIn .4s ease"}}>
          {/* Result */}
          <div role="status" aria-live="polite" style={{background:result?.hit?`${C.green}15`:`${C.red}15`,border:`2px solid ${result?.hit?C.green:C.red}55`,borderRadius:16,padding:18}}>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:28,color:result?.hit?C.green:C.red,marginBottom:8,filter:`drop-shadow(0 0 8px ${result?.hit?C.green:C.red})`}}>
              {result?.hit?"✅ ACERTOU!":"❌ QUASE! AJUSTA O PLANO"}
            </div>
            {result?.hit&&(
              <>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  {result.found.map(kw=>(
                    <span key={kw} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}55`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700,animation:"popIn .3s ease"}}>✓ {kw}</span>
                  ))}
                  {result.bonus.length>0&&<span style={{background:`${C.yellow}22`,color:C.yellow,border:`1px solid ${C.yellow}55`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700,animation:"popIn .3s ease"}}>⭐ bônus do plano</span>}
                </div>
                <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{color:C.gray,fontSize:11,fontWeight:800,letterSpacing:1,marginBottom:5}}>SEU PLANO</div>
                  <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>{result.text}</p>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  <div style={{color:C.grayLt,fontSize:13}}>Base: <strong style={{color:C.white}}>+{result.basePoints}</strong></div>
                  {result.bonus.length>0&&<div style={{color:C.yellow,fontSize:13}}>Bônus: <strong>+{result.bonusPoints}</strong></div>}
                  {result.comboMultiplier>1&&<div style={{color:C.orange,fontSize:13}}>Combo ×{result.comboMultiplier}: <strong>×{result.comboMultiplier}</strong></div>}
                  <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.yellow,marginLeft:"auto"}}>= +{result.total} pts!</div>
                </div>
                {result.newAllies.length>0&&(
                  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:6}}>
                    {result.newAllies.map(aid=>{const a=ALLIES.find(x=>x.id===aid);return a?(
                      <div key={aid} style={{display:"flex",gap:10,alignItems:"center",animation:"popIn .4s ease"}}>
                        <span style={{fontSize:28}}>{a.icon}</span>
                        <div><div style={{color:a.color,fontWeight:800,fontSize:14}}>🔓 {a.name} desbloqueado!</div><div style={{color:C.gray,fontSize:12}}>{a.power}</div></div>
                      </div>
                    ):null;})}
                  </div>
                )}
                {result.bonus.length>0&&<p style={{color:C.yellow,fontSize:13,margin:"8px 0 0",fontWeight:700}}>{challenge.perfect}</p>}
              </>
            )}
          </div>
          {/* Educational tip */}
          <div style={{background:C.surface,borderLeft:`4px solid ${challenge.categoryColor}`,borderRadius:"0 12px 12px 0",padding:"12px 14px"}}>
            <p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:0}}>{challenge.tip}</p>
          </div>
          <Btn onClick={()=>onSubmit(createPreventionSubmission(result))}
            color={challenge.categoryColor} size="lg" style={{width:"100%",color:"#000"}}>
            {challengeIndex<totalChallenges-1?"BORA PRA PRÓXIMA →":"🏁 FINALIZAR MÓDULO 3"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// Compilado de respostas
function M3Compendium({responses,onBack}){
  const [open,setOpen]=useState(null);
  const allFound=[...new Set(responses.flatMap(r=>r.found||[]))];
  const allAllies=[...new Set(responses.flatMap(r=>r.newAllies||[]))];
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .4s ease"}}>
      <div><Tag label="Compêndio" color={C.teal}/><div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:C.white,letterSpacing:2,marginTop:6}}>SUAS RESPOSTAS</div></div>

      {/* Palavras encontradas */}
      <div style={{background:C.surface,border:`1px solid ${C.green}33`,borderRadius:14,padding:16}}>
        <div style={{color:C.green,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:10}}>🃏 CARTAS-CHAVE ESCOLHIDAS ({allFound.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {allFound.length>0?allFound.map(kw=>(
            <span key={kw} style={{background:`${C.green}22`,color:C.green,border:`1px solid ${C.green}44`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700}}>{kw}</span>
          )):<span style={{color:C.grayDk,fontSize:13}}>Nenhuma carta-chave registrada.</span>}
        </div>
      </div>

      {/* Aliados */}
      {allAllies.length>0&&(
        <div style={{background:C.surface,border:`1px solid ${C.amber}33`,borderRadius:14,padding:16}}>
          <div style={{color:C.amber,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:10}}>🤝 ALIADOS DESBLOQUEADOS ({allAllies.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {allAllies.map(aid=>{const a=ALLIES.find(x=>x.id===aid);return a?(
              <div key={aid} style={{display:"flex",gap:12,alignItems:"center",padding:"8px 12px",background:`${a.color}11`,border:`1px solid ${a.color}33`,borderRadius:10}}>
                <span style={{fontSize:24}}>{a.icon}</span>
                <div><div style={{color:a.color,fontWeight:800,fontSize:14}}>{a.name}</div><div style={{color:C.gray,fontSize:12}}>{a.desc}</div></div>
              </div>
            ):null;})}
          </div>
        </div>
      )}

      {/* Per-question */}
      {PREVENTION_CHALLENGES.map((ch,i)=>{
        const r=responses[i];const answered=r&&r.hit;
        return(
          <div key={ch.id}>
            <button onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:answered?`${ch.categoryColor}15`:C.surface,border:`1px solid ${answered?ch.categoryColor+"44":C.border}`,borderRadius:open===i?"14px 14px 0 0":14,textAlign:"left"}}>
              <span style={{fontSize:24}}>{ch.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:answered?C.white:C.grayLt,fontWeight:700,fontSize:14}}>{ch.category}</div>
                <div style={{color:C.gray,fontSize:12}}>{ch.question.substring(0,55)}...</div>
              </div>
              {answered?<Tag label={`+${r.total} pts`} color={ch.categoryColor}/>:<Tag label="Não respondido" color={C.grayDk}/>}
              <span style={{color:C.gray,fontSize:18}}>{open===i?"−":"+"}</span>
            </button>
            {open===i&&(
              <div style={{background:C.surface,border:`1px solid ${ch.categoryColor}33`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"14px 16px"}}>
                {r?.text&&<p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:"0 0 10px",fontStyle:"italic"}}>"{r.text}"</p>}
                <p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:0}}>{ch.tip}</p>
              </div>
            )}
          </div>
        );
      })}
      <Btn onClick={onBack} color={C.teal} outline size="lg" style={{width:"100%"}}>← VOLTAR AO RESULTADO</Btn>
    </div>
  );
}

function M3Result({responses,prevScore,onCompendium,onNext}){
  const [phase,setPhase]=useState(0);
  useEffect(()=>{SFX.levelUp();const t1=setTimeout(()=>setPhase(1),800);const t2=setTimeout(()=>setPhase(2),2000);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);

  const prevPoints=responses.filter(r=>r&&r.hit).reduce((s,r)=>s+(r.total||0),0);
  const totalScore=prevScore+prevPoints;
  const hitCount=responses.filter(r=>r&&r.hit).length;
  const performance=calculatePreventionPerformance(responses);
  const totalAllies=[...new Set(responses.flatMap(r=>r?.newAllies||[]))];

  const grade=performance.percent>=90?"S":performance.percent>=75?"A":performance.percent>=60?"B":performance.percent>=45?"C":"D";
  const gradeColor=grade==="S"?C.green:grade==="A"?C.teal:grade==="B"?C.yellow:grade==="C"?C.orange:C.red;


  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
      {/* Hero */}
      <div style={{textAlign:"center",background:`${gradeColor}11`,border:`1px solid ${gradeColor}33`,borderRadius:20,padding:"24px 16px",boxShadow:`0 0 40px ${gradeColor}18`}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
          <ModuleArt mod={3} size={110} color={C.green}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:56,color:gradeColor,filter:`drop-shadow(0 0 14px ${gradeColor})`,lineHeight:1}}>{grade}</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:C.white,letterSpacing:2,margin:"10px 0 6px"}}>
          {performance.percent>=90?"MESTRE DA PREVENÇÃO":performance.percent>=75?"GUARDIÃO DA SAÚDE":performance.percent>=50?"APRENDIZ CONSCIENTE":"EM TREINAMENTO"}
        </div>
        <div style={{color:C.gray,fontSize:14}}>{hitCount}/{responses.length||PREVENTION_CHALLENGES.length} desafios acertados</div>
      </div>

      {phase>=1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"popIn .4s ease"}}>
          <div style={{background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTOS TOTAIS</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:C.yellow,lineHeight:1,filter:`drop-shadow(0 0 8px ${C.yellow})`}}><CountUp target={totalScore}/></div>
            <div style={{color:C.gray,fontSize:12}}>acumulados até aqui</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${gradeColor}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>DESEMPENHO M3</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:gradeColor,lineHeight:1,filter:`drop-shadow(0 0 8px ${gradeColor})`}}><CountUp target={performance.percent}/><span style={{fontSize:24,color:C.gray}}>%</span></div>
            <div style={{color:C.gray,fontSize:12}}>{performance.earned}/{performance.maximum} pts possíveis</div>
          </div>
        </div>
      )}

      {phase>=2&&(
        <>
          {/* Aliados desbloqueados */}
          {totalAllies.length>0&&(
            <div style={{background:C.surface,border:`1px solid ${C.amber}33`,borderRadius:14,padding:16,animation:"fadeUp .4s ease"}}>
              <div style={{color:C.amber,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:10}}>🤝 ALIADOS CONQUISTADOS ({totalAllies.length}/{ALLIES.length})</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {ALLIES.map(a=>{
                  const owned=totalAllies.includes(a.id);
                  return(
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:owned?`${a.color}22`:C.surface,border:`1px solid ${owned?a.color+"55":C.border}`,borderRadius:10,opacity:owned?1:.4}}>
                      <span style={{fontSize:20}}>{a.icon}</span>
                      <span style={{color:owned?a.color:C.gray,fontWeight:700,fontSize:12}}>{a.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progresso individual: sem ranking fictício */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,animation:"fadeUp .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:22}}>🎯</span>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.yellow,letterSpacing:2}}>SEU PROGRESSO</div>
            </div>
            <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:"0 0 10px"}}>Você concluiu <strong style={{color:C.white}}>{hitCount}</strong> de <strong style={{color:C.white}}>{responses.length||PREVENTION_CHALLENGES.length}</strong> planos. A barra compara seus pontos com o máximo real das cartas que apareceram na sua partida.</p>
            <ProgressBar value={performance.percent} max={100} color={gradeColor} h={7}/>
          </div>

          {/* Summary */}
          <div style={{background:C.surface,borderLeft:`4px solid ${C.teal}`,borderRadius:"0 14px 14px 0",padding:"14px 16px",animation:"fadeUp .4s ease"}}>
            <div style={{color:C.teal,fontSize:13,fontWeight:800,marginBottom:6}}>💡 O QUE ESTE MÓDULO TREINOU</div>
            <p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:0}}>
              Prevenção da hipertensão começa nos hábitos — exercício, alimentação, sono e gestão do estresse.
              Seus aliados: médico, nutricionista, educador físico, família e <strong style={{color:C.white}}>você mesmo</strong>.
              Hábitos saudáveis ajudam a reduzir o risco cardiovascular ao longo da vida, mas o efeito varia de pessoa para pessoa.
            </p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <UnlockCard mod={4} icon="🔓" title="MÓDULO 4 DESBLOQUEADO!" body="Agora reconheça sinais de alarme sem tentar diagnosticar pressão alta pelos sintomas." color={C.red}>
              <Btn onClick={onNext} color={C.red} size="lg" style={{width:"100%"}}>🔍 MÓDULO 4 — CAÇADOR DE ALERTAS →</Btn>
            </UnlockCard>
          </div>
          <p style={{color:C.grayDk,fontSize:11,textAlign:"center"}}>⚕️ Diretriz Brasileira de Hipertensão 2025 · OMS 2020 · AASM · AHA/ASA 2026</p>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 4 — CAÇADOR DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════════
export const M4_SYMPTOMS=[
  // real:true = sinal de alarme quando surge com PA muito alta ou início súbito; não é diagnóstico de hipertensão.
  {id:1,text:"Dor ou aperto no peito",emoji:"💔",real:true,tip:"Dor no peito pode indicar lesão aguda do coração. Se vier com pressão muito alta, é sinal de emergência."},
  {id:2,text:"Falta de ar importante",emoji:"😮‍💨",real:true,tip:"Falta de ar intensa pode indicar comprometimento cardíaco ou pulmonar e merece atendimento rápido."},
  {id:3,text:"Fraqueza de um lado ou fala enrolada",emoji:"🧠",real:true,tip:"Pode ser sinal de AVC. Não espere melhorar: chame o SAMU 192."},
  {id:4,text:"Confusão, desmaio ou convulsão",emoji:"⚡",real:true,tip:"Alteração importante do estado mental é sinal de alarme e precisa de avaliação urgente."},
  {id:5,text:"Alteração visual súbita e importante",emoji:"👁️",real:true,tip:"Perda ou piora súbita da visão pode acompanhar lesão aguda e precisa ser avaliada."},
  {id:6,text:"Dor de cabeça súbita e muito intensa",emoji:"🤕",real:true,tip:"Uma dor súbita, muito forte e diferente do habitual é sinal de alerta por várias causas, não um diagnóstico de hipertensão."},
  {id:7,text:"Zumbido isolado no ouvido",emoji:"👂",real:false,tip:"Zumbido tem várias causas e não permite saber se a pressão está alta."},
  {id:8,text:"Sangramento nasal isolado",emoji:"🩸",real:false,tip:"Sangramento nasal é comum e, sozinho, não indica hipertensão."},
  {id:9,text:"Rosto vermelho e quente",emoji:"🥵",real:false,tip:"Calor, exercício e emoção podem deixar o rosto vermelho. Isso não mede pressão."},
  {id:10,text:"Cansaço depois de dormir pouco",emoji:"😴",real:false,tip:"Cansaço é inespecífico e não permite diagnosticar hipertensão."},
  {id:11,text:"Tosse seca persistente",emoji:"🤧",real:false,tip:"Tosse tem muitas causas e não é um sinal usado para detectar hipertensão."},
  {id:12,text:"Coceira na pele",emoji:"🦟",real:false,tip:"Coceira não é um marcador de pressão alta."},
  {id:13,text:"Dor de garganta",emoji:"😤",real:false,tip:"Dor de garganta não ajuda a reconhecer hipertensão."},
  {id:14,text:"Febre alta",emoji:"🌡️",real:false,tip:"Febre não é um marcador de hipertensão."},
  {id:15,text:"Dor nos joelhos",emoji:"🦵",real:false,tip:"Dor articular não serve para identificar pressão alta."},
  {id:16,text:"Palpitação isolada",emoji:"💓",real:false,tip:"Palpitação pode ocorrer por ansiedade, cafeína, arritmias e outras causas. Sozinha, não indica hipertensão."},
];

function shuffleArr(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function M4Intro({onStart}){
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:20,padding:"28px 20px",boxShadow:`0 0 50px ${C.red}15`}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14,animation:"float 3s ease infinite"}}>
          <ModuleArt mod={4} size={150} color={C.red}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:C.red,marginBottom:8}}>MÓDULO 4</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:32,color:C.white,lineHeight:1.1,marginBottom:12}}>CAÇADOR DE ALERTAS</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7}}>
          A hipertensão costuma não dar sintomas. Quando a pressão está <em>muito</em> alta, alguns sinais podem aparecer — mas nenhum deles confirma o diagnóstico sem aferição e avaliação.<br/><br/>
          Bora ver se você separa um sinal de alerta de uma pegadinha que não diz se a pressão está alta?
        </p>
      </div>
      <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`}}>
        <div style={{color:C.amber,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:12}}>📋 COMO JOGAR</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            ["🎯","Escolha os 6 sinais de alarme entre as 16 opções"],
            ["✅","Acerte um sinal de alerta: +10 pontos"],
            ["❌","Marque um distrator: −5 pontos"],
            ["🏆","Encontre os 6 sem errar: badge especial!"],
          ].map(([ic,tx])=>(
            <div key={tx} style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>{ic}</span>
              <span style={{color:C.grayLt,fontSize:13,lineHeight:1.5}}>{tx}</span>
            </div>
          ))}
        </div>
      </div>
      <Btn onClick={onStart} color={C.red} size="lg" style={{width:"100%"}}>🔍 COMEÇAR A CAÇADA</Btn>
    </div>
  );
}

function M4Game({onFinish}){
  const symptoms=useRef(shuffleArr(M4_SYMPTOMS)).current;
  const [selected,setSelected]=useState(new Set());
  const [submitted,setSubmitted]=useState(false);

  const MAX_SEL=M4_SYMPTOMS.filter(s=>s.real).length;
  const toggle=(id)=>{if(submitted)return;setSelected(p=>{const n=new Set(p);if(n.has(id)){n.delete(id);SFX.click();return n;}if(n.size>=MAX_SEL)return p;SFX.click();n.add(id);return n;});};

  const realSymptoms=M4_SYMPTOMS.filter(s=>s.real);
  const correctHits=submitted?realSymptoms.filter(s=>selected.has(s.id)).length:0;
  const wrongHits=submitted?M4_SYMPTOMS.filter(s=>!s.real&&selected.has(s.id)).length:0;
  const score=submitted?calculateAlertScore(correctHits,wrongHits):0;
  const perfect=correctHits===realSymptoms.length&&wrongHits===0;

  const getCardSt=(s)=>{
    const isSel=selected.has(s.id);
    if(!submitted) return{bg:isSel?`${C.red}22`:C.card,bd:`2px solid ${isSel?C.red:C.border}`,transform:isSel?"scale(1.02)":"scale(1)",shadow:isSel?`0 0 16px ${C.red}40`:"none"};
    if(isSel&&s.real)  return{bg:`${C.green}22`,bd:`2px solid ${C.green}`,transform:"scale(1)",shadow:`0 0 12px ${C.green}30`};
    if(isSel&&!s.real) return{bg:`${C.red}22`,bd:`2px solid ${C.red}`,transform:"scale(1)",shadow:`0 0 12px ${C.red}30`};
    if(!isSel&&s.real) return{bg:`${C.yellow}11`,bd:`2px dashed ${C.yellow}66`,transform:"scale(1)",shadow:"none"};
    return{bg:C.card,bd:`2px solid ${C.border}`,transform:"scale(1)",shadow:"none"};
  };

  const tipSymptoms=submitted
    ?M4_SYMPTOMS.filter(s=>(selected.has(s.id)&&!s.real)||(!selected.has(s.id)&&s.real)).slice(0,8)
    :[];

  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:22,color:C.red,letterSpacing:2}}>🔍 CAÇADOR DE ALERTAS</div>
        <div style={{color:C.gray,fontSize:13,marginTop:4}}>
          {submitted
            ?`${correctHits} de ${realSymptoms.length} sinais encontrados · ${wrongHits} erro${wrongHits!==1?"s":""}`
            :`${selected.size}/${MAX_SEL} selecionados — escolha os sinais que pedem avaliação urgente`}
        </div>
      </div>

      {submitted&&(
        <div role="status" aria-live="polite" style={{textAlign:"center",background:perfect?`${C.green}15`:`${C.amber}11`,border:`1px solid ${perfect?C.green:C.amber}44`,borderRadius:16,padding:"16px 12px",animation:"popIn .4s ease"}}>
          <div style={{fontSize:44,marginBottom:4}}>{perfect?"🏆":correctHits>=4?"🥇":correctHits>=3?"🥈":"🥉"}</div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:40,color:perfect?C.green:C.amber,filter:`drop-shadow(0 0 10px ${perfect?C.green:C.amber})`}}>{score} <span style={{fontSize:18,color:C.gray}}>pts</span></div>
          {perfect&&<div style={{color:C.green,fontSize:13,fontWeight:700,marginTop:4}}>🎉 PERFEITO! Todos os sinais de alerta encontrados!</div>}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {symptoms.map(s=>{
          const isSel=selected.has(s.id);
          const cs=getCardSt(s);
          return(
            <button key={s.id} onClick={()=>toggle(s.id)} aria-pressed={isSel} disabled={submitted}
              style={{background:cs.bg,border:cs.bd,transform:cs.transform,boxShadow:cs.shadow,borderRadius:14,padding:"12px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:submitted?"default":"pointer",transition:"all .18s",minHeight:86,color:C.white,animation:submitted&&isSel?(s.real?"correctPop .42s ease":"wrongBuzz .42s ease"):"none"}}>
              <span style={{fontSize:26}}>{s.emoji}</span>
              <span style={{fontSize:10,fontWeight:700,textAlign:"center",lineHeight:1.3}}>{s.text}</span>
              {submitted&&(
                <span style={{fontSize:9,fontWeight:800,color:isSel&&s.real?C.green:isSel&&!s.real?C.red:!isSel&&s.real?C.yellow:C.gray}}>
                  {isSel&&s.real?"✓ BOA!":isSel&&!s.real?"✗ QUASE!":!isSel&&s.real?"← ERA ALERTA":""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {submitted&&tipSymptoms.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,animation:"fadeUp .4s ease"}}>
          <div style={{color:C.teal,fontSize:11,fontWeight:800,letterSpacing:2}}>💡 APRENDA COM OS ERROS</div>
          {tipSymptoms.map(s=>(
            <div key={s.id} style={{background:C.card,borderLeft:`3px solid ${s.real?C.yellow:C.red}`,borderRadius:"0 10px 10px 0",padding:"10px 12px"}}>
              <div style={{fontSize:11,fontWeight:700,color:s.real?C.yellow:C.red,marginBottom:3}}>{s.emoji} {s.text} {s.real?"(é alerta)":"(não é alerta)"}</div>
              <div style={{fontSize:12,color:C.grayLt}}>{s.tip}</div>
            </div>
          ))}
        </div>
      )}

      {!submitted?(
        <Btn onClick={()=>{if(selected.size===MAX_SEL){const rh=M4_SYMPTOMS.filter(s=>s.real&&selected.has(s.id)).length;const wh=M4_SYMPTOMS.filter(s=>!s.real&&selected.has(s.id)).length;if(rh===realSymptoms.length&&wh===0)SFX.levelUp();else if(rh>wh)SFX.correct();else SFX.wrong();setSubmitted(true);}}} color={C.red} size="lg" style={{width:"100%",opacity:selected.size<MAX_SEL?0.4:1}}>
          ⚡ VERIFICAR RESPOSTAS {selected.size<MAX_SEL?`(${MAX_SEL-selected.size} restantes)`:"→"}
        </Btn>
      ):(
        <Btn onClick={()=>onFinish(score,perfect)} color={C.green} size="lg" style={{width:"100%",color:"#000"}}>
          CONTINUAR → RESULTADO FINAL
        </Btn>
      )}
    </div>
  );
}

function M4Result({score,perfect,totalScore,onNext}){
  const [phase,setPhase]=useState(0);
  useEffect(()=>{if(perfect)SFX.combo();else SFX.levelUp();const t1=setTimeout(()=>setPhase(1),600),t2=setTimeout(()=>setPhase(2),1400);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:20,padding:"28px 20px",boxShadow:`0 0 40px ${C.red}18`}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
          <ModuleArt mod={4} size={110} color={C.red}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:C.red,marginBottom:6}}>JORNADA COMPLETA</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:28,color:C.white,lineHeight:1.1,marginBottom:8}}>
          {perfect?"MANDOU MUITO BEM!":"INVESTIGAÇÃO CONCLUÍDA"}
        </div>
        <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6}}>
          Você fechou o <strong style={{color:C.white}}>Módulo 4</strong>! Mais uma fase desbloqueada.<br/>
          Ainda faltam consequências, ações de ajuda e o quiz final.
        </p>
      </div>
      {phase>=1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"popIn .4s ease"}}>
          <div style={{background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTUAÇÃO TOTAL</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:40,color:C.yellow,lineHeight:1}}><CountUp target={totalScore}/></div>
            <div style={{color:C.gray,fontSize:12}}>pontuação acumulada</div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.purple}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>MÓDULO 4</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:40,color:C.purple,lineHeight:1}}><CountUp target={score}/></div>
            <div style={{color:C.gray,fontSize:12}}>pts alertas</div>
          </div>
        </div>
      )}
      {phase>=2&&(
        <div style={{background:C.surface,borderLeft:`4px solid ${C.red}`,borderRadius:"0 14px 14px 0",padding:"14px 16px",animation:"fadeUp .4s ease"}}>
          <div style={{color:C.red,fontSize:13,fontWeight:800,marginBottom:6}}>⚕️ Mensagem final</div>
          <p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:0}}>
            A hipertensão é comum e frequentemente não causa sintomas. A única forma de saber é medir a pressão corretamente.
            Sintomas isolados não confirmam hipertensão. Se houver pressão muito alta junto com dor no peito, falta de ar, alteração neurológica, confusão ou alteração visual importante, <strong style={{color:C.yellow}}>procure atendimento urgente</strong>.
          </p>
        </div>
      )}
      <UnlockCard mod={5} icon="🔓" title="PRÓXIMA FASE LIBERADA!" body="Agora vem a parte de decidir: situações simuladas em que sua escolha muda o caminho da história." color={C.orange}>
        <Btn onClick={onNext} color={C.orange} size="lg" style={{width:"100%"}}>⚠️ PARTIU MÓDULO 5 →</Btn>
      </UnlockCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 5 — CONSEQUÊNCIAS (SIMULAÇÃO NARRATIVA)
// ═══════════════════════════════════════════════════════════════════════════════
// Banco de cenários M5 — 18 casos, 4 sorteados por jogo
export const M5_SCENARIOS_BANK=[
  {id:"avc",icon:"🧠",title:"AVC",color:C.red,
   intro:"João, 45 anos. Pressão 180/110 mmHg há meses sem tratamento. Hoje tudo muda.",
   steps:[
     {sit:"João acorda com fraqueza no lado direito do corpo e fala embaralhada.",
      choices:[
        {t:"Deitar e esperar passar",dmg:40,ok:false,fb:"❌ Esperar pode atrasar um tratamento que é dependente de tempo."},
        {t:"Tomar analgésico e observar",dmg:25,ok:false,fb:"⚠️ Analgésico não trata AVC e não deve atrasar o atendimento."},
        {t:"Ligar SAMU (192) agora",dmg:0,ok:true,fb:"✅ Suspeita de AVC é emergência. Acionar o SAMU reduz atrasos até um serviço preparado para avaliação."}]},
     {sit:"No hospital, o médico pergunta quando os sintomas começaram exatamente.",
      choices:[
        {t:"\"Não sei ao certo…\"",dmg:10,ok:false,fb:"⚠️ Diga exatamente o que sabe, inclusive a última vez em que a pessoa foi vista bem. Mesmo com início incerto, alguns pacientes podem receber tratamento após avaliação e imagem."},
        {t:"\"Vi no relógio — faz 2 horas\"",dmg:0,ok:true,fb:"✅ O horário de início é decisivo. Alguns pacientes podem receber trombólise intravenosa até 4,5 horas, após avaliação e imagem; outros podem ter indicação de trombectomia em janelas maiores."},
        {t:"\"É desde ontem\"",dmg:40,ok:false,fb:"⚠️ Estar fora da janela usual de trombólise IV não encerra as opções. A equipe avalia imagem, contraindicações e possível trombectomia em casos selecionados."}]}],
   lesson:"Pressão alta merece respeito: quando está bem acompanhada e controlada, você reduz um fator importante de risco cardiovascular."},
  {id:"infarto",icon:"💔",title:"Infarto",color:C.red,
   intro:"Ana, 52 anos. Hipertensa sem controle há 10 anos. Sente dor intensa no peito irradiando para o braço.",
   steps:[
     {sit:"Ana sente dor no peito, suor frio e náusea. PA: 200/120 mmHg.",
      choices:[
        {t:"\"É estresse, vou respirar fundo\"",dmg:35,ok:false,fb:"❌ Dor no peito com suor frio e náusea pode ser uma emergência. Melhorar por alguns minutos não exclui infarto."},
        {t:"Pedir carona para o hospital",dmg:15,ok:false,fb:"⚠️ Melhor que esperar, mas o SAMU tem desfibrilador e começa o tratamento antes."},
        {t:"Ligar SAMU (192) imediatamente",dmg:0,ok:true,fb:"✅ Dor no peito com sinais de alarme exige atendimento imediato. O SAMU pode iniciar o cuidado e encaminhar para reperfusão quando indicada."}]},
     {sit:"No hospital, a equipe explica que o tratamento depende do tipo de infarto e dos exames.",
      choices:[
        {t:"Seguir a avaliação e as orientações da equipe",dmg:0,ok:true,fb:"✅ No infarto, o tratamento é definido rapidamente conforme ECG, sintomas, exames e disponibilidade de reperfusão."},
        {t:"Ir embora porque a dor melhorou",dmg:35,ok:false,fb:"❌ Melhorar da dor não exclui infarto. A avaliação precisa continuar."},
        {t:"Tomar remédio de outra pessoa por conta própria",dmg:40,ok:false,fb:"❌ Automedicação pode causar dano e atrasar o tratamento correto."}]}],
   lesson:"Hipertensão aumenta o risco de doença coronariana. O controle adequado da pressão reduz eventos cardiovasculares."},
  {id:"renal",icon:"🫘",title:"Insuf. Renal",color:C.orange,
   intro:"Pedro, 38 anos. Tem hipertensão há muitos anos e agora recebeu diagnóstico de doença renal crônica.",
   steps:[
     {sit:"A equipe explica que controlar a pressão faz parte do cuidado para proteger os rins.",
      choices:[
        {t:"Tomar remédio só quando sentir mal",dmg:40,ok:false,fb:"❌ Pressão alta pode causar dano mesmo sem sintomas. Tratamento deve seguir a prescrição."},
        {t:"Seguir medicação, alimentação e acompanhamento",dmg:0,ok:true,fb:"✅ O cuidado da doença renal é individual e inclui controle da pressão, medicamentos e alimentação conforme orientação."},
        {t:"Mudar líquidos e remédios por conta própria",dmg:25,ok:false,fb:"❌ Na doença renal, quantidade de líquidos e medicamentos depende do quadro de cada pessoa."}]},
     {sit:"Pedro pergunta se pode usar um produto natural que viu na internet.",
      choices:[
        {t:"Usar sem contar à equipe porque é natural",dmg:30,ok:false,fb:"❌ Produtos naturais também podem interagir com remédios ou prejudicar os rins."},
        {t:"Levar o produto para discutir com a equipe",dmg:0,ok:true,fb:"✅ Na doença renal, vale conferir qualquer suplemento ou medicamento antes de usar."},
        {t:"Parar o tratamento e usar apenas o produto",dmg:40,ok:false,fb:"❌ Substituir tratamento prescrito por conta própria pode ser perigoso."}]}],
   lesson:"Hipertensão e doença renal podem alimentar uma à outra. Controlar a pressão ajuda a proteger a função dos rins e reduzir complicações."},
  {id:"jovem_hta",icon:"🧑‍⚕️",title:"Hipertensão Jovem",color:C.amber,
   intro:"Bia, 16 anos. Na triagem escolar, PA: 155/100 mmHg. O médico quer investigar. O pai acha exagero.",
   steps:[
     {sit:"Médico confirma hipertensão. Pai de Bia diz: 'é nervo, vai passar'. Bia precisa decidir.",
      choices:[
        {t:"Concordar com o pai e ignorar",dmg:40,ok:false,fb:"❌ Hipertensão em adolescente precisa ser confirmada e acompanhada. Ignorar pode atrasar a investigação e o cuidado."},
        {t:"Pedir avaliação e investigar a causa",dmg:0,ok:true,fb:"✅ Hipertensão em adolescente merece confirmação e avaliação clínica, inclusive de possíveis causas secundárias quando indicado."},
        {t:"Tomar remédio 1 mês e parar",dmg:25,ok:false,fb:"⚠️ Tratamento não deve ser interrompido sem orientação, mesmo quando a pessoa se sente bem."}]},
     {sit:"Com tratamento, médico orienta mudanças de estilo de vida. Bia escolhe o que vai fazer.",
      choices:[
        {t:"Só tomar o remédio, sem considerar hábitos",dmg:20,ok:false,fb:"⚠️ Quando prescrita, medicação faz parte do cuidado, mas alimentação, atividade física, sono e outros hábitos também importam."},
        {t:"Mudar hábitos e manter o tratamento prescrito",dmg:0,ok:true,fb:"✅ A combinação de acompanhamento, hábitos e tratamento indicado aumenta a chance de bom controle."},
        {t:"Parar o remédio quando se sentir bem",dmg:35,ok:false,fb:"❌ Sentir-se bem não significa que a pressão esteja controlada. Mudanças no tratamento são feitas com a equipe de saúde."}]}],
   lesson:"Pressão alta também ocorre em adolescentes. Valores elevados precisam ser confirmados com técnica adequada e avaliação clínica."},
  {id:"crise_familiar",icon:"👨‍👩‍👧",title:"Crise em Casa",color:C.orange,
   intro:"Lucas, 15 anos. São 23h. Sua mãe hipertensa está com PA 190/115 e começa a ter visão muito embaçada e confusão. O pai não está.",
   steps:[
     {sit:"São 23h. Mãe com PA muito alta, sintomas neurológicos. Lucas está sozinho com ela.",
      choices:[
        {t:"Dar dose extra do remédio e colocar para dormir",dmg:35,ok:false,fb:"❌ Não aumente dose por conta própria nem espere dormir passar. Sinais neurológicos com pressão muito alta exigem avaliação urgente."},
        {t:"Ligar para o SAMU (192) imediatamente",dmg:0,ok:true,fb:"✅ Boa decisão. Sinais neurológicos com pressão muito alta precisam de atendimento imediato."},
        {t:"Esperar o pai chegar para decidir",dmg:40,ok:false,fb:"❌ Esperar pode atrasar o diagnóstico e o tratamento de uma emergência."}]},
     {sit:"No hospital, médico pergunta os remédios que a mãe usa. Lucas não sabe de cabeça.",
      choices:[
        {t:"Dizer que não sabe nada",dmg:15,ok:false,fb:"⚠️ Informar os medicamentos conhecidos pode ajudar a equipe. Diga apenas o que souber, sem inventar."},
        {t:"Voltar em casa buscar as caixas dos remédios",dmg:5,ok:false,fb:"⚠️ Útil, mas Lucas poderia ter fotografado antes de sair de casa."},
        {t:"Mostrar fotos das caixas salvas no celular",dmg:0,ok:true,fb:"✅ Boa decisão. Fotos das caixas podem fornecer informações úteis para a avaliação da equipe."}]}],
   lesson:"Ter uma lista atualizada dos remédios pode ajudar a equipe em consultas e emergências. O mais importante é acionar ajuda quando surgem sinais de alarme."},
  {id:"obesidade",icon:"⚖️",title:"Peso e Pressão",color:C.yellow,
   intro:"Rodrigo, 17 anos, sobrepeso. Médico detecta PA 148/95. 'Pressão elevada: precisa confirmar e avaliar. O peso pode ser um dos fatores associados.'",
   steps:[
     {sit:"Médico recomenda perda de peso antes de remédios. Rodrigo decide como agir.",
      choices:[
        {t:"Fazer dieta radical para emagrecer rápido",dmg:25,ok:false,fb:"⚠️ Dietas muito restritivas não são uma estratégia segura para fazer por conta própria. O melhor é buscar orientação e mudanças sustentáveis."},
        {t:"Acompanhamento com nutricionista + caminhada",dmg:0,ok:true,fb:"✅ Acompanhamento profissional, alimentação e movimento ajudam no controle da pressão e da saúde cardiovascular."},
        {t:"Ignorar — pressão assim não mata jovem",dmg:40,ok:false,fb:"❌ Hipertensão não controlada pode lesar coração, cérebro, rins e vasos ao longo do tempo."}]},
     {sit:"Colegas oferecem termogênicos 'para secar'. Rodrigo está tentado.",
      choices:[
        {t:"Tomar — é natural, não faz mal",dmg:30,ok:false,fb:"❌ Estimulantes podem elevar batimentos e pressão. Com uma medida já alterada, o mais seguro é buscar orientação."},
        {t:"Consultar o médico antes de qualquer coisa",dmg:0,ok:true,fb:"✅ Boa decisão. Um profissional pode avaliar ingredientes, dose, contexto e possíveis contraindicações."},
        {t:"Tomar só nos dias de academia",dmg:20,ok:false,fb:"⚠️ Usar apenas em alguns dias não torna um estimulante automaticamente seguro. Vale buscar orientação antes de usar."}]}],
   lesson:"Excesso de peso aumenta a chance de pressão alta em jovens. Mudanças graduais de alimentação, atividade física e peso podem melhorar a pressão, com acompanhamento profissional quando necessário."},
  {id:"energetico",icon:"🥤",title:"Maratona de Estudos",color:C.purple,
   intro:"Nina, 16 anos, vai virar a noite estudando para prova. Ela tomou dois energéticos e agora sente palpitação e dor de cabeça.",
   steps:[
     {sit:"Nina sente o coração acelerado, tremor e pressão 160/100 depois dos energéticos.",
      choices:[
        {t:"Tomar mais energético para não dormir",dmg:40,ok:false,fb:"❌ Mais estimulante pode piorar palpitação, ansiedade e pressão. A situação ficou perigosa."},
        {t:"Parar os estimulantes, beber água e avisar um adulto",dmg:0,ok:true,fb:"✅ Boa. Ela parou o estimulante e chamou um adulto para acompanhar a situação com segurança."},
        {t:"Tomar remédio de pressão da avó",dmg:35,ok:false,fb:"❌ Remédio de outra pessoa pode causar queda brusca ou mascarar algo grave."}]},
     {sit:"A prova é amanhã. Nina precisa decidir como se organizar depois do susto.",
      choices:[
        {t:"Dormir poucas horas e compensar no fim de semana",dmg:25,ok:false,fb:"⚠️ Sono ruim mantém estresse alto e pode repetir o ciclo."},
        {t:"Planejar estudo em blocos e dormir 8h",dmg:0,ok:true,fb:"✅ Boa escolha. Para adolescentes, sono regular de 8 a 10 horas favorece saúde, atenção e aprendizagem."},
        {t:"Usar pré-treino para estudar",dmg:35,ok:false,fb:"❌ Pré-treino é estimulante. Não é ferramenta de estudo e pode elevar a PA."}]}],
   lesson:"Energético não é estratégia de estudo. Cafeína e outros estimulantes podem aumentar batimentos, ansiedade e pressão arterial."},
  {id:"gamer",icon:"🎮",title:"Rankeada Sem Pausa",color:C.navy,
   intro:"Caio, 15 anos, passou 7 horas jogando sem levantar, com salgadinho e refrigerante. À noite sente tontura e dor de cabeça.",
   steps:[
     {sit:"Caio está tonto, irritado e não bebeu água direito. A mãe quer medir a pressão.",
      choices:[
        {t:"Recusar porque 'é coisa de velho'",dmg:30,ok:false,fb:"❌ Jovem também pode ter pressão alta. Ignorar atrasa cuidado."},
        {t:"Medir a pressão e fazer pausa",dmg:0,ok:true,fb:"✅ Boa escolha. Medir trouxe informação e permitiu decidir os próximos passos com mais segurança."},
        {t:"Continuar jogando para terminar a partida",dmg:25,ok:false,fb:"⚠️ Mais estresse, tela e sedentarismo prolongaram os sintomas."}]},
     {sit:"No dia seguinte, Caio quer manter os games sem prejudicar a saúde.",
      choices:[
        {t:"Pausas a cada hora, água e lanche melhor",dmg:0,ok:true,fb:"✅ Dá para jogar e cuidar da saúde. Pausas reduzem sedentarismo e tensão."},
        {t:"Trocar água por refrigerante zero",dmg:15,ok:false,fb:"⚠️ Pode reduzir açúcar, mas não resolve hidratação, sono e sedentarismo."},
        {t:"Jogar só de madrugada para não ser interrompido",dmg:35,ok:false,fb:"❌ Virar a noite prejudica sono, estresse e controle da pressão."}]}],
   lesson:"O problema não é jogar. É juntar muitas horas sentado, pouco sono, sal, açúcar e zero pausas."},
  {id:"bullying",icon:"😟",title:"Pressão Emocional",color:C.purple,
   intro:"Lara, 14 anos, sofre comentários sobre seu corpo na escola. Ela começou a comer escondido e dormir mal.",
   steps:[
     {sit:"Lara sente ansiedade antes da aula, dor de cabeça e evita Educação Física.",
      choices:[
        {t:"Guardar tudo e faltar às aulas",dmg:35,ok:false,fb:"❌ Isolamento aumenta sofrimento, sedentarismo e piora a rotina."},
        {t:"Conversar com adulto de confiança e pedir ajuda",dmg:0,ok:true,fb:"✅ Apoio reduz estresse e abre caminho para proteger saúde mental e física."},
        {t:"Fazer dieta extrema por conta própria",dmg:30,ok:false,fb:"❌ Dieta radical pode causar efeito sanfona, culpa e piora do estresse."}]},
     {sit:"A escola chama Lara para montar um plano de cuidado.",
      choices:[
        {t:"Atividade física gradual e acompanhamento",dmg:0,ok:true,fb:"✅ Boa! Movimento gradual e acompanhamento ajudam a cuidar da saúde sem transformar o corpo em inimigo."},
        {t:"Tomar remédio para emagrecer sem médico",dmg:40,ok:false,fb:"❌ Remédios e estimulantes sem orientação podem elevar pressão e trazer riscos sérios."},
        {t:"Só ignorar os comentários e seguir sozinha",dmg:20,ok:false,fb:"⚠️ Ignorar sem rede de apoio deixa Lara vulnerável ao estresse crônico."}]}],
   lesson:"Saúde cardiovascular também passa por saúde mental, acolhimento e ambiente seguro."},
  {id:"sal_oculto",icon:"🍜",title:"Sódio Escondido",color:C.amber,
   intro:"Vitor, 16 anos, acha que não come sal porque quase não usa saleiro. Mas vive de macarrão instantâneo, embutidos e molhos prontos.",
   steps:[
     {sit:"Na consulta, a pressão de Vitor deu 150/95. O médico pergunta sobre alimentos industrializados.",
      choices:[
        {t:"Dizer que não usa sal e encerrar assunto",dmg:25,ok:false,fb:"⚠️ O sal oculto dos industrializados continuou fora do radar."},
        {t:"Mostrar a rotina real de lanches e rótulos",dmg:0,ok:true,fb:"✅ O médico identificou sódio escondido e orientou trocas possíveis."},
        {t:"Cortar água para 'não reter líquido'",dmg:35,ok:false,fb:"❌ Desidratação não trata pressão alta e pode causar outros problemas."}]},
     {sit:"Vitor precisa escolher uma mudança para começar esta semana.",
      choices:[
        {t:"Trocar temperos prontos por alho, cebola e ervas",dmg:0,ok:true,fb:"✅ Uma troca realista reduziu sódio sem deixar a comida sem sabor."},
        {t:"Comer miojo sem o caldo, mas todo dia",dmg:18,ok:false,fb:"⚠️ Ajuda um pouco, mas ainda mantém ultraprocessado como base da rotina."},
        {t:"Usar molho shoyu para substituir sal",dmg:30,ok:false,fb:"❌ Shoyu costuma ter muito sódio. A troca pode piorar."}]}],
   lesson:"Muito sódio não vem só do saleiro. Ele aparece em temperos prontos, embutidos, salgadinhos e refeições instantâneas."},
  {id:"anabolico",icon:"💉",title:"Ciclo na Academia",color:C.red,
   intro:"Diego, 17 anos. Um 'coach' da academia ofereceu anabolizante para secar em 8 semanas. Diego quer resultado rápido para o verão.",
   steps:[
     {sit:"O coach diz que 'todo mundo usa' e que a bomba é segura sem médico.",
      choices:[
        {t:"Aceitar o ciclo para emagrecer rápido",dmg:40,ok:false,fb:"❌ Anabolizante sem orientação pode elevar PA, prejudicar fígado e coração."},
        {t:"Recusar e pedir plano com personal/nutri de verdade",dmg:0,ok:true,fb:"✅ Diego escolheu treino e alimentação com acompanhamento, sem usar anabolizante por conta própria."},
        {t:"Usar só metade da dose 'para testar'",dmg:30,ok:false,fb:"⚠️ Dose menor não torna o uso informal seguro. Os efeitos cardiovasculares continuam possíveis."}]},
     {sit:"Amigos zoam Diego por não aceitar. Ele precisa decidir o próximo passo.",
      choices:[
        {t:"Ceder à pressão do grupo",dmg:35,ok:false,fb:"❌ Pressão social não é indicação médica. O risco permanece."},
        {t:"Conversar com adulto/profissional de saúde",dmg:0,ok:true,fb:"✅ Apoio reforçou a escolha segura e afastou o 'coach' irregular."},
        {t:"Comprar termogênico forte no lugar",dmg:25,ok:false,fb:"⚠️ Estimulante forte também pode disparar batimentos e pressão."}]}],
   lesson:"Shape não vale colocar o coração no modo hard. Anabolizante e estimulante sem orientação podem trazer risco de verdade."},
  {id:"fest_alcool",icon:"🍺",title:"Festa e Bebida",color:C.orange,
   intro:"Marina, 16 anos, vai a uma festa. Oferecem bebida + energético. Ela já está ansiosa por causa de prova.",
   steps:[
     {sit:"Alguém entrega um copo e diz que 'é só para animar'.",
      choices:[
        {t:"Beber o mix de álcool e energético",dmg:35,ok:false,fb:"❌ A mistura mascara embriaguez e pode elevar batimentos e pressão."},
        {t:"Recusar e ficar com água",dmg:0,ok:true,fb:"✅ Boa escolha. Ela curtiu sem adicionar mais estimulantes à situação."},
        {t:"Beber só o energético, sem álcool",dmg:18,ok:false,fb:"⚠️ Melhor que misturar, mas cafeína alta ainda pode acelerar o coração."}]},
     {sit:"Uma amiga passa mal: coração acelerado e dor de cabeça.",
      choices:[
        {t:"Deixar dormir no sofá e 'passar'",dmg:30,ok:false,fb:"❌ Sintomas + estimulante pedem atenção de adulto/ajuda."},
        {t:"Chamar um adulto e monitorar sinais",dmg:0,ok:true,fb:"✅ Mandou bem: chamar um adulto e acompanhar os sinais foi a escolha mais segura."},
        {t:"Dar café para 'acordar'",dmg:25,ok:false,fb:"⚠️ Mais estimulante piora taquicardia."}]}],
   lesson:"No rolê, misturar álcool com energético não é combo inocente. Limite e água continuam sendo escolhas mais seguras."},
  {id:"vape_fumo",icon:"🚬",title:"Vape na Escola",color:C.red,
   intro:"Rafa, 15 anos, começou a usar vape nos intervalos. Diz que 'não é cigarro'. Sente tontura depois de usar.",
   steps:[
     {sit:"Amigos oferecem um trago rápido antes da prova.",
      choices:[
        {t:"Aceitar para 'acalmar o nervoso'",dmg:30,ok:false,fb:"❌ Nicotina contrai vasos e pode elevar a pressão — piora ansiedade depois."},
        {t:"Recusar e usar respiração/conversa",dmg:0,ok:true,fb:"✅ Boa. Ele não usou nicotina como saída para a ansiedade e buscou outra estratégia."},
        {t:"Trocar vape por energético",dmg:20,ok:false,fb:"⚠️ Troca ruim: outro estimulante no lugar."}]},
     {sit:"Na UBS, a enfermeira pergunta sobre vape e pressão.",
      choices:[
        {t:"Negar e esconder",dmg:25,ok:false,fb:"❌ Esconder atrasa orientação e acompanhamento."},
        {t:"Contar a verdade e pedir ajuda para parar",dmg:0,ok:true,fb:"✅ Boa. Falar a verdade abriu espaço para receber orientação e apoio."},
        {t:"Dizer que vape é inofensivo",dmg:30,ok:false,fb:"❌ Nicotina e aerossóis não são inofensivos para vasos e pulmão."}]}],
   lesson:"Vape não ganha passe livre por ter cheiro de fruta. Nicotina mexe com vasos, batimentos e pressão."},
  {id:"jejum_extremo",icon:"⏱️",title:"Jejum Extremo",color:C.yellow,
   intro:"Sofia, 16 anos, está em jejum de 20h + treino pesado para 'secar'. Sente fraqueza e dor de cabeça.",
   steps:[
     {sit:"A amiga oferece café forte e pré-treino para aguentar o treino em jejum.",
      choices:[
        {t:"Aceitar e treinar assim mesmo",dmg:35,ok:false,fb:"❌ Jejum extremo + estimulante eleva risco de mal-estar e pressão instável."},
        {t:"Parar o extremo, comer e treinar com segurança",dmg:0,ok:true,fb:"✅ Sofia interrompeu a combinação de jejum extremo e estimulantes e buscou orientação."},
        {t:"Só cortar o pré-treino e manter o jejum radical",dmg:20,ok:false,fb:"⚠️ Melhor, mas jejum extremo ainda estressa o corpo."}]},
     {sit:"O médico pergunta o objetivo do jejum.",
      choices:[
        {t:"Mentir que come normal",dmg:22,ok:false,fb:"❌ Sem honestidade, a orientação fica incompleta."},
        {t:"Explicar a pressão estética e pedir plano realista",dmg:0,ok:true,fb:"✅ Um plano alimentar realista reduz extremos e facilita um cuidado mais seguro."},
        {t:"Pedir remédio para emagrecer rápido",dmg:30,ok:false,fb:"❌ Remédio sem indicação pode ser perigoso para pressão."}]}],
   lesson:"Projeto “secar a qualquer custo” não é cuidado. Mudança sustentável vale mais que extremo + estimulante."},
  {id:"remedio_alheio",icon:"💊",title:"Remédio da Avó",color:C.orange,
   intro:"Tiago, 15 anos, mediu 150/95 na farmácia. Com medo, pensou em tomar o remédio de pressão da avó.",
   steps:[
     {sit:"A pressão veio alta uma vez. O que fazer agora?",
      choices:[
        {t:"Tomar o comprimido da avó escondido",dmg:40,ok:false,fb:"❌ Remédio de outra pessoa pode derrubar a PA ou mascarar causa."},
        {t:"Repetir a medida e procurar UBS/adulto",dmg:0,ok:true,fb:"✅ Boa. Repetir a medida e procurar orientação é bem mais seguro que usar remédio de outra pessoa."},
        {t:"Ignorar porque 'foi só uma vez'",dmg:25,ok:false,fb:"⚠️ Uma medida alta pede atenção, especialmente com sintomas."}]},
     {sit:"Na consulta, perguntam se ele tomou alguma coisa por conta própria.",
      choices:[
        {t:"Esconder a ideia do remédio alheio",dmg:15,ok:false,fb:"⚠️ Informação incompleta atrasa cuidado."},
        {t:"Contar tudo com honestidade",dmg:0,ok:true,fb:"✅ Mandou bem. Contar tudo ajuda a equipe a orientar melhor."},
        {t:"Pedir o mesmo remédio da avó",dmg:30,ok:false,fb:"❌ Dose e medicamento são individuais."}]}],
   lesson:"Remédio dos outros não é atalho. Se a medida veio alta, o caminho é confirmar do jeito certo e buscar orientação."},
  {id:"pretreino_aula",icon:"⚡",title:"Pré-treino na Aula",color:C.purple,
   intro:"Helena toma pré-treino antes da aula de educação física para 'render mais'. No meio do jogo, sente tremor e pressão na cabeça.",
   steps:[
     {sit:"Helena está trêmula, com coração acelerado.",
      choices:[
        {t:"Tomar mais pré-treino para 'passar o efeito'",dmg:40,ok:false,fb:"❌ Mais estimulante piora taquicardia e risco."},
        {t:"Parar, beber água, avisar o professor",dmg:0,ok:true,fb:"✅ Boa decisão. Parar a atividade e avisar um adulto permitiu avaliar a situação com segurança."},
        {t:"Continuar jogando para não passar vergonha",dmg:28,ok:false,fb:"⚠️ Esforço + estimulante prolonga o risco."}]},
     {sit:"Depois, ela quer manter performance sem susto.",
      choices:[
        {t:"Trocar pré-treino por sono, água e aquecimento",dmg:0,ok:true,fb:"✅ Boa. Sono, hidratação e aquecimento são uma base mais segura para treinar."},
        {t:"Usar só em dia de jogo oficial",dmg:20,ok:false,fb:"⚠️ Uso esporádico ainda pode disparar sintomas."},
        {t:"Misturar café + pré-treino em dose menor",dmg:30,ok:false,fb:"❌ Soma de cafeína continua arriscada."}]}],
   lesson:"Pré-treino não é passe mágico. Sono, água, alimentação e treino bem feito formam uma base muito melhor."},
  {id:"pressao_escola",icon:"🏫",title:"Triagem Escolar",color:C.teal,
   intro:"Na feira de saúde da escola, a PA de Enzo deu 142/92. Ele quer esconder o papelzinho dos pais.",
   steps:[
     {sit:"A professora sugere avisar a família e repetir a medida.",
      choices:[
        {t:"Rasgar o papel e fingir que nada aconteceu",dmg:30,ok:false,fb:"❌ Esconder atrasa diagnóstico e cuidado."},
        {t:"Mostrar aos responsáveis e ir à UBS",dmg:0,ok:true,fb:"✅ Boa. Mostrar o resultado e procurar acompanhamento permitiu avaliar a medida alterada do jeito certo."},
        {t:"Medir de novo sozinho só daqui a 1 ano",dmg:22,ok:false,fb:"⚠️ Esperar demais perde janela de prevenção."}]},
     {sit:"Na UBS, perguntam sobre energético, sal e sono.",
      choices:[
        {t:"Mentir para 'não levar bronca'",dmg:20,ok:false,fb:"❌ Sem dados reais, o plano fica fraco."},
        {t:"Contar a rotina completa com honestidade",dmg:0,ok:true,fb:"✅ Boa. Contar a rotina completa dá informações úteis para orientar o acompanhamento."},
        {t:"Pedir remédio na hora sem mudança de hábito",dmg:18,ok:false,fb:"⚠️ Às vezes precisa medicação, mas hábitos são base — e só médico indica."}]}],
   lesson:"Se uma medida na escola veio alterada, esconder não ajuda. Mostra aos responsáveis e busca acompanhamento."},
  {id:"suplemento_duvidoso",icon:"📦",title:"Suplemento Importado",color:C.amber,
   intro:"Caio quer comprar um 'emagrecedor importado' sem rótulo claro, vendido no grupo da academia.",
   steps:[
     {sit:"O vendedor promete secar em 10 dias sem efeito colateral.",
      choices:[
        {t:"Comprar porque 'é natural'",dmg:35,ok:false,fb:"❌ Sem rótulo/registro, pode ter estimulante escondido que sobe a PA."},
        {t:"Recusar e consultar nutricionista/médico",dmg:0,ok:true,fb:"✅ Boa escolha. Antes de usar algo duvidoso, vale checar com um profissional de saúde."},
        {t:"Pedir amostra grátis para testar",dmg:25,ok:false,fb:"⚠️ Mesmo amostra pode conter substâncias perigosas."}]},
     {sit:"Um amigo já está usando e oferece compartilhar.",
      choices:[
        {t:"Aceitar metade da dose do amigo",dmg:30,ok:false,fb:"❌ Compartilhar substância desconhecida é perigoso."},
        {t:"Convencer o amigo a parar e buscar orientação",dmg:0,ok:true,fb:"✅ Mandou bem. Chamar o amigo para buscar orientação também é cuidado."},
        {t:"Filmar e postar o 'antes e depois'",dmg:20,ok:false,fb:"⚠️ Glamourizar risco espalha comportamento perigoso."}]}],
   lesson:"Produto sem procedência pode esconder coisa que você nem sabe que está usando. Grupo de mensagem não substitui orientação de saúde."},
];

function M5Intro({onStart}){
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${C.orange}11`,border:`1px solid ${C.orange}33`,borderRadius:20,padding:"28px 20px",boxShadow:`0 0 50px ${C.orange}15`}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14,animation:"float 3s ease infinite"}}>
          <ModuleArt mod={5} size={150} color={C.orange}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:C.orange,marginBottom:8}}>MÓDULO 5</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:30,color:C.white,lineHeight:1.1,marginBottom:12}}>CONSEQUÊNCIAS REAIS</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7}}>
          Quatro histórias sorteadas do banco ampliado. Suas decisões determinam o que acontece.<br/><br/>
          Aqui não basta saber a teoria: você vai escolher o que faria. Decisões menos seguras somam pontos de consequência no jogo. Bora?
        </p>
      </div>
      <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`}}>
        <div style={{color:C.amber,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:10}}>📋 COMO FUNCIONA</div>
        {[["🎭","Você escolhe o que faria em situações simuladas"],["⚠️","Escolhas menos seguras pesam no resultado do desafio"],["✅","Escolhas mais seguras colocam proteção e ajuda em primeiro lugar"],["📊","No fim, você vê como suas decisões se saíram"]].map(([ic,tx])=>(
          <div key={tx} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
            <span style={{fontSize:18,flexShrink:0}}>{ic}</span>
            <span style={{color:C.grayLt,fontSize:13,lineHeight:1.5}}>{tx}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onStart} color={C.red} size="lg" style={{width:"100%"}}>💀 ENTRAR NAS HISTÓRIAS</Btn>
    </div>
  );
}

function M5Game({onFinish,scenarioCount=4}){
  const [scenarios]=useState(()=>shuffle([...M5_SCENARIOS_BANK]).slice(0,scenarioCount));
  const [scenIdx,setScenIdx]=useState(0);
  const [stepIdx,setStepIdx]=useState(0);
  const [totalDmg,setTotalDmg]=useState(0);
  const [sel,setSel]=useState(null);
  const [showFb,setShowFb]=useState(false);
  const [phase,setPhase]=useState("intro");
  const [decisions,setDecisions]=useState([]);
  const sc=scenarios[scenIdx];
  const step=sc?.steps[stepIdx];
  const progress=calculateScenarioProgress(scenarios,scenIdx,stepIdx,phase);

  const choose=(ci)=>{
    if(showFb)return;
    const choice=sc.steps[stepIdx].choices[ci];
    if(choice.ok)SFX.correct();else SFX.wrong();
    setSel(ci);setShowFb(true);
    setTotalDmg(d=>d+choice.dmg);
    setDecisions(previous=>[...previous,{scenarioId:sc.id,scenarioTitle:sc.title,step:step.sit,choice:choice.t,ok:choice.ok,feedback:choice.fb}]);
  };
  const advance=()=>{
    if(stepIdx<sc.steps.length-1){setStepIdx(i=>i+1);setSel(null);setShowFb(false);}
    else setPhase("lesson");
  };
  const nextScen=()=>{
    if(scenIdx<scenarios.length-1){setScenIdx(i=>i+1);setStepIdx(0);setSel(null);setShowFb(false);setPhase("intro");}
    else onFinish(calculateDecisionScore(totalDmg),totalDmg,decisions);
  };

  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Tag label={`Caso ${scenIdx+1}/${scenarios.length}`} color={sc.color}/>
        <div style={{marginLeft:"auto",background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"4px 10px"}}>
          <span style={{color:C.red,fontWeight:800,fontSize:13}}>⚠️ {totalDmg} pts</span>
        </div>
      </div>
      <ProgressBar value={progress.value} max={progress.maximum} color={sc.color}/>

      {phase==="intro"&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <div style={{background:`${sc.color}11`,border:`2px solid ${sc.color}33`,borderRadius:16,padding:"20px 16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:40}}>{sc.icon}</span>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:sc.color}}>{sc.title}</div>
            </div>
            <p style={{color:C.white,fontSize:14,lineHeight:1.7,margin:0}}>{sc.intro}</p>
          </div>
          <Btn onClick={()=>setPhase("playing")} color={sc.color} size="lg" style={{width:"100%"}}>🎭 ENTRAR NO CASO</Btn>
        </div>
      )}

      {phase==="playing"&&step&&(
        <div style={{animation:"slideIn .35s ease"}}>
          <div style={{background:C.card,border:`1px solid ${sc.color}44`,borderRadius:16,padding:"18px 16px",marginBottom:14}}>
            <div style={{color:C.gray,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:8}}>SITUAÇÃO</div>
            <p style={{color:C.white,fontSize:15,fontWeight:600,lineHeight:1.5,margin:0}}>{step.sit}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {step.choices.map((ch,i)=>{
              let bg=C.surface,bdr=`2px solid ${C.border}`,col=C.grayLt;
              if(showFb){
                if(i===sel&&ch.ok){bg=`${C.green}22`;bdr=`2px solid ${C.green}`;col=C.white;}
                else if(i===sel&&!ch.ok){bg=`${C.red}22`;bdr=`2px solid ${C.red}`;col=C.white;}
                else if(ch.ok){bg=`${C.green}11`;bdr=`2px solid ${C.green}55`;}
                else{bdr=`2px solid ${C.border}44`;}
              }else if(sel===i){bg=`${sc.color}22`;bdr=`2px solid ${sc.color}`;col=C.white;}
              return(
                <button key={i} onClick={()=>choose(i)} aria-pressed={sel===i} disabled={showFb} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 15px",background:bg,border:bdr,borderRadius:13,textAlign:"left",width:"100%",cursor:showFb?"default":"pointer",animation:showFb&&i===sel?(ch.ok?"correctPop .45s ease":"wrongBuzz .42s ease"):"none"}}>
                  <div style={{width:28,height:28,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,background:showFb&&i===sel&&ch.ok?C.green:showFb&&i===sel&&!ch.ok?C.red:`${sc.color}22`,border:`2px solid ${showFb&&i===sel&&ch.ok?C.green:showFb&&i===sel&&!ch.ok?C.red:sc.color}`,color:showFb&&i===sel?"#000":sc.color}}>
                    {showFb&&i===sel?(ch.ok?"✓":"✗"):String.fromCharCode(65+i)}
                  </div>
                  <span style={{color:col,fontWeight:sel===i||showFb?700:500,fontSize:14,lineHeight:1.4}}>{ch.t}</span>
                </button>
              );
            })}
          </div>
          {showFb&&(
            <div style={{animation:"fadeUp .3s ease",marginTop:12}}>
              <div style={{background:step.choices[sel].ok?`${C.green}15`:`${C.red}15`,border:`1px solid ${step.choices[sel].ok?C.green:C.red}44`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>{step.choices[sel].fb}</p>
                {step.choices[sel].dmg>0&&<div style={{color:C.red,fontWeight:800,fontSize:12,marginTop:6}}>⚠️ +{step.choices[sel].dmg} pontos de consequência</div>}
              </div>
              <Btn onClick={advance} color={sc.color} size="lg" style={{width:"100%"}}>
                {stepIdx<sc.steps.length-1?"PRÓXIMA SITUAÇÃO →":"VER LIÇÃO →"}
              </Btn>
            </div>
          )}
        </div>
      )}

      {phase==="lesson"&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <div style={{background:`${sc.color}11`,border:`2px solid ${sc.color}33`,borderRadius:16,padding:"20px 16px",marginBottom:14}}>
            <div style={{fontSize:40,marginBottom:8}}>{sc.icon}</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:16,color:sc.color,marginBottom:10}}>LIÇÃO DO CASO</div>
            <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7,margin:0}}>{sc.lesson}</p>
          </div>
          <Btn onClick={nextScen} color={scenIdx<scenarios.length-1?C.teal:C.green} size="lg" style={{width:"100%",color:"#000"}}>
            {scenIdx<scenarios.length-1?`PRÓXIMO: ${scenarios[scenIdx+1].title} →`:"📊 VER RESULTADO DAS DECISÕES →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

function M5Result({score,totalDamage,onNext}){
  const [phase,setPhase]=useState(0);
  useEffect(()=>{if(totalDamage===0)SFX.combo();else SFX.levelUp();const t=setTimeout(()=>setPhase(1),600);return()=>clearTimeout(t);},[]);
  const dmgColor=totalDamage===0?C.green:totalDamage<=40?C.yellow:totalDamage<=80?C.orange:C.red;
  const dmgLabel=totalDamage===0?"DECISÕES MUITO SEGURAS!":totalDamage<=40?"BOA TOMADA DE DECISÃO":totalDamage<=80?"ATENÇÃO ÀS DECISÕES":"PRECISA REVISAR AS CONDUTAS";
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${dmgColor}11`,border:`2px solid ${dmgColor}33`,borderRadius:20,padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
          <ModuleArt mod={5} size={110} color={C.orange}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:dmgColor,marginBottom:6}}>RESULTADO DAS DECISÕES</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:48,color:dmgColor,lineHeight:1,marginBottom:4}}>{totalDamage} pts</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:16,color:dmgColor,marginBottom:12}}>{dmgLabel}</div>
        <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6}}>
          {totalDamage===0?"Você priorizou as opções mais seguras nos casos apresentados.":
           totalDamage<=40?"Algumas escolhas poderiam atrasar a busca por ajuda. Vale revisar os feedbacks.":
           totalDamage<=80?"Algumas decisões do jogo poderiam ser inadequadas em situações reais. Revise quando e como pedir ajuda.":
           "Várias decisões precisam ser revistas. Em emergências reais, reconhecer sinais de alerta e pedir ajuda rapidamente é essencial."}
        </p>
      </div>
      {phase>=1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"popIn .4s ease"}}>
          <div style={{background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTOS M5</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:40,color:C.yellow,lineHeight:1}}><CountUp target={score}/></div>
          </div>
          <div style={{background:C.card,border:`1px solid ${dmgColor}33`,borderRadius:16,padding:"18px 12px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTOS DE CONSEQUÊNCIA</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:40,color:dmgColor,lineHeight:1}}>{totalDamage} pts</div>
          </div>
        </div>
      )}
      <UnlockCard mod={6} icon="🔓" title="MÓDULO 6 DESBLOQUEADO!" body="Hora de agir: monte o plano de ação para ajudar sua família." color={C.teal}>
        <Btn onClick={onNext} color={C.teal} size="lg" style={{width:"100%",color:"#000"}}>🌍 MÓDULO 6 — AGIR NA FAMÍLIA →</Btn>
      </UnlockCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 6 — COMO AJUDAR MINHA FAMÍLIA ONDE MORO
// ═══════════════════════════════════════════════════════════════════════════════
const M6_ACTIONS=[
  {id:1,icon:"🩺",title:"Conversar sobre medir a pressão",desc:"Converse com um adulto responsável sobre procurar uma UBS ou serviço de saúde disponível na sua região para medir a pressão e receber orientação.",commitment:"Vou conversar com um adulto responsável sobre onde medir a pressão",color:C.teal},
  {id:2,icon:"🧂",title:"Cozinhar com menos sal",desc:"Proponha receitas com menos sódio em casa. Use temperos naturais como alho, cebola, orégano e limão no lugar do sal.",commitment:"Me comprometo a ajudar a cozinhar com menos sal",color:C.green},
  {id:3,icon:"🚶",title:"Caminhar junto em família",desc:"Convide seus familiares para caminhar 30 minutos, pelo menos 3 vezes por semana. A atividade física em grupo é mais fácil de manter.",commitment:"Me comprometo a caminhar com minha família 3x/semana",color:C.amber},
  {id:4,icon:"💬",title:"Conversar sobre o histórico",desc:"Pergunte aos seus pais e avós sobre doenças da família. Conhecer o histórico é o primeiro passo para a prevenção.",commitment:"Me comprometo a conversar com minha família sobre saúde",color:C.purple},
  {id:5,icon:"📱",title:"Compartilhar o que aprendi",desc:"Use suas redes sociais para conscientizar amigos e colegas sobre hipertensão. Compartilhe informação confiável e incentive quem precisa a procurar atendimento.",commitment:"Me comprometo a compartilhar informação confiável sobre hipertensão",color:C.navy},
  {id:6,icon:"💊",title:"Apoiar sem mexer nos remédios",desc:"Você pode incentivar o acompanhamento e avisar um adulto responsável sobre dúvidas. Nunca altere doses, ofereça ou organize remédios por conta própria.",commitment:"Vou apoiar com segurança e chamar um adulto quando houver dúvida sobre tratamento",color:C.red},
];

function M6Intro({onStart}){
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${C.teal}11`,border:`1px solid ${C.teal}33`,borderRadius:20,padding:"28px 20px",boxShadow:`0 0 50px ${C.teal}15`}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14,animation:"float 3s ease infinite"}}>
          <ModuleArt mod={6} size={150} color={C.teal}/>
        </div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:C.teal,marginBottom:8}}>MÓDULO 6</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:30,color:C.white,lineHeight:1.1,marginBottom:12}}>COMO AJUDAR MINHA FAMÍLIA</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7}}>
          Você aprendeu sobre riscos, sintomas e consequências.<br/><br/>
          Agora é hora de agir. Escolha até 3 ações que realmente façam sentido pra sua rotina e pra sua família.
        </p>
      </div>
      <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`}}>
        <div style={{color:C.amber,fontSize:12,fontWeight:800,letterSpacing:2,marginBottom:10}}>📋 COMO FUNCIONA</div>
        {[["🤝","Veja 6 ideias de ação"],["✅","Escolha de 1 a 3 que sejam possíveis pra você"],["⭐","Vale mais escolher bem do que prometer tudo"],["🏆","No final, seu plano fica registrado no relatório"]].map(([ic,tx])=>(
          <div key={tx} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
            <span style={{fontSize:18,flexShrink:0}}>{ic}</span>
            <span style={{color:C.grayLt,fontSize:13,lineHeight:1.5}}>{tx}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onStart} color={C.teal} size="lg" style={{width:"100%",color:"#000"}}>🏥 VER MEU PLANO DE AÇÃO</Btn>
    </div>
  );
}

function M6Game({onFinish}){
  const MAX_COMMITMENTS=3;
  const [committed,setCommitted]=useState(new Set());
  const score=calculateActionScore(committed.size);
  const commit=(id)=>setCommitted(p=>{
    const n=new Set(p);
    if(n.has(id)){n.delete(id);SFX.click();return n;}
    if(n.size>=MAX_COMMITMENTS)return p;
    SFX.correct();n.add(id);return n;
  });
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:20,color:C.teal,letterSpacing:2}}>🏥 SEU PLANO DE AÇÃO</div>
        <div style={{color:C.gray,fontSize:13,marginTop:4}}>{committed.size}/{MAX_COMMITMENTS} escolhidas · selecione só o que dá pra tentar de verdade</div>
      </div>
      <ProgressBar value={committed.size} max={MAX_COMMITMENTS} color={C.teal}/>
      <div style={{background:`${C.teal}10`,border:`1px solid ${C.teal}33`,borderRadius:12,padding:"10px 12px",color:C.grayLt,fontSize:12,lineHeight:1.5}}>
        💡 Não precisa marcar tudo. Um plano possível vale mais do que seis promessas que não cabem na sua rotina.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {M6_ACTIONS.map(action=>{
          const isDone=committed.has(action.id);
          const blocked=!isDone&&committed.size>=MAX_COMMITMENTS;
          return(
            <div key={action.id} style={{background:isDone?`${action.color}11`:C.card,border:`2px solid ${isDone?action.color+"55":C.border}`,borderRadius:16,padding:"16px",transition:"all .3s",boxShadow:isDone?`0 0 14px ${action.color}22`:"none",opacity:blocked?0.58:1,animation:isDone?"correctPop .38s ease":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{fontSize:32}}>{action.icon}</span>
                <div style={{fontWeight:800,fontSize:15,color:isDone?action.color:C.white}}>{action.title}</div>
                {isDone&&<span style={{marginLeft:"auto",color:action.color,fontSize:14,fontWeight:800}}>✓</span>}
              </div>
              <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:"0 0 12px"}}>{action.desc}</p>
              <Btn onClick={()=>commit(action.id)} aria-pressed={isDone} disabled={blocked} color={isDone?C.gray:action.color} style={{width:"100%",color:isDone?C.white:"#000",fontSize:13}}>
                {isDone?"↩ TROCAR ESTA ESCOLHA":`🤝 QUERO TENTAR: ${action.title}`}
              </Btn>
            </div>
          );
        })}
      </div>
      {committed.size>0&&(
        <Btn onClick={()=>onFinish(score,[...committed])} color={C.green} size="lg" style={{width:"100%",color:"#000",animation:"popIn .4s ease"}}>
          🎯 FECHAR MEU PLANO E IR PRO QUIZ →
        </Btn>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ FINAL + TELA DE VITÓRIA
// ═══════════════════════════════════════════════════════════════════════════════
// Banco do quiz final — 12 perguntas por módulo = 72 total
// A cada jogo 1 é sorteada de cada módulo = 6 perguntas únicas
export const FINAL_QUIZ_BANK=[
  // ── Módulo 1 ──────────────────────────────────────────────────────────────
  {id:"m1a",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual desses hábitos aumenta MAIS o risco de hipertensão?",
   opts:["Comer pouca fruta","Fumar cigarro","Dormir 8 horas por dia","Praticar esportes"],correct:1,
   exp:"Nicotina pode aumentar temporariamente os batimentos e a pressão, além de causar dependência e dano cardiovascular."},
  {id:"m1b",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Em adolescentes com 13 anos ou mais, qual valor repetido merece avaliação para hipertensão?",
   opts:["90/60 mmHg","100/60 mmHg","≥130/80 mmHg","Só acima de 180/120 mmHg"],correct:2,
   exp:"A Diretriz Brasileira 2025 usa valores de adulto a partir dos 13 anos; hipertensão precisa ser confirmada em medidas adequadas, não por uma aferição isolada."},
  {id:"m1c",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Por que adolescentes com obesidade têm maior risco de hipertensão?",
   opts:["Porque não praticam esportes","Porque o tecido adiposo libera substâncias que elevam a PA","Porque dormem tarde","Porque ficam muito no celular"],correct:1,
   exp:"Excesso de peso se associa a maior chance de hipertensão por vários mecanismos, incluindo alterações metabólicas, hormonais e vasculares."},
  {id:"m1d",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual hábito ajuda a descobrir cedo se a pressão está alta?",
   opts:["Medir a pressão periodicamente","Evitar beber água","Tomar energético antes da escola","Comer mais sal no almoço"],correct:0,
   exp:"Medir a pressão de tempos em tempos é essencial porque a hipertensão pode não causar sintomas no começo."},
  {id:"m1e",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual combinação aumenta o risco de pressão alta em adolescentes?",
   opts:["Sono adequado e esporte","Ultraprocessados, sedentarismo e pouco sono","Frutas, água e caminhada","Consulta anual e alimentação equilibrada"],correct:1,
   exp:"Sódio em excesso, pouca atividade física e sono ruim somam risco cardiovascular desde a adolescência."},
  {id:"m1f",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Por que o consumo frequente de energéticos merece atenção?",
   opts:["Porque sempre hidrata melhor que água","Porque pode elevar frequência cardíaca e pressão","Porque reduz o sódio do corpo","Porque cura dor de cabeça"],correct:1,
   exp:"Energéticos têm cafeína e estimulantes que podem elevar os batimentos e a pressão, especialmente em excesso."},
  {id:"m1g",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual frase é mais correta sobre pressão alta em adolescentes?",
   opts:["Dá para descobrir pelos sintomas","Pode não dar sintoma; medir corretamente é essencial","Só aparece em quem tem obesidade","Uma medida alta já fecha diagnóstico"],correct:1,
   exp:"Hipertensão pode ser silenciosa. O diagnóstico depende de aferição correta e confirmação conforme a idade e o contexto."},
  {id:"m1h",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual hábito diário protege mais contra pressão alta?",
   opts:["Adicionar mais sal antes de provar","Dormir bem, se movimentar e comer melhor","Ficar sentado para economizar energia","Tomar estimulante para render mais"],correct:1,
   exp:"Pressão saudável depende de rotina: sono, movimento, alimentação com menos sódio e acompanhamento quando necessário."},
  // ── Módulo 2 ──────────────────────────────────────────────────────────────
  {id:"m2a",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Se seu pai E sua mãe têm hipertensão, o que isso significa para você?",
   opts:["Nada — apenas hábitos importam","Risco aumentado por herança genética","Zero risco se fizer exercícios","Risco só se for obeso"],correct:1,
   exp:"Ter pais com hipertensão aumenta a suscetibilidade, mas não permite calcular uma porcentagem individual só pelo histórico familiar."},
  {id:"m2b",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"O que é a 'herança genética' no contexto da hipertensão?",
   opts:["Dívidas da família","Tendência de desenvolver HAS transmitida pelos genes","Dinheiro herdado","Histórico escolar dos pais"],correct:1,
   exp:"Genes que predispõem à HAS são transmitidos entre gerações. Conhecer o histórico familiar é o primeiro passo para a prevenção."},
  {id:"m2c",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Além da genética, o que mais a família transmite que influencia a hipertensão?",
   opts:["Trauma de infância","Hábitos alimentares e de vida aprendidos em casa","Tipo sanguíneo","Cor dos olhos"],correct:1,
   exp:"Famílias compartilham genes e também ambiente, alimentação e hábitos. Os dois lados ajudam a explicar o risco, sem uma conta simples para cada pessoa."},
  {id:"m2d",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Qual informação familiar é mais útil para prevenir hipertensão?",
   opts:["Histórico de pressão alta, AVC, infarto e diabetes","Marca de celular dos familiares","Time de futebol da família","Altura exata dos primos"],correct:0,
   exp:"Conhecer doenças cardiovasculares na família ajuda a identificar risco aumentado e agir mais cedo."},
  {id:"m2e",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Se há hipertensão na família, qual atitude é melhor?",
   opts:["Ignorar porque é inevitável","Monitorar, melhorar hábitos e procurar orientação","Tomar remédio sem consulta","Parar todas as atividades físicas"],correct:1,
   exp:"Histórico familiar aumenta a suscetibilidade. Hábitos saudáveis, aferição adequada e acompanhamento ajudam na prevenção e no cuidado."},
  {id:"m2f",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Por que conversar com avós e pais sobre saúde ajuda?",
   opts:["Porque substitui consulta médica","Porque revela padrões de risco que podem se repetir","Porque muda instantaneamente seus genes","Porque evita qualquer exame"],correct:1,
   exp:"A conversa familiar revela pistas importantes para prevenção, como hipertensão, AVC e doenças cardíacas precoces."},
  {id:"m2g",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Qual pergunta é útil para mapear risco familiar?",
   opts:["Alguém mede pressão ou usa remédio para pressão?","Qual série todo mundo assiste?","Quem tem o celular mais novo?","Quem dorme mais tarde nas férias?"],correct:0,
   exp:"Perguntar sobre pressão, remédios, AVC, infarto e diabetes ajuda a entender o risco familiar."},
  {id:"m2h",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Se a família tem muito caso de hipertensão, o que isso muda?",
   opts:["Nada, porque adolescente nunca tem risco","Mostra que vale prevenir e medir mais cedo","Obriga todos a tomar o mesmo remédio","Impede qualquer esporte"],correct:1,
   exp:"Histórico familiar não é sentença, mas é sinal para cuidar antes: medir, conversar com profissionais e melhorar hábitos."},
  // ── Módulo 3 ──────────────────────────────────────────────────────────────
  {id:"m3a",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual dieta foi criada especificamente para combater a hipertensão?",
   opts:["Dieta Keto","Dieta DASH","Dieta Paleolítica","Jejum Intermitente"],correct:1,
   exp:"A dieta DASH prioriza frutas, vegetais, feijões, grãos integrais e menos sódio. A Diretriz Brasileira 2025 recomenda esse padrão também para jovens, especialmente quando há obesidade."},
  {id:"m3b",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual é a recomendação geral de atividade física para adolescentes?",
   opts:["60 minutos por semana","Em média, pelo menos 60 minutos por dia de atividade moderada a vigorosa","Somente educação física escolar","Exercício apenas aos fins de semana"],correct:1,
   exp:"Para adolescentes, a OMS recomenda em média pelo menos 60 minutos por dia de atividade física moderada a vigorosa ao longo da semana."},
  {id:"m3c",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual alimento protege ativamente contra a hipertensão por ser rico em potássio?",
   opts:["Salsicha","Banana","Refrigerante diet","Macarrão instantâneo"],correct:1,
   exp:"Alimentos ricos em potássio, como banana, feijão, verduras e outras frutas, fazem parte de uma alimentação saudável. O efeito depende do padrão alimentar como um todo."},
  {id:"m3d",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual troca ajuda a reduzir o sódio no dia a dia?",
   opts:["Temperos naturais no lugar de temperos prontos","Mais salgadinho no lanche","Miojo com todo o sachê","Refrigerante no lugar de água"],correct:0,
   exp:"Temperos naturais como alho, cebola, limão e ervas dão sabor com menos sódio."},
  {id:"m3e",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual prática ajuda sono e pressão ao mesmo tempo?",
   opts:["Usar celular até dormir","Criar rotina de sono e reduzir tela à noite","Virar a noite estudando sempre","Tomar energético de madrugada"],correct:1,
   exp:"Sono regular e menos tela à noite reduzem estresse fisiológico e ajudam no controle da pressão."},
  {id:"m3f",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual é uma meta simples de movimento para começar?",
   opts:["Ficar sentado o dia todo","Somar em média 60 minutos por dia de atividade moderada a vigorosa","Fazer só um treino por ano","Evitar educação física"],correct:1,
   exp:"Caminhadas regulares já contam como atividade física e ajudam coração, vasos e controle de peso."},
  {id:"m3g",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual escolha é melhor antes de dormir?",
   opts:["Energetico para estudar mais","Diminuir telas e manter rotina de sono","Salgadinho bem salgado","Virar a noite no celular"],correct:1,
   exp:"Sono regular reduz estresse fisiológico e ajuda o corpo a regular pressão, fome e energia."},
  {id:"m3h",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual lanche combina melhor com prevenção?",
   opts:["Fruta e água","Salgadinho com refrigerante","Miojo com sachê completo","Embutido com molho pronto"],correct:0,
   exp:"Frutas, água e comida menos processada ajudam a reduzir açúcar, sódio e excesso de calorias."},
  // ── Módulo 4 ──────────────────────────────────────────────────────────────
  {id:"m4a",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual situação é sinal de alarme e pede atendimento rápido?",
   opts:["Coceira isolada","Dor no peito com falta de ar ou confusão","Cansaço depois de uma aula","Fome antes do almoço"],correct:1,
   exp:"Dor no peito, falta de ar importante, alteração neurológica, confusão, convulsão ou alteração visual súbita são sinais de alarme. Hipertensão, porém, muitas vezes não dá sintoma."},
  {id:"m4b",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Por que a hipertensão é chamada de 'assassina silenciosa'?",
   opts:["Porque mata à noite","Porque não tem sintomas na maioria dos casos","Porque é discreta nas consultas","Porque só aparece em idosos"],correct:1,
   exp:"Hipertensão frequentemente não causa sintomas. Por isso, diagnóstico depende de aferições corretas e confirmação conforme a faixa etária e o contexto clínico."},
  {id:"m4c",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual afirmação evita uma confusão comum sobre hipertensão?",
   opts:["Só existe hipertensão quando dói a cabeça","Tontura sempre confirma pressão alta","Sintomas isolados não confirmam hipertensão; é preciso medir corretamente","Quem está bem nunca precisa medir"],correct:2,
   exp:"Hipertensão costuma ser silenciosa. Sintomas podem ter muitas causas e não confirmam pressão alta sem aferição adequada."},
  {id:"m4d",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"O que torna a hipertensão perigosa mesmo sem sintomas?",
   opts:["Ela pode danificar vasos e órgãos lentamente","Ela muda a cor da pele","Ela sempre dá febre","Ela só aparece durante esportes"],correct:0,
   exp:"A pressão alta pode machucar coração, rins, cérebro e olhos por muito tempo antes de gerar sinais claros."},
  {id:"m4e",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Quando uma pressão muito alta exige avaliação urgente?",
   opts:["Quando vem com sinais de lesão aguda, como dor no peito, falta de ar importante, confusão ou déficit neurológico","Sempre que alguém espirra","Somente se a pessoa estiver com fome","Apenas quando ocorre depois de exercício"],correct:0,
   exp:"A urgência depende do quadro completo e de sinais de possível lesão de órgãos. Não use sintomas isolados para diagnosticar hipertensão."},
  {id:"m4f",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual é a melhor forma de confirmar pressão alta?",
   opts:["Adivinhar pelos sintomas","Medir com aparelho adequado e repetir quando necessário","Olhar a cor dos olhos","Contar quantas horas usou celular"],correct:1,
   exp:"A confirmação depende de medidas corretas da pressão, idealmente com orientação de profissional de saúde."},
  {id:"m4g",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual frase sobre sintomas de hipertensão está correta?",
   opts:["Sempre dá sintoma forte","Pode não dar sintoma por muito tempo","Só dá coceira","Só aparece quando a pessoa corre"],correct:1,
   exp:"A hipertensão muitas vezes é silenciosa. Por isso medir a pressão é tão importante."},
  {id:"m4h",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual conjunto de sinais pede atenção urgente?",
   opts:["Dor no peito, falta de ar e confusão","Unha grande e cabelo seco","Fome e sono depois da escola","Vontade de jogar"],correct:0,
   exp:"Dor no peito, falta de ar, confusão, fraqueza em um lado do corpo ou visão alterada podem indicar emergência."},
  // ── Módulo 5 ──────────────────────────────────────────────────────────────
  {id:"m5a",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual é a consequência mais grave da hipertensão não controlada no cérebro?",
   opts:["Dor de cabeça crônica","Perda de memória leve","AVC (derrame cerebral)","Alergia cerebral"],correct:2,
   exp:"Hipertensão é um dos principais fatores de risco modificáveis para AVC e seu controle reduz o risco."},
  {id:"m5b",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual afirmação sobre hipertensão e AVC está correta?",
   opts:["Não existe relação","Hipertensão é um importante fator de risco modificável para AVC","Só importa após os 80 anos","AVC ocorre apenas em quem tem pressão normal"],correct:1,
   exp:"Hipertensão aumenta o risco de AVC. Detectar e controlar a pressão é uma das principais medidas de prevenção cardiovascular."},
  {id:"m5c",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"O que pode acontecer com os olhos de quem tem hipertensão severa sem controle?",
   opts:["Mudança de cor dos olhos","Danos na retina podendo causar cegueira","Necessidade de óculos mais fortes","Olhos permanentemente avermelhados"],correct:1,
   exp:"A retinopatia hipertensiva danifica os vasos da retina, podendo causar perda parcial ou total da visão. Uma das complicações mais graves da HAS."},
  {id:"m5d",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual órgão pode ser afetado pela hipertensão além do coração?",
   opts:["Rins","Cabelo","Unhas apenas","Dentes de leite"],correct:0,
   exp:"Os rins têm muitos vasos pequenos e podem ser danificados pela pressão alta persistente."},
  {id:"m5e",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Como a hipertensão prejudica o coração com o tempo?",
   opts:["Faz o coração trabalhar contra mais pressão","Faz o coração virar músculo do braço","Impede qualquer batimento","Sempre causa febre"],correct:0,
   exp:"Com pressão alta, o coração precisa fazer mais força para bombear sangue, o que pode causar sobrecarga."},
  {id:"m5f",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual é a melhor ideia sobre as consequências da hipertensão?",
   opts:["Só importam depois dos 80 anos","Podem ser prevenidas com controle e hábitos desde cedo","Não atingem adolescentes nunca","Desaparecem com refrigerante diet"],correct:1,
   exp:"Prevenção precoce reduz risco de AVC, infarto, doença renal e danos nos olhos ao longo da vida."},
  {id:"m5g",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Por que cuidar da pressão ainda jovem importa?",
   opts:["Porque dano nos vasos pode acumular com o tempo","Porque pressão alta melhora com mais sal","Porque só vale para atletas","Porque evita precisar dormir"],correct:0,
   exp:"Pressão alta repetida machuca vasos e órgãos aos poucos. Quanto antes cuidar, menor o risco futuro."},
  {id:"m5h",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual consequência pode aparecer quando a pressão fica alta por anos?",
   opts:["Rins sobrecarregados e coração mais exigido","Visão noturna de super-herói","Crescimento mais rápido","Imunidade perfeita"],correct:0,
   exp:"Hipertensão persistente pode afetar rins, coração, cérebro e olhos."},
  // ── Módulo 6 ──────────────────────────────────────────────────────────────
  {id:"m6a",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Onde você pode medir a pressão arterial GRATUITAMENTE no Brasil?",
   opts:["Só em hospitais particulares","Na UBS (Unidade Básica de Saúde)","Apenas com receita médica","Só em laboratórios especializados"],correct:1,
   exp:"A UBS é um bom lugar para buscar aferição da pressão e orientação pelo SUS."},
  {id:"m6b",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Qual é o número correto para chamar o SAMU no Brasil?",
   opts:["190","192","193","197"],correct:1,
   exp:"192 é o número gratuito do SAMU. O serviço funciona 24 horas nas áreas cobertas; também siga a orientação de emergência disponível no seu município."},
  {id:"m6c",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Se alguém está com pressão muito alta e sinais de alarme, qual atitude é a mais segura?",
   opts:["Dar dose extra de remédio por conta própria","Ligar para o SAMU (192)","Dar aspirina para 'diluir o sangue'","Mandar fazer exercício para baixar a pressão"],correct:1,
   exp:"Sinais de alarme com pressão muito alta exigem avaliação urgente. Não improvise doses nem use aspirina como tratamento da pressão."},
  {id:"m6d",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Quem pode ajudar a acompanhar pressão alta na comunidade?",
   opts:["UBS, equipe de saúde e familiares","Apenas influenciadores","Só lojas de suplemento","Ninguém, deve ser segredo"],correct:0,
   exp:"UBS, profissionais de saúde e rede familiar ajudam no acompanhamento e na adesão aos cuidados."},
  {id:"m6e",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Qual atitude é correta ao ajudar alguém com pressão alta?",
   opts:["Incentivar acompanhamento e hábitos saudáveis","Mandar parar remédio sozinho","Oferecer muito sal para animar","Esconder sintomas graves"],correct:0,
   exp:"Apoio prático, acompanhamento e hábitos saudáveis são formas seguras de ajudar."},
  {id:"m6f",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Quando há dor no peito, falta de ar ou confusão mental junto com pressão muito alta, o que fazer?",
   opts:["Esperar passar jogando videogame","Procurar ajuda urgente ou chamar o SAMU 192","Tomar qualquer remédio de outra pessoa","Fazer exercício intenso"],correct:1,
   exp:"Sinais graves junto com pressão alta pedem atendimento urgente. No Brasil, o SAMU atende pelo 192."},
  {id:"m6g",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Qual atitude ajuda sua família de forma segura?",
   opts:["Guardar foto dos remédios usados pelos familiares","Misturar remédios para fazer efeito rápido","Mandar parar tratamento quando melhorar","Trocar consulta por dicas de internet"],correct:0,
   exp:"Saber quais remédios a pessoa usa ajuda muito em emergências e consultas."},
  {id:"m6h",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Qual é um bom jeito de virar multiplicador de saúde?",
   opts:["Compartilhar informação confiável e incentivar medição","Assustar todo mundo com fake news","Prometer cura rápida","Receitar remédio para amigos"],correct:0,
   exp:"Adolescente também pode ajudar: falar sobre prevenção, orientar a medir pressão e buscar serviços de saúde."},
  // ── extras M1 ─────────────────────────────────────────────────────────────
  {id:"m1i",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Por que anabolizante sem orientação médica é risco para a pressão?",
   opts:["Porque sempre hidrata melhor","Porque pode elevar a PA e sobrecarregar o coração","Porque reduz o sódio automaticamente","Porque só afeta a pele"],correct:1,
   exp:"Anabolizantes e muitos estimulantes podem elevar pressão, batimentos e trazer danos a órgãos."},
  {id:"m1j",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual combinação é especialmente arriscada para o coração do adolescente?",
   opts:["Água + caminhada","Sono + fruta","Energético + treino intenso / anabolizante","Alongamento + respiração"],correct:2,
   exp:"Estimulante + esforço (ou anabolizante) pode disparar batimentos, pressão e mal-estar."},
  {id:"m1k",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"O que fazer se um 'emagrecedor' sem rótulo for oferecido na academia?",
   opts:["Comprar porque é natural","Recusar e buscar orientação profissional","Dividir a dose com amigo","Postar o antes e depois"],correct:1,
   exp:"Produto sem procedência pode esconder estimulantes que sobem a pressão."},
  {id:"m1l",module:"Módulo 1",moduleColor:C.red,icon:"❤️",
   q:"Qual hábito ajuda mais que atalho químico para mudar o corpo?",
   opts:["Treino consistente, sono e alimentação","Ciclo curto de anabolizante","Jejum extremo todo dia","Pré-treino em dose dupla"],correct:0,
   exp:"Resultado sustentável vem de rotina — não de substância irregular."},
  // ── extras M2 ─────────────────────────────────────────────────────────────
  {id:"m2i",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Se alguém da família usa remédio para pressão, o que isso sugere?",
   opts:["Que você nunca precisará medir","Que vale acompanhar hábitos e medir mais cedo","Que todos devem tomar o mesmo remédio","Que esporte fica proibido"],correct:1,
   exp:"Tratamento na família é pista de risco e de cuidado preventivo — não cópia de remédio."},
  {id:"m2j",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Qual atitude familiar protege contra hipertensão?",
   opts:["Esconder diagnósticos","Conversar sobre PA, AVC, diabetes e hábitos","Usar remédio um do outro","Evitar UBS juntos"],correct:1,
   exp:"Conversar revela padrões e abre caminho para prevenção em rede."},
  {id:"m2k",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Histórico familiar de HAS significa que:",
   opts:["A doença é inevitável","O risco sobe, mas hábitos ainda mudam o jogo","Só importa depois dos 70 anos","Exercício piora tudo"],correct:1,
   exp:"Genes aumentam risco; prevenção e acompanhamento reduzem complicações."},
  {id:"m2l",module:"Módulo 2",moduleColor:C.amber,icon:"🧬",
   q:"Por que perguntar sobre AVC/infarto precoce na família ajuda?",
   opts:["Porque é fofoca inútil","Porque sinaliza risco cardiovascular mais alto","Porque substitui todo exame","Porque cura hipertensão"],correct:1,
   exp:"Eventos precoces na família são alerta para medir e cuidar mais cedo."},
  // ── extras M3 ─────────────────────────────────────────────────────────────
  {id:"m3i",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual é a melhor resposta se oferecerem anabolizante na academia?",
   opts:["Aceitar para secar rápido","Recusar e buscar plano com profissional","Usar metade da dose","Misturar com energético"],correct:1,
   exp:"Recusar ciclo informal e buscar orientação é prevenção cardiovascular."},
  {id:"m3j",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Como reduzir sódio oculto de verdade?",
   opts:["Só tirar o saleiro e manter miojo diário","Ler rótulo e trocar temperos prontos por ervas","Trocar sal por shoyu à vontade","Beber menos água"],correct:1,
   exp:"Sódio escondido está em industrializados; rótulo e tempero natural ajudam."},
  {id:"m3k",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual estratégia deixa o game/tela menos arriscado para a pressão?",
   opts:["Pausas, água e horário de sono","Maratonar 6h sem levantar","Virar a noite na ranked","Salgadinho + refrigerante sem pausa"],correct:0,
   exp:"Pausas e sono quebram o combo sedentarismo + estresse."},
  {id:"m3l",module:"Módulo 3",moduleColor:C.green,icon:"🛡️",
   q:"Qual uso do SUS/UBS ajuda na prevenção?",
   opts:["Só ir em emergência grave","Medir pressão e fazer acompanhamento gratuito","Nunca ir se estiver bem","Pedir remédio de outra pessoa"],correct:1,
   exp:"UBS mede pressão de graça e apoia prevenção familiar."},
  // ── extras M4 ─────────────────────────────────────────────────────────────
  {id:"m4i",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual situação é um sinal de alarme cardiovascular ou neurológico?",
   opts:["Fraqueza de um lado e fala enrolada","Dor de joelho isolada","Coceira leve","Unha quebradiça"],correct:0,
   exp:"Fraqueza de um lado e fala enrolada podem indicar AVC. Chame o SAMU 192."},
  {id:"m4j",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Por que febre alta NÃO confirma hipertensão?",
   opts:["Porque febre é típica de infecção, não de HAS","Porque febre sempre baixa a pressão","Porque só idoso tem febre","Porque febre cura vasos"],correct:0,
   exp:"Febre aponta infecção; HAS severa tem outros sinais."},
  {id:"m4k",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Se houver falta de ar + dor de cabeça forte, o melhor é:",
   opts:["Ignorar e dormir","Contar para adulto e buscar avaliação","Tomar energético","Aumentar o sal"],correct:1,
   exp:"Sinais fortes pedem ajuda — não automedicação."},
  {id:"m4l",module:"Módulo 4",moduleColor:C.red,icon:"🔍",
   q:"Qual frase é verdadeira sobre sintomas de HAS?",
   opts:["Sempre doem todos os dias","Podem faltar por anos enquanto o dano acumula","Só aparecem ao correr","Sempre vêm com coceira"],correct:1,
   exp:"Hipertensão pode permanecer sem sintomas por muito tempo. Por isso, medir corretamente é essencial."},
  // ── extras M5 ─────────────────────────────────────────────────────────────
  {id:"m5i",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Qual consequência está ligada à HAS não controlada?",
   opts:["AVC, infarto e dano renal","Crescimento ilimitado de músculo","Imunidade perfeita","Visão noturna"],correct:0,
   exp:"Órgãos-alvo: cérebro, coração, rins e olhos."},
  {id:"m5j",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Em suspeita de AVC, a melhor ação inicial é:",
   opts:["Esperar passar","Ligar SAMU 192","Dar aspirina de qualquer jeito","Fazer exercício"],correct:1,
   exp:"Tempo é cérebro. SAMU inicia cuidado rápido."},
  {id:"m5k",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Por que anabolizante entra na conversa de consequências?",
   opts:["Porque melhora sempre a PA","Porque pode acelerar dano cardiovascular","Porque substitui treino","Porque é obrigatório na academia"],correct:1,
   exp:"Uso irregular eleva risco de pressão alta e sobrecarga cardíaca."},
  {id:"m5l",module:"Módulo 5",moduleColor:C.orange,icon:"⚠️",
   q:"Obesidade na adolescência aumenta risco de HAS porque:",
   opts:["Não tem relação","Excesso de peso e inflamação mexe com a pressão","Só afeta a pele","Impede qualquer esporte para sempre"],correct:1,
   exp:"Excesso de peso está fortemente associado à hipertensão em jovens. O cuidado deve focar saúde, hábitos e acompanhamento, sem dietas radicais."},
  // ── extras M6 ─────────────────────────────────────────────────────────────
  {id:"m6i",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Qual número chama o SAMU no Brasil?",
   opts:["190","192","193","180"],correct:1,
   exp:"192 = SAMU, 24h, gratuito."},
  {id:"m6j",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Como ajudar um familiar hipertenso no dia a dia?",
   opts:["Lembrar medicação e hábitos, sem trocar remédio sozinho","Misturar remédios para 'acelerar'","Esconder a pressão alta","Oferecer sal extra"],correct:0,
   exp:"Apoio prático + adesão + hábitos; mudança de remédio é com profissional."},
  {id:"m6k",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Por que guardar foto das caixas de remédio ajuda?",
   opts:["Porque fica bonito no feed","Porque em emergência a equipe precisa saber o que a pessoa usa","Porque substitui consulta","Porque evita beber água"],correct:1,
   exp:"Informação de medicação poupa minutos críticos."},
  {id:"m6l",module:"Módulo 6",moduleColor:C.teal,icon:"🏥",
   q:"Onde medir pressão de graça com a família?",
   opts:["Somente hospital particular","UBS / posto de saúde (SUS)","Só em competição esportiva","Em casa sem aparelho, adivinhando"],correct:1,
   exp:"A UBS é uma referência do SUS para buscar orientação; oferta e horários devem ser confirmados na sua região."},
];

// Sorteia perguntas do quiz final: 2 por módulo (12 total), intercaladas para módulos diferentes em sequência
const FINAL_QUIZ_PER_MODULE = 2;
function pickFinalQuiz(){
  const modules=["Módulo 1","Módulo 2","Módulo 3","Módulo 4","Módulo 5","Módulo 6"];
  const piles=modules.map(mod=>{
    const pool=shuffle(FINAL_QUIZ_BANK.filter(q=>q.module===mod));
    return pool.slice(0, FINAL_QUIZ_PER_MODULE);
  });
  // intercala: rodada1 uma de cada módulo (ordem sorteada), depois rodada2
  const out=[];
  for(let round=0; round<FINAL_QUIZ_PER_MODULE; round++){
    const order=shuffle([...piles.keys()]);
    order.forEach(i=>{ if(piles[i][round]) out.push(piles[i][round]); });
  }
  return out;
}

export const CONGRESS_PREVIEW_CONFIG={m1Questions:2,familyMembers:1,preventionCases:1,symptomOptions:Math.ceil(M4_SYMPTOMS.length/4),correctSymptoms:1,m5Scenarios:1,m5Questions:2,m6Situations:1,finalQuizQuestions:2};
export const CONGRESS_M6_SITUATION={
  id:"m6-medicacao-familia",
  title:"COMO AJUDAR COM SEGURANÇA",
  prompt:"Sua avó conta que está esquecendo alguns horários do remédio e pede para você mudar as doses por conta própria. O que você faz?",
  options:[
    {text:"Mudo os horários e dobro a próxima dose para compensar",correct:false,feedback:"Alterar dose ou horário sem orientação pode causar danos e não é uma responsabilidade segura para o adolescente."},
    {text:"Chamo um adulto responsável e ajudo a procurar orientação, sem mexer no tratamento",correct:true,feedback:"Apoiar, envolver um adulto responsável e buscar orientação profissional é uma forma segura de ajudar."},
    {text:"Peço para ela parar o remédio até se sentir melhor",correct:false,feedback:"Interromper um tratamento prescrito sem orientação pode piorar o controle da pressão."},
    {text:"Ofereço o remédio de outra pessoa que toma algo parecido",correct:false,feedback:"Medicamentos não devem ser compartilhados: doses e indicações são individuais."},
  ],
};

export function pickCongressFinalQuiz(){
  const modules=shuffle([...new Set(FINAL_QUIZ_BANK.map(question=>question.module))]);
  return modules.slice(0,CONGRESS_PREVIEW_CONFIG.finalQuizQuestions).map(module=>shuffle(FINAL_QUIZ_BANK.filter(question=>question.module===module))[0]);
}

export function pickCongressSymptoms(){
  const correct=shuffle(M4_SYMPTOMS.filter(symptom=>symptom.real)).slice(0,1);
  const distractors=shuffle(M4_SYMPTOMS.filter(symptom=>!symptom.real)).slice(0,CONGRESS_PREVIEW_CONFIG.symptomOptions-1);
  return shuffle([...correct,...distractors]);
}

function CongressM6Situation({onComplete}){
  const [selected,setSelected]=useState(null);
  const situation=CONGRESS_M6_SITUATION;
  const selectedOption=selected===null?null:situation.options[selected];
  const correctOption=situation.options.find(option=>option.correct);
  const choose=index=>{if(selected!==null)return;setSelected(index);situation.options[index].correct?SFX.correct():SFX.wrong();};
  return <div style={{minHeight:"100vh",padding:"18px 16px 30px",display:"flex",flexDirection:"column",gap:15,animation:"slideIn .32s ease"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}><Tag label="Módulo 6" color={C.teal}/><span style={{marginLeft:"auto",color:C.grayLt,fontSize:12,fontWeight:800}}>1 situação</span></div>
    <ProgressBar value={1} max={1} color={C.teal} label="Situação do módulo 6"/>
    <div style={{display:"flex",alignItems:"center",gap:14,background:`${C.teal}10`,border:`1px solid ${C.teal}44`,borderRadius:18,padding:15}}><ModuleArt mod={6} size={76} color={C.teal}/><div><div style={{color:C.teal,fontWeight:900,fontSize:11,letterSpacing:1.5}}>PRÉVIA DO JOGO COMPLETO</div><div style={{color:C.white,fontWeight:900,fontSize:19,marginTop:5}}>{situation.title}</div></div></div>
    <div style={{background:C.card,border:`1px solid ${C.teal}44`,borderRadius:20,padding:18}}><div style={{color:C.teal,fontWeight:900,fontSize:11,letterSpacing:1.5,marginBottom:8}}>SITUAÇÃO EM FAMÍLIA</div><p style={{color:C.white,fontSize:18,fontWeight:900,lineHeight:1.45,margin:0}}>{situation.prompt}</p></div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>{situation.options.map((option,index)=>{const isSelected=selected===index;const revealCorrect=selected!==null&&option.correct;const stateColor=revealCorrect?C.green:isSelected?C.red:C.teal;return <button key={option.text} onClick={()=>choose(index)} disabled={selected!==null} aria-pressed={isSelected} style={{width:"100%",display:"flex",alignItems:"center",gap:11,textAlign:"left",padding:"12px 13px",borderRadius:12,background:selected!==null&&(isSelected||revealCorrect)?`${stateColor}18`:C.surface,border:`2px solid ${selected!==null&&(isSelected||revealCorrect)?stateColor:C.border}`,color:C.white,fontSize:14,lineHeight:1.4,opacity:selected!==null&&!isSelected&&!revealCorrect?.62:1}}><span style={{display:"grid",placeItems:"center",width:28,height:28,borderRadius:8,flexShrink:0,background:`${stateColor}20`,border:`1px solid ${stateColor}88`,color:stateColor,fontWeight:900}}>{revealCorrect?"✓":String.fromCharCode(65+index)}</span><span>{option.text}</span></button>;})}</div>
    {selectedOption&&<div role="status" aria-live="polite" style={{background:selectedOption.correct?`${C.green}12`:`${C.yellow}10`,borderLeft:`4px solid ${selectedOption.correct?C.green:C.yellow}`,borderRadius:"0 13px 13px 0",padding:"13px 14px",animation:"fadeUp .3s ease"}}><div style={{color:selectedOption.correct?C.green:C.yellow,fontWeight:900,fontSize:13,marginBottom:5}}>{selectedOption.correct?"BOA DECISÃO!":"VALE REVISAR"}</div><p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>{selectedOption.feedback}{!selectedOption.correct?` Conduta mais segura: ${correctOption.text}.`:""}</p></div>}
    {selectedOption&&<Btn onClick={()=>onComplete({id:situation.id,prompt:situation.prompt,selectedText:selectedOption.text,correct:selectedOption.correct,correctText:correctOption.text,feedback:selectedOption.feedback})} color={C.teal} size="lg" style={{width:"100%",color:"#000"}}>QUIZ FINAL — 2 PERGUNTAS →</Btn>}
  </div>;
}

function CongressFinalQuizIntro({questions,onStart}){
  return <div style={{minHeight:"100vh",padding:"22px 16px 32px",display:"flex",flexDirection:"column",justifyContent:"center",gap:18,animation:"fadeUp .4s ease"}}>
    <div style={{textAlign:"center",background:`linear-gradient(150deg,${C.purple}1d,${C.card},${C.teal}12)`,border:`2px solid ${C.purple}55`,borderRadius:24,padding:"28px 18px"}}><div style={{fontSize:58,marginBottom:10}}>🎯</div><Tag label="Etapa final" color={C.purple}/><div style={{fontFamily:"Impact,sans-serif",fontSize:30,color:C.white,letterSpacing:2,marginTop:12}}>QUIZ FINAL</div><p style={{color:C.grayLt,fontSize:14,lineHeight:1.65,margin:"12px 0 0"}}>Duas perguntas sorteadas de módulos diferentes para fechar a experiência.</p></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{questions.map(question=><div key={question.id} style={{background:C.surface,border:`1px solid ${question.moduleColor}44`,borderRadius:14,padding:14,textAlign:"center"}}><div style={{fontSize:28}}>{question.icon}</div><strong style={{display:"block",color:question.moduleColor,fontSize:12,marginTop:5}}>{question.module}</strong></div>)}</div>
    <Btn onClick={onStart} color={C.purple} size="lg" style={{width:"100%"}}>INICIAR AS 2 PERGUNTAS →</Btn>
  </div>;
}

function CongressAlertStage({onComplete}){
  const [options]=useState(()=>pickCongressSymptoms());
  const [selected,setSelected]=useState(null);
  const correct=options.find(symptom=>symptom.real);
  const choose=symptom=>{if(selected)return;setSelected(symptom);symptom.real?SFX.correct():SFX.wrong();};
  return <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:15,animation:"fadeUp .4s ease"}}>
    <div style={{display:"flex",alignItems:"center",gap:14}}><ModuleArt mod={4} size={78} color={C.red}/><div><Tag label="Módulo 4" color={C.red}/><div style={{fontFamily:"Impact,sans-serif",fontSize:22,color:C.white,letterSpacing:2,marginTop:6}}>CAÇADOR DE ALERTAS</div><div style={{color:C.gray,fontSize:12,marginTop:3}}>Prévia com ¼ do painel original</div></div></div>
    <div style={{background:`${C.red}10`,border:`1px solid ${C.red}44`,borderRadius:14,padding:"12px 14px",color:C.grayLt,fontSize:13,lineHeight:1.55}}>Entre estas {options.length} opções, escolha somente <strong style={{color:C.white}}>um sinal de alarme</strong> que pede atendimento rápido.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{options.map(symptom=>{const isSelected=selected?.id===symptom.id;const reveal=selected&&symptom.real;const color=reveal?C.green:isSelected?C.red:C.borderHi;return <button key={symptom.id} onClick={()=>choose(symptom)} disabled={Boolean(selected)} aria-pressed={isSelected} style={{minHeight:138,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:13,background:reveal?`${C.green}18`:isSelected?`${C.red}18`:C.card,border:`2px solid ${color}`,borderRadius:15,textAlign:"center",opacity:selected&&!reveal&&!isSelected?.58:1}}><span style={{fontSize:34}}>{symptom.emoji}</span><span style={{color:C.white,fontWeight:800,fontSize:13,lineHeight:1.35}}>{symptom.text}</span>{selected&&(reveal||isSelected)&&<span style={{color,fontWeight:900,fontSize:11}}>{reveal?"SINAL DE ALARME":"NÃO CONFIRMA"}</span>}</button>;})}</div>
    {selected&&<div role="status" style={{background:selected.real?`${C.green}12`:`${C.yellow}10`,borderLeft:`4px solid ${selected.real?C.green:C.yellow}`,borderRadius:"0 12px 12px 0",padding:"12px 14px"}}><strong style={{color:selected.real?C.green:C.yellow,fontSize:13}}>{selected.real?"ACERTOU!":"O SINAL CORRETO ERA OUTRO"}</strong><p style={{color:C.grayLt,fontSize:13,lineHeight:1.55,margin:"5px 0 0"}}>{selected.real?selected.tip:correct.tip}</p></div>}
    {selected&&<Btn onClick={()=>onComplete({selectedId:selected.id,selectedText:selected.text,correct:selected.real,correctText:correct.text,tip:selected.real?selected.tip:correct.tip})} color={C.red} size="lg" style={{width:"100%"}}>MÓDULO 5 — ENTRAR NO CASO →</Btn>}
  </div>;
}

function CongressReport({nickname,m1Answers,m1Questions,family,preventionChallenge,preventionResult,alertResult,m5Result,m6Result,finalQuiz,finalQuizAnswers,onReset,onExit}){
  const participant=nickname.trim()||"Participante";
  const reportDate=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
  const m3Correct=preventionResult?.correctCount||0;
  const m5Safe=m5Result?.decisions?.filter(decision=>decision.ok).length||0;
  const finalQuizCorrect=finalQuizAnswers.filter(answer=>answer.correct).length;
  const decisionCorrect=m3Correct+(alertResult?.correct?1:0)+m5Safe+(m6Result?.correct?1:0)+finalQuizCorrect;
  const familyDef=family?FAM_DEFS.find(item=>item.id===family.id):null;
  const familyFactors=(family?.factors||[]).map(id=>FAM_FACTORS.find(item=>item.id===id)).filter(Boolean);
  const modules=[
    {n:1,title:"Pressão Quest",value:m1Answers.filter(Boolean).length,max:2,label:`${m1Answers.filter(Boolean).length}/2 hábitos respondidos`,color:C.red},
    {n:2,title:"Missão Família",value:family?1:0,max:1,label:family?"1 familiar mapeado":"não mapeado",color:C.amber},
    {n:3,title:"Batalha da Prevenção",value:m3Correct,max:3,label:`${m3Correct}/3 cartas protetoras`,color:C.green},
    {n:4,title:"Caçador de Alertas",value:alertResult?.correct?1:0,max:1,label:alertResult?.correct?"sinal reconhecido":"revisar sinal",color:C.red},
    {n:5,title:"Consequências",value:m5Safe,max:2,label:`${m5Safe}/2 decisões seguras`,color:C.orange},
    {n:6,title:"Como Ajudar",value:m6Result?.correct?1:0,max:1,label:m6Result?.correct?"conduta segura":"revisar conduta",color:C.teal},
  ];
  return <div data-report style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease"}}>
    <div className="print-page-footer" aria-hidden="true">MOSTRA DE PRODUTOS EDUCACIONAIS · VERSÃO {APP_VERSION}</div>
    <div className="print-letterhead" aria-hidden="true"><div className="print-letterhead__mark"><svg viewBox="0 0 64 64"><path d="M32 52S10 39 10 22c0-8 5-13 13-13 5 0 8 3 9 7 2-4 5-7 10-7 8 0 13 5 13 13 0 17-23 30-23 30Z" strokeWidth="3"/><path d="M14 31h10l4-8 7 17 5-9h10" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div><div className="print-letterhead__brand">DESAFIO HIPERTENSÃO</div><div className="print-letterhead__subtitle">Conhecimento que protege · escolhas que transformam</div></div><div className="print-letterhead__meta">Prévia Congresso<br/>{reportDate} · versão {APP_VERSION}</div><div className="print-letterhead__title"><p>Relatório da experiência educacional</p><h1>{participant}</h1></div></div>
    <div className="print-congress-summary"><strong>6 módulos + quiz final</strong><span>{decisionCorrect}/9 indicadores educativos protetores · não é nota ou diagnóstico</span></div>
    <div className="screen-report-header" style={{textAlign:"center",background:`linear-gradient(150deg,${C.green}1a,${C.card},${C.teal}15)`,border:`2px solid ${C.green}55`,borderRadius:24,padding:"26px 18px"}}><div style={{fontSize:48}}>🎓</div><Tag label="Relatório congresso" color={C.green}/><div style={{fontFamily:"Impact,sans-serif",fontSize:30,letterSpacing:2,color:C.white,marginTop:12}}>MISSÃO CONCLUÍDA, {participant.toUpperCase()}</div><div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:C.green,marginTop:12}}>6/6 MÓDULOS</div><p style={{color:C.grayLt,fontSize:12,lineHeight:1.55,margin:"8px 0 0"}}>Você experimentou as seis mecânicas e concluiu um quiz final com duas perguntas.</p></div>
    <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:16}}><div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.teal,letterSpacing:2,marginBottom:12}}>MAPA DA EXPERIÊNCIA</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{modules.map(item=><div key={item.n} className="report-card" style={{background:C.surface,border:`1px solid ${item.color}44`,padding:"10px 12px",borderRadius:12}}><div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:6}}><strong style={{color:C.white,fontSize:12}}>M{item.n} · {item.title}</strong><span style={{color:item.color,fontWeight:900,fontSize:11,textAlign:"right"}}>{item.label}</span></div><ProgressBar value={item.value} max={item.max} color={item.color} h={6}/></div>)}</div><p style={{color:C.gray,fontSize:10,lineHeight:1.5,margin:"12px 0 0"}}>As barras descrevem atividades diferentes. O mapeamento familiar registra participação, não desempenho nem risco clínico.</p></div>
    <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:16}}><div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.white,letterSpacing:2,marginBottom:12}}>O QUE ACONTECEU EM CADA MÓDULO</div><div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="report-card" style={{borderLeft:`3px solid ${C.red}`,paddingLeft:12}}><strong style={{color:C.red}}>M1 · Duas perguntas de hábitos</strong>{m1Questions.map((question,index)=><p key={question.id} style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{index+1}. {question.q} <strong style={{color:C.white}}>{m1Answers[index]?.t||"Sem resposta"}</strong></p>)}<p style={{color:C.gray,fontSize:10,lineHeight:1.5,margin:"7px 0 0"}}>Autorrelato educativo: não compõe nota, risco ou diagnóstico.</p></div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.amber}`,paddingLeft:12}}><strong style={{color:C.amber}}>M2 · Um membro da família</strong><p style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{familyDef?.label||"Familiar"}{family?.age?` · ${family.age} anos`:""}. {familyFactors.length?`Antecedentes registrados: ${familyFactors.map(item=>item.label).join(", ")}.`:"Nenhum antecedente foi marcado."}</p></div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.green}`,paddingLeft:12}}><strong style={{color:C.green}}>M3 · Um caso de prevenção</strong><p style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{preventionChallenge?.category}: {preventionResult?.text||"Plano montado"} ({m3Correct}/3 cartas protetoras).</p></div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.red}`,paddingLeft:12}}><strong style={{color:C.red}}>M4 · Um sinal entre quatro</strong><p style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>Escolha: {alertResult?.selectedText}. {alertResult?.correct?"Sinal de alarme reconhecido.":`O sinal correto era: ${alertResult?.correctText}.`} {alertResult?.tip}</p></div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.orange}`,paddingLeft:12}}><strong style={{color:C.orange}}>M5 · Um caso, duas decisões</strong>{(m5Result?.decisions||[]).map((decision,index)=><p key={`${decision.scenarioId}-${index}`} style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{index+1}. {decision.choice} <strong style={{color:decision.ok?C.green:C.orange}}>{decision.ok?"Decisão segura":"Revisar"}</strong></p>)}</div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.teal}`,paddingLeft:12}}><strong style={{color:C.teal}}>M6 · Uma situação familiar</strong><p style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{m6Result?.prompt} Escolha: {m6Result?.selectedText}. <strong style={{color:m6Result?.correct?C.green:C.orange}}>{m6Result?.correct?"Conduta segura":`Revisar — conduta mais segura: ${m6Result?.correctText}`}</strong></p></div>
      <div className="report-card" style={{borderLeft:`3px solid ${C.purple}`,paddingLeft:12}}><strong style={{color:C.purple}}>Quiz final · Duas perguntas</strong>{finalQuizAnswers.map((answer,index)=>{const question=finalQuiz[answer.qi];return question?<p key={question.id} style={{color:C.grayLt,fontSize:11,lineHeight:1.5,margin:"6px 0 0"}}>{index+1}. {question.q} <strong style={{color:answer.correct?C.green:C.orange}}>{answer.correct?"Acertou":"Revisar"}</strong></p>:null;})}</div>
    </div></div>
    <div className="report-footer" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,padding:14,textAlign:"center"}}><p style={{color:C.grayDk,fontSize:11,margin:"0 0 3px"}}>Diretriz Brasileira de Hipertensão 2025 · OMS 2020 · AASM · AHA/ASA 2026</p><p style={{color:C.grayDk,fontSize:11,margin:0}}>Relatório educativo de uma prévia do produto. Não calcula risco e não substitui avaliação profissional.</p></div>
    <div className="no-print" style={{display:"flex",flexDirection:"column",gap:10}}><div style={{background:`${C.yellow}10`,border:`1px solid ${C.yellow}44`,borderRadius:12,padding:"10px 12px",color:C.grayLt,fontSize:12,lineHeight:1.55}}>🔒 Este relatório pode conter apelido, idade aproximada e antecedentes de um familiar. Salve ou compartilhe somente com autorização.</div><Btn onClick={()=>window.print()} color={C.teal} size="lg" style={{width:"100%"}}>🖨️ IMPRIMIR OU SALVAR RELATÓRIO</Btn><Btn onClick={onReset} color={C.green} size="lg" style={{width:"100%"}}>↻ PRÓXIMO VISITANTE</Btn><Btn onClick={onExit} color={C.gray} outline style={{width:"100%"}}>CONHECER O JOGO COMPLETO</Btn></div>
  </div>;
}

function CongressMode({onExit}){
  const [stage,setStage]=useState("intro");
  const [nickname,setNickname]=useState("");
  const [copied,setCopied]=useState(false);
  const [m1Answers,setM1Answers]=useState([]);
  const [m1Questions,setM1Questions]=useState([]);
  const [members,setMembers]=useState(()=>initMembers());
  const [activeMemberId,setActiveMemberId]=useState(null);
  const [family,setFamily]=useState(null);
  const [preventionChallenge,setPreventionChallenge]=useState(()=>shuffle(PREVENTION_CHALLENGES)[0]);
  const [preventionResult,setPreventionResult]=useState(null);
  const [alertResult,setAlertResult]=useState(null);
  const [m5Result,setM5Result]=useState(null);
  const [m6Result,setM6Result]=useState(null);
  const [congressFinalQuiz,setCongressFinalQuiz]=useState(()=>pickCongressFinalQuiz());
  const [finalQuizAnswers,setFinalQuizAnswers]=useState([]);
  const congressUrl=typeof window!=="undefined"?`${window.location.origin}${window.location.pathname}?modo=congresso`:"";
  const start=()=>{if(!nickname.trim())return;setM1Answers([]);setM1Questions([]);setMembers(initMembers());setFamily(null);setPreventionChallenge(shuffle(PREVENTION_CHALLENGES)[0]);setPreventionResult(null);setAlertResult(null);setM5Result(null);setM6Result(null);setCongressFinalQuiz(pickCongressFinalQuiz());setFinalQuizAnswers([]);setStage("m1");SFX.unlock();};
  const reset=()=>{setNickname("");setCopied(false);setActiveMemberId(null);setStage("intro");setM1Answers([]);setM1Questions([]);setMembers(initMembers());setFamily(null);setPreventionResult(null);setAlertResult(null);setM5Result(null);setM6Result(null);setCongressFinalQuiz(pickCongressFinalQuiz());setFinalQuizAnswers([]);};
  const copyLink=async()=>{try{await navigator.clipboard.writeText(congressUrl);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setCopied(false);}};
  const activeMember=members.find(member=>member.id===activeMemberId);
  const activeMemberDef=FAM_DEFS.find(definition=>definition.id===activeMemberId);

  if(stage==="intro")return <div style={{minHeight:"100vh",padding:"22px 16px 32px",display:"flex",flexDirection:"column",gap:18,justifyContent:"center",animation:"fadeUp .4s ease"}}><div style={{position:"relative",overflow:"hidden",background:`linear-gradient(155deg,${C.teal}1f,${C.card} 45%,${C.red}16)`,border:`1px solid ${C.teal}66`,borderRadius:26,padding:"26px 20px",boxShadow:`0 0 70px ${C.teal}18`}}><div aria-hidden="true" style={{position:"absolute",right:-45,top:-45,width:160,height:160,borderRadius:"50%",border:`28px solid ${C.teal}12`}}/><div style={{position:"relative"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:18}}><Tag label="Mostra de Produtos · 2026" color={C.teal}/><span style={{color:C.grayLt,fontSize:12,fontWeight:800}}>≈ 8–12 MIN</span></div><div style={{fontFamily:"Impact,sans-serif",fontSize:38,lineHeight:.95,letterSpacing:2,color:C.white}}>PRÉVIA DO JOGO</div><div style={{fontFamily:"Impact,sans-serif",fontSize:22,lineHeight:1.1,letterSpacing:3,color:C.teal,marginTop:7}}>DESAFIO HIPERTENSÃO</div><p style={{color:C.grayLt,fontSize:14,lineHeight:1.65,margin:"18px 0 16px"}}>Experimente uma versão curta das seis mecânicas do aplicativo completo e gere seu relatório ao final.</p><label htmlFor="congress-nickname" style={{display:"block",color:C.white,fontSize:12,fontWeight:900,letterSpacing:1,marginBottom:7}}>SUA CREDENCIAL: APELIDO</label><input id="congress-nickname" value={nickname} onChange={event=>setNickname(event.target.value.slice(0,24))} onKeyDown={event=>{if(event.key==="Enter")start();}} autoComplete="off" maxLength={24} placeholder="Como quer aparecer no relatório?" style={{width:"100%",boxSizing:"border-box",background:C.bg,border:`2px solid ${nickname.trim()?C.teal:C.borderHi}`,borderRadius:12,padding:"11px 13px",color:C.white,fontSize:15,marginBottom:6}}/><p style={{color:C.gray,fontSize:11,lineHeight:1.45,margin:"0 0 16px"}}>Use apenas um apelido. O Módulo 2 pedirá informações de um familiar; você pode marcar somente o que souber e quiser informar.</p><div aria-label="Rota com seis módulos" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:12}}>{[[C.red,"❤️","2 perguntas"],[C.amber,"🧬","1 familiar"],[C.green,"🛡️","1 caso"],[C.red,"🔍","4 sintomas"],[C.orange,"⚠️","1 caso"],[C.teal,"🏥","1 situação"]].map(([color,icon,label],index)=><div key={`${index}-${label}`} style={{textAlign:"center"}}><div style={{height:5,borderRadius:99,background:color,boxShadow:`0 0 10px ${color}77`,marginBottom:7}}/><span aria-hidden="true" style={{fontSize:18}}>{icon}</span><span className="sr-only">{`Módulo ${index+1}: ${label}`}</span></div>)}</div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:C.purple,fontWeight:900,fontSize:12,marginBottom:18}}>🎯 + QUIZ FINAL · 2 PERGUNTAS</div><Btn onClick={start} disabled={!nickname.trim()} color={C.teal} size="lg" style={{width:"100%"}}>COMEÇAR A PRÉVIA ⚡</Btn></div></div><div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:14,alignItems:"center",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:15}}><div><div style={{color:C.white,fontWeight:900,fontSize:13,marginBottom:5}}>ABRA NO SEU CELULAR</div><p style={{color:C.grayLt,fontSize:12,lineHeight:1.5,margin:0}}>Aponte a câmera para abrir a mesma experiência.</p><button onClick={copyLink} style={{marginTop:8,background:"transparent",border:0,color:C.teal,textDecoration:"underline",fontWeight:800,fontSize:12,padding:0,minHeight:30}}>{copied?"✓ LINK COPIADO":"COPIAR LINK"}</button></div><div style={{background:"#fff",padding:7,borderRadius:10,lineHeight:0}} aria-label="QR Code para abrir a versão congresso"><QRCodeSVG value={congressUrl} size={92} bgColor="#ffffff" fgColor="#07090f" level="M" title="Abrir versão congresso"/></div></div><Btn onClick={onExit} color={C.gray} outline style={{width:"100%"}}>← VOLTAR AO JOGO COMPLETO</Btn></div>;
  if(stage==="m1")return <M1Quiz key="congress-m1" questionCount={CONGRESS_PREVIEW_CONFIG.m1Questions} onFinish={(answers,questions)=>{setM1Answers(answers);setM1Questions(questions);setStage("m2sel");}}/>;
  if(stage==="m2sel")return <M2Selector members={members} onEdit={id=>{setActiveMemberId(id);setStage("m2detail");}} onFinish={()=>setStage("m3")}/>;
  if(stage==="m2detail"&&activeMember&&activeMemberDef)return <M2Detail member={activeMember} memberDef={activeMemberDef} onBack={()=>setStage("m2sel")} saveLabel="💾 SALVAR FAMILIAR E AVANÇAR" onSave={updated=>{setMembers(previous=>previous.map(member=>member.id===updated.id?updated:member));setFamily(updated);setStage("m3");}}/>;
  if(stage==="m3")return <M3Challenge key={preventionChallenge.id} challenge={preventionChallenge} challengeIndex={0} totalChallenges={1} unlockedAllies={[]} combo={0} onSubmit={result=>{setPreventionResult(result);setStage("m4");}}/>;
  if(stage==="m4")return <CongressAlertStage onComplete={result=>{setAlertResult(result);setStage("m5");}}/>;
  if(stage==="m5")return <M5Game scenarioCount={CONGRESS_PREVIEW_CONFIG.m5Scenarios} onFinish={(score,totalDamage,decisions)=>{setM5Result({score,totalDamage,decisions});setStage("m6");}}/>;
  if(stage==="m6")return <CongressM6Situation onComplete={result=>{setM6Result(result);setStage("quizintro");}}/>;
  if(stage==="quizintro")return <CongressFinalQuizIntro questions={congressFinalQuiz} onStart={()=>setStage("quiz")}/>;
  if(stage==="quiz")return <QuizFinal finalQuiz={congressFinalQuiz} onFinish={(score,answers)=>{setFinalQuizAnswers(answers);setStage("report");}}/>;
  return <CongressReport nickname={nickname} m1Answers={m1Answers} m1Questions={m1Questions} family={family} preventionChallenge={preventionChallenge} preventionResult={preventionResult} alertResult={alertResult} m5Result={m5Result} m6Result={m6Result} finalQuiz={congressFinalQuiz} finalQuizAnswers={finalQuizAnswers} onReset={reset} onExit={onExit}/>;
}

function QuizFinalIntro({finalQuiz,onStart}){
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>
      <div style={{textAlign:"center",background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:20,padding:"28px 20px",boxShadow:`0 0 50px ${C.purple}15`}}>
        <div style={{fontSize:64,marginBottom:12,animation:"hb 1.4s ease infinite"}}>🎯</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:13,letterSpacing:4,color:C.purple,marginBottom:8}}>QUIZ FINAL</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:30,color:C.white,lineHeight:1.1,marginBottom:12}}>DESAFIO DO MESTRE</div>
        <p style={{color:C.grayLt,fontSize:14,lineHeight:1.7}}>Última fase: 12 perguntas misturando tudo o que você viu até aqui. Bora ver o que ficou?</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {finalQuiz.map(q=>(
          <div key={q.id} style={{background:C.surface,border:`1px solid ${q.moduleColor}33`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontSize:20}}>{q.icon}</div>
            <div style={{color:q.moduleColor,fontWeight:800,fontSize:11}}>{q.module}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`}}>
        {[["🎯","12 perguntas — 2 de cada módulo, intercaladas"],["✅","Acerto: +20 pontos"],["❌","Erro: feedback educativo"],["🏆","Acerte tudo: título MESTRE DO DESAFIO"]].map(([ic,tx])=>(
          <div key={tx} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:16,flexShrink:0}}>{ic}</span>
            <span style={{color:C.grayLt,fontSize:13}}>{tx}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onStart} color={C.purple} size="lg" style={{width:"100%"}}>🎯 INICIAR QUIZ FINAL</Btn>
    </div>
  );
}

function QuizFinal({finalQuiz,onFinish}){
  const [qi,setQi]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [sel,setSel]=useState(null);
  const [showFeedback,setShowFeedback]=useState(false);
  const q=finalQuiz[qi];
  const isCorrect=sel===q?.correct;

  const choose=(i)=>{
    if(showFeedback)return;
    if(i===q.correct)SFX.correct();else SFX.wrong();
    setSel(i);
    setShowFeedback(true);
  };
  const next=()=>{
    const newAnswers=[...answers,{qi,sel,correct:sel===q.correct}];
    setAnswers(newAnswers);
    if(qi<finalQuiz.length-1){setQi(v=>v+1);setSel(null);setShowFeedback(false);}
    else{const sc=newAnswers.filter(a=>a.correct).length*20;onFinish(sc,newAnswers);}
  };

  if(!q)return null;
  return(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,animation:"slideIn .35s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Tag label={q.module} color={q.moduleColor}/>
        <span style={{color:C.gray,fontSize:13,marginLeft:"auto"}}>{qi+1}/{finalQuiz.length}</span>
      </div>
      <ProgressBar value={qi+1} max={finalQuiz.length} color={q.moduleColor}/>
      <div style={{background:C.card,border:`1px solid ${q.moduleColor}33`,borderRadius:16,padding:20,boxShadow:`0 0 24px ${q.moduleColor}10`}}>
        <div style={{fontSize:36,marginBottom:8}}>{q.icon}</div>
        <p style={{color:C.white,fontSize:17,fontWeight:800,lineHeight:1.4,margin:0}}>{q.q}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {q.opts.map((opt,i)=>{
          let bg=C.surface,border=`2px solid ${C.border}`,color=C.grayLt;
          if(showFeedback){
            if(i===q.correct){bg=`${C.green}22`;border=`2px solid ${C.green}`;color=C.white;}
            else if(i===sel&&i!==q.correct){bg=`${C.red}22`;border=`2px solid ${C.red}`;color=C.white;}
            else{border=`2px solid ${C.border}44`;}
          } else if(sel===i){bg=`${q.moduleColor}22`;border=`2px solid ${q.moduleColor}`;color=C.white;}
          return(
            <button key={i} onClick={()=>choose(i)} aria-pressed={sel===i} disabled={showFeedback} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:bg,border,borderRadius:13,textAlign:"left",animation:showFeedback&&i===sel?(i===q.correct?"correctPop .45s ease":"wrongBuzz .42s ease"):"none"}}>
              <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:showFeedback&&i===q.correct?C.green:showFeedback&&i===sel&&i!==q.correct?C.red:`${q.moduleColor}22`,border:`2px solid ${showFeedback&&i===q.correct?C.green:showFeedback&&i===sel&&i!==q.correct?C.red:q.moduleColor}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:900,fontSize:12}}>
                {showFeedback&&i===q.correct?"✓":showFeedback&&i===sel&&i!==q.correct?"✗":String.fromCharCode(65+i)}
              </div>
              <span style={{color,fontWeight:sel===i||showFeedback?700:500,fontSize:14,lineHeight:1.4}}>{opt}</span>
            </button>
          );
        })}
      </div>
      {showFeedback&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{background:isCorrect?`${C.green}15`:`${C.red}15`,border:`1px solid ${isCorrect?C.green:C.red}44`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontWeight:800,color:isCorrect?C.green:C.red,fontSize:14,marginBottom:4}}>{isCorrect?"✅ Correto! +20 pts":"❌ Não foi dessa vez..."}</div>
            <p style={{color:C.grayLt,fontSize:13,lineHeight:1.6,margin:0}}>{q.exp}</p>
          </div>
          <Btn onClick={next} color={q.moduleColor} size="lg" style={{width:"100%",color:"#000"}}>
            {qi<finalQuiz.length-1?"BORA PRA PRÓXIMA →":"🏆 VER MEU RESULTADO"}
          </Btn>
        </div>
      )}
    </div>
  );
}

function playVictorySound(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const play=()=>{
    // Arpejo ascendente
    [[523,0],[659,0.14],[784,0.28],[1047,0.42]].forEach(([f,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type="triangle";
      const t=ctx.currentTime+d;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.28,t+0.04);g.gain.linearRampToValueAtTime(0,t+0.28);
      o.start(t);o.stop(t+0.32);
    });
    // Acorde final sustentado
    [523,659,784,1047].forEach(f=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type="sine";
      const t=ctx.currentTime+0.65;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.16,t+0.06);g.gain.linearRampToValueAtTime(0,t+1.1);
      o.start(t);o.stop(t+1.2);
    });
    // Shimmer de estrelas (notas altas rápidas)
    [1319,1568,2093,1568,1319].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type="sine";
      const t=ctx.currentTime+1.9+i*0.09;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.09,t+0.02);g.gain.linearRampToValueAtTime(0,t+0.12);
      o.start(t);o.stop(t+0.15);
    });
    };
    if(ctx.state==="suspended"){ctx.resume().then(play);}else{play();}
  }catch(e){}
}

const SFX={
  _ctx:null,
  muted:false,
  setMuted(v){this.muted=v;},
  _get(){if(!this._ctx)this._ctx=new(window.AudioContext||window.webkitAudioContext)();return this._ctx;},
  _play(fn){if(this.muted)return;try{const ctx=this._get();if(ctx.state==="suspended"){ctx.resume().then(()=>fn(ctx));}else{fn(ctx);}}catch(e){}},
  _tone(ctx,freq,delay=0,dur=.16,type="sine",vol=.14,dest=ctx.destination){
    const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);
    o.type=type;o.frequency.value=freq;const t=ctx.currentTime+delay;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t);o.stop(t+dur+.02);
  },
  click(){this._play(ctx=>{
    this._tone(ctx,920,0,.07,"sine",.08);
  })},
  correct(){this._play(ctx=>{
    [[523,0],[659,0.08],[784,0.16],[1047,0.25]].forEach(([f,d])=>this._tone(ctx,f,d,.22,"triangle",.17));
  })},
  wrong(){this._play(ctx=>{
    [[196,0],[164,0.11],[130,0.22]].forEach(([f,d])=>this._tone(ctx,f,d,.18,"sawtooth",.13));
  })},
  levelUp(){this._play(ctx=>{
    [[392,0],[523,0.1],[659,0.2],[784,0.3],[1175,0.45]].forEach(([f,d])=>this._tone(ctx,f,d,.25,"triangle",.18));
  })},
  combo(){this._play(ctx=>{
    [[784,0],[1047,0.07],[1319,0.14],[1760,0.22],[2093,0.3]].forEach(([f,d])=>this._tone(ctx,f,d,.14,"sine",.16));
  })},
  unlock(){this._play(ctx=>{
    [[330,0],[392,0.08],[523,0.17],[784,0.32]].forEach(([f,d])=>this._tone(ctx,f,d,.28,"triangle",.16));
    [1175,1568,1976].forEach((f,i)=>this._tone(ctx,f,.55+i*.06,.13,"sine",.08));
  })},
  heartbeat(){this._play(ctx=>{
    this._tone(ctx,72,0,.1,"sine",.09);
    this._tone(ctx,58,.16,.12,"sine",.07);
  })},
};

const CONFETTI_COLORS=["#ffd166","#00f5a0","#e51b3f","#00c9ff","#a855f7","#ff8c42","#f0f4ff","#ff4d6d"];

function Confetti(){
  const pieces=useRef(
    Array.from({length:48},(_,i)=>({
      id:i,
      x:Math.random()*100,
      color:CONFETTI_COLORS[i%CONFETTI_COLORS.length],
      size:6+Math.random()*8,
      delay:Math.random()*1.4,
      dur:2.2+Math.random()*1.8,
      shape:Math.random()>.5?"circle":"rect",
      rotate:Math.random()*360,
    }))
  ).current;
  return(
    <div style={{position:"fixed",inset:0,zIndex:10,pointerEvents:"none",overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",top:-20,left:`${p.x}%`,
          width:p.size,height:p.size,
          background:p.color,
          borderRadius:p.shape==="circle"?"50%":"3px",
          opacity:0,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform:`rotate(${p.rotate}deg)`,
        }}/>
      ))}
    </div>
  );
}

function TrophyAnim({phase}){
  return(
    <div style={{
      position:"relative",display:"inline-block",marginBottom:8,
      width:180,height:180,
      animation:phase===0?"":"trophyIn .7s cubic-bezier(.34,1.56,.64,1) forwards, trophyGlow 2s 0.7s ease infinite",
      opacity:phase===0?0:1,
    }}>
      {phase>=1&&[0,45,90,135,180,225,270,315].map(deg=>(
        <div key={deg} style={{
          position:"absolute",top:"50%",left:"50%",
          width:phase>=2?90:50,height:3,
          background:`linear-gradient(90deg,${C.yellow},transparent)`,
          transformOrigin:"0 50%",
          transform:`translate(0,-50%) rotate(${deg}deg)`,
          opacity:phase>=2?0.45:0.2,
          transition:"all .6s ease",
          borderRadius:2,
          zIndex:0,
        }}/>
      ))}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        width:phase>=1?160:0,height:phase>=1?160:0,
        borderRadius:"50%",
        background:`radial-gradient(circle,${C.yellow}28,transparent 70%)`,
        transform:"translate(-50%,-50%)",
        transition:"all .5s ease",
        zIndex:0,
      }}/>
      <MotionMedia
        video={MEDIA.trophyVideo}
        poster={MEDIA.trophyStill}
        style={{
          width:180,height:180,objectFit:"cover",borderRadius:20,
          display:"block",position:"relative",zIndex:1,
          boxShadow:`0 0 36px ${C.yellow}55`,
          background:C.bg,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELATÓRIO EDUCACIONAL
// ═══════════════════════════════════════════════════════════════════════════════
const CAT_TIPS={
  "🍔 Alimentação":{good:"Boa! Sua alimentação tá jogando a favor 🥗",tip:"Muitos ultraprocessados têm bastante sódio. Quando der, troca parte deles por comida de verdade."},
  "🧂 Sal":{good:"Boa! O sódio não tá te pegando de surpresa 💪",tip:"Muito sal pode pesar contra o controle da pressão. Alho, limão, cebola e ervas ajudam a dar sabor sem depender tanto dele."},
  "🏃 Exercício":{good:"Tá se mexendo! 🏃",tip:"Para 5–17 anos, a OMS recomenda em média 60 min/dia de atividade moderada a vigorosa. Começar com menos já é melhor do que ficar parado."},
  "😴 Sono":{good:"Sono em dia! 😴",tip:"Dormir pouco ou mal pode atrapalhar a saúde. Se o celular estiver roubando seu sono, tenta largar a tela um pouco antes de deitar."},
  "📱 Tela":{good:"Tela sem dominar o rolê! 📱",tip:"Ficar horas sentado soma tempo parado. Faz pausas, levanta, dá uma volta e mexe o corpo ao longo do dia."},
  "😤 Estresse":{good:"Você tá encontrando jeitos de lidar com a pressão do dia a dia 😤",tip:"Estresse persistente pode mexer com sono, hábitos e pressão. Respiração, música, conversa e apoio podem ajudar a lidar melhor com ele."},
  "⚖️ Peso":{good:"Cuidar do corpo sem neura! ⚖️",tip:"Excesso de peso está associado a maior chance de hipertensão em adolescentes. Foque em hábitos e acompanhamento, sem culpa."},
  "🧬 Família":{good:"Bom conhecimento familiar! 🧬",tip:"Ter hipertensão na família é uma pista importante, não uma sentença. Conhecer o histórico ajuda a cuidar melhor."},
  "🥤 Bebidas":{good:"Ótimas escolhas de bebida! 🥤",tip:"Energéticos podem elevar pressão e batimentos; refrigerantes podem aumentar o consumo de açúcar e calorias. Água é a escolha principal para hidratação."},
  "🩺 Saúde":{good:"Você cuida da sua saúde! 🩺",tip:"A pressão deve ser aferida nas avaliações de saúde conforme idade e contexto, porque hipertensão pode não causar sintomas."},
  "💉 Anabolizantes":{good:"Longe de atalhos perigosos! 💪",tip:"Anabolizante e estimulante sem orientação podem trazer riscos. Treino, sono, alimentação e acompanhamento são um caminho bem mais seguro."},
};

const MODULE_REPORT={
  "Módulo 1":{name:"Hábitos e prevenção",color:C.red,tip:"Você sacou que rotina, sono, comida, tela e movimento também entram nessa história de pressão."},
  "Módulo 2":{name:"Família e genética",color:C.amber,tip:"Família dá pista, não destino. Saber o histórico ajuda a ficar esperto e cuidar melhor."},
  "Módulo 3":{name:"Prevenção",color:C.green,tip:"Prevenção não precisa ser missão impossível: movimento, menos excesso de sal e sono em dia já fazem parte do jogo."},
  "Módulo 4":{name:"Sinais de alerta",color:C.red,tip:"Pressão alta pode ficar na miúda. Se vier junto com sinais de alerta, não é hora de pagar pra ver."},
  "Módulo 5":{name:"Consequências",color:C.orange,tip:"Pressão alta sem controle pode atingir cérebro, coração, rins e olhos. Cuidar cedo faz diferença."},
  "Módulo 6":{name:"Ação familiar",color:C.teal,tip:"Aprendizado fica mais forte quando sai do jogo: troca ideia em casa e sabe onde buscar ajuda."},
};

const CATEGORY_ACTIONS={
  "🍔 Alimentação":"Escolhe um lanche da semana pra trocar por uma opção menos ultraprocessada. Pequena mudança já conta.",
  "🧂 Sal":"Antes de colocar mais sal, prova. Em casa, testa alho, limão, cebola e ervas pra variar o sabor.",
  "🏃 Exercício":"Escolhe um jeito de se mexer mais nesta semana. Caminhada, dança, bike, esporte... vale achar algo que você curta.",
  "😴 Sono":"Testa largar o celular um pouco antes de dormir e vê se seu sono agradece.",
  "📱 Tela":"Combina uma pausa de tempos em tempos pra levantar, esticar e sair um pouco da cadeira.",
  "😤 Estresse":"Quando a ansiedade apertar, tenta desacelerar a respiração ou trocar ideia com alguém de confiança.",
  "⚖️ Peso":"Foque em rotina, não em culpa: água, movimento e comida de verdade na maioria dos dias.",
  "🧬 Família":"Pergunte em casa quem tem pressão alta, AVC, infarto, diabetes ou usa remédio contínuo.",
  "🥤 Bebidas":"Escolhe um momento do dia pra trocar refrigerante ou energético por água.",
  "🩺 Saúde":"Descubra onde medir pressão perto de casa: UBS, farmácia ou ação de saúde da escola.",
  "💉 Anabolizantes":"Se aparecer papo de ciclo ou estimulante sem orientação, não vai no embalo. Troca ideia com um profissional de saúde ou adulto de confiança.",
};

function pct(n,max){return toPercent(n,max);}
function levelColor(v){return v>=80?C.green:v>=60?C.teal:v>=40?C.yellow:v>=25?C.orange:C.red;}
function levelLabel(v){return v>=85?"mandou muito":v>=70?"mandou bem":v>=50?"tá evoluindo":v>=30?"bora treinar":"vale rever";}

function buildSmartReport({m1Answers,m1Questions,m1Risk,quizAnswers,finalQuiz,m3Responses,m4Score,m4Perfect,m5Score,m6Score,m6Commitments}){
  const catMap={};
  (m1Questions||[]).forEach((q,i)=>{
    if(!catMap[q.cat])catMap[q.cat]=[];
    catMap[q.cat].push({q,ans:m1Answers?.[i]});
  });
  const catRisk=Object.entries(catMap).map(([cat,items])=>{
    const totalRisk=items.reduce((s,{ans})=>s+(ans?.risk||0),0);
    const maxRisk=items.reduce((s,{q})=>s+Math.max(...q.opts.map(o=>o.risk)),0);
    const avgChoice=items.length?items.reduce((s,{ans})=>s+(ans?.risk||0),0)/items.length:0;
    return{cat,score:100-pct(totalRisk,maxRisk),riskPct:pct(totalRisk,maxRisk),avgChoice,items};
  }).sort((a,b)=>a.score-b.score);

  const quizResults=(quizAnswers||[]).map(a=>{
    const q=finalQuiz?.[a.qi];
    return{...a,question:q,chosen:q?.opts?.[a.sel],correctText:q?.opts?.[q?.correct]};
  });
  const quizCorrect=quizResults.filter(r=>r.correct).length;
  const quizTotal=finalQuiz?.length||0;
  const quizPct=pct(quizCorrect,quizTotal||1);
  const moduleStats=Object.entries(MODULE_REPORT).map(([module,meta])=>{
    const qs=quizResults.filter(r=>r.question?.module===module);
    const correct=qs.filter(r=>r.correct).length;
    const value=qs.length?pct(correct,qs.length):0;
    return{module,...meta,correct,total:qs.length,value,questions:qs};
  });

  const preventionHits=(m3Responses||[]).filter(r=>r?.hit).length;
  const preventionPerformance=calculatePreventionPerformance(m3Responses);
  const preventionPoints=preventionPerformance.earned;
  const preventionMax=preventionPerformance.maximum;
  const preventionPct=preventionPerformance.percent;
  const foundKeywords=[...new Set((m3Responses||[]).flatMap(r=>[...(r?.found||[]),...(r?.bonus||[])]))];
  const allies=[...new Set((m3Responses||[]).flatMap(r=>r?.newAllies||[]))];
  const symptomPct=pct(m4Score||0,MODULE_MAX_POINTS.m4);
  const consequencePct=pct(m5Score||0,MODULE_MAX_POINTS.m5);
  const actionPct=pct(m6Score||0,MODULE_MAX_POINTS.m6);
  const habitScore=100-(m1Risk||0);
  // O M2 não entra no agregado: desconhecer a história familiar não deve reduzir a nota.
  const smartScore=calculateLearningScore({
    quiz:quizPct,
    prevention:preventionPct,
    alerts:symptomPct,
    decisions:consequencePct,
  });

  const domains=[
    {id:"habits",label:"Radar autorreferido de hábitos",value:habitScore,color:levelColor(habitScore),note:`Reflexão educativa; não estima risco: ${m1Risk||0}/100 pontos de atenção`},
    {id:"knowledge",label:"Conhecimento geral",value:quizPct,color:levelColor(quizPct),note:`Quiz final: ${quizCorrect}/${quizTotal||0}`},
    {id:"prevention",label:"Prevenção prática",value:preventionPct,color:levelColor(preventionPct),note:`${preventionHits}/${(m3Responses||[]).length||M3_CHALLENGES_PER_GAME} planos concluídos`},
    {id:"symptoms",label:"Sinais de alerta",value:symptomPct,color:levelColor(symptomPct),note:m4Perfect?"Caçada perfeita":"Reconhecimento de sinais de alarme"},
    {id:"consequences",label:"Decisões em situações simuladas",value:consequencePct,color:levelColor(consequencePct),note:`Desempenho nos casos: ${Math.max(0,m5Score||0)}/60 pts`},
    {id:"action",label:"Plano de ação",value:actionPct,color:levelColor(actionPct),note:`Ações escolhidas para o plano: ${(m6Commitments||[]).length}/3`},
  ];

  const strengths=[
    ...catRisk.filter(c=>c.score>=80).slice(-3).map(c=>({title:c.cat,body:CAT_TIPS[c.cat]?.good||"Mandou bem nesse tema.",color:C.green})),
    ...moduleStats.filter(m=>m.value===100&&m.total>0).map(m=>({title:m.name,body:m.tip,color:m.color})),
    ...(preventionPct>=75?[{title:"Prevenção prática",body:`Você achou ${foundKeywords.length} cartas-chave e conseguiu ligar prevenção com vida real.`,color:C.green}]:[]),
    ...(actionPct>=80?[{title:"Influência positiva",body:"Você saiu com ideia prática pra ajudar em casa, não só com pontuação.",color:C.teal}]:[]),
  ].slice(0,5);

  const weakCats=catRisk.filter(c=>c.riskPct>=25).slice(0,4);
  const weakModules=moduleStats.filter(m=>m.value<100&&m.total>0).slice(0,3);
  const weaknesses=[
    ...weakCats.map(c=>({title:c.cat,body:CAT_TIPS[c.cat]?.tip||"Esse tema merece mais uma olhada.",action:CATEGORY_ACTIONS[c.cat]||"Escolha uma mudança pequena e possível pra testar nesta semana.",color:c.riskPct>=60?C.red:c.riskPct>=35?C.orange:C.yellow,value:c.riskPct})),
    ...weakModules.map(m=>({title:m.name,body:m.tip,action:"Dá uma revisada nesse ponto e tenta explicar pra alguém com suas próprias palavras.",color:m.color,value:100-m.value})),
    ...(preventionPct<60?[{title:"Prevenção em palavras próprias",body:"Suas ideias estão vindo, mas dá pra deixá-las mais completas.",action:"Tenta montar assim: o que você vai fazer + quando + por quê. Fica muito mais fácil tirar do papel.",color:C.yellow,value:100-preventionPct}]:[]),
    ...(symptomPct<60?[{title:"Sinais de alerta",body:"Misturar sinal de alerta com sintoma comum pode fazer você demorar pra pedir ajuda.",action:"Guarde os alertas: dor no peito, falta de ar importante, fraqueza/fala enrolada, confusão/convulsão ou alteração visual súbita = buscar ajuda.",color:C.red,value:100-symptomPct}]:[]),
  ].sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,6);

  const profile=smartScore>=85
    ?{title:"Mandou muito!",text:"Você conectou bem as ideias e fez escolhas seguras. Agora o desafio é levar esse aprendizado pra vida real e trocar ideia com a família.",color:C.green}
    :smartScore>=70
    ?{title:"Tá voando",text:"Você pegou bem a lógica da hipertensão. Tem alguns pontos pra lapidar, mas a base tá firme.",color:C.teal}
    :smartScore>=50
    ?{title:"Tá no caminho",text:"Você entendeu bastante coisa. Agora vale revisar alguns pontos pra não cair em pegadinha quando precisar decidir de verdade.",color:C.yellow}
    :{title:"Bora subir de nível",text:"Você começou bem. Agora é hora de juntar as peças e transformar informação em escolhas mais seguras no dia a dia.",color:C.orange};

  return{catRisk,quizResults,quizCorrect,quizTotal,quizPct,moduleStats,preventionPct,preventionHits,preventionPoints,preventionMax,foundKeywords,allies,symptomPct,consequencePct,actionPct,smartScore,domains,strengths,weaknesses,profile};
}

function ReportScreen({playerName,m1Answers,m1Questions,m1Risk,quizAnswers,finalQuiz,totalScore,m3Responses,m4Score,m4Perfect,m5Score,m6Score,m6Commitments,onBack}){
  const prof=getRiskProfile(m1Risk||0);
  const riskColor=m1Risk>50?C.red:m1Risk>30?C.orange:m1Risk>15?C.yellow:C.green;
  const reportDate=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
  const analysis=buildSmartReport({m1Answers,m1Questions,m1Risk,quizAnswers,finalQuiz,m3Responses,m4Score,m4Perfect,m5Score,m6Score,m6Commitments});
  const {catRisk,quizResults,quizCorrect,quizTotal,domains,strengths,weaknesses,profile,smartScore,moduleStats,preventionHits,foundKeywords,allies}=analysis;

  const CONCLUSION=[
    {emoji:"❤️",title:"Pressão alta: qual é a real?",text:"É quando a pressão fica elevada de forma persistente. Muitas vezes você nem percebe, mas, sem controle, ela pode prejudicar coração, rins, olhos e cérebro ao longo do tempo."},
    {emoji:"🤫",title:"Dá pra ter e nem sentir?",text:"Sim. Hipertensão muitas vezes não dá sintomas. Então não dá pra confiar só no ‘tô de boa’. O jeito certo é medir a pressão adequadamente."},
    {emoji:"🧬",title:"Mas isso não é coisa de adulto?",text:"Não só. Entender isso cedo ajuda você a reconhecer fatores de risco, conversar com a família e construir hábitos que fazem diferença lá na frente."},
    {emoji:"🔄",title:"A parte boa",text:"Tem muita coisa que dá pra ajustar: menos excesso de sal, mais movimento, sono em dia e menos energético. Pequenas escolhas, repetidas de verdade, contam."},
    {emoji:"📏",title:"E se a pressão der alta?",text:"Uma medida isolada não fecha diagnóstico. Se vier alterada, o certo é repetir e confirmar do jeito adequado, com orientação de um profissional de saúde."},
    {emoji:"🚀",title:"Agora é com você",text:"Troca essa ideia com alguém de casa, presta atenção nos hábitos e, quando fizer sentido, mede a pressão do jeito certo. Conhecimento bom é o que sai da tela e entra na rotina. 💚"},
  ];

  return(
    <div data-report style={{padding:"16px",display:"flex",flexDirection:"column",gap:20,animation:"fadeUp .4s ease"}}>

      <div className="print-page-footer" aria-hidden="true">MATERIAL EDUCATIVO · SEM VALIDADE DIAGNÓSTICA · VERSÃO {APP_VERSION}</div>

      {/* Folha timbrada exclusiva da impressão/PDF */}
      <div className="print-letterhead" aria-hidden="true">
        <div className="print-letterhead__mark">
          <svg viewBox="0 0 64 64" role="img" aria-label="Símbolo do Desafio Hipertensão">
            <path d="M32 52S10 39 10 22c0-8 5-13 13-13 5 0 8 3 9 7 2-4 5-7 10-7 8 0 13 5 13 13 0 17-23 30-23 30Z" strokeWidth="3"/>
            <path d="M14 31h10l4-8 7 17 5-9h10" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="print-letterhead__brand">DESAFIO HIPERTENSÃO</div>
          <div className="print-letterhead__subtitle">Conhecimento que protege · escolhas que transformam</div>
        </div>
        <div className="print-letterhead__meta">
          Documento educacional<br/>
          Versão {APP_VERSION} · {reportDate}
        </div>
        <div className="print-letterhead__title">
          <p>Relatório individual de aprendizagem</p>
          <h1>{playerName||"Participante"}</h1>
        </div>
      </div>

      {/* Header */}
      <div className="screen-report-header" style={{textAlign:"center",background:`linear-gradient(135deg,${C.yellow}18,${C.green}10)`,border:`2px solid ${C.yellow}44`,borderRadius:20,padding:"24px 16px"}}>
        <div style={{fontSize:52}}>📊</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:26,letterSpacing:3,color:C.yellow,lineHeight:1.1}}>SEU RELATÓRIO</div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:14,color:C.white,letterSpacing:2,marginTop:4}}>DE APRENDIZAGEM</div>
        <p style={{color:C.grayLt,fontSize:14,marginTop:10,marginBottom:0}}>
          Ei, <strong style={{color:C.white}}>{playerName}</strong>! Seu relatório analisa escolhas, respostas e decisões do desafio. Sem sermão e sem nota de boletim: aqui você vê onde mandou bem, onde quase acertou e o que vale dar mais uma olhada.
        </p>
      </div>

      <div style={{background:`${C.teal}10`,border:`1px solid ${C.teal}44`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:17,color:C.teal,letterSpacing:2,marginBottom:5}}>🤝 SEU PLANO PESSOAL</div>
        <p style={{color:C.gray,fontSize:12,lineHeight:1.55,margin:"0 0 10px"}}>Você escolheu o que acredita conseguir tentar. Uma ação realista já completa esta missão.</p>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {(m6Commitments||[]).map(id=>M6_ACTIONS.find(action=>action.id===id)).filter(Boolean).map(action=>(
            <div key={action.id} className="report-card" style={{display:"flex",alignItems:"flex-start",gap:9,background:`${action.color}10`,borderLeft:`3px solid ${action.color}`,borderRadius:"0 9px 9px 0",padding:"8px 10px"}}>
              <span>{action.icon}</span>
              <span style={{color:C.grayLt,fontSize:12,lineHeight:1.5}}>{action.commitment}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {label:"HÁBITOS DECLARADOS",val:`${m1Risk||0}/100`,sub:"pontos de atenção",color:riskColor},
          {label:"ÍNDICE DO JOGO*",val:`${smartScore}%`,sub:"experimental",color:profile.color},
          {label:"QUIZ FINAL",val:`${quizCorrect}/${quizTotal||0}`,sub:"acertos",color:C.green},
        ].map(({label,val,sub,color})=>(
          <div key={label} className="report-card" style={{background:C.card,border:`1px solid ${color}44`,borderRadius:14,padding:"14px 8px",textAlign:"center"}}>
            <div style={{color:C.gray,fontSize:9,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>{label}</div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:28,color,lineHeight:1,filter:`drop-shadow(0 0 6px ${color})`}}>{val}</div>
            <div style={{color:C.gray,fontSize:10,marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{background:`${C.teal}0d`,border:`1px solid ${C.teal}33`,borderRadius:13,padding:"11px 13px"}}>
        <p style={{color:C.grayLt,fontSize:11,lineHeight:1.55,margin:0}}>ℹ️ *Índice simples de gamificação, calculado pela média das atividades de conhecimento e decisão. Não é instrumento validado. Esses números não dizem se sua pressão está alta, não calculam risco cardiovascular e não funcionam como diagnóstico.</p>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:17,color:C.white,letterSpacing:2,marginBottom:5}}>🧩 O QUE VOCÊ DESBLOQUEOU</div>
        <p style={{color:C.gray,fontSize:12,lineHeight:1.55,margin:"0 0 12px"}}>Cada fase treinou uma habilidade diferente. Dá uma olhada no que você levou de cada uma:</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
          {[
            ["1","Hábitos","Sacar como rotina, sono, comida e movimento entram no jogo da saúde.",C.red],
            ["2","Família","Entender o histórico da família sem achar que genética é sentença.",C.amber],
            ["3","Prevenção","Pegar conselho de saúde e transformar em atitude que cabe na vida real.",C.green],
            ["4","Alertas","Sacar que pressão alta pode ficar quietinha e reconhecer quando existe sinal de alerta.",C.red],
            ["5","Consequências","Entender por que pressão alta sem controle pode dar ruim com o tempo.",C.orange],
            ["6","Como ajudar","Treinar decisões seguras e saber a hora de chamar ajuda.",C.teal],
          ].map(([n,title,text,color])=>(
            <div key={n} className="report-card" style={{background:`${color}0d`,border:`1px solid ${color}2f`,borderRadius:11,padding:"10px 11px"}}>
              <div style={{color,fontSize:10,fontWeight:900,letterSpacing:1}}>MÓDULO {n}</div>
              <div style={{color:C.white,fontSize:12,fontWeight:800,margin:"2px 0 4px"}}>{title}</div>
              <div style={{color:C.grayLt,fontSize:11,lineHeight:1.45}}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Perfil do percurso */}
      <div style={{background:`${profile.color}12`,border:`1px solid ${profile.color}44`,borderRadius:16,padding:16}}>
        <div style={{color:C.gray,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:10}}>SEU JEITO DE JOGAR</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <span style={{fontSize:34,flexShrink:0}}>🧭</span>
          <div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:17,color:profile.color,letterSpacing:2}}>{profile.title}</div>
            <p style={{color:C.grayLt,fontSize:13,margin:"4px 0 0",lineHeight:1.55}}>{profile.text}</p>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {domains.map(d=>(
            <div key={d.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{color:C.white,fontWeight:800,fontSize:12}}>{d.label}</span>
                <span style={{color:d.color,fontWeight:900,fontSize:12}}>{d.value}% · {levelLabel(d.value)}</span>
              </div>
              <ProgressBar value={d.value} max={100} color={d.color} h={7}/>
              <div style={{color:C.gray,fontSize:11,marginTop:3}}>{d.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leitura dos hábitos no jogo */}
      <div style={{background:`${prof.color}12`,border:`1px solid ${prof.color}44`,borderRadius:16,padding:16}}>
        <div style={{color:C.gray,fontSize:10,fontWeight:800,letterSpacing:2,marginBottom:10}}>SEU RADAR DE HÁBITOS</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:36,flexShrink:0}}>{prof.emoji}</span>
          <div>
            <div style={{fontFamily:"Impact,sans-serif",fontSize:15,color:prof.color,letterSpacing:2}}>{prof.title}</div>
            <p style={{color:C.grayLt,fontSize:13,margin:"4px 0 0",lineHeight:1.5}}>{prof.desc}</p>
          </div>
        </div>
        <div style={{marginTop:10,background:`${prof.color}18`,borderRadius:10,padding:"10px 12px"}}>
          <span style={{color:prof.color,fontSize:12,fontWeight:700}}>💡 Toque rápido: </span>
          <span style={{color:C.grayLt,fontSize:13}}>{prof.tip}</span>
        </div>
      </div>

      {/* Forças e pontos fracos */}
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
        <div style={{background:C.card,border:`1px solid ${C.green}33`,borderRadius:16,padding:16}}>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:17,color:C.green,letterSpacing:2,marginBottom:10}}>✅ ONDE VOCÊ MANDOU BEM</div>
          {(strengths.length?strengths:[{title:"Você chegou até o fim",body:"Só chegar até aqui já mostra que você entrou no desafio. Agora bora levar alguma coisa dele pra vida real.",color:C.green}]).map((s,i)=>(
            <div key={`${s.title}-${i}`} className="report-card" style={{background:`${s.color}10`,borderLeft:`3px solid ${s.color}`,borderRadius:"0 10px 10px 0",padding:"9px 11px",marginBottom:8}}>
              <div style={{color:s.color,fontWeight:900,fontSize:12}}>{s.title}</div>
              <div style={{color:C.grayLt,fontSize:12,lineHeight:1.5,marginTop:2}}>{s.body}</div>
            </div>
          ))}
        </div>

        <div style={{background:C.card,border:`1px solid ${C.orange}33`,borderRadius:16,padding:16}}>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:17,color:C.orange,letterSpacing:2,marginBottom:10}}>🎯 ONDE DÁ PRA SUBIR DE NÍVEL</div>
          {(weaknesses.length?weaknesses:[{title:"Continua no jogo",body:"Você foi bem. O próximo nível é fazer esse cuidado aparecer fora da tela também.",action:"Chama alguém de casa pra conversar sobre pressão e, se houver indicação, medir do jeito certo.",color:C.teal}]).map((w,i)=>(
            <div key={`${w.title}-${i}`} className="report-card" style={{background:`${w.color}10`,borderLeft:`3px solid ${w.color}`,borderRadius:"0 10px 10px 0",padding:"9px 11px",marginBottom:8}}>
              <div style={{color:w.color,fontWeight:900,fontSize:12}}>{w.title}</div>
              <div style={{color:C.grayLt,fontSize:12,lineHeight:1.5,marginTop:2}}>{w.body}</div>
              <div style={{color:C.white,fontSize:12,lineHeight:1.5,marginTop:5}}><strong style={{color:w.color}}>Bora tentar: </strong>{w.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas dos módulos */}
      <div>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.white,letterSpacing:3,marginBottom:4}}>📈 SEU RESUMÃO DO DESAFIO</div>
        <p style={{color:C.gray,fontSize:12,marginTop:0,marginBottom:14}}>Pontuação total: {totalScore} pts · planos concluídos: {preventionHits}/{(m3Responses||[]).length||M3_CHALLENGES_PER_GAME} · cartas-chave: {foundKeywords.length} · aliados: {allies.length}/{ALLIES.length}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {moduleStats.map(m=>(
            <div key={m.module} className="report-card" style={{background:C.surface,border:`1px solid ${m.color}33`,borderRadius:12,padding:"10px 13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{color:C.white,fontWeight:800,fontSize:13}}>{m.name}</span>
                <span style={{color:m.color,fontWeight:900,fontSize:12}}>{m.total?`${m.correct}/${m.total}`:"jogado"}</span>
              </div>
              <ProgressBar value={m.value} max={100} color={m.color} h={6}/>
              <p style={{color:C.grayLt,fontSize:12,margin:"7px 0 0",lineHeight:1.5}}>{m.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* M1 Quiz por categoria */}
      {catRisk.length>0&&(
        <div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.white,letterSpacing:3,marginBottom:4}}>📋 SEU MAPA DE HÁBITOS</div>
          <p style={{color:C.gray,fontSize:12,marginTop:0,marginBottom:14}}>Olha onde você tá tranquilo e onde vale ficar mais ligado 👇</p>

          {/* Barras por categoria */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
            {catRisk.map(({cat,riskPct})=>{
              const col=riskPct>60?C.red:riskPct>35?C.orange:riskPct>15?C.yellow:C.green;
              const tip=CAT_TIPS[cat];
              return(
                <div key={cat} className="report-card" style={{background:C.card,border:`1px solid ${col}33`,borderRadius:12,padding:"10px 13px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{color:C.white,fontWeight:700,fontSize:13}}>{cat}</span>
                    <span style={{color:col,fontWeight:800,fontSize:12}}>{riskPct>0?`⚠️ ${riskPct} pra ficar ligado`:"✅ Tá tranquilo aqui"}</span>
                  </div>
                  <div className="report-progress" style={{height:6,background:C.border,borderRadius:99,overflow:"hidden",marginBottom:riskPct>15?8:0}}>
                    <div className="report-progress__fill" style={{width:`${riskPct}%`,height:"100%",background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:99}}/>
                  </div>
                  {riskPct>15&&<p style={{color:C.grayLt,fontSize:12,margin:0,lineHeight:1.5}}>{tip?.tip||"Vale ficar ligado nesse tema!"}</p>}
                  {riskPct===0&&<p style={{color:C.green,fontSize:12,margin:0}}>{tip?.good||"Mandou bem. Segue nessa!"}</p>}
                </div>
              );
            })}
          </div>

          {/* Pergunta a pergunta */}
          <div style={{fontWeight:700,fontSize:13,color:C.white,letterSpacing:1,marginBottom:10}}>🔍 VAMOS REVER AS JOGADAS</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(m1Questions||[]).map((q,i)=>{
              const ans=m1Answers?.[i];
              if(!ans)return null;
              const risk=ans.risk||0;
              const isGood=risk===0;
              const col=risk>15?C.red:risk>5?C.yellow:C.green;
              const safest=q.opts[0];
              return(
                <div key={q.id} className="report-card" style={{background:C.surface,border:`1px solid ${col}33`,borderRadius:13,padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                    <Tag label={q.cat.split(" ")[0]} color={col}/>
                    <span style={{marginLeft:"auto",color:col,fontWeight:800,fontSize:12}}>
                      {isGood?"✅ Mandou bem!":`⚠️ +${risk} pts`}
                    </span>
                  </div>
                  <p style={{color:C.white,fontSize:13,fontWeight:700,margin:"0 0 4px",lineHeight:1.4}}>{q.q}</p>
                  <p style={{color:C.gray,fontSize:11,margin:"0 0 8px"}}>{q.sub}</p>
                  <div style={{background:`${col}15`,borderRadius:8,padding:"7px 10px",fontSize:12,color:C.grayLt}}>
                    <span style={{color:col,fontWeight:700}}>Sua resposta: </span>{ans.t}
                  </div>
                  {!isGood&&(
                    <div style={{background:`${C.green}10`,borderRadius:8,padding:"7px 10px",fontSize:12,color:C.grayLt,marginTop:6,borderLeft:`3px solid ${C.green}`}}>
                      <span style={{color:C.green,fontWeight:700}}>Melhor caminho: </span>{safest.t}
                      <p style={{margin:"4px 0 0",fontSize:11,color:C.gray}}>Sem neura: ajuste pequeno, repetido de verdade, já conta. 💪</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Final */}
      {quizResults.length>0&&(
        <div>
          <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.white,letterSpacing:3,marginBottom:4}}>🧠 COMO FOI NO QUIZ</div>
          <p style={{color:C.gray,fontSize:12,marginTop:0,marginBottom:14}}>Você cravou {quizCorrect} de {quizTotal||0} 🎯</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {quizResults.map((r,i)=>{
              if(!r.question)return null;
              const q=r.question;
              return(
                <div key={i} className="report-card" style={{background:C.card,border:`1px solid ${r.correct?C.green:C.red}44`,borderRadius:14,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:20}}>{q.icon}</span>
                    <Tag label={q.module} color={q.moduleColor}/>
                    <span style={{marginLeft:"auto",fontWeight:800,fontSize:13,color:r.correct?C.green:C.red}}>
                      {r.correct?"✅ Cravou!":"❌ Quase!"}
                    </span>
                  </div>
                  <p style={{color:C.white,fontSize:13,fontWeight:700,margin:"0 0 8px",lineHeight:1.4}}>{q.q}</p>
                  <div style={{background:`${r.correct?C.green:C.red}12`,borderRadius:8,padding:"7px 10px",fontSize:12,color:C.grayLt,marginBottom:r.correct?0:6}}>
                    <span style={{color:r.correct?C.green:C.red,fontWeight:700}}>Sua resposta: </span>{r.chosen||"—"}
                  </div>
                  {!r.correct&&r.correctText&&(
                    <div style={{background:`${C.green}10`,borderRadius:8,padding:"7px 10px",fontSize:12,color:C.grayLt,marginBottom:6,borderLeft:`3px solid ${C.green}`}}>
                      <span style={{color:C.green,fontWeight:700}}>A resposta era: </span>{r.correctText}
                    </div>
                  )}
                  <div style={{background:C.surface,borderLeft:`3px solid ${q.moduleColor}`,borderRadius:"0 8px 8px 0",padding:"8px 10px",fontSize:12,color:C.grayLt,lineHeight:1.6}}>
                    💡 {q.exp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conclusão */}
      <div style={{background:`linear-gradient(135deg,${C.teal}15,${C.purple}10)`,border:`1px solid ${C.teal}44`,borderRadius:18,padding:20}}>
        <div style={{fontFamily:"Impact,sans-serif",fontSize:18,color:C.teal,letterSpacing:3,marginBottom:14}}>🎓 LEVA ISSO COM VOCÊ</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {CONCLUSION.map(({emoji,title,text})=>(
            <div key={title} className="report-card" style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0}}>{emoji}</span>
              <div>
                <div style={{color:C.white,fontWeight:800,fontSize:13,marginBottom:3}}>{title}</div>
                <p style={{color:C.grayLt,fontSize:13,margin:0,lineHeight:1.6}}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="report-footer" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,padding:14,textAlign:"center"}}>
        <p style={{color:C.grayDk,fontSize:11,margin:"0 0 3px"}}>⚕️ Diretriz Brasileira de Hipertensão 2025 · OMS 2020 · AASM · AHA/ASA 2026</p>
        <p style={{color:C.grayDk,fontSize:11,margin:0}}>Relatório educativo · versão {APP_VERSION}. Não é diagnóstico, prontuário ou instrumento validado e não substitui avaliação profissional.</p>
      </div>

      {/* Botões — sumem no PDF */}
      <div style={{display:"flex",flexDirection:"column",gap:10}} className="no-print">
        <div style={{background:`${C.yellow}10`,border:`1px solid ${C.yellow}44`,borderRadius:12,padding:"10px 12px",color:C.grayLt,fontSize:12,lineHeight:1.55}}>🔒 O PDF pode conter seu apelido, hábitos e informações familiares. Salve apenas em um dispositivo seguro e compartilhe somente com sua autorização.</div>
        <Btn onClick={()=>window.print()} color={C.teal} size="lg" style={{width:"100%"}}>🖨️ IMPRIMIR OU SALVAR EM PDF</Btn>
        <Btn onClick={onBack} color={C.gray} outline size="lg" style={{width:"100%"}}>← VOLTAR PRO FINAL</Btn>
      </div>
    </div>
  );
}

function VictoryScreen({totalScore,quizAnswers,playerName,finalQuiz,onRestart,onShowReport}){
  const [phase,setPhase]=useState(0);
  const soundFired=useRef(false);
  useEffect(()=>{
    const t0=setTimeout(()=>{setPhase(1);if(!soundFired.current&&!SFX.muted){playVictorySound();soundFired.current=true;}},300);
    const t1=setTimeout(()=>setPhase(2),1000);
    const t2=setTimeout(()=>setPhase(3),1900);
    const t3=setTimeout(()=>setPhase(4),2800);
    return()=>{clearTimeout(t0);clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  const correct=quizAnswers.filter(a=>a.correct).length;
  const quizTotal=finalQuiz.length||6;
  const perfect=correct===quizTotal;
  const quizPct=quizTotal?Math.round((correct/quizTotal)*100):0;
  const title=perfect?"MESTRE DO DESAFIO":quizPct>=75?"GUARDIÃO DO CONHECIMENTO":quizPct>=50?"APRENDIZ CONSCIENTE":"MISSÃO EM ANDAMENTO";
  const achievements=[
    {ok:true,icon:"❤️",title:"Explorador de Hábitos",color:C.red},
    {ok:quizPct>=75,icon:"🧠",title:"Conhecimento em Ação",color:C.purple},
    {ok:perfect,icon:"🏆",title:"Mestre do Desafio",color:C.green},
  ].filter(a=>a.ok);
  return(
    <>
      {phase>=1&&<Confetti/>}
      {/* Background full-screen — vídeo do troféu */}
      <div aria-hidden style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <MotionMedia
          video={MEDIA.trophyVideo}
          poster={MEDIA.trophyStill}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"saturate(1.15) brightness(0.55)"}}
        />
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${C.bg}88 0%,${C.bg}bb 45%,${C.bg}f0 100%)`}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 30%,${C.yellow}22 0%,transparent 60%)`}}/>
      </div>
      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp .4s ease",position:"relative",zIndex:2}}>

        {/* Hero card */}
        <div style={{textAlign:"center",background:`linear-gradient(160deg,${C.yellow}22,${C.green}14,${C.purple}12)`,border:`2px solid ${C.yellow}55`,borderRadius:24,padding:"36px 20px 28px",boxShadow:`0 0 80px ${C.yellow}25`,position:"relative",overflow:"hidden",animation:"celebPulse 2.5s ease infinite",backdropFilter:"blur(8px)"}}>
          {/* Estrelas decorativas */}
          {phase>=1&&["⭐","✨","🌟","✨","⭐"].map((s,i)=>(
            <span key={i} style={{position:"absolute",fontSize:18+i*4,opacity:.7,animation:`starPop .5s ${i*0.12}s cubic-bezier(.34,1.56,.64,1) forwards`,top:`${10+i*12}%`,left:i%2===0?`${5+i*5}%`:`${75-i*4}%`,display:"inline-block",transform:"scale(0)",zIndex:1}}>
              {s}
            </span>
          ))}
          <div style={{position:"relative",zIndex:2}}>
          <TrophyAnim phase={phase}/>
          {phase>=1&&(
            <>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:12,letterSpacing:5,color:C.yellow,marginBottom:6,animation:"textReveal .5s .1s ease forwards",opacity:0}}>
                PARABÉNS, {playerName.toUpperCase()}!
              </div>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:30,color:C.white,lineHeight:1.1,marginBottom:10,animation:"textReveal .5s .25s ease forwards",opacity:0}}>
                VOCÊ COMPLETOU<br/>O DESAFIO!
              </div>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:16,color:C.yellow,letterSpacing:2,animation:"textReveal .5s .4s ease forwards",opacity:0}}>
                {title}
              </div>
            </>
          )}
          </div>
        </div>

        {/* Pontuação */}
        {phase>=2&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"popIn .45s ease"}}>
            <div style={{background:C.card,border:`1px solid ${C.yellow}44`,borderRadius:16,padding:"18px 12px",textAlign:"center",boxShadow:`0 0 20px ${C.yellow}15`}}>
              <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>PONTUAÇÃO TOTAL</div>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:C.yellow,lineHeight:1,filter:`drop-shadow(0 0 10px ${C.yellow})`}}><CountUp target={totalScore}/></div>
              <div style={{color:C.gray,fontSize:12}}>6 módulos + quiz</div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.green}44`,borderRadius:16,padding:"18px 12px",textAlign:"center",boxShadow:`0 0 20px ${C.green}15`}}>
              <div style={{color:C.gray,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6}}>QUIZ FINAL</div>
              <div style={{fontFamily:"Impact,sans-serif",fontSize:44,color:C.green,lineHeight:1}}><CountUp target={correct}/><span style={{fontSize:22,color:C.gray}}>/{quizTotal}</span></div>
              <div style={{color:C.gray,fontSize:12}}>acertos</div>
            </div>
          </div>
        )}

        {/* Módulos concluídos */}
        {phase>=3&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,animation:"fadeUp .4s ease"}}>
            {[[1,"M1",C.red],[2,"M2",C.amber],[3,"M3",C.green],[4,"M4",C.red],[5,"M5",C.orange],[6,"M6",C.teal]].map(([mod,lb,col],i)=>(
              <div key={lb} style={{background:`${col}15`,border:`1px solid ${col}55`,borderRadius:13,padding:"10px 6px",textAlign:"center",animation:`starPop .4s ${i*0.07}s ease forwards`,opacity:0}}>
                <ModuleArt mod={mod} size={44} color={col} style={{margin:"0 auto 4px",borderRadius:10}}/>
                <div style={{color:col,fontWeight:800,fontSize:11,marginTop:2}}>{lb}</div>
                <div style={{color:C.green,fontSize:18,fontWeight:900}}>✓</div>
              </div>
            ))}
          </div>
        )}

        {phase>=3&&(
          <div style={{background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:16,padding:16,animation:"fadeUp .45s ease"}}>
            <div style={{color:C.yellow,fontSize:12,fontWeight:900,letterSpacing:2,marginBottom:12}}>CONQUISTAS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {achievements.map((a,i)=>(
                <div key={a.title} style={{background:`${a.color}14`,border:`1px solid ${a.color}55`,borderRadius:12,padding:"11px 10px",display:"flex",alignItems:"center",gap:9,animation:`badgeFlip .45s ${i*.08}s ease both`}}>
                  <span style={{fontSize:22}}>{a.icon}</span>
                  <span style={{color:a.color,fontSize:12,fontWeight:900,lineHeight:1.2}}>{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA final */}
        {phase>=4&&(
          <>
            <div style={{background:C.surface,borderLeft:`4px solid ${C.teal}`,borderRadius:"0 14px 14px 0",padding:"14px 16px",animation:"fadeUp .4s ease"}}>
              <div style={{color:C.teal,fontSize:13,fontWeight:800,marginBottom:6}}>💚 Sua missão agora</div>
              <p style={{color:C.grayLt,fontSize:13,lineHeight:1.7,margin:0}}>
                Compartilhe o que aprendeu, leve sua família ao posto de saúde e lembre: <strong style={{color:C.white}}>controlar a pressão é cuidar da vida</strong>.
              </p>
            </div>
            <Btn onClick={onShowReport} color={C.teal} size="lg" style={{width:"100%",color:"#000"}}>📊 VER MEU RELATÓRIO →</Btn>
            <Btn onClick={onRestart} color={C.red} outline size="lg" style={{width:"100%"}}>🔄 JOGAR NOVAMENTE</Btn>
            <p style={{color:C.grayDk,fontSize:11,textAlign:"center"}}>⚕️ Diretriz Brasileira de Hipertensão 2025 · OMS 2020 · AASM · AHA/ASA 2026</p>
          </>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORQUESTRADOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function PressaoQuest(){
  const [screen,setScreen]=useState(()=>["mostra","congresso"].includes(new URLSearchParams(window.location.search).get("modo"))?"congress":"home");
  const [soundOn,setSoundOn]=useState(true);
  const [playerName,setPlayerName]=useState("Jogador");
  const [m1Answers,setM1Answers]=useState([]);
  const [m1Questions,setM1Questions]=useState([]);
  const [m1Score,setM1Score]=useState(0);
  const [m1Risk,setM1Risk]=useState(0);
  const [members,setMembers]=useState(initMembers());
  const [detailQueue,setDetailQueue]=useState([]);
  const [detailIdx,setDetailIdx]=useState(0);
  const [m3Challenges,setM3Challenges]=useState(()=>pickPreventionChallenges());
  const [m3Responses,setM3Responses]=useState([]);
  const [m3ChalIdx,setM3ChalIdx]=useState(0);
  const [m3UnlockedAllies,setM3UnlockedAllies]=useState([]);
  const [m3Combo,setM3Combo]=useState(0);
  const [showCompendium,setShowCompendium]=useState(false);
  const [m4Score,setM4Score]=useState(0);
  const [m4Perfect,setM4Perfect]=useState(false);
  const [m5Score,setM5Score]=useState(0);
  const [m5TotalDamage,setM5TotalDamage]=useState(0);
  const [m6Score,setM6Score]=useState(0);
  const [m6Commitments,setM6Commitments]=useState([]);
  const [finalQuiz,setFinalQuiz]=useState(()=>pickFinalQuiz());
  const [quizScore,setQuizScore]=useState(0);
  const [quizAnswers,setQuizAnswers]=useState([]);
  const mainRef=useRef(null);

  const totalScore=m1Score+calcExplorerScore(members)+m3Responses.reduce((s,r)=>s+(r?.total||0),0)+m4Score+m5Score+m6Score+quizScore;
  const screenModules={
    home:"1",name:"1",devpanel:"1",m1quiz:"1",m1result:"1",
    m2sel:"2",m2detail:"2",m2tree:"2",
    m3intro:"3",m3challenge:"3",m3result:"3",
    m4intro:"4",m4game:"4",m4result:"4",
    m5intro:"5",m5game:"5",m5result:"5",
    m6intro:"6",m6game:"6",
    quizfinalintro:"quiz",quizfinal:"quiz",victory:"quiz",report:"report",congress:"congress",
  };
  const currentModule=screenModules[screen]||"1";
  const currentModuleLabel={1:"Hábitos",2:"Família",3:"Prevenção",4:"Alertas",5:"Consequências",6:"Ação familiar",quiz:"Quiz final",report:"Relatório",congress:"Versão Congresso"}[currentModule]||"Pressão Quest";

  useEffect(()=>{SFX.setMuted(!soundOn);},[soundOn]);
  useEffect(()=>{
    mainRef.current?.focus();
    window.scrollTo({top:0,behavior:"auto"});
  },[screen]);

  // M1
  const finishM1=(ans,questions)=>{
    const sc=calcScore(ans,questions);const rk=calcRisk(ans,questions);
    setM1Answers(ans);setM1Questions(questions);setM1Score(sc);setM1Risk(rk);setScreen("m1result");
  };

  // M2
  const saveMember=(upd)=>{
    const updated=members.map(m=>m.id===upd.id?{...m,...upd}:m);
    setMembers(updated);
    setScreen("m2sel");
  };
  const editMember=(id)=>{const idx=detailQueue.indexOf(id);if(idx>=0){setDetailIdx(idx);setScreen("m2detail");}else{const nq=[...detailQueue,id];setDetailQueue(nq);setDetailIdx(nq.length-1);setScreen("m2detail");}};
  const finishM2=()=>{SFX.unlock();setM3Challenges(pickPreventionChallenges());setM3Responses([]);setM3ChalIdx(0);setM3UnlockedAllies([]);setM3Combo(0);setScreen("m3intro");};

  // M3
  const submitM3=(resp)=>{
    const newResp=[...m3Responses];newResp[m3ChalIdx]=resp;
    setM3Responses(newResp);
    const newAllies=[...new Set([...m3UnlockedAllies,...(resp.newAllies||[])])];
    setM3UnlockedAllies(newAllies);
    const newCombo=resp.correctCount===PLAN_GROUPS.length?m3Combo+1:0;
    setM3Combo(newCombo);
    if(m3ChalIdx<m3Challenges.length-1){setM3ChalIdx(i=>i+1);}
    else{setScreen("m3result");}
  };

  const finishM4=(sc,perf)=>{setM4Score(sc);setM4Perfect(perf);setScreen("m4result");};
  const finishM5=(sc,totalDamage)=>{setM5Score(sc);setM5TotalDamage(totalDamage);setScreen("m5result");};
  const prepareFinalQuiz=()=>setFinalQuiz(pickFinalQuiz());
  const finishM6=(sc,commitments)=>{SFX.unlock();setM6Score(sc);setM6Commitments(commitments);prepareFinalQuiz();setScreen("quizfinalintro");};
  const finishQuiz=(sc,ans)=>{setQuizScore(sc);setQuizAnswers(ans);setScreen("victory");};
  const openShowcase=()=>{
    const url=new URL(window.location.href);url.searchParams.set("modo","congresso");window.history.replaceState({},"",url);setScreen("congress");
  };
  const closeShowcase=()=>{
    const url=new URL(window.location.href);url.searchParams.delete("modo");window.history.replaceState({},"",url);setScreen("home");
  };

  const restart=()=>{
    setScreen("home");setPlayerName("Jogador");setM1Answers([]);setM1Score(0);setM1Risk(0);
    setM1Questions([]);
    setMembers(initMembers());setDetailQueue([]);setDetailIdx(0);
    setM3Challenges(pickPreventionChallenges());setM3Responses([]);setM3ChalIdx(0);setM3UnlockedAllies([]);setM3Combo(0);setShowCompendium(false);
    setM4Score(0);setM4Perfect(false);setM5Score(0);setM5TotalDamage(0);setM6Score(0);setM6Commitments([]);setFinalQuiz(pickFinalQuiz());setQuizScore(0);setQuizAnswers([]);
  };

  const devJumpTo=(target)=>{
    // Inicializa estado mínimo para cada módulo funcionar
    setPlayerName("DEV");
    if(["m1result"].includes(target)){setM1Score(40);setM1Risk(2);setM1Answers([]);setM1Questions(QUIZ_QUESTIONS_BANK.slice(0,10));}
    if(["m2sel","m2detail","m2tree"].includes(target)){setM1Risk(2);}
    if(["m3intro","m3challenge","m3result"].includes(target)){
      setM1Risk(2);
      if(target==="m3result"){const ch=pickPreventionChallenges();setM3Challenges(ch);setM3Responses(ch.map(()=>({hit:true,total:10,maxPoints:10,newAllies:[]})));setM3ChalIdx(0);}
      else{setM3Responses([]);setM3ChalIdx(0);setM3UnlockedAllies([]);setM3Combo(0);}
    }
    if(target==="m4result"){setM4Score(MODULE_MAX_POINTS.m4);setM4Perfect(true);}
    if(target==="m5result"){setM5Score(MODULE_MAX_POINTS.m5);setM5TotalDamage(0);}
    if(["quizfinalintro","quizfinal","victory","report"].includes(target)){setM6Score(MODULE_MAX_POINTS.m6);setM6Commitments([1]);}
    if(target==="report"){
      setM1Score(MODULE_MAX_POINTS.m1);setM1Risk(0);
      setM4Score(MODULE_MAX_POINTS.m4);setM4Perfect(true);
      setM5Score(MODULE_MAX_POINTS.m5);setM5TotalDamage(0);
    }
    if(["quizfinalintro","quizfinal","victory"].includes(target)){prepareFinalQuiz();}
    if(target==="victory"){setQuizScore(50);setM1Score(40);setM4Score(MODULE_MAX_POINTS.m4);setQuizAnswers([]);}
    setScreen(target);
  };

  const currentMemberDef=FAM_DEFS.find(f=>f.id===detailQueue[detailIdx]);
  const currentMember=members.find(m=>m.id===detailQueue[detailIdx]);

  const moduleColorMap={"1":C.red,"2":C.amber,"3":C.green,"4":C.red,"5":C.orange,"6":C.teal,quiz:C.purple,report:C.teal,congress:C.teal};
  const moduleColor=moduleColorMap[currentModule]||C.red;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Segoe UI',system-ui,sans-serif",position:"relative"}}>
      <style>{GLOBAL_CSS}</style>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      {screen!=="congress"&&<ThreeBackground moduleColor={moduleColor}/>}
      <ModuleAura color={moduleColor} label={currentModuleLabel}/>
      <SoundToggle on={soundOn} onToggle={()=>setSoundOn(v=>!v)}/>

      {screen!=="home"&&screen!=="devpanel"&&screen!=="congress"&&<TopBar module={currentModule} score={totalScore} onBack={screen==="report"?()=>setScreen("victory"):undefined}/>}

      <main id="main-content" ref={mainRef} tabIndex={-1} key={screen} aria-labelledby="screen-title" style={{width:"100%",maxWidth:560,margin:"0 auto",position:"relative",zIndex:1,animation:"screenEnter .32s cubic-bezier(.4,0,.2,1)"}}>
        <h1 id="screen-title" className="sr-only">Desafio Hipertensão — {currentModuleLabel}</h1>
        {screen==="home"&&<M1Home onStart={()=>setScreen("name")} onShowcase={openShowcase} playerName={playerName} onDevUnlock={()=>setScreen("devpanel")}/>}
        {screen==="congress"&&<CongressMode onExit={closeShowcase}/>}
        {screen==="devpanel"&&<DevPanel onJump={devJumpTo} onClose={()=>setScreen("home")}/>}
        {screen==="name"&&<M1Name onConfirm={n=>{setPlayerName(n);setScreen("m1quiz");}}/>}
        {screen==="m1quiz"&&<M1Quiz onFinish={finishM1}/>}
        {screen==="m1result"&&<M1Result answers={m1Answers} score={m1Score} risk={m1Risk} questions={m1Questions} onNext={()=>{SFX.unlock();setScreen("m2sel");}}/>}
        {screen==="m2sel"&&<M2Selector members={members} onEdit={editMember} onFinish={()=>setScreen("m2tree")}/>}
        {screen==="m2detail"&&currentMember&&currentMemberDef&&<M2Detail member={currentMember} memberDef={currentMemberDef} onSave={saveMember} onBack={()=>setScreen("m2sel")}/>}
        {screen==="m2tree"&&<M2Tree members={members} onEdit={editMember} onFinish={finishM2}/>}
        {screen==="m3intro"&&<M3Intro playerRisk={m1Risk} onStart={()=>setScreen("m3challenge")}/>}
        {screen==="m3challenge"&&(
          <M3Challenge
            key={m3ChalIdx}
            challenge={m3Challenges[m3ChalIdx]}
            onSubmit={submitM3}
            challengeIndex={m3ChalIdx}
            totalChallenges={m3Challenges.length}
            unlockedAllies={m3UnlockedAllies}
            combo={m3Combo}
          />
        )}
        {screen==="m3result"&&!showCompendium&&(
          <M3Result
            responses={m3Responses} prevScore={m1Score+calcExplorerScore(members)}
            onCompendium={()=>setShowCompendium(true)} onNext={()=>{SFX.unlock();setScreen("m4intro");}}
          />
        )}
        {screen==="m3result"&&showCompendium&&(
          <M3Compendium responses={m3Responses} onBack={()=>setShowCompendium(false)}/>
        )}
        {screen==="m4intro"&&<M4Intro onStart={()=>setScreen("m4game")}/>}
        {screen==="m4game"&&<M4Game onFinish={finishM4}/>}
        {screen==="m4result"&&<M4Result score={m4Score} perfect={m4Perfect} totalScore={totalScore} onNext={()=>{SFX.unlock();setScreen("m5intro");}}/>}
        {screen==="m5intro"&&<M5Intro onStart={()=>setScreen("m5game")}/>}
        {screen==="m5game"&&<M5Game onFinish={finishM5}/>}
        {screen==="m5result"&&<M5Result score={m5Score} totalDamage={m5TotalDamage} onNext={()=>{SFX.unlock();setScreen("m6intro");}}/>}
        {screen==="m6intro"&&<M6Intro onStart={()=>setScreen("m6game")}/>}
        {screen==="m6game"&&<M6Game onFinish={finishM6}/>}
        {screen==="quizfinalintro"&&<QuizFinalIntro finalQuiz={finalQuiz} onStart={()=>setScreen("quizfinal")}/>}
        {screen==="quizfinal"&&<QuizFinal finalQuiz={finalQuiz} onFinish={finishQuiz}/>}
        {screen==="victory"&&<VictoryScreen totalScore={totalScore} quizAnswers={quizAnswers} playerName={playerName} finalQuiz={finalQuiz} onRestart={restart} onShowReport={()=>setScreen("report")}/>}
        {screen==="report"&&(
          <ReportScreen
            playerName={playerName}
            m1Answers={m1Answers}
            m1Questions={m1Questions}
            m1Risk={m1Risk}
            quizAnswers={quizAnswers}
            finalQuiz={finalQuiz}
            totalScore={totalScore}
            m3Responses={m3Responses}
            m4Score={m4Score}
            m4Perfect={m4Perfect}
            m5Score={m5Score}
            m6Score={m6Score}
            m6Commitments={m6Commitments}
            onBack={()=>setScreen("victory")}
          />
        )}
      </main>
    </div>
  );
}

export class AppErrorBoundary extends Component{
  constructor(props){super(props);this.state={hasError:false};}
  static getDerivedStateFromError(){return{hasError:true};}
  componentDidCatch(error,info){console.error("Falha inesperada no Desafio Hipertensão",error,info);}
  render(){
    if(!this.state.hasError)return this.props.children;
    return <div role="alert" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:C.bg,color:C.white,fontFamily:"system-ui,sans-serif"}}>
      <div style={{maxWidth:480,background:C.card,border:`1px solid ${C.red}66`,borderRadius:18,padding:24,textAlign:"center"}}>
        <h1 style={{fontSize:24,marginBottom:12}}>Não foi possível carregar esta etapa</h1>
        <p style={{color:C.grayLt,lineHeight:1.6,marginBottom:18}}>O jogo encontrou uma falha inesperada. Nenhuma resposta foi enviada para um servidor.</p>
        <button onClick={()=>window.location.reload()} style={{minHeight:44,padding:"10px 18px",borderRadius:10,border:0,background:C.teal,color:"#000",fontWeight:800}}>REINICIAR O JOGO</button>
      </div>
    </div>;
  }
}
