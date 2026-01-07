<template>
    <BRow>
        <BCol md="6" class="mb-4">
            <BCard :title="`Substituição - ${timeA.nome}`" class="h-100 bg-dark text-white border-secondary">
                
                <BFormGroup label="Sai (Em campo):" class="mb-2 text-white-50">
                    <BFormSelect v-model="subTempA.saiId" class="bg-secondary text-white border-secondary">
                        <option :value="null">Selecione...</option>
                        <option v-for="j in getCampo(elencoA, titularesA, timeA.id)" :key="getId(j)" :value="getId(j)">
                            #{{ j.numero }} - {{ j.nome }}
                        </option>
                    </BFormSelect>
                </BFormGroup>

                <BFormGroup label="Entra (Banco):" class="mb-3 text-white-50">
                    <BFormSelect v-model="subTempA.entraId" class="bg-secondary text-white border-secondary">
                        <option :value="null">Selecione...</option>
                        <option v-for="j in getBanco(elencoA, titularesA, timeA.id)" :key="getId(j)" :value="getId(j)">
                            #{{ j.numero }} - {{ j.nome }}
                        </option>
                    </BFormSelect>
                </BFormGroup>

                <BButton variant="success" class="w-100" @click="$emit('realizarSubstituicao', 'A')" 
                    :disabled="!subTempA.saiId || !subTempA.entraId">
                    🔄 Confirmar Substituição
                </BButton>

                <hr v-if="getSubs(timeA.id).length > 0" class="border-secondary">
                
                <ul class="list-unstyled small mb-0">
                    <li v-for="(s, idx) in getSubs(timeA.id)" :key="idx" class="d-flex justify-content-between border-bottom border-secondary py-1">
                        <span class="text-danger">⬇ {{ s.sai?.nome }} (#{{ s.sai?.numero }})</span>
                        <span class="text-success">⬆ {{ s.entra?.nome }} (#{{ s.entra?.numero }})</span>
                        <span class="text-muted cursor-pointer" @click="$emit('removerSubstituicao', s)">❌</span>
                    </li>
                </ul>
            </BCard>
        </BCol>

        <BCol md="6" class="mb-4">
            <BCard :title="`Substituição - ${timeB.nome}`" class="h-100 bg-dark text-white border-secondary">
                
                <BFormGroup label="Sai (Em campo):" class="mb-2 text-white-50">
                    <BFormSelect v-model="subTempB.saiId" class="bg-secondary text-white border-secondary">
                        <option :value="null">Selecione...</option>
                        <option v-for="j in getCampo(elencoB, titularesB, timeB.id)" :key="getId(j)" :value="getId(j)">
                            #{{ j.numero }} - {{ j.nome }}
                        </option>
                    </BFormSelect>
                </BFormGroup>

                <BFormGroup label="Entra (Banco):" class="mb-3 text-white-50">
                    <BFormSelect v-model="subTempB.entraId" class="bg-secondary text-white border-secondary">
                        <option :value="null">Selecione...</option>
                        <option v-for="j in getBanco(elencoB, titularesB, timeB.id)" :key="getId(j)" :value="getId(j)">
                            #{{ j.numero }} - {{ j.nome }}
                        </option>
                    </BFormSelect>
                </BFormGroup>

                <BButton variant="success" class="w-100" @click="$emit('realizarSubstituicao', 'B')" 
                    :disabled="!subTempB.saiId || !subTempB.entraId">
                    🔄 Confirmar Substituição
                </BButton>

                <hr v-if="getSubs(timeB.id).length > 0" class="border-secondary">
                
                <ul class="list-unstyled small mb-0">
                    <li v-for="(s, idx) in getSubs(timeB.id)" :key="idx" class="d-flex justify-content-between border-bottom border-secondary py-1">
                        <span class="text-danger">⬇ {{ s.sai?.nome }} (#{{ s.sai?.numero }})</span>
                        <span class="text-success">⬆ {{ s.entra?.nome }} (#{{ s.entra?.numero }})</span>
                        <span class="text-muted cursor-pointer" @click="$emit('removerSubstituicao', s)">❌</span>
                    </li>
                </ul>
            </BCard>
        </BCol>
    </BRow>
</template>

<script>
import { BRow, BCol, BCard, BFormGroup, BFormSelect, BButton } from 'bootstrap-vue-next';

export default {
    name: 'SumulaSubstituicoes',
    components: { BRow, BCol, BCard, BFormGroup, BFormSelect, BButton },
    props: [
        'timeA', 'timeB', 
        'elencoA', 'elencoB', 
        'titularesA', 'titularesB', 
        'substituicoes', 
        'subTempA', 'subTempB'
    ],
    emits: ['realizarSubstituicao', 'removerSubstituicao'],
    methods: {
        getId(j) { return j.id || j.numero },
        
        getSubs(timeId) {
            return (this.substituicoes || []).filter(s => s.timeId == timeId);
        },

        getCampo(elenco, titulares, timeId) {
            // IDs de quem começou jogando
            const idsTitulares = (titulares || []).map(t => t?.id).filter(id => id);
            
            // Histórico de substituições do time
            const subs = this.getSubs(timeId);
            const idsSairam = subs.map(s => s.sai?.id).filter(id => id);
            const idsEntraram = subs.map(s => s.entra?.id).filter(id => id);

            // Quem está em campo = (Titulares que não saíram) + (Reservas que entraram e não saíram)
            const idsEmCampo = [
                ...idsTitulares.filter(id => !idsSairam.includes(id)),
                ...idsEntraram.filter(id => !idsSairam.includes(id))
            ];
            
            return elenco.filter(j => idsEmCampo.includes(this.getId(j)));
        },

        getBanco(elenco, titulares, timeId) {
            const idsTitulares = (titulares || []).map(t => t?.id).filter(id => id);
            const subs = this.getSubs(timeId);
            // Quem já entrou em campo (seja titular ou reserva que entrou) não está no banco disponível para entrar
            const idsEntraram = subs.map(s => s.entra?.id).filter(id => id);
            
            const idsIndisponiveis = [...idsTitulares, ...idsEntraram];
            
            // Banco = Elenco total MENOS quem já participou
            // (Nota: em regras oficiais, quem sai não volta. Se for regra de futsal/society onde pode voltar, a lógica mudaria aqui)
            return elenco.filter(j => !idsIndisponiveis.includes(this.getId(j)));
        }
    }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>