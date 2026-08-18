# Auditoria de pontuação, coerência e build

> **Registro histórico.** Os números de build e dependências abaixo descrevem uma versão anterior. Para o estado 1.1.0 verificado, consulte `VERSAO_CONGRESSO.md` e `VERSAO_ATUAL.md`.

Data: 17/08/2026

## Escopo

Auditoria do fluxo completo da SPA, das fórmulas dos seis módulos, do quiz final, do Relatório de Aprendizagem, das barras de progresso, dos estados React e do build Vite.

Os valores abaixo são pontos educativos de gamificação. Não representam risco, diagnóstico, prognóstico ou probabilidade clínica.

## Pontuação por etapa

| Etapa | Mínimo ao concluir | Máximo | Cálculo |
|---|---:|---:|---|
| M1 — Radar de Hábitos | 0 | 100 | `100 - percentual dos pontos educativos marcados em relação ao máximo das 10 perguntas sorteadas` |
| M2 — História Familiar | 10 | 60 | `10 × familiares mapeados`, limitado a 6. A presença de antecedentes não aumenta a pontuação. |
| M3 — Prevenção | 115 (menor partida concluível) | 371 (máximo teórico) | 7 desafios sorteados. Pontos-base proporcionais a 2 ou 3 cartas corretas; bônus apenas com as 3 cartas especiais; multiplicador de `1,25` ou `1,5` somente após sequência de planos perfeitos. |
| M4 — Caçador de Alertas | 0 | 60 | `10 × alertas corretos - 5 × distratores`, limitado a `0–60`. |
| M5 — Decisões | 0 | 60 | `60 - pontos de consequência`, limitado ao intervalo `0–60`. |
| M6 — Plano de Ação | 60 | 60 | Qualquer plano válido com 1, 2 ou 3 ações recebe 60 pontos. Quantidade maior não gera vantagem. |
| Quiz final | 0 | 240 | 12 perguntas, 20 pontos por acerto. |

O total bruto teórico do percurso varia de 185 a 951 pontos entre partidas concluídas. O M3 e o quiz geram mais pontos brutos; por isso, esse total permanece apenas como elemento de gamificação e não define o perfil de aprendizagem.

## Relatório de Aprendizagem

O indicador agregado é normalizado em `0–100%` e usa:

- hábitos e escolhas: 25%;
- quiz final: 20%;
- prevenção prática: 20%;
- sinais de alerta: 15%;
- decisões simuladas: 10%;
- plano de ação: 10%.

O M2 não entra no agregado. Não conhecer ou não ter acesso a toda a história familiar não deve reduzir o desempenho do adolescente. O tema continua representado no percurso, no resumo do que foi treinado e nas perguntas do quiz final.

O M3 agora usa a soma dos máximos reais das cartas e multiplicadores que apareceram naquela partida. Assim, desempenho perfeito resulta exatamente em 100%, independentemente do sorteio.

M4, M5 e M6 usam máximo de 60 pontos. Um resultado perfeito de M4 e M5 aparece como 100%. Qualquer plano válido de 1 a 3 ações completa o domínio do M6 em 100%.

## Problemas encontrados e correções

