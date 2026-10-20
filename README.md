# Foco
Agenda de estudo por tags, com cronômetro, calendário e insights. Funciona no navegador e como aplicativo de desktop, sem conta, sem internet e sem enviar nenhum dado para servidor.

# Foco

Agenda de estudo por tags, com cronômetro, calendário e insights. Funciona no navegador e como aplicativo de desktop, sem conta, sem internet e sem enviar nenhum dado para servidor.

<!-- Adicione aqui um print da tela "Hoje" e outro da aba "Insights":
![Tela Hoje](docs/hoje.png)
![Tela Insights](docs/insights.png)
-->

## Funcionalidades

**Registro do estudo**
- Cronômetro e temporizador com meta em minutos (no temporizador, só o tempo feito é salvo).
- Relógio em estilo flip, que muda de cor conforme a tag escolhida.
- Tags coloridas: crie com nome, cor e tom, e apague quando quiser. Com o cronômetro ativo, as tags ficam travadas.
- Aviso quando a meta do temporizador termina.

**Calendário e anotações**
- Calendário mensal em que cada dia mostra as cores das tags estudadas.
- Lista de registros de cada dia, com opção de apagar.
- Nota diária para escrever o que você fez.

**Insights**
- Resumo por dia, semana ou mês, sempre comparado ao período anterior.
- Tempo por tag (rosca), comparação atual × anterior, tempo por dia e mapa de dias estudados no mês.
- Download dos insights do mês como imagem PNG, nos formatos 1:1, 4:5 (Instagram) e 9:16, escolhendo o que incluir.

## Como usar

### No navegador

Não precisa instalar nada. Baixe o projeto e abra o `index.html` no navegador.

```bash
git clone https://github.com/SEU-USUARIO/foco.git
cd foco
# abra o index.html no navegador
```

### Como aplicativo de desktop (Linux)

Requer [Node.js](https://nodejs.org/) e npm.

```bash
npm install
npm start        # abre o app em modo de desenvolvimento
npm run dist     # gera o AppImage e o .deb na pasta dist/
```

Para abrir o AppImage depois de gerado:

```bash
chmod +x dist/Foco-*.AppImage
./dist/Foco-*.AppImage
```

## Seus dados

Tudo fica salvo localmente, no `localStorage` (chave `foco.v1`). Nada é enviado para a internet.

- O navegador e o app de desktop guardam dados separados, então um não enxerga os registros do outro.
- Na primeira abertura o app vem com dados de exemplo. Use o botão **Limpar dados de exemplo** no topo para começar do zero.
- Limpar os dados do navegador apaga os registros.

## Estrutura

```
foco/
├── index.html    # estrutura das telas
├── style.css     # visual (tema escuro)
├── script.js     # toda a lógica do app
├── main.js       # janela do Electron (desktop)
└── package.json  # scripts e configuração de empacotamento
```

## Tecnologias

- HTML, CSS e JavaScript puros, sem frameworks e sem dependências no navegador.
- [Electron](https://www.electronjs.org/) e [electron-builder](https://www.electron.build/) para o app de desktop.

## Licença

Escolha uma licença para o projeto (por exemplo, [MIT](https://choosealicense.com/licenses/mit/)) e adicione o arquivo `LICENSE`.
