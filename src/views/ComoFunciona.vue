<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-primary fw-bold mb-0">Manual do Treinador</h2>
        <span class="text-muted small">Guia detalhado de funcionalidades</span>
      </div>
      <BButton variant="outline-secondary" @click="$router.push('/')">Voltar</BButton>
    </div>

    <BCard no-body class="shadow-sm border-0 overflow-hidden">
      <BRow class="g-0">
        <BCol md="3" class="bg-dark border-end">
          <div class="nav flex-column nav-pills p-3" role="tablist" aria-orientation="vertical">
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'intro' }" 
              @click="abaAtiva = 'intro'"
            >
              🏁 Introdução
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'clubes' }" 
              @click="abaAtiva = 'clubes'"
            >
              🛡️ Gestão de Clubes
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'campeonatos' }" 
              @click="abaAtiva = 'campeonatos'"
            >
              🏆 Campeonatos
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'partidas' }" 
              @click="abaAtiva = 'partidas'"
            >
              ⚽ Operando a Partida
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'dados' }" 
              @click="abaAtiva = 'dados'"
            >
              💾 Backup e Dados
            </button>
          </div>
        </BCol>

        <BCol md="9" class="bg-dark">
          <div class="p-4" style="min-height: 500px;">
            
            <div v-if="abaAtiva === 'intro'" class="fade-in">
              <h4 class="text-primary mb-3">Bem-vindo ao Sistema</h4>
              <p>
                Este sistema foi desenhado para ser um gerenciador de campeonatos <strong>agnóstico</strong>. 
                Isso significa que ele não impõe regras rígidas de futebol profissional (como 11 jogadores ou 3 substituições), 
                permitindo que você gerencie desde peladas de fim de semana, campeonatos de futsal, até ligas de videogame.
              </p>
              <BAlert show variant="info" class="mt-4">
                <h6 class="alert-heading fw-bold">⚠️ Importante: Modo Offline</h6>
                <p class="mb-0 small">
                  Todos os dados ficam salvos no <strong>seu navegador</strong>. Se você limpar o cache ou formatar o PC, os dados somem. 
                  Use a aba <strong>Configurações</strong> frequentemente para baixar um backup dos seus dados.
                </p>
              </BAlert>
            </div>

            <div v-if="abaAtiva === 'clubes'" class="fade-in">
              <h4 class="text-primary mb-3">Gestão de Clubes</h4>
              
              <h6 class="fw-bold mt-4">1. Cadastro Flexível</h6>
              <p class="text-muted small">
                Ao criar um time, você não precisa preencher 11 titulares. Você pode cadastrar apenas 5 (futsal) ou até 22 jogadores.
                O sistema aceita times com qualquer número de atletas.
              </p>

              <h6 class="fw-bold mt-4">2. Uniformes e Cores</h6>
              <p class="text-muted small">
                Na edição do time, você pode criar "Combinações de Cores" (Kits). 
                Essas cores aparecem na súmula do jogo para diferenciar os times no placar.
                Você define uma <strong>Cor Interna</strong> (predominante) e uma <strong>Cor Externa</strong> (borda/detalhe).
              </p>

              <h6 class="fw-bold mt-4">3. Siglas</h6>
              <p class="text-muted small">
                Defina uma sigla de 3 letras (ex: FLA, VAS, PAL). Ela será usada na visualização mobile para economizar espaço na tabela de jogos.
              </p>
            </div>

            <div v-if="abaAtiva === 'campeonatos'" class="fade-in">
              <h4 class="text-primary mb-3">Tipos de Campeonato</h4>
              
              <div class="d-flex gap-3 mb-4">
                <div class="border rounded p-3 bg-dark w-100">
                  <strong>Pontos Corridos</strong>
                  <p class="small text-muted mb-0">Tabela tradicional. Todos contra todos (Turno ou Turno/Returno).</p>
                </div>
                <div class="border rounded p-3 bg-dark w-100">
                  <strong>Mata-Mata</strong>
                  <p class="small text-muted mb-0">Eliminatórias. Você pode sortear ou definir manualmente os confrontos.</p>
                </div>
              </div>

              <h6 class="fw-bold">Fase de Grupos Interativa</h6>
              <p class="text-muted small">
                Ao criar um torneio de grupos, você define quantos times avançam (ex: 2 por grupo).
                Após finalizar todos os jogos, um botão <strong>"Encerrar Grupos"</strong> aparecerá na tela de detalhes.
                Isso gerará automaticamente a fase de <strong>Mata-Mata</strong> cruzando os classificados (ex: 1ºA x 2ºB).
              </p>

              <h6 class="fw-bold mt-3">Avançando Fases (Mata-Mata)</h6>
              <p class="text-muted small">
                Quando todos os jogos de uma fase (ex: Quartas) terminam, o botão <strong>"Encerrar Fase"</strong> fica disponível.
                Uma janela abrirá mostrando os vencedores (baseado em placar). Em caso de empate, você deve selecionar manualmente quem avança.
              </p>
            </div>

            <div v-if="abaAtiva === 'partidas'" class="fade-in">
              <h4 class="text-primary mb-3">Operando a Partida</h4>
              <p>A tela de Súmula é o coração do sistema. Ela é dividida em abas:</p>

              <ul class="list-group list-group-flush small">
                <li class="list-group-item">
                  <strong>📝 Súmula (Lances):</strong> Clique na ação (Gol, Cartão) e depois no jogador. O lance é registrado automaticamente.
                </li>
                <li class="list-group-item">
                  <strong>⏱️ Linha do Tempo:</strong> Mostra a ordem cronológica dos fatos. Se errou um gol, é aqui que você clica na lixeira 🗑️ para remover.
                </li>
                <li class="list-group-item">
                  <strong>📋 Escalação:</strong> Marque quem começou jogando. Isso ajuda a calcular estatísticas e substituições.
                </li>
                <li class="list-group-item">
                  <strong>🔄 Substituições:</strong> Selecione quem sai (deve estar em campo) e quem entra (deve estar no banco). O sistema atualiza visualmente quem está jogando na lista principal.
                </li>
                <li class="list-group-item">
                  <strong>👕 Uniformes:</strong> Escolha qual kit cada time está usando para facilitar a visualização no placar.
                </li>
              </ul>
            </div>

            <div v-if="abaAtiva === 'dados'" class="fade-in">
              <h4 class="text-primary mb-3">Backup e Segurança</h4>
              
              <h6 class="fw-bold">Exportar</h6>
              <p class="text-muted small">
                Gera um arquivo <code>.json</code> com tudo. Faça isso sempre que terminar uma rodada importante.
              </p>

              <h6 class="fw-bold">Importar (Mesclar vs Substituir)</h6>
              <p class="text-muted small">
                Ao importar, você tem duas opções:
                <br>
                <strong>Mesclar:</strong> Adiciona os dados do arquivo ao que você já tem (útil para juntar times criados em PCs diferentes).
                <br>
                <strong>Substituir:</strong> Apaga tudo o que existe agora e coloca o backup no lugar.
              </p>
            </div>

          </div>
        </BCol>
      </BRow>
    </BCard>
  </div>
</template>

<script>
import { BCard, BButton, BRow, BCol, BAlert } from 'bootstrap-vue-next';

export default {
  name: 'ComoFunciona',
  components: {
    BCard, BButton, BRow, BCol, BAlert
  },
  data() {
    return {
      abaAtiva: 'intro'
    }
  }
}
</script>

<style scoped>
.nav-pills .nav-link {
  color: #4b5563;
  border-radius: 0;
  border-left: 4px solid transparent;
  transition: all 0.2s;
}

.nav-pills .nav-link:hover {
  /* background-color: #e5e7eb; */
}

.nav-pills .nav-link.active {
  /* background-color: #f3f4f6; */
  color: var(--bs-primary);
  border-left-color: var(--bs-primary);
  font-weight: bold;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>