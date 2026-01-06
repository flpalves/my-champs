<template>
  <div class="container mt-4">
    <BCard title="Cadastro de Novo Time" class="mb-4 shadow-sm">
      <BForm @submit.prevent="salvarTime">
        
        <h5 class="mb-3 text-primary">Informações Gerais</h5>
        <BRow>
          <BCol md="6">
            <BFormGroup label="Nome do Time:" label-for="nome-time" class="mb-3">
              <BFormInput
                id="nome-time"
                v-model="novoTime.nome"
                required
                placeholder="Ex: Vue United"
              />
            </BFormGroup>
          </BCol>
          
          <BCol md="6">
            <BFormGroup label="Link do Escudo (URL):" label-for="escudo-time" class="mb-3">
              <BFormInput
                id="escudo-time"
                v-model="novoTime.escudo"
                required
                placeholder="https://..."
                @input="verificarImagem"
              />
            </BFormGroup>
          </BCol>
        </BRow>

        <BRow>
          <BCol md="6">
            <BFormGroup label="Estádio / Quadra:" label-for="estadio-time" class="mb-3">
              <BFormInput
                id="estadio-time"
                v-model="novoTime.estadio"
                required
                placeholder="Ex: Arena Dom"
              />
            </BFormGroup>
          </BCol>

          <BCol md="6">
            <BFormGroup label="Técnico / Responsável:" label-for="tecnico-time" class="mb-3">
              <BFormInput
                id="tecnico-time"
                v-model="novoTime.tecnico"
                required
                placeholder="Ex: Guardiola"
              />
            </BFormGroup>
          </BCol>
        </BRow>

        <BRow v-if="novoTime.escudo" class="mb-4 justify-content-center text-center">
          <BCol md="4">
            <div class="border p-2 rounded">
              <small class="d-block mb-2 text-muted">Pré-visualização</small>
              <img 
                :src="novoTime.escudo" 
                alt="Escudo" 
                style="max-height: 100px; max-width: 100%; object-fit: contain;"
                @error="imagemErro = true"
                @load="imagemErro = false"
              />
              <div v-if="imagemErro" class="text-danger mt-1 small">
                Erro ao carregar imagem
              </div>
            </div>
          </BCol>
        </BRow>

        <hr />

        <h5 class="mb-3 text-primary">Elenco</h5>
        <p class="text-muted small">Preencha os jogadores do time (quantidade livre).</p>
        
        <BRow>
          <BCol md="6">
            <div v-for="(jogador, index) in novoTime.jogadores.slice(0, 11)" :key="index" class="mb-2">
              <BInputGroup>
                <BInputGroupText style="width: 45px; justify-content: center;">
                  {{ index + 1 }}
                </BInputGroupText>
                <BFormInput
                  v-model="novoTime.jogadores[index].nome"
                  placeholder="Nome do Jogador"
                />
              </BInputGroup>
            </div>
          </BCol>

          <BCol md="6">
            <div v-for="(jogador, index) in novoTime.jogadores.slice(11, 22)" :key="index + 11" class="mb-2">
              <BInputGroup>
                <BInputGroupText style="width: 45px; justify-content: center;">
                  {{ index + 12 }}
                </BInputGroupText>
                <BFormInput
                  v-model="novoTime.jogadores[index + 11].nome"
                  placeholder="Nome do Jogador"
                />
              </BInputGroup>
            </div>
          </BCol>
        </BRow>

        <div class="mt-4 d-grid gap-2">
          <BButton type="submit" variant="primary" size="lg" :disabled="formularioInvalido">
            Cadastrar Time
          </BButton>
        </div>

      </BForm>
    </BCard>
  </div>
</template>

<script>
import {
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BRow,
  BCol,
  BButton,
  BInputGroup,
  BInputGroupText
} from 'bootstrap-vue-next'

import DbService from '@/services/DbService';

export default {
  name: 'CadastroTime',
  components: {
    BCard,
    BForm,
    BFormGroup,
    BFormInput,
    BRow,
    BCol,
    BButton,
    BInputGroup,
    BInputGroupText
  },
  data() {
    return {
      imagemErro: false,
      novoTime: {
        nome: '',
        escudo: '',
        estadio: '',
        tecnico: '',
        // Inicializa array com 22 slots disponíveis
        jogadores: Array.from({ length: 22 }, (_, i) => ({
          numero: i + 1,
          nome: ''
        }))
      }
    }
  },
  computed: {
    // Validação simplificada: Apenas dados do time são obrigatórios
    formularioInvalido() {
      const dadosGeraisVazios = !this.novoTime.nome || !this.novoTime.escudo || !this.novoTime.estadio || !this.novoTime.tecnico;
      return dadosGeraisVazios || this.imagemErro;
    }
  },
  methods: {
    verificarImagem() {
      this.imagemErro = false; // Reseta erro ao digitar nova URL
    },
    async salvarTime() {
      if (this.formularioInvalido) {
        alert("Preencha as informações gerais do time!");
        return;
      }

      // Filtra jogadores vazios
      const jogadoresValidos = this.novoTime.jogadores.filter(j => j.nome.trim() !== '');

      if (jogadoresValidos.length === 0) {
        if(!confirm("Tem certeza que deseja cadastrar um time sem jogadores?")) {
            return;
        }
      }

      const timeParaSalvar = {
        ...this.novoTime,
        jogadores: jogadoresValidos
      };

      try {
        await DbService.adicionarTime(timeParaSalvar);
        
        this.$emit('ao-salvar-time', timeParaSalvar);

        alert('Time salvo com sucesso no banco de dados!');
        this.resetarFormulario();
        
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar o time. Tente novamente.');
      }
    },
    resetarFormulario() {
      this.novoTime = {
        nome: '',
        escudo: '',
        estadio: '',
        tecnico: '',
        jogadores: Array.from({ length: 22 }, (_, i) => ({
          numero: i + 1,
          nome: ''
        }))
      };
      this.imagemErro = false;
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .btn-group-vertical {
    width: 100%;
  }
}
</style>