# Auditoria pré-congresso — Desafio Hipertensão

**Data:** 20 de agosto de 2026  
**Versão auditada:** 1.7.0

## 1. Resumo executivo

**Avaliação geral: 8,7/10.** O projeto é uma SPA React estática, sem backend, autenticação, API, banco de dados, analytics ou dependências remotas de conteúdo. Isso reduz substancialmente o risco de falha em demonstração. O fluxo principal, a prévia do Congresso e o Módulo Professor possuem entradas diretas e foram verificados em build de produção.

## 2. Situação para apresentação amanhã

**PRONTO COM RESSALVAS.**

Não há problema P0 conhecido. A ressalva operacional é preparar uma cópia local do build e validar o navegador da máquina que será usada, pois a aplicação não possui service worker/PWA e o progresso é mantido apenas em memória.

## 3. Mapa técnico

| Área | Estado |
|---|---|
| Stack | React 18, Vite 8, JavaScript/JSX, Three.js e qrcode.react |
| Arquitetura | SPA de cliente único; principal componente em `pressao-quest-completo.jsx` |
| Entrada | `src/main.jsx` monta `PressaoQuest` com `AppErrorBoundary` |
| Rotas | Query string: jogo completo `/`, Congresso `?modo=congresso` (alias `mostra`) e Módulo Professor `?modo=professor` (alias `aula`) |
| Serviços e APIs | Não existem |
| Banco, autenticação e armazenamento | Não existem; respostas vivem apenas na memória da página |
| Assets | Todos locais em `public/media` e `public/modules` |
| Configuração | `package.json`, `vite.config.js`, `index.html`, workflow GitHub Actions |
| Variáveis de ambiente | Nenhuma necessária |
| Deploy | Build estático Vite; o repositório não contém configuração de provedor obrigatória |

## 4. Fluxo funcional

**Jogo completo:** entrada → apelido → 10 perguntas de hábitos → mapa familiar → desafios de prevenção → alertas → casos de consequência → plano de ação → quiz final → vitória → relatório/reinício.

**Congresso:** apelido → mesma mecânica dos seis módulos com quantidade reduzida → quiz final de duas perguntas → relatório, impressão/reinício, QR Code para o jogo completo.

**Módulo Professor:** introdução da aula → orientação antes de cada módulo → turma no jogo completo iniciado pelo QR Code do menu principal → fechamento com quiz e conversa final. Não executa a prévia do Congresso nem gera relatório próprio.

## 5. Problemas críticos encontrados

Nenhum problema crítico encontrado.

## 6. Problemas importantes e alterações realizadas

| Prioridade | Arquivo | Problema | Alteração segura realizada |
|---|---|---|---|
| P1 | `pressao-quest-completo.jsx` | O Módulo Professor oferecia abertura direta do jogo completo, criando uma etapa duplicada no roteiro. | Removida a abertura direta; a turma inicia o jogo completo exclusivamente pelo QR Code do menu principal. |
| P2 | `pressao-quest-completo.jsx` | A tela inicial emitia aviso React para `fetchPriority`. | O atributo foi escrito na forma reconhecida pelo DOM (`fetchpriority`); console limpo no build de produção. |
| P2 | `docs/VERSAO_CONGRESSO.md` | O documento corrente ainda identificava a versão anterior. | Atualizado para 1.7.0 e registrado o QR Code final para o jogo completo. |

## 7. Resultados dos testes

| Verificação | Resultado |
|---|---|
| `npm ci` | Concluído com sucesso |
| `npm test` | 12 testes aprovados em 2 arquivos |
| `npm run build` | Concluído com Vite 8 |
| `npm audit --audit-level=high` | 0 vulnerabilidades |
| Assets locais referenciados | Nenhum arquivo ausente |
| Console de produção | Sem erros nas entradas completa, Congresso e Professor |
| Responsividade de entrada | Sem overflow horizontal observado em 320×568, 390×844, 768×1024, 1366×768 e 1920×1080 |
| Fluxo completo exercitado | Entrada, apelido, 10 perguntas do M1, resultado e chegada ao M2 |
| Fluxo Congresso exercitado | Entrada, apelido, 2 perguntas do M1 e chegada ao M2 |
| Módulo Professor exercitado | Introdução, seis orientações em sequência e fechamento |

Não há script de lint configurado no `package.json`; por isso não há resultado de lint a executar. O build emite apenas o aviso conhecido de chunk acima de 500 kB; o pacote inicial principal tem aproximadamente 136 kB gzip e não indicou travamento nos testes.

## 8. Riscos restantes

| Nível | Risco | Mitigação amanhã |
|---|---|---|
| 🟡 Médio | Sem PWA/service worker, uma primeira abertura depende de arquivo servido por internet ou servidor local. | Levar `dist/`, `node_modules/` e uma aba local já testada. |
| 🟡 Médio | Atualizar/fechar a página apaga a partida em andamento por desenho. | Evitar refresh durante a demonstração; deixar uma partida de reserva aberta. |
| 🟡 Médio | O relatório pode conter apelido e dados familiares inseridos pelo visitante. | Usar apelido; não demonstrar dados reais; usar `Próximo visitante` após cada pessoa. |
| 🟢 Baixo | Abertura do jogo pelo Módulo Professor cria nova aba. | Testar o botão no navegador do evento e permitir pop-ups para o domínio, se a política institucional bloquear abas. |
| 🟢 Baixo | Aviso de bundle acima de 500 kB minificado. | Não otimizar na véspera; a carga inicial observada é pequena e Three.js não é carregado no Congresso. |

