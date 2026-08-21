# Desafio Hipertensão

Jogo educativo em formato web para apoiar a educação em saúde de adolescentes sobre hipertensão arterial, hábitos de vida, antecedentes familiares, prevenção, sinais de alerta e atitudes seguras diante de situações de emergência.

O produto foi desenvolvido como recurso educacional no contexto do **Mestrado Profissional em Ensino em Ciências da Saúde e do Meio Ambiente (MECSMA / UniFOA)**.

## Objetivo educacional

Ao final da experiência, espera-se que o jogador consiga:

- reconhecer hábitos relacionados à saúde cardiovascular;
- compreender que hipertensão pode ocorrer sem sintomas;
- identificar fatores familiares relevantes sem interpretar o jogo como cálculo de risco clínico;
- relacionar atividade física, alimentação, sono e outras escolhas à prevenção;
- reconhecer sinais que justificam avaliação urgente;
- saber que, diante de uma emergência, a atitude segura é buscar ajuda e acionar o serviço de emergência, sem improvisar medicamentos.

## Como o jogo funciona

O percurso possui seis módulos e um quiz final:

1. **Radar de Hábitos** — escolhas do cotidiano e saúde cardiovascular.
2. **Família** — construção de um mapa educativo de antecedentes familiares.
3. **Prevenção** — desafios sobre alimentação, atividade física, sono e hábitos protetores.
4. **Sinais de Alerta** — diferencia sintomas inespecíficos de situações que exigem avaliação rápida.
5. **Consequências** — apresenta possíveis órgãos-alvo e efeitos da hipertensão persistente.
6. **Como Ajudar** — treina decisões seguras em situações simuladas.
7. **Quiz final** — revisão dos principais conceitos trabalhados.

Para demonstrações públicas, a **Versão Congresso** funciona como um mini jogo completo: reutiliza a jogabilidade real de todos os módulos, reduzindo apenas a quantidade. São duas perguntas do Módulo 1, um familiar no Módulo 2, um caso no Módulo 3, quatro sintomas e uma escolha no Módulo 4, um caso com duas decisões no Módulo 5, uma ação escolhida entre três no Módulo 6 e duas perguntas no quiz final. Ao final, gera um relatório da experiência. Ela pode ser aberta pelo botão da capa ou diretamente com `?modo=congresso` no final da URL; o endereço antigo `?modo=mostra` continua compatível.

O **Módulo Professor** é um roteiro independente para conduzir uma aula enquanto a turma joga a versão completa. Ele introduz a aplicação e apresenta uma orientação antes de cada módulo: objetivo, tempo, dinâmica, pergunta para a turma e cuidado ético. O modo mantém o guia aberto e oferece um botão para abrir o jogo completo em outra aba; não executa a versão reduzida do Congresso nem gera relatório próprio. Ele pode ser aberto pela capa ou com `?modo=professor`; `?modo=aula` continua compatível. O módulo não substitui planejamento pedagógico, não solicita exposição de dados pessoais e não deve ser usado para atribuir nota.

Ao concluir o percurso, o participante pode imprimir ou salvar o relatório de aprendizagem em PDF. A versão de impressão usa formato A4, preto e branco, folha timbrada do Desafio Hipertensão, identificação do participante, data de emissão e quebras de página preparadas para preservar a leitura dos cartões.

## Nota metodológica importante

**Pontos, rankings e índices exibidos no Desafio Hipertensão são elementos experimentais de gamificação.** O índice do jogo é uma média simples das atividades de conhecimento e decisão; hábitos autorreferidos, mapa familiar e compromissos não entram nessa média. Nada disso corresponde a escore clínico ou instrumento educacional validado, calcula probabilidade individual, faz diagnóstico ou orienta tratamento.

O jogo é uma ferramenta educativa e não substitui aferição adequada da pressão arterial, avaliação profissional ou atendimento médico.

## Base científica

A revisão científica do conteúdo utiliza como referências principais:

- Brandão AA, Rodrigues CIS, Bortolotto LA, et al. **Diretriz Brasileira de Hipertensão Arterial – 2025.** *Arquivos Brasileiros de Cardiologia*. 2025;122(9):e20250624. DOI: 10.36660/abc.20250624.
- World Health Organization. **WHO Guidelines on Physical Activity and Sedentary Behaviour.** Geneva: WHO; 2020.
- Paruthi S, Brooks LJ, D'Ambrosio C, et al. **Recommended Amount of Sleep for Pediatric Populations: A Consensus Recommendation of the American Academy of Sleep Medicine.** *J Clin Sleep Med.* 2016;12(6):785-786. DOI: 10.5664/jcsm.5866.
- American Heart Association/American Stroke Association. **Guideline for the Early Management of Patients With Acute Ischemic Stroke.** 2026.

A lista comentada está em [`docs/REFERENCIAS_CIENTIFICAS.md`](docs/REFERENCIAS_CIENTIFICAS.md).

## Tecnologias

- React 18
- Vite 8
- Three.js
- JavaScript / JSX

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

Para executar os testes das regras de pontuação:

```bash
npm test
```

Para executar testes e build local:

```bash
npm run check
npm audit
```

## Estrutura do projeto

```text
src/                         entrada da aplicação
src/scoring.js               regras puras e limites de pontuação
src/scoring.test.js          testes das regras de pontuação
public/modules/              artes dos seis módulos
public/media/                capa e mídia da tela de conclusão
pressao-quest-completo.jsx   componentes, conteúdo e lógica do jogo
docs/                        documentação científica e histórico de revisão
```

O resultado da auditoria de pontuação e build está em [`docs/AUDITORIA_PONTUACAO_E_BUILD.md`](docs/AUDITORIA_PONTUACAO_E_BUILD.md).

As imagens de interface são distribuídas em WebP para reduzir o tamanho de carregamento. O vídeo de conclusão também foi recomprimido para uso na web.

## Uso responsável

O conteúdo foi escrito em linguagem acessível para adolescentes. Situações clínicas são simulações educativas. Em uma emergência real, o jogador é orientado a buscar ajuda e acionar o **SAMU 192** nas áreas cobertas, ou seguir o fluxo de emergência disponível no município.

Nesta versão não há conta, backend, analytics ou persistência: as respostas permanecem somente na memória do navegador e são apagadas ao atualizar ou fechar a página. O PDF pode conter apelido, hábitos e informações familiares e deve ser armazenado e compartilhado com cuidado.

## Estado da revisão

Revisão científica: **agosto de 2026**.

Consulte a [`versão atual`](docs/VERSAO_ATUAL.md), o [`guia da Versão Congresso`](docs/MODO_MOSTRA.md), a [`matriz de evidências`](docs/MATRIZ_EVIDENCIAS.md) e o [`plano de validação`](docs/VALIDACAO_METODOLOGICA.md). Os demais relatórios em `docs/` são registros históricos e podem descrever estados anteriores do código.

## Estado atual da revisão

O conteúdo clínico e educacional passou por revisão de coerência científica e de linguagem. O relatório final é um **relatório de aprendizagem**: seus indicadores representam desempenho e escolhas dentro do jogo e não constituem avaliação clínica, diagnóstico ou estimativa individual de risco cardiovascular.
