# Desafio Hipertensão

[![Qualidade](https://github.com/fernadertestes/DESAFIOHIPERTENSAOCONGRESSO/actions/workflows/ci.yml/badge.svg)](https://github.com/fernadertestes/DESAFIOHIPERTENSAOCONGRESSO/actions/workflows/ci.yml)

Protótipo web gamificado para educação em saúde cardiovascular de adolescentes. O projeto aborda hábitos, história familiar, prevenção, sinais de alerta, consequências e atitudes seguras — sem diagnosticar, calcular risco clínico ou substituir avaliação profissional.

Desenvolvido no contexto do **Mestrado Profissional em Ensino em Ciências da Saúde e do Meio Ambiente (MECSMA / UniFOA)**.

## Acesso rápido

| Experiência | Link direto | Uso |
|---|---|---|
| Jogo completo | [Abrir aplicação](https://desafiohipertensaocongresso.vercel.app/) | Percurso com seis módulos e quiz final |
| Versão Congresso | [Abrir prévia](https://desafiohipertensaocongresso.vercel.app/?modo=congresso) | Demonstração curta, com relatório e QR Code para o jogo completo |
| Módulo Professor | [Abrir roteiro](https://desafiohipertensaocongresso.vercel.app/?modo=professor) | Guia de mediação enquanto a turma usa o jogo completo |

> A rota histórica `?modo=mostra` abre a Versão Congresso; `?modo=aula` abre o Módulo Professor.

## Modos de uso

### Jogo completo

O estudante escolhe um apelido e percorre seis módulos, seguido de quiz final, tela de conclusão e relatório de aprendizagem.

1. **Radar de Hábitos** — escolhas cotidianas e saúde cardiovascular.
2. **Família** — mapa educativo de antecedentes familiares.
3. **Prevenção** — planos sobre alimentação, atividade física, sono e hábitos protetores.
4. **Sinais de Alerta** — reconhecimento de situações que justificam avaliação rápida.
5. **Consequências** — decisões simuladas e órgãos-alvo da hipertensão persistente.
6. **Como Ajudar** — atitudes seguras e apoio familiar.
7. **Quiz final** — revisão dos conceitos trabalhados.

### Versão Congresso

Mini jogo completo para demonstração pública: 2 perguntas no M1, 1 familiar no M2, 1 caso no M3, 4 sintomas/1 escolha no M4, 1 caso com 2 decisões no M5, 3 ações/1 compromisso no M6 e 2 perguntas finais. Ao terminar, gera relatório A4 em preto e branco e oferece QR Code para abrir o jogo completo.

### Módulo Professor

Roteiro independente para uma aula de aproximadamente 25–35 minutos. Antes de cada módulo, o professor recebe objetivo, tempo, dinâmica, pergunta de discussão e cuidado ético. O roteiro abre o jogo completo em outra aba para a turma, mas não coleta dados nem gera relatório próprio.

## Objetivo educacional

Ao final da experiência, espera-se que o participante consiga:

- reconhecer hábitos relacionados à saúde cardiovascular;
- compreender que hipertensão pode ocorrer sem sintomas;
- interpretar história familiar como informação para prevenção, sem transformá-la em cálculo de risco;
- relacionar hábitos protetores a escolhas viáveis;
- reconhecer sinais que justificam busca de ajuda;
- evitar automedicação ou improviso diante de situações de urgência.

## Estado para apresentação

A versão 1.7.0 passou por instalação limpa, build, testes automatizados, auditoria de dependências e verificações dos fluxos principais. Consulte o [relatório pré-congresso](docs/AUDITORIA_PRE_CONGRESSO.md) e o [checklist operacional](docs/MODO_MOSTRA.md).

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

| Comando | Finalidade |
|---|---|
| `npm run dev` | Desenvolvimento local |
| `npm run build` | Gera `dist/` para produção |
| `npm run preview` | Serve o build localmente |
| `npm test` | Executa testes unitários |
| `npm run check` | Executa testes e build |
| `npm audit --audit-level=high` | Verifica dependências de alto risco |

Para plano B sem internet, gere o build antes do evento e execute `npm run preview -- --host 127.0.0.1 --port 4173` na máquina da apresentação.

## Arquitetura

```text
src/                         entrada React e regras puras de pontuação
public/media/                capa e mídia de conclusão
public/modules/              artes dos seis módulos
docs/                        documentação metodológica, operacional e histórica
pressao-quest-completo.jsx   componentes, conteúdo e orquestração dos modos
```

Stack: React 18, Vite 8, Three.js, qrcode.react e JavaScript/JSX. Não há backend, autenticação, banco de dados, analytics ou variáveis de ambiente obrigatórias. As respostas existem apenas na memória da página atual.

## Documentação

Comece pelo [índice de documentação](docs/README.md).

- [Especificação e limites atuais](docs/VERSAO_ATUAL.md)
- [Guia da Versão Congresso](docs/VERSAO_CONGRESSO.md)
- [Guia do Módulo Professor](docs/COMO_APLICAR_EM_AULA.md)
- [Auditoria pré-congresso](docs/AUDITORIA_PRE_CONGRESSO.md)
- [Matriz de evidências](docs/MATRIZ_EVIDENCIAS.md)
- [Referências científicas](docs/REFERENCIAS_CIENTIFICAS.md)
- [Privacidade e ética](docs/PRIVACIDADE_ETICA.md)
- [Plano de validação metodológica](docs/VALIDACAO_METODOLOGICA.md)

## Uso responsável

Pontuação, rankings e indicadores são elementos de gamificação educacional. O produto não é instrumento clínico validado, não diagnostica, não estima risco individual, não orienta tratamento e não substitui aferição ou avaliação profissional. O PDF pode conter apelido, hábitos ou informações familiares e deve ser armazenado e compartilhado com cuidado.

## Créditos

**Fernando Nader** · Médico + Programador<br>
[drnandonader@gmail.com](mailto:drnandonader@gmail.com)
