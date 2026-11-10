# Códice do Treino 360X

Aplicativo web de Aldenir Rocha de Oliveira Filho para montar treinos, marcar séries, usar o cronômetro e acompanhar medidas, evolução e XP. A base veio do artefato original do Claude e roda como um site estático.

- [Abrir o app](https://aldenirfilho.github.io/codice-de-treino/)
- [Repositório GitHub](https://github.com/aldenirfilho/codice-de-treino)

## 📱 Instalar no iPhone

1. Abra o app pelo link acima no Safari, com internet.
2. No menu do Safari, toque em **Compartilhar → Adicionar à Tela de Início**.
3. Ative **Abrir como App da Web**, quando a opção estiver disponível, e toque em **Adicionar**.
4. Abra pelo novo ícone ainda com internet para preparar os arquivos usados no modo offline.

[Guia da Apple](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios)

## 💾 Salvar e transferir seus registros

Os treinos, medidas, metas e XP do app ficam no armazenamento local do navegador. Projetos publicados no mesmo domínio `aldenirfilho.github.io` compartilham a origem de armazenamento. Para levar dados do Claude, do Safari ou de outro aparelho para a versão instalada, transfira o arquivo de backup.

1. Na versão que contém seus registros, abra **Dados** e exporte o backup JSON para **Arquivos**. No Claude, se o download estiver indisponível, use **Copiar backup** e salve o conteúdo completo em um arquivo `.json`.
2. Abra a versão de destino pelo local onde pretende usá-la, inclusive pelo ícone da Tela de Início se já instalou.
3. Em **Dados → Importar backup**, selecione o arquivo, confira a contagem de registros e confirme em **Restaurar e substituir meus dados**. Exporte os dados do destino antes de restaurar se precisar mantê-los.

Backups e registros pessoais devem ficar fora do repositório. O selo da **Sala de Honra** serve para uma transferência separada do resumo de XP para o Códice do Estudo.

## Desenvolvimento e publicação

Para executar localmente, na raiz do repositório, rode `python3 -m http.server 8000 --bind 127.0.0.1` e abra `http://127.0.0.1:8000/`. O `index.html` contém a interface, o `app.js` contém a lógica, o `manifest.json` define a instalação e o `sw.js` prepara os recursos offline. Rode `node --test tests/*.test.cjs` para verificar as regressões.

No GitHub, configure **Settings → Pages → Deploy from a branch → main → /(root)**. O arquivo `.nojekyll` indica a publicação estática. Com o primeiro commit em `main`, a configuração equivalente pelo GitHub CLI é:

```sh
gh api --method POST repos/aldenirfilho/codice-de-treino/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

Quando a publicação termina, a URL fica em **Settings → Pages**. Alterações em `main` são publicadas pelo GitHub Pages. Ao alterar arquivos que o service worker guarda, atualize a versão do cache e teste a reabertura online e offline. [Guia do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Trabalhar com o Claude

Use `main` como fonte de verdade do código publicado.

- **Claude Projects**. No projeto, abra **Project knowledge → + → GitHub**, selecione este repositório, a branch `main` e os arquivos do app. Use **Sync now** após alterações em `main`. Esse fluxo traz os arquivos do GitHub para o contexto do Claude. [Integração do Claude com GitHub](https://support.claude.com/en/articles/10167454-use-the-github-integration)
- **Claude Code**. Abra uma sessão neste repositório para editar o código. Revise as mudanças em uma branch e integre pelo pull request. O Pages publica após a mudança chegar a `main`. [Claude Code na nuvem](https://support.claude.com/en/articles/12618689-use-claude-code-in-the-cloud)

Alterações no artefato original do Claude exigem exportação e revisão para entrar no GitHub. O botão **Sync now** atualiza o contexto do projeto Claude.
