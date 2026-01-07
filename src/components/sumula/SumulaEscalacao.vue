<template>
    <div>
        <div class="alert alert-info bg-dark border-info text-info small mb-3">
            <i class="bi bi-info-circle"></i> Selecione os jogadores que iniciarão a partida como titulares.
        </div>
        
        <BRow>
            <BCol md="6" class="mb-3">
                <div class="escalacao-panel h-100 p-3 rounded border border-secondary bg-surface">
                    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                        <h6 class="mb-0 fw-bold text-white text-uppercase">{{ timeA.nome }}</h6>
                        <div class="btn-group">
                            <BButton size="sm" variant="outline-success" class="py-0" @click="$emit('selecionarTodos', 'A')">Todos</BButton>
                            <BButton size="sm" variant="outline-secondary" class="py-0" @click="$emit('selecionarNenhum', 'A')">Nenhum</BButton>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted">Relacionados:</span>
                        <span class="badge bg-primary">{{ titularesA.length }} Titulares</span>
                    </div>

                    <div class="players-grid">
                        <template v-for="jogador in elencoA" :key="getId(jogador)">
                            <div v-if="jogador.nome" 
                                 class="player-card d-flex align-items-center p-2 mb-2 rounded cursor-pointer"
                                 :class="ehTitular(jogador, titularesA) ? 'selected-titular' : 'player-bench'"
                                 @click="$emit('toggleTitular', jogador, 'A')">
                                
                                <div class="checkbox-indicator me-3 d-flex align-items-center justify-content-center">
                                    <span v-if="ehTitular(jogador, titularesA)">✔</span>
                                </div>
                                <div class="player-number me-3 fw-bold">{{ jogador.numero }}</div>
                                <div class="player-name flex-grow-1 text-truncate">{{ jogador.nome }}</div>
                                <div v-if="ehTitular(jogador, titularesA)" class="badge bg-success small">T</div>
                            </div>
                        </template>
                    </div>
                    
                    <div v-if="elencoA.every(j => !j.nome)" class="text-center text-muted py-4 small">
                        Nenhum jogador cadastrado.
                    </div>
                </div>
            </BCol>

            <BCol md="6" class="mb-3">
                <div class="escalacao-panel h-100 p-3 rounded border border-secondary bg-surface">
                    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                        <h6 class="mb-0 fw-bold text-white text-uppercase">{{ timeB.nome }}</h6>
                        <div class="btn-group">
                            <BButton size="sm" variant="outline-success" class="py-0" @click="$emit('selecionarTodos', 'B')">Todos</BButton>
                            <BButton size="sm" variant="outline-secondary" class="py-0" @click="$emit('selecionarNenhum', 'B')">Nenhum</BButton>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted">Relacionados:</span>
                        <span class="badge bg-primary">{{ titularesB.length }} Titulares</span>
                    </div>

                    <div class="players-grid">
                        <template v-for="jogador in elencoB" :key="getId(jogador)">
                            <div v-if="jogador.nome" 
                                 class="player-card d-flex align-items-center p-2 mb-2 rounded cursor-pointer"
                                 :class="ehTitular(jogador, titularesB) ? 'selected-titular' : 'player-bench'"
                                 @click="$emit('toggleTitular', jogador, 'B')">
                                
                                <div class="checkbox-indicator me-3 d-flex align-items-center justify-content-center">
                                    <span v-if="ehTitular(jogador, titularesB)">✔</span>
                                </div>
                                <div class="player-number me-3 fw-bold">{{ jogador.numero }}</div>
                                <div class="player-name flex-grow-1 text-truncate">{{ jogador.nome }}</div>
                                <div v-if="ehTitular(jogador, titularesB)" class="badge bg-success small">T</div>
                            </div>
                        </template>
                    </div>

                    <div v-if="elencoB.every(j => !j.nome)" class="text-center text-muted py-4 small">
                        Nenhum jogador cadastrado.
                    </div>
                </div>
            </BCol>
        </BRow>
    </div>
</template>

<script>
import { BRow, BCol, BButton } from 'bootstrap-vue-next';

export default {
    name: 'SumulaEscalacao',
    components: { BRow, BCol, BButton },
    props: ['timeA', 'timeB', 'elencoA', 'elencoB', 'titularesA', 'titularesB'],
    emits: ['toggleTitular', 'selecionarTodos', 'selecionarNenhum'],
    methods: {
        getId(j) { 
            return j.id || j.numero 
        },
        ehTitular(jogador, listaTitulares) { 
            // Verifica se o jogador está na lista de titulares (snapshots)
            return listaTitulares.some(t => t?.id == this.getId(jogador)); 
        }
    }
}
</script>

<style scoped>
.bg-surface { background-color: #212529; }

.player-card { 
    transition: all 0.2s ease; 
    border: 1px solid transparent; 
}

/* Estado: Banco */
.player-bench { 
    background-color: #2c3035; 
    color: #adb5bd; 
    border-color: #373b3e; 
}
.player-bench:hover { 
    background-color: #343a40; 
    color: #fff; 
}

/* Estado: Titular */
.selected-titular { 
    background-color: rgba(25, 135, 84, 0.2); 
    border-color: #198754; 
    color: #fff; 
    font-weight: 500; 
}

/* Checkbox Fake */
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

/* Scrollbar */
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

.cursor-pointer { cursor: pointer; }
</style>