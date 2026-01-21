# ⚽ My Champs - Football Manager System

Bem-vindo ao **My Champs**, o sistema de gestão esportiva que aposenta suas planilhas de Excel e transforma seu navegador em um console de administração de ligas.

Este projeto é uma **Single Page Application (SPA)** desenvolvida para organizar torneios de futebol (campo, futsal, society), futebol de botão ou campeonatos de e-sports (FIFA, PES) de forma agnóstica, offline e reativa.

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![IndexedDB](https://img.shields.io/badge/IndexedDB-LocalForage-yellow?style=for-the-badge)

---

## 🚀 O que há de novo? (Versão 2.0)

O sistema evoluiu drasticamente! Confira as novas funcionalidades implementadas:

### 👑 Hall da Fama & Ranking Histórico
Agora seus campeonatos valem mais do que apenas a taça momentânea.
* **Pontuação Dinâmica:** Configure regras de pontuação personalizadas ao criar o torneio (ex: Campeão ganha 100pts, Vice 70pts).
* **Ranking Global:** Uma tela dedicada que soma os pontos de **todos** os campeonatos encerrados para definir quem é o maior clube da história do seu save.
* **Contagem de Títulos:** Monitoramento automático de troféus e vices.

### 🌍 Scout Global (Olheiro)
Encontre qualquer jogador no seu banco de dados em segundos.
* **Busca por Jogador:** Pesquise por nome e veja o histórico completo de partidas, gols e prêmios de "Melhor em Campo" (Hat-tricks).
* **Visualização de Overall:** Identifique craques rapidamente pelo badge colorido de nível.

### 🛡️ Persistência de Dados Blindada
Chega de perder dados porque o navegador limpou o cache!
* **Verificação Ativa:** O sistema detecta se o armazenamento é volátil.
* **Solicitação de Permissão:** Um alerta na Home permite solicitar ao navegador o modo de **Armazenamento Persistente**, protegendo seu save contra limpezas automáticas de disco.

### 📝 Engine de Jogo Aprimorada
* **Observações na Súmula:** Campo estilo "Twitter" (140 caracteres) para registrar narrativas da partida (ex: "Goleiro pegou pênalti aos 90'").
* **Memória de Navegação:** O sistema lembra a última rodada que você visitou ao voltar para a tela do campeonato.
* **Liga + Fase Final:** Novo modo híbrido onde você joga pontos corridos e os melhores avançam para um mata-mata (com opção de zerar pontos ou não).

---

## ⚙️ Funcionalidades Principais

* **Múltiplos Mundos (Slots):** Crie saves paralelos (ex: "Liga Retro 90s" em um slot, "FIFA 25" em outro) sem misturar os dados.
* **Gestão de Clubes:** Cadastro flexível de times, escudos e uniformes.
* **Criação de Torneios:**
    * Pontos Corridos.
    * Mata-Mata (com chaveamento inteligente).
    * Fase de Grupos (com evolução para Mata-Mata e suporte a Repescagem).
    * **NOVO:** Liga + Fase Final.
* **Súmula em Tempo Real:** Linha do tempo (timeline) de eventos, substituições, escolha de craque do jogo e uniformes.
* **Backup & Restore:** Exporte seus dados para JSON e importe em qualquer outro dispositivo.

---

## 💻 Como rodar localmente

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/my-champs.git](https://github.com/seu-usuario/my-champs.git)
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

4.  Acesse `http://localhost:8080`.

---

## 📂 Estrutura do Projeto (Mapa da Mina)

* `src/services/DbService.js`: **O Núcleo.** Gerencia o IndexedDB, Slots, Persistência e a lógica pesada de salvar/carregar.
* `src/utils/`:
    * `GeradorTabela.js`: Algoritmos de Round Robin e emparelhamento.
    * `CalculadoraRanking.js`: **(Novo)** Lógica para computar pontos do Hall da Fama.
* `src/components/hall/`: **(Novo)** Componentes modais para configuração de pontuação.
* `src/views/`:
    * `HomeView.vue`: Dashboard principal com verificação de persistência.
    * `HallDaFama.vue`: Tela de ranking histórico.
    * `BuscaJogadores.vue`: Tela de Scout.
    * `DetalhesCampeonato.vue`: O "cérebro" da gestão do torneio ativo.

---

## 🔧 Dica de Segurança (Persistência)

Navegadores baseados em Chromium (Chrome, Edge, Brave) podem limpar dados do `IndexedDB` se o disco estiver cheio, a menos que o usuário conceda permissão explícita.

1.  Ao abrir o **My Champs**, verifique se há um alerta amarelo na Home.
2.  Se houver, clique no link **"Clique aqui para proteger seus dados"**.
3.  Isso garante que seu save seja tratado como "Dourado" pelo navegador e nunca seja apagado automaticamente.

---

Desenvolvido com ⚽ e Vue.js.