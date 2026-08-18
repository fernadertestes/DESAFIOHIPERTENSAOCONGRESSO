export const MODULE_MAX_POINTS = Object.freeze({
  m1: 100,
  m2: 60,
  m4: 60,
  m5: 60,
  m6: 60,
  finalQuizPerQuestion: 20,
});

export function toPercent(value, maximum) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / maximum) * 100)));
}

export function calculateHabitRisk(answers, questions) {
  const total = (answers || []).reduce((sum, answer) => sum + (answer?.risk || 0), 0);
  const maximum = (questions || []).reduce(
    (sum, question) => sum + Math.max(...question.opts.map(option => option.risk)),
    0,
  );
  return toPercent(total, maximum);
}

export function calculateHabitScore(answers, questions) {
  const total = (answers || []).reduce((sum, answer) => sum + (answer?.pts || 0), 0);
  const maximum = (questions || []).reduce(
    (sum, question) => sum + Math.max(...question.opts.map(option => option.pts)),
    0,
  );
  return Math.max(0, MODULE_MAX_POINTS.m1 - toPercent(total, maximum));
}

// O módulo recompensa o mapeamento, nunca a presença de doenças na família.
export function calculateFamilyExplorerScore(members) {
  const mapped = (members || []).filter(member => member?.visited).length;
  return Math.min(MODULE_MAX_POINTS.m2, mapped * 10);
}

export function calculateAlertScore(correctHits, wrongHits) {
  return Math.max(0, Math.min(MODULE_MAX_POINTS.m4, correctHits * 10 - wrongHits * 5));
}

export function calculateDecisionScore(consequencePoints) {
  return Math.max(0, MODULE_MAX_POINTS.m5 - Math.max(0, consequencePoints || 0));
}

export function calculateActionScore(commitmentCount) {
  return commitmentCount >= 1 && commitmentCount <= 3 ? MODULE_MAX_POINTS.m6 : 0;
}

export function calculatePreventionPerformance(responses) {
  const played = (responses || []).filter(Boolean);
  const earned = played.reduce((sum, response) => sum + (response.total || 0), 0);
  const maximum = played.reduce((sum, response) => sum + (response.maxPoints || 0), 0);
  return { earned, maximum, percent: toPercent(earned, maximum) };
}

export function calculateLearningScore({ habits, quiz, prevention, alerts, decisions, action }) {
  return Math.round(
    habits * 0.25 +
    quiz * 0.20 +
    prevention * 0.20 +
    alerts * 0.15 +
    decisions * 0.10 +
    action * 0.10
  );
}

export function calculateScenarioProgress(scenarios, scenarioIndex, stepIndex, phase) {
  const list = scenarios || [];
  const maximum = list.reduce((sum, scenario) => sum + (scenario.steps?.length || 0), 0);
  const completedBefore = list
    .slice(0, scenarioIndex)
    .reduce((sum, scenario) => sum + (scenario.steps?.length || 0), 0);
  const currentLength = list[scenarioIndex]?.steps?.length || 0;
  const current = phase === "lesson" ? currentLength : phase === "playing" ? stepIndex + 1 : 0;
  return { value: Math.min(maximum, completedBefore + current), maximum };
}
