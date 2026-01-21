<template>
  <BModal v-model="modelValueLocal" title="🏆 Configurar Pontuação do Hall da Fama" size="lg" 
          header-bg-variant="dark" header-text-variant="warning" body-bg-variant="dark" body-text-variant="white"
          footer-bg-variant="dark" footer-text-variant="white" @ok="salvar" ok-title="Salvar Configuração" ok-variant="warning">
    
    <div class="alert alert-secondary small">
        Defina quantos pontos os times ganharão no <strong>Ranking Geral</strong> ao final deste torneio com <strong>{{ qtdTimes }} participantes</strong>.
    </div>

    <div v-if="tipo === 'PONTOS_CORRIDOS' || tipo === 'LIGA_COM_FINAL'">
        <h6 class="text-warning border-bottom border-secondary pb-2 mb-3">Pontuação por Colocação Final</h6>
        
        <div class="row g-2" style="max-height: 400px; overflow-y: auto;">
            <div class="col-6 col-md-3" v-for="pos in listaPosicoes" :key="pos">
                <label class="form-label small mb-1" :class="getClasseLabel(pos)">
                    {{ getNomePosicao(pos) }}
                </label>
                <BFormInput type="number" v-model.number="regras.posicao[pos]" class="bg-secondary text-white border-0 form-control-sm" />
            </div>
        </div>
        
        <div class="mt-3 pt-3 border-top border-secondary">
            <div class="d-flex align-items-end gap-2">
                <div class="flex-grow-1">
                    <label class="small text-muted">Preencher restantes com:</label>
                    <BFormInput type="number" v-model.number="valorPreencher" placeholder="Ex: 5" class="bg-dark text-white border-secondary form-control-sm" />
                </div>
                <BButton size="sm" variant="outline-light" @click="preencherVazios">Aplicar aos Vazios</BButton>
            </div>
        </div>
    </div>

    <div v-else>
        <h6 class="text-warning border-bottom border-secondary pb-2 mb-3">Pontuação por Fase Alcançada</h6>
        <div class="row g-3">
            
            <div class="col-6 col-md-4" v-for="fase in fasesDisponiveis" :key="fase.chave">
                <label class="form-label small fw-bold" :class="fase.classe">{{ fase.label }}</label>
                <BFormInput type="number" v-model.number="regras[fase.chave]" class="bg-secondary text-white border-0" />
                <div class="form-text text-muted small" style="font-size: 0.7rem;">{{ fase.desc }}</div>
            </div>

            <div class="col-6 col-md-4">
                <label class="form-label small text-muted">Participação / Fase Grupos</label>
                <BFormInput type="number" v-model.number="regras.PARTICIPACAO" class="bg-secondary text-white border-0" />
                <div class="form-text text-muted small" style="font-size: 0.7rem;">Eliminados na 1ª fase</div>
            </div>

        </div>
    </div>

  </BModal>
</template>

<script>
import { BModal, BFormInput, BButton } from 'bootstrap-vue-next';

export default {
    name: 'ConfiguracaoPontuacaoModal',
    components: { BModal, BFormInput, BButton },
    props: {
        modelValue: Boolean,
        tipo: String,
        qtdTimes: { type: Number, default: 0 } // Nova Prop
    },
    emits: ['update:modelValue', 'salvar'],
    data() {
        return {
            valorPreencher: 0,
            regras: {
                posicao: { 1: 100, 2: 80, 3: 60, 4: 50 }, // Defaults básicos
                CAMPEAO: 100,
                VICE: 70,
                SEMIFINAL: 40,
                QUARTAS: 20,
                OITAVAS: 10,
                PARTICIPACAO: 5
            }
        }
    },
    computed: {
        modelValueLocal: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        // Gera array [1, 2, 3, ..., qtdTimes]
        listaPosicoes() {
            if (!this.qtdTimes || this.qtdTimes < 1) return [];
            return Array.from({ length: this.qtdTimes }, (_, i) => i + 1);
        },
        // Define quais fases de mata-mata mostrar baseado no número de times
        fasesDisponiveis() {
            const fases = [
                { chave: 'CAMPEAO', label: '🏆 Campeão', classe: 'text-warning', desc: 'Vencedor da Final' },
                { chave: 'VICE', label: '🥈 Vice-Campeão', classe: 'text-white-50', desc: 'Perdedor da Final' }
            ];

            // Lógica: Se tem X times, a fase anterior existe
            if (this.qtdTimes >= 3) fases.push({ chave: 'SEMIFINAL', label: '🥉 Semifinalistas', classe: 'text-white-50', desc: 'Eliminados na Semi (Top 4)' });
            if (this.qtdTimes >= 5) fases.push({ chave: 'QUARTAS', label: 'Quartas de Final', classe: 'text-white-50', desc: 'Eliminados nas Quartas (Top 8)' });
            if (this.qtdTimes >= 9) fases.push({ chave: 'OITAVAS', label: 'Oitavas de Final', classe: 'text-white-50', desc: 'Eliminados nas Oitavas (Top 16)' });
            if (this.qtdTimes >= 17) fases.push({ chave: '16AVOS', label: '16-avos de Final', classe: 'text-white-50', desc: 'Eliminados no Top 32' });

            return fases;
        }
    },
    methods: {
        getNomePosicao(p) {
            if (p === 1) return '🥇 1º Lugar (Campeão)';
            if (p === 2) return '🥈 2º Lugar (Vice)';
            if (p === 3) return '🥉 3º Lugar';
            return `${p}º Lugar`;
        },
        getClasseLabel(p) {
            if (p === 1) return 'text-warning fw-bold';
            if (p === 2) return 'text-light';
            if (p === 3) return 'text-light';
            return 'text-muted';
        },
        preencherVazios() {
            const val = this.valorPreencher || 0;
            this.listaPosicoes.forEach(pos => {
                // Só preenche se estiver undefined ou null ou 0
                if (!this.regras.posicao[pos]) {
                    this.regras.posicao[pos] = val;
                }
            });
        },
        salvar() {
            // Limpa o objeto para salvar apenas o necessário
            let payload = {};
            
            if (this.tipo === 'PONTOS_CORRIDOS' || this.tipo === 'LIGA_COM_FINAL') {
                // Salva o mapa de posições completo
                payload = { ...this.regras.posicao };
                // Garante que não salvamos posições além da qtd de times atual (limpeza)
                // (Opcional, mas mantém o banco limpo)
            } else {
                // Salva apenas as fases relevantes + participação
                payload = { PARTICIPACAO: this.regras.PARTICIPACAO };
                this.fasesDisponiveis.forEach(f => {
                    payload[f.chave] = this.regras[f.chave];
                });
            }
            this.$emit('salvar', payload);
            this.modelValueLocal = false;
        }
    }
}
</script>