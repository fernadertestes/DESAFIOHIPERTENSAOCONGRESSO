import { describe, expect, it } from "vitest";
import {
  FINAL_QUIZ_BANK,
  M4_SYMPTOMS,
  M5_SCENARIOS_BANK,
  PREVENTION_CHALLENGES,
  QUIZ_QUESTIONS_BANK,
  CONGRESS_M6_QUESTIONS,
  CONGRESS_PREVIEW_CONFIG,
  pickCongressSymptoms,
} from "../pressao-quest-completo.jsx";

function expectUniqueIds(items){
  const ids=items.map(item=>item.id);
  expect(new Set(ids).size).toBe(ids.length);
}

describe("integridade dos bancos de conteúdo",()=>{
  it("mantém o radar com 60 perguntas válidas e IDs únicos",()=>{
    expect(QUIZ_QUESTIONS_BANK).toHaveLength(60);
    expectUniqueIds(QUIZ_QUESTIONS_BANK);
    QUIZ_QUESTIONS_BANK.forEach(question=>{
      expect(question.opts.length).toBeGreaterThanOrEqual(2);
      question.opts.forEach(option=>{
        expect(option.pts).toBeTypeOf("number");
        expect(option.risk).toBeTypeOf("number");
      });
    });
  });

  it("mantém desafios preventivos e casos com estrutura jogável",()=>{
    expect(PREVENTION_CHALLENGES).toHaveLength(14);
    expect(M5_SCENARIOS_BANK).toHaveLength(18);
    expectUniqueIds(PREVENTION_CHALLENGES);
    expectUniqueIds(M5_SCENARIOS_BANK);
    M5_SCENARIOS_BANK.forEach(scenario=>{
      expect(scenario.steps.length).toBeGreaterThan(0);
      scenario.steps.forEach(step=>expect(step.choices.length).toBeGreaterThanOrEqual(2));
    });
  });

  it("mantém sinais reais e distratores no módulo 4",()=>{
    expectUniqueIds(M4_SYMPTOMS);
    expect(M4_SYMPTOMS.some(item=>item.real)).toBe(true);
    expect(M4_SYMPTOMS.some(item=>!item.real)).toBe(true);
  });

  it("mantém 72 questões finais com alternativas e gabarito válidos",()=>{
    expect(FINAL_QUIZ_BANK).toHaveLength(72);
    expectUniqueIds(FINAL_QUIZ_BANK);
    FINAL_QUIZ_BANK.forEach(question=>{
      expect(question.opts.length).toBeGreaterThanOrEqual(2);
      expect(question.correct).toBeGreaterThanOrEqual(0);
      expect(question.correct).toBeLessThan(question.opts.length);
      expect(question.exp.length).toBeGreaterThan(15);
    });
  });

  it("mantém a prévia congresso com a amostra correta de cada módulo",()=>{
    expect(CONGRESS_PREVIEW_CONFIG.m1Questions).toBe(2);
    expect(CONGRESS_PREVIEW_CONFIG.familyMembers).toBe(1);
    expect(CONGRESS_PREVIEW_CONFIG.preventionCases).toBe(1);
    expect(CONGRESS_PREVIEW_CONFIG.symptomOptions).toBe(M4_SYMPTOMS.length/4);
    expect(CONGRESS_PREVIEW_CONFIG.correctSymptoms).toBe(1);
    expect(CONGRESS_PREVIEW_CONFIG.m5Scenarios).toBe(1);
    expect(CONGRESS_PREVIEW_CONFIG.m5Questions).toBe(2);
    expect(M5_SCENARIOS_BANK.every(scenario=>scenario.steps.length===2)).toBe(true);
    expect(CONGRESS_M6_QUESTIONS).toHaveLength(2);
    expect(CONGRESS_M6_QUESTIONS.every(question=>question.module==="Módulo 6")).toBe(true);
    expectUniqueIds(CONGRESS_M6_QUESTIONS);

    const symptoms=pickCongressSymptoms();
    expect(symptoms).toHaveLength(4);
    expect(symptoms.filter(symptom=>symptom.real)).toHaveLength(1);
  });
});
