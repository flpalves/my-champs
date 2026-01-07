<template>
    <BRow>
        <BCol md="6" class="mb-4">
            <BCard :title="`Uniforme: ${timeFullA.nome || 'Time A'}`" class="h-100 bg-dark text-white border-secondary">
                
                <div v-if="!timeFullA.cores || timeFullA.cores.length === 0" class="text-muted small">
                    Nenhuma cor cadastrada. <br>
                    <router-link :to="`/editar-clube/${timeFullA.id}`" class="text-info">Editar Clube</router-link>
                </div>

                <div v-else class="d-flex flex-wrap gap-3">
                    <div v-for="(cor, idx) in timeFullA.cores" :key="idx" 
                         class="color-option p-2 border border-secondary rounded cursor-pointer"
                         :class="{ 'border-primary bg-secondary shadow-sm': isSel(cor, 'A') }"
                         @click="$emit('selecionar', cor, 'A')">
                        
                        <div class="color-badge mx-auto" 
                             :style="{ backgroundColor: cor.interno, borderColor: cor.externo }">
                        </div>
                        <div class="text-center small mt-1">Opção {{ idx + 1 }}</div>
                    </div>
                </div>
            </BCard>
        </BCol>

        <BCol md="6" class="mb-4">
            <BCard :title="`Uniforme: ${timeFullB.nome || 'Time B'}`" class="h-100 bg-dark text-white border-secondary">
                
                <div v-if="!timeFullB.cores || timeFullB.cores.length === 0" class="text-muted small">
                    Nenhuma cor cadastrada. <br>
                    <router-link :to="`/editar-clube/${timeFullB.id}`" class="text-info">Editar Clube</router-link>
                </div>

                <div v-else class="d-flex flex-wrap gap-3">
                    <div v-for="(cor, idx) in timeFullB.cores" :key="idx" 
                         class="color-option p-2 border border-secondary rounded cursor-pointer"
                         :class="{ 'border-primary bg-secondary shadow-sm': isSel(cor, 'B') }"
                         @click="$emit('selecionar', cor, 'B')">
                        
                        <div class="color-badge mx-auto" 
                             :style="{ backgroundColor: cor.interno, borderColor: cor.externo }">
                        </div>
                        <div class="text-center small mt-1">Opção {{ idx + 1 }}</div>
                    </div>
                </div>
            </BCard>
        </BCol>
    </BRow>
</template>

<script>
import { BRow, BCol, BCard } from 'bootstrap-vue-next';

export default {
    name: 'SumulaUniformes',
    components: { BRow, BCol, BCard },
    props: ['uniformeA', 'uniformeB', 'timeFullA', 'timeFullB'],
    emits: ['selecionar'],
    methods: {
        isSel(cor, lado) {
            const selecionado = lado === 'A' ? this.uniformeA : this.uniformeB;
            if (!selecionado) return false;
            // Compara as cores para saber se é o item ativo
            return selecionado.interno === cor.interno && selecionado.externo === cor.externo;
        }
    }
}
</script>

<style scoped>
.color-badge { 
    width: 40px; 
    height: 40px; 
    border-radius: 50%; 
    border-style: solid; 
    border-width: 8px; 
}
.cursor-pointer { 
    cursor: pointer; 
    transition: transform 0.2s;
}
.cursor-pointer:hover {
    transform: scale(1.05);
}
</style>