<template>
    <div>
        <div class="alert alert-info bg-dark border-info text-info small mb-3">
            <i class="bi bi-info-circle"></i> Selecione os jogadores que iniciarão a partida como titulares.
        </div>

        <BRow>
            <BCol md="6" class="mb-3">
                <EscalacaoCard :time="timeA" :elenco="elencoA" :titulares="titularesA" @toggle="toggle" @todos="todos"
                    @nenhum="nenhum" lado="A" />
            </BCol>
            <BCol md="6" class="mb-3">
                <EscalacaoCard :time="timeB" :elenco="elencoB" :titulares="titularesB" @toggle="toggle" @todos="todos"
                    @nenhum="nenhum" lado="B" />
            </BCol>
        </BRow>
    </div>
</template>

<script>
import { BRow, BCol, BButton } from 'bootstrap-vue-next';

// Sub-componente interno para evitar repetição
const EscalacaoCard = {
    props: ['time', 'elenco', 'titulares', 'lado'],
    emits: ['toggle', 'todos', 'nenhum'],
    methods: {
        getId(j) { return j.id || j.numero },
        ehTitular(j) { return this.titulares.some(t => t?.id == this.getId(j)); }
    },
    template: `
        <div class="escalacao-panel h-100 p-3 rounded border border-secondary bg-surface">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                <h6 class="mb-0 fw-bold text-white text-uppercase">{{ time.nome }}</h6>
                <div class="btn-group">
                    <BButton size="sm" variant="outline-success" class="py-0" @click="$emit('todos', lado)">Todos</BButton>
                    <BButton size="sm" variant="outline-secondary" class="py-0" @click="$emit('nenhum', lado)">Nenhum</BButton>
                </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small text-muted">Relacionados:</span>
                <span class="badge bg-primary">{{ titulares.length }} Titulares</span>
            </div>

            <div class="players-grid">
                <template v-for="jogador in elenco" :key="getId(jogador)">
                    <div v-if="jogador.nome" 
                            class="player-card d-flex align-items-center p-2 mb-2 rounded cursor-pointer"
                            :class="ehTitular(jogador) ? 'selected-titular' : 'player-bench'"
                            @click="$emit('toggle', jogador, lado)">
                        
                        <div class="checkbox-indicator me-3 d-flex align-items-center justify-content-center">
                            <span v-if="ehTitular(jogador)">✔</span>
                        </div>
                        <div class="player-number me-3 fw-bold">{{ jogador.numero }}</div>
                        <div class="player-name flex-grow-1 text-truncate">{{ jogador.nome }}</div>
                        <div v-if="ehTitular(jogador)" class="badge bg-success small">T</div>
                    </div>
                </template>
            </div>
            
            <div v-if="elenco.every(j => !j.nome)" class="text-center text-muted py-4 small">
                Nenhum jogador cadastrado.
            </div>
        </div>
    `,
    components: { BButton }
};

export default {
    components: { BRow, BCol, EscalacaoCard },
    props: ['timeA', 'timeB', 'elencoA', 'elencoB', 'titularesA', 'titularesB'],
    emits: ['toggleTitular', 'selecionarTodos', 'selecionarNenhum'],
    methods: {
        toggle(j, l) { this.$emit('toggleTitular', j, l); },
        todos(l) { this.$emit('selecionarTodos', l); },
        nenhum(l) { this.$emit('selecionarNenhum', l); }
    }
}
</script>

<style scoped>
.bg-surface {
    background-color: #212529;
}

.player-card {
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.player-bench {
    background-color: #2c3035;
    color: #adb5bd;
    border-color: #373b3e;
}

.player-bench:hover {
    background-color: #343a40;
    color: #fff;
}

.selected-titular {
    background-color: rgba(25, 135, 84, 0.2);
    border-color: #198754;
    color: #fff;
    font-weight: 500;
}

.checkbox-indicator {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid #6c757d;
    font-size: 12px;
    color: #fff;
}

.selected-titular .checkbox-indicator {
    background-color: #198754;
    border-color: #198754;
}

.player-number {
    width: 25px;
    text-align: center;
    font-family: monospace;
    font-size: 1.1em;
}

.players-grid {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 5px;
}

.players-grid::-webkit-scrollbar {
    width: 5px;
}

.players-grid::-webkit-scrollbar-thumb {
    background: #495057;
    border-radius: 3px;
}
</style>