# Revisão de fluxo e lógica — V6

Esta etapa revisou o funcionamento interno do produto oficial, sem adicionar recursos específicos para congresso.

## Correções realizadas

- Corrigida chamada obsoleta `calcInheritedRisk` no Módulo 2. O salvamento de familiares agora usa `calcFamilyAttentionIndex`, evitando quebra do fluxo.
- O Mapa de História Familiar passa a exibir o índice descritivo em `%`, coerente com a explicação apresentada ao estudante.
- Idade não informada deixa de ser preenchida artificialmente como 50 anos. Agora permanece sem registro (`null`).
- Texto do Módulo 2 reforça que o estudante deve registrar apenas informações que realmente conhece.
- Título "Mapa Cardiovascular" alterado para "Mapa de História Familiar", reduzindo interpretação clínica indevida.
- Removido ranking simulado do resultado do Módulo 3. Em seu lugar, o estudante vê apenas o próprio progresso.
- Removido limite artificial de 300 pontos no resultado acumulado do Módulo 3, para manter coerência com a pontuação real exibida no restante do jogo.
- "Conclusão clínica" no Módulo 3 alterada para "O que este módulo treinou".
- Corrigida a expressão visual de opacidade do botão de validação no Módulo 4.
- Ajustada a barra de progresso do Módulo 5 para representar melhor a passagem por caso, decisão e lição.
- Verificação estática dos identificadores `calc*`: nenhuma chamada de função de cálculo ficou sem definição.

## Validação

A lógica modificada foi revisada estaticamente no código-fonte. A instalação das dependências ainda não completa de forma confiável neste ambiente, portanto o build Vite e o teste em navegador permanecem como etapa obrigatória antes da publicação final.
