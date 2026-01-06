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
            <BCol md="6">
              <BFormGroup label="Nome do Time:" label-for="nome-time" class="mb-3">
                <BFormInput id="nome-time" v-model="timeEditavel.nome" required />
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
        escudo: '',
        estadio: '',
        tecnico: '',
        jogadores: []
      }
    }
  },
  async mounted() {
    // Tenta pegar o ID, seja "id" ou "idTime", dependendo de como está sua rota
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

        // 2. RECONSTRUIR ARRAY DE 22 POSIÇÕES (MANTENDO DADOS EXISTENTES)
        const jogadoresPreenchidos = timeClone.jogadores || [];
        const totalSlots = 22;
        
        // Garante que a tela sempre tenha 22 campos, preenchendo onde houver dados
        const elencoCompleto = Array.from({ length: totalSlots }, (_, i) => {
          const numeroCamisa = i + 1;

          // Busca se existe jogador salvo com esse número
          const jogadorEncontrado = jogadoresPreenchidos.find(j => j.numero == numeroCamisa);

          if (jogadorEncontrado) {
            return jogadorEncontrado;
          }
          
          // Se não encontrou, retorna slot vazio com o número correto
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

    async salvarAlteracoes() {
      // 1. Limpeza e Validação Básica
      if (!this.timeEditavel.nome || !this.timeEditavel.escudo) {
          alert("Nome e Escudo são obrigatórios.");
          return;
      }

      // 2. Preparar objeto para salvar (remove proxies)
      const objetoLimpo = JSON.parse(JSON.stringify(this.timeEditavel));

      // 3. Filtrar apenas jogadores com nome preenchido
      const jogadoresValidos = objetoLimpo.jogadores.filter(j => j.nome && j.nome.trim() !== '');

      // Opcional: Aviso se tentar salvar time sem jogadores
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