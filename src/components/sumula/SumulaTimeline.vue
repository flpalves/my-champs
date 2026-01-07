<template>
    <BCard title="Histórico da Partida" class="shadow-sm bg-dark text-white border-secondary">
        <div v-if="timeline.length === 0" class="text-center text-muted py-4">
            Nenhum evento registrado ainda.
        </div>
        <div v-else class="timeline-container">
            <div v-for="(evento, index) in timeline" :key="evento.id" class="d-flex align-items-center mb-3 border-bottom border-secondary pb-2">
                
                <div class="me-3 text-center" style="width: 40px;">
                    <div class="fs-4">{{ getIcone(evento) }}</div>
                    <small class="text-muted" style="font-size: 0.7rem;">{{ index + 1 }}º</small>
                </div>

                <div class="flex-grow-1">
                    <div v-if="evento.tipo !== 'SUBS'">
                        <strong>{{ getDescricao(evento.tipo) }}</strong>
                        <div class="small">
                            {{ evento.jogador?.nome || 'Desconhecido' }} 
                            <span class="badge bg-secondary ms-1">#{{ evento.jogador?.numero }}</span>
                        </div>
                        <div class="small text-muted">{{ getNomeTime(evento.timeId) }}</div>
                    </div>

                    <div v-else>
                        <strong>Substituição</strong>
                        <div class="small text-danger">⬇ Sai: {{ evento.sai?.nome }} (#{{ evento.sai?.numero }})</div>
                        <div class="small text-success">⬆ Entra: {{ evento.entra?.nome }} (#{{ evento.entra?.numero }})</div>
                        <div class="small text-muted">{{ getNomeTime(evento.timeId) }}</div>
                    </div>
                </div>

                <BButton size="sm" variant="outline-danger" class="ms-2" 
                         @click="$emit('remover', evento)" title="Remover evento">
                    🗑️
                </BButton>
            </div>
        </div>
    </BCard>
</template>

<script>
import { BCard, BButton } from 'bootstrap-vue-next';

export default {
    components: { BCard, BButton },
    props: ['eventos', 'substituicoes', 'timeA', 'timeB'],
    emits: ['remover'],
    computed: {
        timeline() {
            const evs = (this.eventos || []).map(e => ({ ...e, categoria: 'EVENTO' }));
            const subs = (this.substituicoes || []).map(s => ({ ...s, tipo: 'SUBS', categoria: 'SUBS' }));
            return [...evs, ...subs].sort((a, b) => a.id - b.id);
        }
    },
    methods: {
        getIcone(ev) {
            const icons = { GOL: '⚽', AMARELO: '🟨', VERMELHO: '🟥', CRAQUE: '⭐', SUBS: '🔄' };
            return icons[ev.tipo] || '•';
        },
        getDescricao(t) {
            const desc = { GOL: 'Gol Marcado', AMARELO: 'Cartão Amarelo', VERMELHO: 'Cartão Vermelho', CRAQUE: 'Eleito Craque' };
            return desc[t] || t;
        },
        getNomeTime(id) {
            if (id == this.timeA.id) return this.timeA.nome;
            if (id == this.timeB.id) return this.timeB.nome;
            return '';
        }
    }
}
</script>