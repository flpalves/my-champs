import localforage from 'localforage';
import {
    gerarJogosPontosCorridos,
    gerarJogosProximaFaseMataMata,
    gerarJogosMataMataDeGrupos
} from '../utils/GeradorTabela.js';

// Configuração inicial do Banco
localforage.config({
    name: 'GeradorCampeonatoApp',
    storeName: 'dados_campeonato',
    description: 'Armazenamento de times e campeonatos'
});

// Chaves para organizar os dados
// ATENÇÃO: Removemos a lista_jogos para forçar o armazenamento embutido
const KEYS = {
    TIMES: 'lista_times',
    CAMPEONATOS: 'lista_campeonatos'
};

export default {
    // =================================================================
    // MÉTODOS PARA TIMES
    // =================================================================

    async getTimes() {
        const times = await localforage.getItem(KEYS.TIMES);
        return times || [];
    },

    async adicionarTime(novoTime) {
        const timesAtuais = await this.getTimes();
        const timeLimpo = JSON.parse(JSON.stringify(novoTime));
        timeLimpo.id = Date.now() + Math.random().toString(36).substr(2, 9);
        timesAtuais.push(timeLimpo);
        return await localforage.setItem(KEYS.TIMES, timesAtuais);
    },

    async getTimeById(id) {
        const times = await this.getTimes();
        return times.find(t => t.id == id);
    },

    async atualizarTime(timeAtualizado) {
        const times = await this.getTimes();
        const index = times.findIndex(t => t.id == timeAtualizado.id);

        if (index !== -1) {
            times[index] = JSON.parse(JSON.stringify(timeAtualizado));
            return await localforage.setItem(KEYS.TIMES, times);
        } else {
            throw new Error("Time não encontrado");
        }
    },

    async limparTimes() {
        return await localforage.removeItem(KEYS.TIMES);
    },

    // =================================================================
    // MÉTODOS PARA CAMPEONATOS (JOGOS EMBUTIDOS)
    // =================================================================

    async getCampeonatos() {
        const camps = await localforage.getItem(KEYS.CAMPEONATOS);
        return camps || [];
    },

    async getCampeonatoById(id) {
        const lista = await this.getCampeonatos();
        // Retorna o objeto campeonato completo (que já contém os jogos dentro)
        const camp = lista.find(c => String(c.id) === String(id));

        // Garante a ordenação dos jogos se eles existirem
        if (camp && camp.jogos) {
            camp.jogos.sort((a, b) => a.rodada - b.rodada);
        }

        return camp;
    },

    async adicionarCampeonato(dadosBasicos) {
        const idCampeonato = Date.now();
        let tabelaJogos = [];

        // 1. Define os jogos (já vindos do front ou gerados agora)
        if (dadosBasicos.jogos && dadosBasicos.jogos.length > 0) {
            tabelaJogos = dadosBasicos.jogos;
        } else {
            // Caso contrário (Pontos Corridos padrão), gera aqui.
            tabelaJogos = gerarJogosPontosCorridos(dadosBasicos.times, dadosBasicos.turnos);
        }

        // 2. Vincula ID (apenas por segurança)
        tabelaJogos = tabelaJogos.map(jogo => ({
            ...jogo,
            campeonatoId: idCampeonato
        }));

        // 3. Monta o objeto completo
        const novoCampeonato = {
            id: idCampeonato,
            nome: dadosBasicos.nome,
            tipo: dadosBasicos.tipo || 'PONTOS_CORRIDOS',
            turnos: dadosBasicos.turnos,
            tipoClassificacao: dadosBasicos.tipoClassificacao,
            modoDefinicao: dadosBasicos.modoDefinicao,
            grupos: dadosBasicos.grupos || [],
            // Salva quantos classificam por grupo (importante para transição)
            classificadosPorGrupo: dadosBasicos.classificadosPorGrupo || 2,
            dataCriacao: new Date().toISOString(),
            status: 'EM_ANDAMENTO',
            timesParticipantes: JSON.parse(JSON.stringify(dadosBasicos.times)),
            // AQUI: Jogos salvos DENTRO do campeonato
            jogos: JSON.parse(JSON.stringify(tabelaJogos))
        };

        // 4. Salva na lista de campeonatos
        const lista = await this.getCampeonatos();
        lista.push(novoCampeonato);
        await localforage.setItem(KEYS.CAMPEONATOS, lista);

        return idCampeonato;
    },

    // ATUALIZAR JOGO (BUSCA DENTRO DO CAMPEONATO)
    async atualizarJogo(idCampeonato, jogoAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];

        // Encontra o jogo dentro do array .jogos do campeonato
        const indexJogo = campeonato.jogos.findIndex(j => j.id == jogoAtualizado.id);

        if (indexJogo !== -1) {
            campeonato.jogos[indexJogo] = JSON.parse(JSON.stringify(jogoAtualizado));

            // Salva a lista de campeonatos inteira novamente
            // Isso substitui o objeto antigo pelo novo (com o jogo atualizado dentro)
            await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Jogo não encontrado neste campeonato");
        }
    },

    // AVANÇAR FASE (MATA-MATA)
    async avancarFaseMataMata(idCampeonato, vencedores) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];

        // Descobre a última rodada
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);

        // Gera os novos jogos
        let novosJogos = gerarJogosProximaFaseMataMata(vencedores, campeonato.turnos, maxRodada);

        // Vincula ID
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));

        // Adiciona os novos jogos ao array existente DENTRO do campeonato
        campeonato.jogos = [...campeonato.jogos, ...novosJogos];

        // Salva tudo
        await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);

        return true;
    },

    // AVANÇAR GRUPOS -> MATA-MATA
    async avancarGruposParaMataMata(idCampeonato, classificadosPorGrupo) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);

        // Gera o cruzamento
        let novosJogos = gerarJogosMataMataDeGrupos(classificadosPorGrupo, campeonato.turnos, maxRodada);
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));

        // Adiciona os novos jogos
        campeonato.jogos = [...campeonato.jogos, ...novosJogos];

        // Salva
        await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);

        return true;
    },

    async resetarBanco() {
        await localforage.clear();
    },

    async exportarBackup() {
        try {
            const times = await this.getTimes();
            const campeonatos = await this.getCampeonatos();

            const backupData = {
                version: '1.0',
                dataExportacao: new Date().toISOString(),
                times: times,
                campeonatos: campeonatos
            };

            return JSON.stringify(backupData, null, 2);
        } catch (error) {
            console.error("Erro ao gerar backup:", error);
            throw new Error("Falha ao exportar dados.");
        }
    },

    /**
     * Importa dados.
     * @param {string} jsonString - O conteúdo do arquivo JSON
     * @param {string} modo - 'SUBSTITUIR' (limpa tudo antes) ou 'MESCLAR' (adiciona ao existente)
     */
    async importarBackup(jsonString, modo = 'SUBSTITUIR') {
        try {
            const dados = JSON.parse(jsonString);

            if (!Array.isArray(dados.times) || !Array.isArray(dados.campeonatos)) {
                throw new Error("Arquivo de backup inválido ou corrompido.");
            }

            let timesFinais = [];
            let campeonatosFinais = [];

            if (modo === 'MESCLAR') {
                // 1. Recupera dados atuais do banco
                const timesAtuais = await this.getTimes();
                const campeonatosAtuais = await this.getCampeonatos();

                // 2. Mescla Times (Usando Map para evitar duplicidade de ID)
                // A ordem importa: primeiro os atuais, depois os novos sobrescrevem se ID for igual
                const mapaTimes = new Map();
                timesAtuais.forEach(t => mapaTimes.set(String(t.id), t));
                dados.times.forEach(t => mapaTimes.set(String(t.id), t));

                timesFinais = Array.from(mapaTimes.values());

                // 3. Mescla Campeonatos
                const mapaCamps = new Map();
                campeonatosAtuais.forEach(c => mapaCamps.set(String(c.id), c));
                dados.campeonatos.forEach(c => mapaCamps.set(String(c.id), c));

                campeonatosFinais = Array.from(mapaCamps.values());

            } else {
                // Modo SUBSTITUIR: Usa apenas os dados do arquivo
                await localforage.clear(); // Limpa tudo antes
                timesFinais = dados.times;
                campeonatosFinais = dados.campeonatos;
            }

            // Salva os dados finais
            await localforage.setItem(KEYS.TIMES, timesFinais);
            await localforage.setItem(KEYS.CAMPEONATOS, campeonatosFinais);

            return true;
        } catch (error) {
            console.error("Erro ao importar backup:", error);
            throw error;
        }
    },
    async atualizarCampeonato(campAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const index = listaCamps.findIndex(c => String(c.id) === String(campAtualizado.id));

        if (index !== -1) {
            listaCamps[index] = JSON.parse(JSON.stringify(campAtualizado));
            await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Campeonato não encontrado");
        }
    },
};