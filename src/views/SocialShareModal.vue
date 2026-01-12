<template>
  <BModal v-model="localModelValue" title="Compartilhar Resultado" size="lg" hide-footer centered>
    
    <div class="d-flex flex-column align-items-center">
      <p class="text-muted small mb-3">
        Este é o preview da imagem. Clique no botão abaixo para baixar.
      </p>

      <div ref="captureArea" class="social-card position-relative overflow-hidden shadow-lg">
        
        <div class="bg-overlay"></div>
        <div class="circle-deco-1"></div>
        <div class="circle-deco-2"></div>

        <div class="card-content d-flex flex-column justify-content-between h-100 p-4">
          
          <div class="text-center text-white header-section">
            <h5 class="text-uppercase fw-bold mb-0 text-warning">{{ nomeCampeonato }}</h5>
            <small class="opacity-75">Rodada {{ rodada }}</small>
          </div>

          <div class="d-flex justify-content-center align-items-center my-3">
            
            <div class="team-box text-center">
              <img :src="timeA.escudo" class="team-logo mb-2" crossorigin="anonymous" />
              <h2 class="fw-black text-white text-uppercase team-name">{{ timeA.nome }}</h2>
              <div class="scorers text-start mt-2">
                <div v-for="(gol, i) in golsListA" :key="i" class="scorer-item">
                  ⚽ {{ gol }}
                </div>
              </div>
            </div>

            <div class="score-box mx-4 text-center">
              <div class="score-display text-white">
                <span>{{ golsA }}</span>
                <span class="divider mx-2">x</span>
                <span>{{ golsB }}</span>
              </div>
              <div class="badge bg-white text-dark mt-2 px-3 fw-bold">FINAL</div>
            </div>

            <div class="team-box text-center">
              <img :src="timeB.escudo" class="team-logo mb-2" crossorigin="anonymous" />
              <h2 class="fw-black text-white text-uppercase team-name">{{ timeB.nome }}</h2>
              <div class="scorers text-end mt-2">
                <div v-for="(gol, i) in golsListB" :key="i" class="scorer-item">
                  {{ gol }} ⚽
                </div>
              </div>
            </div>

          </div>

          <div class="text-center mt-auto footer-section">
            <div class="app-brand text-white">
              <span class="fw-light">Gerado por</span> <span class="fw-bold text-warning">MY CHAMPS</span>
            </div>
          </div>

        </div>
      </div>

      <div class="mt-4">
        <BButton variant="success" size="lg" @click="gerarImagem" :disabled="gerando">
          <span v-if="gerando">Gerando...</span>
          <span v-else>📸 Baixar Imagem (PNG)</span>
        </BButton>
      </div>

    </div>
  </BModal>
</template>

<script>
import { BModal, BButton } from 'bootstrap-vue-next';
import html2canvas from 'html2canvas';

export default {
  name: 'SocialShareModal',
  components: { BModal, BButton },
  props: {
    modelValue: Boolean, // Controla abertura do modal
    timeA: Object,
    timeB: Object,
    golsA: [Number, String],
    golsB: [Number, String],
    eventos: Array, // Lista completa de eventos para filtrar autores
    nomeCampeonato: { type: String, default: 'Campeonato' },
    rodada: { type: [Number, String], default: '-' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      gerando: false
    }
  },
  computed: {
    localModelValue: {
      get() { return this.modelValue },
      set(val) { this.$emit('update:modelValue', val) }
    },
    golsListA() { return this.filtrarGols(this.timeA.id); },
    golsListB() { return this.filtrarGols(this.timeB.id); }
  },
  methods: {
    filtrarGols(timeId) {
      if (!this.eventos) return [];
      return this.eventos
        .filter(e => e.tipo === 'GOL' && e.timeId === timeId)
        .map(e => e.jogador ? e.jogador.nome.split(' ')[0] : 'Gol'); // Pega só o primeiro nome para caber
    },
    async gerarImagem() {
      this.gerando = true;
      try {
        const el = this.$refs.captureArea;
        // Configurações para garantir qualidade e evitar cortes
        const canvas = await html2canvas(el, {
          scale: 2, // Alta resolução (Retina)
          useCORS: true, // Importante para carregar imagens externas (escudos)
          backgroundColor: null,
          logging: false
        });

        const link = document.createElement('a');
        link.download = `Resultado-${this.timeA.nome}-x-${this.timeB.nome}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error("Erro ao gerar imagem", error);
        alert("Erro ao gerar imagem. Verifique se os escudos são de uma fonte segura (HTTPS).");
      } finally {
        this.gerando = false;
      }
    }
  }
}
</script>

<style scoped>
/* Fonte grossa para impacto */
.fw-black { font-weight: 900; }

/* O Card Quadrado (Aspecto Instagram) */
.social-card {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border: 1px solid #374151;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none; /* Evita seleção de texto na imagem */
}

/* Elementos Decorativos de Fundo */
.bg-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(#374151 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.1;
  z-index: 0;
}
.circle-deco-1 {
  position: absolute;
  top: -50px; left: -50px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(0,0,0,0) 70%);
  z-index: 0;
}
.circle-deco-2 {
  position: absolute;
  bottom: -50px; right: -50px;
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(0,0,0,0) 70%);
  z-index: 0;
}

/* Layout Interno */
.card-content {
  position: relative;
  z-index: 10;
}

.team-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
}

.team-name {
  font-size: 1.1rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.score-display {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.scorer-item {
  font-size: 0.85rem;
  color: #d1d5db;
  margin-bottom: 2px;
}
.divider{
    font-size:2rem;
}

/* Responsividade do Modal (mas o card mantém tamanho fixo para a foto) */
@media (max-width: 550px) {
  .social-card {
    zoom: 0.6; /* Reduz visualmente em telas pequenas, mas gera imagem full */
  }
}
</style>