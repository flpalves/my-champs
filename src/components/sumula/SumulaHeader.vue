<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <BButton variant="outline-secondary" size="sm" @click="$emit('voltar')">
                ← Voltar
            </BButton>
            <span class="text-muted small">Rodada {{ rodada }}</span>
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
            <div class="d-flex justify-content-center">
                <BFormGroup label="Data do Jogo:" label-cols="auto" class="mb-0 text-white-50">
                    <BFormInput type="datetime-local" :model-value="dataHora" size="sm"
                        class="bg-secondary text-white border-secondary"
                        @update:model-value="$emit('update:dataHora', $event)" @change="$emit('salvar')" />
                </BFormGroup>
            </div>
        </BCard>

        <ul class="nav nav-tabs mb-4 nav-justified border-secondary">
            <li class="nav-item" v-for="aba in abas" :key="aba.key">
                <a class="nav-link" :class="{ active: abaAtiva === aba.key, 'text-white': abaAtiva !== aba.key }"
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
    props: ['rodada', 'timeA', 'timeB', 'golsA', 'golsB', 'uniformeA', 'uniformeB', 'dataHora', 'abaAtiva'],
    emits: ['voltar', 'salvar', 'update:dataHora', 'update:abaAtiva'],
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
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.nav-link {
    cursor: pointer;
    font-size: 0.7rem
}
</style>