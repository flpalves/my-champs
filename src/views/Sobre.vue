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

    <BRow class="mt-4">
      <BCol md="12">
        <div class="donation-card p-4 rounded border border-2 border-warning bg-dark position-relative overflow-hidden text-center text-md-start">
          <div class="glow-effect"></div>
          
          <BRow class="align-items-center position-relative" style="z-index: 2;">
            <BCol md="8" class="mb-4 mb-md-0">
              <h3 class="text-warning fw-bold mb-2">
                ☕ Gostou do Projeto?
              </h3>
              <p class="text-white lead mb-3">
                O <strong>MY CHAMPS</strong> é 100% gratuito e sem anúncios. 
                Se ele ajuda a organizar seus campeonatos, considere fazer uma doação de qualquer valor para manter o desenvolvedor motivado!
              </p>
              
              <div class="d-flex flex-column flex-md-row gap-3 align-items-center">
                <div class="bg-black bg-opacity-50 px-3 py-2 rounded border border-secondary d-flex align-items-center">
                  <span class="text-muted small me-2">CHAVE PIX:</span>
                  <span class="fw-bold text-white font-monospace user-select-all" id="chavePix">flpalves.dev@gmail.com</span>
                </div>
                <BButton variant="warning" size="sm" class="fw-bold text-dark" @click="copiarPix">
                  <span v-if="copiado">Copiado! ✅</span>
                  <span v-else>Copiar Chave 📋</span>
                </BButton>
              </div>
            </BCol>

            <BCol md="4" class="text-center">
              <div class="bg-white p-2 d-inline-block rounded shadow-lg">
                <img 
                  src="https://placehold.co/150x150/white/black?text=QR+Code+PIX" 
                  alt="QR Code Pix" 
                  class="img-fluid"
                  style="width: 150px; height: 150px;"
                />
                <div class="small text-dark mt-1 fw-bold">Scan Me</div>
              </div>
            </BCol>
          </BRow>
        </div>
      </BCol>
    </BRow>

    <BRow class="mt-4">
      <BCol md="12">
        <div class="p-4 rounded border border-1 border-primary bg-dark d-flex flex-column flex-md-row align-items-center justify-content-between shadow-sm">
          <div class="mb-3 mb-md-0">
            <h4 class="text-primary fw-bold mb-1">💡 Tem uma ideia ou encontrou um bug?</h4>
            <p class="text-muted mb-0 small">
              Ajude a melhorar o sistema! Envie suas sugestões, críticas ou solicite novas funcionalidades diretamente para o desenvolvedor.
            </p>
          </div>
          <BButton 
            href="mailto:flpalves.dev@gmail.com?subject=Sugestão%20My%20Champs" 
            variant="outline-primary" 
            class="fw-bold px-4"
          >
            ✉️ Enviar E-mail
          </BButton>
        </div>
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
  },
  data() {
    return {
      copiado: false
    }
  },
  methods: {
    copiarPix() {
      const chave = "flpalves.dev@gmail.com";
      navigator.clipboard.writeText(chave).then(() => {
        this.copiado = true;
        setTimeout(() => {
          this.copiado = false;
        }, 2000);
      }).catch(err => {
        console.error('Erro ao copiar', err);
        alert('Copie manualmente: ' + chave);
      });
    }
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

/* Estilos do Card de Doação */
.donation-card {
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.1); /* Sombra dourada suave */
  transition: transform 0.3s;
}

.donation-card:hover {
  transform: scale(1.01);
}

.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,193,7,0.05) 0%, rgba(0,0,0,0) 70%);
  pointer-events: none;
  z-index: 1;
}
</style>