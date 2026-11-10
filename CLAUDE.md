# Códice do Treino 360X

Trabalhe em uma branch a partir de `main` e abra um pull request para revisão. Execute `node --test tests/*.test.cjs` e informe o que verificou. O GitHub Pages publica após o merge em `main`.

- Preserve o endereço público `https://aldenirfilho.github.io/codice-de-treino/`, o ID do manifesto e a chave de histórico `codice-treino-360x-v1`.
- Preserve treinos, séries concluídas, cargas, medidas, metas, preferências e a leitura de backups anteriores. Se precisar mudar a estrutura, faça uma migração compatível e teste com dados de exemplo de uma versão anterior.
- Mantenha registros pessoais e backups fora do Git e do deploy. Use dados fictícios em testes.
- Preserve o funcionamento offline. Ao adicionar um arquivo necessário ao app, inclua-o no pacote de publicação e no service worker. O deploy define a versão do cache a partir do commit.
