<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary">Editar Time</h2>
      <BButton variant="outline-secondary" @click="$emit('cancelar')">
        Voltar
      </BButton>
    </div>

    <div v-if="carregando" class="text-center py-5">
      <BSpinner label="Carregando..." />
    </div>

    <div v-else>
      <BCard class="shadow-sm">
        <BForm @submit.prevent="salvarAlteracoes">
          
          <h5 class="mb-3 text-primary">Informações Gerais</h5>
          
          <BRow>
            <BCol md="4">
              <BFormGroup label="Nome do Time:" label-for="nome-time" class="mb-3">
                <BFormInput id="nome-time" v-model="timeEditavel.nome" required />
              </BFormGroup>
            </BCol>

            <BCol md="2">
              <BFormGroup label="Sigla (3 letras):" label-for="sigla-time" class="mb-3">
                <BFormInput 
                  id="sigla-time" 
                  :model-value="timeEditavel.sigla"
                  @update:model-value="v => timeEditavel.sigla = v ? v.toUpperCase() : ''"
                  maxlength="3" 
                  style="text-transform: uppercase;"
                  placeholder="Ex: FLA"
                />
              </BFormGroup>
            </BCol>
            
            <BCol md="6">
              <BFormGroup label="Link do Escudo (URL):" label-for="escudo-time" class="mb-3">
                <BFormInput id="escudo-time" v-model="timeEditavel.escudo" required @input="verificarImagem" />
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol md="6">
              <BFormGroup label="Estádio / Quadra:" label-for="estadio-time" class="mb-3">
                <BFormInput id="estadio-time" v-model="timeEditavel.estadio" required />
              </BFormGroup>
            </BCol>

            <BCol md="6">
              <BFormGroup label="Técnico / Responsável:" label-for="tecnico-time" class="mb-3">
                <BFormInput id="tecnico-time" v-model="timeEditavel.tecnico" required />
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow v-if="timeEditavel.escudo" class="mb-4 justify-content-center text-center">
            <BCol md="4">
              <div class="border p-2 rounded">
                <img 
                  :src="timeEditavel.escudo" 
                  style="max-height: 100px; max-width: 100%; object-fit: contain;"
                  @error="imagemErro = true"
                  @load="imagemErro = false"
                />
                <div v-if="imagemErro" class="text-danger mt-1 small">Erro na imagem</div>
              </div>
            </BCol>
          </BRow>

          <hr />

          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="text-primary mb-0">Cores do Time (Uniformes)</h5>
              <BButton 
                size="sm" 
                variant="outline-primary" 
                @click="adicionarCor" 
                :disabled="timeEditavel.cores.length >= 10"
              >
                + Adicionar Combinação
              </BButton>
            </div>
            
            <p class="text-muted small" v-if="timeEditavel.cores.length === 0">
              Nenhuma cor definida. Adicione combinações para representar os uniformes.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <div 
                v-for="(esquema, index) in timeEditavel.cores" 
                :key="index" 
                class="border rounded p-2 d-flex flex-column align-items-center position-relative"
                style="min-width: 140px;"
              >
                <button 
                  type="button"
                  class="btn-close position-absolute top-0 end-0 m-1 small" 
                  aria-label="Close" 
                  style="font-size: 0.7rem;"
                  @click="removerCor(index)"
                ></button>

                <div class="mb-2 fw-bold small text-muted">Opção {{ index + 1 }}</div>

                <div 
                  class="color-badge mb-2"
                  :style="{ 
                    backgroundColor: esquema.interno, 
                    borderColor: esquema.externo 
                  }"
                  title="Externo (Borda) / Interno (Centro)"
                ></div>

                <div class="d-flex gap-1">
                  <div class="text-center">
                    <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.externo" title="Cor Externa (Anel)">
                    <span class="d-block" style="font-size: 0.6rem;">Externo</span>
                  </div>
                  <div class="text-center">
                    <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.interno" title="Cor Interna (Miolo)">
                    <span class="d-block" style="font-size: 0.6rem;">Interno</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="timeEditavel.cores.length >= 10" class="text-danger small mt-1">
              Limite máximo de 10 cores atingido.
            </div>
          </div>

          <hr />

          <h5 class="mb-3 text-primary">Elenco</h5>
          <p class="text-muted small">Preencha os jogadores do time (quantidade livre).</p>
          
          <BRow>
            <BCol md="6">
              <div v-for="(jogador, index) in timeEditavel.jogadores.slice(0, 11)" :key="jogador.numero" class="mb-2">
                <BInputGroup>
                  <BInputGroupText style="width: 45px; justify-content: center;">
                    {{ jogador.numero }}
                  </BInputGroupText>
                  <BFormInput v-model="timeEditavel.jogadores[index].nome" placeholder="Nome do Jogador" />
                </BInputGroup>
              </div>
            </BCol>

            <BCol md="6">
              <div v-for="(jogador, index) in timeEditavel.jogadores.slice(11, 22)" :key="jogador.numero" class="mb-2">
                <BInputGroup>
                  <BInputGroupText style="width: 45px; justify-content: center;">
                    {{ jogador.numero }}
                  </BInputGroupText>
                  <BFormInput v-model="timeEditavel.jogadores[index + 11].nome" placeholder="Nome do Jogador" />
                </BInputGroup>
              </div>
            </BCol>
          </BRow>

          <div class="mt-4 d-flex justify-content-end gap-2">
            <BButton variant="secondary" @click="$emit('cancelar')">Cancelar</BButton>
            <BButton type="submit" variant="success" size="lg">Salvar Alterações</BButton>
          </div>

        </BForm>
      </BCard>
    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BCard, BForm, BFormGroup, BFormInput, BRow, BCol, BButton, BInputGroup, BInputGroupText, BSpinner } from 'bootstrap-vue-next';

