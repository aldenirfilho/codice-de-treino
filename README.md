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

O GitHub Pages usa **Settings → Pages → Source → GitHub Actions**. O fluxo **Publicar Códice do Treino** executa os testes e publica os arquivos do app após um merge em `main`. Cada publicação recebe uma versão de cache derivada do commit. Para reverter uma mudança, faça um novo commit com a reversão.

O mesmo link serve todas as versões. Se o iPhone ainda exibir a versão anterior, abra o app com internet, encerre as janelas do Códice e reabra pelo ícone. O navegador aplica a versão nova quando termina de baixá-la e encerra as janelas que usam a anterior. O histórico usa o armazenamento local, separado do cache de instalação.

## Trabalhar com o Claude

Abra o [Códice no Claude Code](https://claude.ai/code?repositories=aldenirfilho%2Fcodice-de-treino). Peça a alteração em uma branch de trabalho, rode os testes e abra um pull request para `main`. Confira a mudança e faça o merge no GitHub. O app é atualizado no endereço de sempre quando o deploy termina. As regras de compatibilidade que o Claude Code recebe ficam em [CLAUDE.md](CLAUDE.md).

No projeto de chat do Claude, **Sincronizar agora** atualiza o contexto a partir do GitHub. Se editar no artefato original, exporte a mudança e peça ao Claude Code para incorporá-la ao repositório em um pull request. [Integração do Claude com GitHub](https://support.claude.com/en/articles/10167454-use-the-github-integration) · [Claude Code na nuvem](https://code.claude.com/docs/en/web-quickstart)
