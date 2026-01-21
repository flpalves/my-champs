<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-warning fw-bold mb-0">👑 Hall da Fama</h2>
        <BButton variant="outline-light" @click="$router.push('/')">Voltar</BButton>
    </div>

    <div v-if="carregando" class="text-center py-5">
        <BSpinner variant="warning" />
    </div>

    <div v-else-if="ranking.length === 0" class="text-center text-muted py-5">
        Nenhum campeonato encerrado com pontuação ainda.
    </div>

    <div v-else>
        <BCard class="shadow-sm border-warning bg-dark p-0 overflow-hidden">
            <BTableSimple hover responsive dark class="mb-0 align-middle">
                <BThead>
                    <BTr>
                        <BTh class="text-center">#</BTh>
                        <BTh>Clube</BTh>
                        <BTh class="text-center text-warning">Pontos</BTh>
                        <BTh class="text-center">🏆 Títulos</BTh>
                        <BTh class="text-center">🥈 Vices</BTh>
                        <BTh class="text-center">Participações</BTh>
                    </BTr>
                </BThead>
                <BTbody>
                    <BTr v-for="(time, idx) in ranking" :key="time.id">
                        <BTd class="text-center fw-bold">{{ idx + 1 }}º</BTd>
                        <BTd>
                            <img :src="time.escudo" width="30" class="me-2"> {{ time.nome }}
                        </BTd>
                        <BTd class="text-center fw-bold fs-5 text-warning">{{ time.pontos }}</BTd>
                        <BTd class="text-center">{{ time.titulos }}</BTd>
                        <BTd class="text-center">{{ time.vices }}</BTd>
                        <BTd class="text-center text-muted">{{ time.participacoes }}</BTd>
                    </BTr>
                </BTbody>
            </BTableSimple>
        </BCard>
    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BCard, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BSpinner, BButton } from 'bootstrap-vue-next';

export default {
    name: 'HallDaFama',
    components: { BCard, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BSpinner, BButton },
    data() { return { carregando: true, ranking: [] } },
    async mounted() {
        this.carregando = true;
        try {
            const camps = await DbService.getCampeonatos();
            const encerrados = camps.filter(c => c.status === 'ENCERRADO' && c.resultadosHall);
            
            const mapa = {};
            encerrados.forEach(c => {
                c.resultadosHall.forEach(res => {
                    if(!mapa[res.timeId]) mapa[res.timeId] = { id: res.timeId, nome: res.nome, escudo: res.escudo, pontos: 0, titulos: 0, vices: 0, participacoes: 0 };
                    const t = mapa[res.timeId];
                    t.pontos += (res.pontosHall || 0);
                    t.participacoes++;
                    
                    // Detecção simples baseada no nome do detalhe ou regra
                    if(String(res.detalhe).includes('1º') || String(res.detalhe).includes('CAMPEAO')) t.titulos++;
                    if(String(res.detalhe).includes('2º') || String(res.detalhe).includes('VICE')) t.vices++;
                });
            });
            this.ranking = Object.values(mapa).sort((a,b) => b.pontos - a.pontos || b.titulos - a.titulos);
        } catch(e) { console.error(e); } finally { this.carregando = false; }
    }
}
</script>