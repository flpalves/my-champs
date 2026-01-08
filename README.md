# ⚽ My Champs - Football Manager System

Bem-vindo ao **My Champs**, o sistema de gestão esportiva que aposenta suas planilhas de Excel.

Este projeto é uma **Single Page Application (SPA)** desenvolvida para organizar torneios de futebol (campo, futsal, society), futebol de botão ou campeonatos de e-sports (FIFA, PES) de forma agnóstica, offline e reativa.

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![IndexedDB](https://img.shields.io/badge/IndexedDB-LocalForage-yellow?style=for-the-badge)

---

## 🚀 O que este sistema faz?

Basicamente, ele transforma você no "Cartola" da sua liga. As principais *features* incluem:

* **Gestão de Clubes:** Cadastro de times com elenco flexível (não exige 11 titulares), escudos personalizados e **esquemas de cores (uniformes)**.
* **Motor de Campeonatos:**
    * Pontos Corridos (Turno/Returno).
    * Mata-Mata (Sorteio ou Manual).
    * **Fase de Grupos Híbrida:** Grupos que evoluem automaticamente para Mata-Mata (ex: cruzamento olímpico 1ºA x 2ºB).
* **Súmula em Tempo Real:** Uma interface completa para operar a partida, registrando gols, cartões, **linha do tempo (timeline)**, substituições e escolha de uniformes.
* **Persistência Offline:** Tudo é salvo no `IndexedDB` do navegador. Sem backend, sem delay, sem custos de servidor.
* **Backup & Restore:** Funcionalidade robusta para exportar (`.json`) e importar dados (com opção de mesclagem inteligente).

---

## 🛠️ Stack Tecnológica

O motor debaixo do capô é moderno e leve:

* **Core:** [Vue.js 3](https://vuejs.org/) (Options API para legibilidade clássica).
* **UI Framework:** [Bootstrap 5](https://getbootstrap.com/) + `bootstrap-vue-next` (porque ninguém merece escrever CSS de grid do zero).
* **Banco de Dados:** [LocalForage](https://localforage.github.io/localForage/) (Wrapper elegante para IndexedDB).
* **Roteamento:** Vue Router 4.
* **Build Tool:** Vue CLI / Webpack.

---

## 💻 Como rodar localmente

Se você quer codar, testar ou apenas brincar de técnico, siga os passos:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/flpalves/my-champs.git](https://github.com/flpalves/my-champs.git)
    cd my-champs
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run serve
    ```

4.  Acesse `http://localhost:8080` e escale seu time.

---

## 📂 Estrutura do Projeto (Onde mexer?)

Para você não se perder no código, aqui vai o mapa da mina:

* `src/services/DbService.js`: **O Cérebro do Banco.** Toda leitura, escrita, backup e lógica de persistência (IndexedDB) está aqui. Se quiser mudar como os dados são salvos, é aqui que você mexe.
* `src/utils/GeradorTabela.js`: **O Matemático.** Contém os algoritmos de *Round Robin* (todos contra todos) e geração de chaves de mata-mata.
* `src/components/`: Onde a mágica visual acontece.
    * `SumulaJogo.vue`: O componente "monstro" que gerencia a partida. **Dica:** Ele foi refatorado em sub-componentes na pasta `src/components/sumula/` (Header, Eventos, Timeline, etc.).
    * `DetalhesCampeonato.vue`: Gerencia a classificação e a transição de fases.
    * `TabelaClassificacao.vue`: A lógica de cálculo de pontos, saldo de gols e ordenação.

---

## 🔧 Guia de Customização

Quer alterar uma feature? Aqui estão alguns cenários comuns:

### "Quero mudar a regra de pontuação (ex: vitória valendo 2 pontos)"
Vá em `src/components/DetalhesCampeonato.vue` (ou `TabelaClassificacao.vue`), procure o método `calcularClassificacaoGrupos` ou `calcularStatsBase` e altere a lógica de soma:
```javascript
// Exemplo:
if (jogo.golsA > jogo.golsB) {
    tA.pontos += 3; // Mude para 2 aqui se quiser ser "old school"
}