## 9. Checklist para amanhã

1. Conectar notebook e carregador; desativar notificações e modo de economia agressiva.
2. Abrir a URL publicada e atualizar uma vez.
3. Testar botão `VERSÃO CONGRESSO`, inserir um apelido e concluir a primeira etapa.
4. Testar `MÓDULO PROFESSOR`, o botão de abrir jogo completo e a nova aba.
5. Deixar duas abas prontas: Congresso e Módulo Professor; manter uma terceira com o jogo completo.
6. Abrir em tela cheia e ajustar zoom para 100%.
7. Testar áudio; se o ambiente for ruidoso, deixá-lo desligado.
8. Confirmar Wi-Fi/hotspot; levar cabo/extensão e carregador.
9. Levar cópia local do repositório com dependências instaladas e build gerado; para plano B usar `npm run preview -- --host 127.0.0.1 --port 4173` e abrir `http://127.0.0.1:4173`.
10. Levar um PDF de exemplo do relatório e informar: “protótipo educacional, não diagnóstico”.

## 10. Perguntas que a banca pode fazer

1. **O produto diagnostica hipertensão?** Não. É um protótipo educacional e explicita que não realiza diagnóstico nem calcula risco clínico.
2. **Como os dados são armazenados?** Não há backend nem persistência: permanecem em memória até reiniciar ou fechar a página.
3. **Há evidência de eficácia?** Ainda não. A documentação descreve a validação futura necessária com painel multiprofissional e adolescentes.
4. **Por que há pontuação?** Para gamificação e feedback; os indicadores não são instrumentos clínicos ou psicométricos validados.
5. **Por que o mapa familiar não gera risco genético?** Para evitar inferências clínicas indevidas; ele registra participação e antecedentes conhecidos.
6. **Como o conteúdo foi rastreado?** Há matriz de evidências e referências por domínio em `docs/MATRIZ_EVIDENCIAS.md` e `docs/REFERENCIAS_CIENTIFICAS.md`.
7. **O jogo funciona sem internet?** O conteúdo não faz chamadas externas; porém é necessário servir os arquivos localmente ou já tê-los carregado, pois não há PWA.
8. **Como o professor usa a ferramenta?** Pelo Módulo Professor, que orienta a mediação antes de cada etapa; a turma inicia o jogo completo pelo QR Code do menu principal.
9. **O aluno é avaliado por nota?** Não. O relatório é educativo e não deve ser usado para comparação ou nota.
10. **Como o produto lida com urgências?** Orienta buscar ajuda adulta e atendimento, sem prescrever ou alterar medicamentos.
11. **Por que usar casos simulados?** Para praticar decisão e discussão sem transformar situações pessoais em exposição pública.
12. **Como a privacidade de adolescentes é protegida?** Com minimização de dados, apelido, ausência de envio a servidor e orientação para não expor informações familiares.
13. **O conteúdo é adaptável?** A aleatoriedade e os bancos de questões favorecem variedade, mas equivalência formal entre formas ainda precisa ser demonstrada.
14. **Há acessibilidade?** Há foco visível, skip link, rótulos, semântica de progresso e respeito a redução de movimento; ainda são necessários testes com tecnologias assistivas e usuários reais.
15. **Como o projeto pode crescer?** A arquitetura atual pode receber banco de itens, avaliação metodológica, PWA e recursos de turma sem reescrever o jogo inteiro.

## 11. Melhorias após o congresso

### Curto prazo

- Testes automatizados de fluxos completos no navegador; lint/formatter; atualização dos registros históricos; teste manual com teclado e leitor de tela.
- Guia operacional de produção e cópia formal do modo offline.

### Médio prazo

- PWA com cache offline; painel docente sem identificação pessoal; sessão por turma; banco de itens versionado; formulário fixo para pesquisa.

### Longo prazo

- Estudo de validação de conteúdo e piloto pré/pós; análise de usabilidade com adolescentes; integração institucional somente após definição de LGPD/CEP; feedback adaptativo após evidência e governança adequadas.

## 12. Roadmap de 30 dias

**Dias 1–7:** consolidar feedback do congresso, corrigir achados reproduzíveis, adicionar Playwright aos fluxos crítico e configurar lint/format.

**Dias 8–15:** realizar revisão de conteúdo com painel multiprofissional, entrevistas cognitivas e ajustes de linguagem/acessibilidade.

**Dias 16–23:** criar PWA/offline e modo professor com materiais imprimíveis, sem coleta de dados pessoais.

**Dias 24–30:** definir protocolo de piloto, desfecho educacional, formulário fixo, critérios éticos e estratégia de avaliação antes de alegar efetividade.
