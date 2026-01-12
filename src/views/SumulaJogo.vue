<template>
    <div class="container mt-4 pb-5">
        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando..." />
        </div>

        <div v-else-if="!jogo">
            <BAlert show variant="danger">Jogo não encontrado.</BAlert>
            <BButton @click="voltar">Voltar</BButton>
        </div>

        <div v-else>
            <SumulaHeader 
                :rodada="jogo.rodada" 
                :timeA="jogo.timeA" :timeB="jogo.timeB" 
                :golsA="golsA" :golsB="golsB"
                :uniformeA="jogo.uniformeA" :uniformeB="jogo.uniformeB" 
                v-model:dataHora="jogo.dataHora"
                v-model:abaAtiva="abaAtiva"
                v-model:nota="jogo.nota" 
                @voltar="voltar" @salvar="salvarAlteracoes" @sharear="gerarShare"
            />
           
            <SocialShareModal v-model="modalShareAberto" :timeA="timeFullA" :timeB="timeFullB" :golsA="golsA"
                :golsB="golsB" :eventos="jogo.eventos" nomeCampeonato="My Champs" :rodada="jogo.rodada" 
                :estadio="timeFullA.estadio" :dataHora="jogo.dataHora" />

            <SumulaEventos v-if="abaAtiva === 'EVENTOS'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
                :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB" :jogo="jogo"
                v-model:ferramentaAtiva="ferramentaAtiva" @aplicar="aplicarAcao" />

            <SumulaTimeline v-if="abaAtiva === 'TIMELINE'" :eventos="jogo.eventos" :substituicoes="jogo.substituicoes"
                :timeA="jogo.timeA" :timeB="jogo.timeB" @remover="removerItemTimeline" />

            <SumulaEscalacao v-if="abaAtiva === 'ESCALACAO'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
                :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB"
                @toggleTitular="toggleTitular" @selecionarTodos="selecionarTodos"
                @selecionarNenhum="selecionarNenhum" />

            <SumulaSubstituicoes v-if="abaAtiva === 'SUBS'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
                :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB"
                :substituicoes="jogo.substituicoes" :subTempA="subTempA" :subTempB="subTempB"
                @realizarSubstituicao="realizarSubstituicao" @removerSubstituicao="removerSubstituicao" />

            <SumulaUniformes v-if="abaAtiva === 'UNIFORMES'" :timeA="jogo.timeA" :timeB="jogo.timeB"
                :uniformeA="jogo.uniformeA" :uniformeB="jogo.uniformeB" :timeFullA="timeFullA" :timeFullB="timeFullB"
                @selecionar="selecionarUniforme" />
        </div>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BSpinner, BButton, BAlert } from 'bootstrap-vue-next';

import SumulaHeader from '@/components/sumula/SumulaHeader.vue';
import SumulaEventos from '@/components/sumula/SumulaEventos.vue';
import SumulaTimeline from '@/components/sumula/SumulaTimeline.vue';
import SumulaEscalacao from '@/components/sumula/SumulaEscalacao.vue';
import SumulaSubstituicoes from '@/components/sumula/SumulaSubstituicoes.vue';
import SumulaUniformes from '@/components/sumula/SumulaUniformes.vue';
import SocialShareModal from '@/views/SocialShareModal.vue';