1. **Resultado do M5 perdia os pontos de consequência.** O callback enviava dois valores, mas o orquestrador armazenava apenas o primeiro. O resultado recebia `undefined`. Foi criado estado específico e os dois valores agora chegam à tela correta.
2. **M3 era normalizado por uma média global.** O denominador não correspondia aos sete desafios sorteados nem aos multiplicadores. Cada resposta agora registra seu máximo real e o relatório calcula `obtido / possível` da partida.
3. **Combo do M3 era automático.** Como planos fracos não podem avançar, qualquer conclusão mantinha o combo. Agora o combo cresce somente quando as três cartas do plano são corretas e reinicia em um plano apenas aceitável.
4. **Resultado do M3 classificava todos como nota alta.** A tela contava planos concluídos, embora todos precisem ser aceitáveis para avançar. A nota e a barra agora usam o percentual real dos pontos.
5. **M2 premiava a marcação de doenças.** Isso poderia estimular o preenchimento indevido. A pontuação passou a recompensar somente familiares efetivamente mapeados.
6. **M6 ainda premiava quantidade.** Uma ação valia 20 e três valiam 60. Agora qualquer plano válido com 1–3 ações vale 60, preservando autonomia e compromisso realista.
7. **O plano pessoal não chegava ao relatório.** O código guardava apenas a pontuação. Os identificadores escolhidos agora são mantidos e o relatório lista os compromissos.
8. **Constante antiga de M4 no painel interno.** O atalho de desenvolvimento ainda simulava 80 pontos. Foi corrigido para 60.
9. **Conquista por 160 pontos era inevitável ao concluir.** O menor total concluível já ultrapassava o limite. A conquista artificial foi removida.
10. **Ranking fictício residual e funções/estados mortos.** Foram removidos `LB_SEED`, extras familiares sem interface e handlers sem uso.
11. **Contagens antigas em comentários.** Os bancos atuais têm 60 perguntas no M1 e 72 no quiz final; os comentários foram atualizados.
12. **Barra do M5 dependia de duas etapas fixas.** Embora todos os casos atuais tenham duas etapas, o progresso agora deriva da quantidade real de etapas de cada caso.
13. **Feedbacks clínicos simulavam desfechos específicos.** Frases sobre pressão que "ficou instável", crise "evitada" e tratamento ajustado "em segundos" foram substituídas por feedback sobre a qualidade da decisão.
14. **Lockfile divergente.** O nome raiz do `package-lock.json` era diferente do `package.json`. A instalação regenerou a raiz de forma coerente.

## Fluxo e barras de progresso

- M1 e quiz final usam `pergunta atual / total`, incluindo a pergunta visível.
- M3 usa `desafio atual / 7` e, no resultado, desempenho sobre o máximo real da partida.
- M4 limita a seleção exatamente aos 6 alertas solicitados.
- M5 soma as etapas reais dos quatro casos sorteados e chega a 100% na última lição.
- M6 limita o conjunto a 3, permite desmarcar e só libera a conclusão com pelo menos 1 escolha.
- Os handlers finais substituem estado; não incrementam novamente pontuações já concluídas.
- O painel técnico só pode ser exposto no servidor de desenvolvimento com `?dev=1`; ele não aparece no build de produção.

## Testes e build

- `npm install`: concluído.
- `npm test`: 5 testes aprovados em `src/scoring.test.js`.
- `npm run build`: concluído com Vite 5.4.21; 33 módulos transformados.
- `npm audit --omit=dev`: 0 vulnerabilidades nas dependências de produção.
- Navegador: home verificada em 375×812 e 1440×900; M5 e relatório verificados por rotas internas de desenvolvimento; console sem erros ou avisos.
- Relatório verificado com M4 `100%`, M5 `60/60`, M6 `100%` e compromisso pessoal visível.

## Fontes verificadas nesta rodada

- [Diretriz Brasileira de Hipertensão Arterial – 2025](https://abccardiol.org/article/diretriz-brasileira-de-hipertensao-arterial-2025/)
- [WHO Guidelines on Physical Activity and Sedentary Behaviour](https://www.who.int/publications/i/item/9789240015128)
- [AASM — Teen Sleep Duration Health Advisory](https://aasm.org/advocacy/position-statements/teen-sleep-duration-health-advisory/)
- [AHA/ASA — 2026 Guideline for Acute Ischemic Stroke](https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know)

## Limitações remanescentes

- O bundle principal tem aproximadamente 875 kB minificado (240 kB gzip) e gera aviso de chunk acima de 500 kB. Não impede build ou execução; separação do monólito e lazy loading permanecem como evolução futura.
- O Vite 5 usa a API Node CJS descontinuada e a árvore de desenvolvimento ainda reporta vulnerabilidades transitivas ligadas ao Vite/esbuild. As dependências de produção têm 0 vulnerabilidades. Não foi aplicado `npm audit fix --force`, pois ele migraria para Vite 8 e ampliaria o risco desta etapa de estabilização.
- Recarregar a página ainda perde o progresso; persistência local continua prevista no roadmap.
- Esta rodada não transforma o jogo em instrumento clínico e não substitui uma revisão humana final de conteúdo em saúde antes da publicação acadêmica.
