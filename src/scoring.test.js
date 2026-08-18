import { describe, expect, it } from "vitest";
import {
  calculateActionScore,
  calculateAlertScore,
  calculateDecisionScore,
  calculateFamilyExplorerScore,
  calculateHabitRisk,
  calculateHabitScore,
  calculateLearningScore,
  calculatePreventionPerformance,
  calculateScenarioProgress,
  toPercent,
} from "./scoring.js";

const questions = [
  { opts: [{ pts: 0, risk: 0 }, { pts: 30, risk: 20 }] },
  { opts: [{ pts: 0, risk: 0 }, { pts: 20, risk: 30 }] },
];

describe("pontuação educativa", () => {
  it("converte desempenho perfeito em 100%", () => {
    expect(toPercent(60, 60)).toBe(100);
    expect(calculateHabitRisk([{ risk: 0 }, { risk: 0 }], questions)).toBe(0);
    expect(calculateHabitScore([{ pts: 0 }, { pts: 0 }], questions)).toBe(100);
  });

  it("mantém os limites dos módulos 2, 4, 5 e 6", () => {
    expect(calculateFamilyExplorerScore(Array.from({ length: 8 }, () => ({ visited: true })))).toBe(60);
    expect(calculateAlertScore(6, 0)).toBe(60);
    expect(calculateAlertScore(0, 6)).toBe(0);
    expect(calculateDecisionScore(0)).toBe(60);
    expect(calculateDecisionScore(200)).toBe(0);
    expect(calculateActionScore(1)).toBe(60);
    expect(calculateActionScore(3)).toBe(60);
    expect(calculateActionScore(6)).toBe(0);
  });

  it("normaliza o módulo 3 pelo máximo real da partida", () => {
    expect(calculatePreventionPerformance([
      { total: 35, maxPoints: 35 },
      { total: 44, maxPoints: 44 },
      { total: 68, maxPoints: 68 },
    ])).toEqual({ earned: 147, maximum: 147, percent: 100 });
    expect(calculatePreventionPerformance([{ total: 20, maxPoints: 40 }]).percent).toBe(50);
  });

  it("leva um percurso perfeito a 100% no relatório", () => {
    expect(calculateLearningScore({
      habits: 100,
      quiz: 100,
      prevention: 100,
      alerts: 100,
      decisions: 100,
      action: 100,
    })).toBe(100);
  });

  it("calcula o progresso dos casos pela quantidade real de etapas", () => {
    const scenarios = [{ steps: [{}, {}] }, { steps: [{}, {}, {}] }];
    expect(calculateScenarioProgress(scenarios, 1, 0, "intro")).toEqual({ value: 2, maximum: 5 });
    expect(calculateScenarioProgress(scenarios, 1, 2, "lesson")).toEqual({ value: 5, maximum: 5 });
  });
});
