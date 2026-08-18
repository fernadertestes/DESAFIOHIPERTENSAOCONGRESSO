# Versão Congresso — agosto de 2026

Esta versão reúne a revisão científica e a limpeza técnica realizada antes da apresentação.

## Alterações técnicas

- README refeito com objetivo, módulos, nota metodológica, referências e instruções de execução.
- Nome e metadados da página padronizados para **Desafio Hipertensão**.
- Referências científicas e nota metodológica acessíveis na tela inicial do jogo.
- Imagens PNG convertidas para WebP.
- Vídeo de vitória recomprimido para web.
- Documentação científica organizada em `docs/`.
- `.gitignore` ampliado para evitar arquivos locais e artefatos de build no repositório.

## Otimização de mídia

As oito imagens principais ocupavam aproximadamente 9,9 MB em PNG. Em WebP, passaram a ocupar cerca de 0,33 MB.
O vídeo de vitória passou de aproximadamente 4,7 MB para 0,69 MB.
A pasta `public/` desta versão ocupa aproximadamente 1,0 MB.

## Validação

As referências internas de mídia foram atualizadas para os novos arquivos. O build não pôde ser executado neste ambiente porque a instalação local das dependências Node não foi concluída. Antes da publicação final, execute `npm install` e `npm run build` em uma máquina com Node.js 18+.
