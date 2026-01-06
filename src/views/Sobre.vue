<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary fw-bold mb-0">Sobre o Sistema</h2>
      <BButton variant="outline-secondary" @click="$router.push('/')">Voltar</BButton>
    </div>

    <BRow>
      <BCol md="12" class="mb-4">
        <BCard class="shadow-sm border-0 bg-dark text-white">
          <h4 class="text-primary mb-3">Bem-vindo ao MY CHAMPS</h4>
          <p class="lead text-light opacity-75">
            Este é um sistema de gestão esportiva offline projetado para organizar torneios de futebol, 
            futsal ou videogames de forma agnóstica e flexível.
          </p>
          <hr class="border-secondary">
          <p class="small text-muted">
            Versão 1.2.0 • Desenvolvido com Vue.js 3 & Bootstrap
          </p>
        </BCard>
      </BCol>
    </BRow>

    <h5 class="text-primary border-bottom border-secondary pb-2 mb-4">Como Funciona?</h5>
    
    <BRow class="mb-5 g-4">
      <BCol md="3">
        <div class="step-card h-100 p-4 border border-secondary rounded bg-dark position-relative">
          <div class="step-number">1</div>
          <div class="fs-1 mb-3">🛡️</div>
          <h5 class="fw-bold">Cadastrar Clubes</h5>
          <p class="text-muted small">
            Crie seus times. Você pode personalizar o nome, o escudo, o estádio e definir as cores dos uniformes. 
            O elenco é flexível (não exige 11 jogadores).
          </p>
        </div>
      </BCol>
      <BCol md="3">
        <div class="step-card h-100 p-4 border border-secondary rounded bg-dark position-relative">
          <div class="step-number">2</div>
          <div class="fs-1 mb-3">🏆</div>
          <h5 class="fw-bold">Criar Campeonato</h5>
          <p class="text-muted small">
            Escolha entre <strong>Pontos Corridos</strong>, <strong>Mata-Mata</strong> ou <strong>Fase de Grupos</strong>. 
            Configure turnos, sorteios e critérios de classificação.
          </p>
        </div>
      </BCol>
      <BCol md="3">
        <div class="step-card h-100 p-4 border border-secondary rounded bg-dark position-relative">
          <div class="step-number">3</div>
          <div class="fs-1 mb-3">📝</div>
          <h5 class="fw-bold">Gerenciar Jogos</h5>
          <p class="text-muted small">
            Entre na súmula das partidas. Registre gols, cartões, substituições, defina o craque do jogo 
            e o uniforme utilizado em tempo real.
          </p>
        </div>
      </BCol>
      <BCol md="3">
        <div class="step-card h-100 p-4 border border-secondary rounded bg-dark position-relative">
          <div class="step-number">4</div>
          <div class="fs-1 mb-3">📊</div>
          <h5 class="fw-bold">Acompanhar</h5>
          <p class="text-muted small">
            O sistema gera automaticamente a tabela de classificação, chaveamento de mata-mata, 
            estatísticas de artilharia e histórico da linha do tempo.
          </p>
        </div>
      </BCol>
    </BRow>

    <BRow>
      <BCol md="6" class="mb-4">
        <BCard title="💾 Dados & Privacidade" class="h-100 border-warning bg-dark">
          <p class="text-muted">
            Este sistema roda <strong>100% no seu navegador</strong>. Nenhum dado é enviado para servidores externos.
          </p>
          <ul class="text-muted small">
            <li>Tudo é salvo no <strong>IndexedDB</strong> do seu navegador.</li>
            <li>Se você limpar o cache do navegador, os dados podem ser perdidos.</li>
            <li>Use a aba <strong>Configurações</strong> para fazer Backup (Exportar JSON) regularmente.</li>
          </ul>
        </BCard>
      </BCol>

      <BCol md="6" class="mb-4">
        <BCard title="⚙️ Funcionalidades Avançadas" class="h-100 border-info bg-dark">
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-items-center">
              <span class="badge bg-success me-2">Novo</span>
              <span class="text-light">Transição automática de Grupos para Mata-Mata.</span>
            </div>
            <div class="d-flex align-items-center">
              <span class="badge bg-success me-2">Novo</span>
              <span class="text-light">Histórico cronológico (Timeline) dos jogos.</span>
            </div>
            <div class="d-flex align-items-center">
              <span class="badge bg-primary me-2">Info</span>
              <span class="text-light">Importação inteligente com mesclagem de dados.</span>
            </div>
          </div>
        </BCard>
      </BCol>
    </BRow>

  </div>
</template>

<script>
import { BCard, BRow, BCol, BButton } from 'bootstrap-vue-next';

export default {
  name: 'Sobre',
  components: {
    BCard, BRow, BCol, BButton
  }
}
</script>

<style scoped>
.step-card {
  transition: transform 0.3s ease, border-color 0.3s;
}

.step-card:hover {
  transform: translateY(-5px);
  border-color: var(--bs-primary) !important;
}

.step-number {
  position: absolute;
  top: -15px;
  right: -10px;
  background-color: var(--bs-primary);
  color: #000;
  font-weight: bold;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  font-family: 'Kanit', sans-serif;
}
</style>