<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <BButton variant="outline-secondary" size="sm" @click="$emit('voltar')">
                ← Voltar
            </BButton>
            <div class="d-flex gap-2 align-items-center">
                <span class="text-muted small">Rodada {{ rodada }}</span>
                <BButton variant="primary" size="sm" @click="$emit('sharear')">
                    📸 Compartilhar
                </BButton>
            </div>
        </div>

        <BCard class="text-center shadow-sm mb-4 border-secondary bg-dark text-white">
            <div class="d-flex justify-content-center align-items-center mb-3">
                <div class="text-center mx-3" style="width: 100px;">
                    <div class="position-relative d-inline-block">
                        <img :src="timeA.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                        <div v-if="uniformeA" class="uniforme-mini" 
                             :style="{ backgroundColor: uniformeA.interno, borderColor: uniformeA.externo }">
                        </div>
                    </div>
                    <small class="fw-bold text-truncate mt-2 d-block">{{ timeA.nome }}</small>
                </div>

                <div class="d-flex align-items-center px-3 py-2 rounded shadow-sm border border-secondary bg-secondary">
                    <h1 class="m-0 fw-bold text-white">{{ golsA }}</h1>
                    <span class="mx-2 text-white-50">x</span>
                    <h1 class="m-0 fw-bold text-white">{{ golsB }}</h1>
                </div>

                <div class="text-center mx-3" style="width: 100px;">
                    <div class="position-relative d-inline-block">
                        <img :src="timeB.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                        <div v-if="uniformeB" class="uniforme-mini" 
                             :style="{ backgroundColor: uniformeB.interno, borderColor: uniformeB.externo }">
                        </div>
                    </div>
                    <small class="fw-bold text-truncate mt-2 d-block">{{ timeB.nome }}</small>
                </div>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-4">
                <BFormGroup label-cols="auto" class="mb-0 text-white-50">
                    <BFormInput type="datetime-local" :model-value="dataHora" size="sm" 
                        class="bg-secondary text-white border-secondary" 
                        @update:model-value="$emit('update:dataHora', $event)" 
                        @change="$emit('salvar')" />
                </BFormGroup>

                <div class="d-flex align-items-center gap-1" title="Avalie a qualidade do jogo">
                    <span 
                        v-for="i in 5" :key="i"
                        class="star-icon fs-5 cursor-pointer"
                        :class="i <= (nota || 0) ? 'text-warning' : 'text-secondary opacity-25'"
                        @click="setNota(i)"
                    >
                        ★
                    </span>
                </div>
            </div>
        </BCard>

        <ul class="nav nav-tabs mb-4 nav-justified border-secondary">
            <li class="nav-item" v-for="aba in abas" :key="aba.key">
                <a class="nav-link" 
                   :class="{ active: abaAtiva === aba.key, 'text-white': abaAtiva !== aba.key }" 
                   href="#" @click.prevent="$emit('update:abaAtiva', aba.key)">
                    {{ aba.label }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { BButton, BCard, BFormGroup, BFormInput } from 'bootstrap-vue-next';

export default {
    components: { BButton, BCard, BFormGroup, BFormInput },
    // ADICIONADO: prop 'nota'
    props: ['rodada', 'timeA', 'timeB', 'golsA', 'golsB', 'uniformeA', 'uniformeB', 'dataHora', 'abaAtiva', 'nota'],
    // ADICIONADO: emit 'update:nota'
    emits: ['voltar', 'salvar', 'update:dataHora', 'update:abaAtiva', 'sharear', 'update:nota'],
    data() {
        return {
            abas: [
                { key: 'EVENTOS', label: '📝 Súmula' },
                { key: 'TIMELINE', label: '⏱️ Lances' },
                { key: 'ESCALACAO', label: '📋 Escalação' },
                { key: 'SUBS', label: '🔄 Subs' },
                { key: 'UNIFORMES', label: '👕 Uniformes' }
            ]
        }
    },
    methods: {
        setNota(valor) {
            // Se clicar na mesma nota, zera (opcional, remove se não quiser)
            const novaNota = this.nota === valor ? 0 : valor;
            this.$emit('update:nota', novaNota);
            this.$emit('salvar');
        }
    }
}
</script>

<style scoped>
.uniforme-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-style: solid;
  border-width: 3px;
  position: absolute;
  bottom: -10px;
  right: -10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.nav-link { cursor: pointer; font-size:0.7rem }
.star-icon {
    transition: transform 0.1s;
    user-select: none;
}
.star-icon:hover {
    transform: scale(1.3);
}
.cursor-pointer { cursor: pointer; }
</style>