# Desafio Hipertensão — especificação atual

**Versão:** 1.7.0

**Data da revisão:** 19 de agosto de 2026

**Público pretendido:** adolescentes, com mediação educacional ou institucional quando aplicável.

## Classificação correta

Protótipo digital gamificado para educação em saúde cardiovascular de adolescentes, baseado em diretrizes selecionadas.

## Alegações não autorizadas pela evidência atual

O produto não deve ser descrito como instrumento validado, teste psicométrico, calculadora de risco, dispositivo médico, sistema diagnóstico ou intervenção de eficácia comprovada.

## Pontuação

- pontos por módulo: feedback e progressão do jogo;
- índice do jogo: média simples das atividades de quiz, prevenção, sinais de alerta e decisões simuladas;
- radar de hábitos: reflexão autorreferida, apresentada fora do índice;
- mapa familiar: descrição do que foi registrado, sem estimativa genética;
- plano de ação: participação, sem interpretação como domínio de desempenho.

A aleatoriedade amplia variedade e rejogabilidade, mas impede comparação direta entre participantes até que existam formulários fixos ou equivalentes.

## Dados e privacidade

Não há backend, conta, analytics ou armazenamento persistente. As respostas permanecem na memória do navegador durante a partida. O PDF é produzido pelo próprio navegador e pode conter informações pessoais; a guarda fica sob controle do participante.

A Versão Congresso solicita um apelido e oferece os seis módulos do jogo completo com os mesmos componentes e regras, reduzindo somente a quantidade de conteúdo, seguida de um quiz final com duas perguntas. O Módulo 2 permite registrar idade aproximada e antecedentes de um familiar; o Módulo 6 reutiliza o plano de ação original com uma escolha entre três opções. Apelido, respostas e dados familiares existem apenas na memória do navegador e são apagados ao iniciar o próximo visitante ou fechar a página. O relatório educacional pode ser impresso ou salvo em PDF.

O **Módulo Professor**, acessível com `?modo=professor` (e compatível com `?modo=aula`), é um roteiro independente que primeiro introduz a proposta de condução e depois acrescenta uma tela de mediação antes de cada módulo do jogo completo. Ele mantém o roteiro disponível ao professor e abre o jogo integral para a turma em outra aba; não executa a prévia curta nem gera relatório próprio. A mediação orienta sobre objetivo, tempo, dinâmica, pergunta de discussão e cuidado ético. Ela não autoriza a coleta ou a exposição de dados pessoais, e o relatório do jogo não deve ser usado como nota ou avaliação de estudantes.

## Limitações conhecidas

- conteúdo ainda requer validação formal com painel multiprofissional e adolescentes;
- não há estudo pré/pós ou evidência de efetividade;
- não há equivalência demonstrada entre conjuntos aleatórios de questões;
- acessibilidade automatizada não substitui teste manual com pessoas usuárias de tecnologias assistivas;
- disponibilidade de UBS, SAMU e fluxos locais deve ser confirmada no município;
- a licença de distribuição ainda deve ser definida pelo responsável institucional.