export default {
    name: 'SumulaJogo',
    components: {
        BSpinner, BButton, BAlert,
        SumulaHeader, SumulaEventos, SumulaTimeline,
        SumulaEscalacao, SumulaSubstituicoes, SumulaUniformes, SocialShareModal
    },
    data() {
        return {
            carregando: true,
            abaAtiva: 'EVENTOS',
            jogo: null,
            modalShareAberto: false,
            timeFullA: {}, timeFullB: {},
            elencoA: [], elencoB: [],
            ferramentaAtiva: null,
            idCampeonato: '', idJogo: '',
            subTempA: { saiId: null, entraId: null },
            subTempB: { saiId: null, entraId: null }
        }
    },
    computed: {
        golsA() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeA.id).length;
        },
        golsB() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeB.id).length;
        }
    },
    async mounted() {
        this.idCampeonato = this.$route.params.idCampeonato;
        this.idJogo = this.$route.params.idJogo;
        await this.carregarDados();
    },
    methods: {
        async carregarDados() {
            this.carregando = true;
            try {
                const camp = await DbService.getCampeonatoById(this.idCampeonato);
                if (!camp) throw new Error("Campeonato não encontrado");

                const jogoEncontrado = camp.jogos.find(j => String(j.id) === String(this.idJogo));
                if (!jogoEncontrado) throw new Error("Jogo não encontrado");

                // Inits
                jogoEncontrado.eventos = jogoEncontrado.eventos || [];
                jogoEncontrado.substituicoes = jogoEncontrado.substituicoes || [];
                jogoEncontrado.titularesA = jogoEncontrado.titularesA || [];
                jogoEncontrado.titularesB = jogoEncontrado.titularesB || [];
                jogoEncontrado.dataHora = jogoEncontrado.dataHora || '';
                jogoEncontrado.craque = jogoEncontrado.craque || null;
                jogoEncontrado.uniformeA = jogoEncontrado.uniformeA || null;
                jogoEncontrado.uniformeB = jogoEncontrado.uniformeB || null;
                
                // Inicializa a nota se não existir
                jogoEncontrado.nota = jogoEncontrado.nota || 0;

                const timeGlobalA = await DbService.getTimeById(jogoEncontrado.timeA.id);
                const timeGlobalB = await DbService.getTimeById(jogoEncontrado.timeB.id);

                const snapA = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeA.id) || {};
                const snapB = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeB.id) || {};

                this.timeFullA = timeGlobalA || snapA;
                this.timeFullB = timeGlobalB || snapB;

                if ((!jogoEncontrado.timeA.cores || jogoEncontrado.timeA.cores.length === 0) && this.timeFullA.cores) {
                    jogoEncontrado.timeA.cores = this.timeFullA.cores;
                }
                if ((!jogoEncontrado.timeB.cores || jogoEncontrado.timeB.cores.length === 0) && this.timeFullB.cores) {
                    jogoEncontrado.timeB.cores = this.timeFullB.cores;
                }

                this.elencoA = this.timeFullA.jogadores || [];
                this.elencoB = this.timeFullB.jogadores || [];

                this.jogo = jogoEncontrado;
            } catch (error) {
                console.error(error);
                alert("Erro ao carregar dados.");
            } finally {
                this.carregando = false;
            }
        },

        // --- Helpers ---
        getId(j) { return j.id || j.numero; },
        criarSnapshot(j) { return { id: this.getId(j), numero: j.numero, nome: j.nome }; },

        // --- Lógica Delegada ---
        async salvarAlteracoes() {
            this.jogo.golsA = this.golsA;
            this.jogo.golsB = this.golsB;
            this.jogo.finalizado = true;
            try {
                await DbService.atualizarJogo(this.idCampeonato, JSON.parse(JSON.stringify(this.jogo)));
            } catch (error) { console.error(error); }
        },

        selecionarUniforme(cor, lado) {
            if (lado === 'A') this.jogo.uniformeA = cor; else this.jogo.uniformeB = cor;
            this.salvarAlteracoes();
        },

        async aplicarAcao(jogador, timeId) {
            if (!this.ferramentaAtiva) return;
            const snapshot = this.criarSnapshot(jogador);

            if (this.ferramentaAtiva === 'CRAQUE') {
                if (this.jogo.craque && this.jogo.craque.id == snapshot.id && this.jogo.craqueTimeId == timeId) {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                } else {
                    this.jogo.craque = snapshot;
                    this.jogo.craqueTimeId = timeId;
                }
            } else {
                this.jogo.eventos.push({
                    id: Date.now(),
                    tipo: this.ferramentaAtiva,
                    jogador: snapshot,
                    jogadorId: snapshot.id,
                    timeId: timeId,
                    minuto: null
                });
            }
            await this.salvarAlteracoes();
        },

        async removerItemTimeline(item) {
            if (!confirm("Remover item?")) return;
            if (item.categoria === 'SUBS') {
                this.jogo.substituicoes = this.jogo.substituicoes.filter(s => s.id !== item.id);
            } else {
                this.jogo.eventos = this.jogo.eventos.filter(e => e.id !== item.id);
                if (item.tipo === 'CRAQUE') {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                }
            }
            await this.salvarAlteracoes();
        },
        async removerSubstituicao(sub) { this.removerItemTimeline(sub); },

        toggleTitular(jogador, lado) {
            const lista = lado === 'A' ? this.jogo.titularesA : this.jogo.titularesB;
            const jId = this.getId(jogador);
            const index = lista.findIndex(t => t?.id == jId);
            if (index !== -1) lista.splice(index, 1);
            else lista.push(this.criarSnapshot(jogador));
            this.salvarAlteracoes();
        },
        selecionarTodos(lado) {
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;
            const novos = elenco.map(j => this.criarSnapshot(j));
            if (lado === 'A') this.jogo.titularesA = novos; else this.jogo.titularesB = novos;
            this.salvarAlteracoes();
        },
        selecionarNenhum(lado) {
            if (lado === 'A') this.jogo.titularesA = []; else this.jogo.titularesB = [];
            this.salvarAlteracoes();
        },

        async realizarSubstituicao(lado) {
            const temp = lado === 'A' ? this.subTempA : this.subTempB;
            const timeId = lado === 'A' ? this.jogo.timeA.id : this.jogo.timeB.id;
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;

            const jogadorSai = elenco.find(j => this.getId(j) == temp.saiId);
            const jogadorEntra = elenco.find(j => this.getId(j) == temp.entraId);

            if (!jogadorSai || !jogadorEntra) return alert("Erro nos jogadores.");

            this.jogo.substituicoes.push({
                id: Date.now(),
                timeId: timeId,
                sai: this.criarSnapshot(jogadorSai),
                entra: this.criarSnapshot(jogadorEntra),
                minuto: null
            });
            temp.saiId = null; temp.entraId = null;
            await this.salvarAlteracoes();
        },
        gerarShare(){
            this.modalShareAberto = true;
        },

        voltar() { this.$router.push(`/campeonato/${this.idCampeonato}`); }
    }
}
</script>