export default {
  name: 'EditarTime',
  components: {
    BCard, BForm, BFormGroup, BFormInput, BRow, BCol, BButton, BInputGroup, BInputGroupText, BSpinner
  },
  props: {},
  data() {
    return {
      carregando: true,
      imagemErro: false,
      idTime : '',
      timeEditavel: {
        nome: '',
        sigla: '',
        escudo: '',
        estadio: '',
        tecnico: '',
        cores: [], // Array de objetos { interno: hex, externo: hex }
        jogadores: []
      }
    }
  },
  async mounted() {
    this.idTime = this.$route.params.id || this.$route.params.idTime;
    await this.carregarTime();
  },
  methods: {
    async carregarTime() {
      try {
        const timeBanco = await DbService.getTimeById(this.idTime);
        
        if (!timeBanco) {
          alert("Time não encontrado!");
          this.$emit('cancelar'); 
          this.$router.push('/');
          return;
        }

        // 1. CLONE PROFUNDO
        const timeClone = JSON.parse(JSON.stringify(timeBanco));

        // 2. TRATAMENTO DE LEGADO
        if (!timeClone.sigla) timeClone.sigla = '';
        if (!timeClone.cores) timeClone.cores = []; // Inicia array vazio se não existir

        // 3. RECONSTRUIR ARRAY DE JOGADORES (22 POSIÇÕES)
        const jogadoresPreenchidos = timeClone.jogadores || [];
        const totalSlots = 22;
        
        const elencoCompleto = Array.from({ length: totalSlots }, (_, i) => {
          const numeroCamisa = i + 1;
          const jogadorEncontrado = jogadoresPreenchidos.find(j => j.numero == numeroCamisa);

          if (jogadorEncontrado) {
            return jogadorEncontrado;
          }
          return { numero: numeroCamisa, nome: '' };
        });

        timeClone.jogadores = elencoCompleto;
        this.timeEditavel = timeClone;

      } catch (error) {
        console.error("Erro ao carregar time:", error);
      } finally {
        this.carregando = false;
      }
    },

    verificarImagem() {
      this.imagemErro = false;
    },

    // --- CORES ---
    adicionarCor() {
      if (this.timeEditavel.cores.length < 10) {
        // Adiciona padrão: Branco no centro, Preto na borda
        this.timeEditavel.cores.push({ interno: '#ffffff', externo: '#000000' });
      }
    },
    removerCor(index) {
      this.timeEditavel.cores.splice(index, 1);
    },

    async salvarAlteracoes() {
      // 1. Validação
      if (!this.timeEditavel.nome || !this.timeEditavel.escudo) {
          alert("Nome e Escudo são obrigatórios.");
          return;
      }

      // 2. Preparar objeto
      const objetoLimpo = JSON.parse(JSON.stringify(this.timeEditavel));
      
      if (objetoLimpo.sigla) {
          objetoLimpo.sigla = objetoLimpo.sigla.toUpperCase();
      }

      // 3. Filtrar jogadores válidos
      const jogadoresValidos = objetoLimpo.jogadores.filter(j => j.nome && j.nome.trim() !== '');

      if (jogadoresValidos.length === 0) {
        if(!confirm("Tem certeza que deseja salvar o time sem jogadores?")) {
            return;
        }
      }

      const timeFinal = {
        ...objetoLimpo,
        jogadores: jogadoresValidos
      };

      try {
        await DbService.atualizarTime(timeFinal);
        alert("Time atualizado com sucesso!");
        this.$emit('sucesso');
        this.$router.push('/'); 
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar time.");
      }
    }
  }
}
</script>

<style scoped>
/* Estilo para simular os 2 círculos */
.color-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 8px; /* Anel externo grosso para parecer "metade da largura" */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.color-badge:hover {
  transform: scale(1.1);
}
</style>