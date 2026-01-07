<template>
    <BRow>
        <BCol md="6" class="mb-4">
            <SubCard :time="timeA" :elenco="elencoA" :titulares="titularesA" 
                :subs="getSubs(timeA.id)" :subTemp="subTempA"
                @realizar="realizar('A')" @remover="remover" />
        </BCol>
        <BCol md="6" class="mb-4">
            <SubCard :time="timeB" :elenco="elencoB" :titulares="titularesB" 
                :subs="getSubs(timeB.id)" :subTemp="subTempB"
                @realizar="realizar('B')" @remover="remover" />
        </BCol>
    </BRow>
</template>

<script>
import { BRow, BCol, BCard, BFormGroup, BFormSelect, BButton } from 'bootstrap-vue-next';

// Componente Interno
const SubCard = {
    props: ['time', 'elenco', 'titulares', 'subs', 'subTemp'],
    emits: ['realizar', 'remover'],
    components: { BCard, BFormGroup, BFormSelect, BButton },
    methods: {
        getId(j) { return j.id || j.numero },
        // Lógica de filtro (campo vs banco) deve ser feita aqui ou no pai. 
        // Para simplificar, faremos aqui usando as props.
        getCampo() {
            // IDs em campo = Titulares - Saiu + Entrou
            const idsTit = (this.titulares || []).map(t => t?.id).filter(i=>i);
            const idsSai = this.subs.map(s => s.sai?.id);
            const idsEnt = this.subs.map(s => s.entra?.id);
            const emCampoIds = [...idsTit.filter(i => !idsSai.includes(i)), ...idsEnt.filter(i => !idsSai.includes(i))];
            return this.elenco.filter(j => emCampoIds.includes(this.getId(j)));
        },
        getBanco() {
            const idsTit = (this.titulares || []).map(t => t?.id).filter(i=>i);
            const idsEnt = this.subs.map(s => s.entra?.id);
            const indisponiveis = [...idsTit, ...idsEnt];
            return this.elenco.filter(j => !indisponiveis.includes(this.getId(j)));
        }
    },
    template: `
        <BCard :title="\`Substituição - \${time.nome}\`" class="h-100 bg-dark text-white border-secondary">
            <BFormGroup label="Sai (Em campo):" class="mb-2 text-white-50">
                <BFormSelect v-model="subTemp.saiId" class="bg-secondary text-white border-secondary">
                    <option :value="null">Selecione...</option>
                    <option v-for="j in getCampo()" :key="getId(j)" :value="getId(j)">
                        #{{ j.numero }} - {{ j.nome }}
                    </option>
                </BFormSelect>
            </BFormGroup>
            <BFormGroup label="Entra (Banco):" class="mb-3 text-white-50">
                <BFormSelect v-model="subTemp.entraId" class="bg-secondary text-white border-secondary">
                    <option :value="null">Selecione...</option>
                    <option v-for="j in getBanco()" :key="getId(j)" :value="getId(j)">
                        #{{ j.numero }} - {{ j.nome }}
                    </option>
                </BFormSelect>
            </BFormGroup>
            <BButton variant="success" class="w-100" @click="$emit('realizar')" 
                :disabled="!subTemp.saiId || !subTemp.entraId">
                🔄 Confirmar Substituição
            </BButton>

            <hr v-if="subs.length > 0" class="border-secondary">
            <ul class="list-unstyled small mb-0">
                <li v-for="(s, idx) in subs" :key="idx" class="d-flex justify-content-between border-bottom border-secondary py-1">
                    <span class="text-danger">⬇ {{ s.sai?.nome }} (#{{ s.sai?.numero }})</span>
                    <span class="text-success">⬆ {{ s.entra?.nome }} (#{{ s.entra?.numero }})</span>
                    <span class="text-muted cursor-pointer" @click="$emit('remover', s)">❌</span>
                </li>
            </ul>
        </BCard>
    `
};

export default {
    components: { BRow, BCol, SubCard },
    props: ['timeA', 'timeB', 'elencoA', 'elencoB', 'titularesA', 'titularesB', 'substituicoes', 'subTempA', 'subTempB'],
    emits: ['realizarSubstituicao', 'removerSubstituicao'],
    methods: {
        getSubs(timeId) {
            return (this.substituicoes || []).filter(s => s.timeId == timeId);
        },
        realizar(lado) { this.$emit('realizarSubstituicao', lado); },
        remover(sub) { this.$emit('removerSubstituicao', sub); }
    }
}
</script>
<style scoped>
.cursor-pointer { cursor: pointer; }
</style>