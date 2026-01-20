import localforage from 'localforage';
import {
    gerarJogosPontosCorridos,
    gerarJogosProximaFaseMataMata,
    gerarJogosMataMataDeGrupos,
    gerarJogosMataMataSeedingGeral,
    gerarJogosFaseFinalPontosCorridos
} from '../utils/GeradorTabela.js';

// Configuração base
localforage.config({
    name: 'GeradorCampeonatoApp',
    storeName: 'dados_campeonato',
    description: 'Armazenamento Multi-Mundos'
});

// === CHAVES DO SISTEMA (Globais) ===
const SYSTEM_KEYS = {
    SLOTS: 'sys_available_slots', // Lista de mundos
    ACTIVE_SLOT: 'sys_active_slot_id' // ID do mundo ativo
};

// === CHAVES DE DADOS (Serão prefixadas) ===
const DATA_KEYS = {
    TIMES: 'lista_times',
    CAMPEONATOS: 'lista_campeonatos'
};

export default {
    // =================================================================
    // 1. GERENCIAMENTO DE SLOTS (MUNDOS) E MIGRAÇÃO
    // =================================================================

    async getActiveSlotId() {
        try {
            let activeId = await localforage.getItem(SYSTEM_KEYS.ACTIVE_SLOT);
            
            // Se activeId é null, significa que é a primeira vez rodando a versão Multi-Mundos
            if (activeId === null) {
                console.log("🔍 Nenhum slot ativo detectado. Verificando migração...");
                await this.inicializarSistemaSlots();
                activeId = 0; // Define o Slot 0 (Principal) como ativo após migrar
            }
            return activeId;
        } catch (e) {
            console.error("Erro ao obter Slot ID:", e);
            return 0; // Fallback de segurança
        }
    },

    async getSlots() {
        const slots = await localforage.getItem(SYSTEM_KEYS.SLOTS);
        return slots || [];
    },

    // --- LÓGICA DE MIGRAÇÃO (GARANTE COMPATIBILIDADE) ---
    async inicializarSistemaSlots() {
        console.log("⚙️ Inicializando sistema de Slots...");
        
        // 1. Tenta buscar os dados no formato antigo (Raiz)
        // Isso bate exatamente com o padrão que você enviou: "lista_campeonatos" e "lista_times"
        const timesAntigos = await localforage.getItem('lista_times');
        const campsAntigos = await localforage.getItem('lista_campeonatos');

        // 2. Cria a estrutura do Slot 0 (Mundo Principal)
        const slotPadrao = { 
            id: 0, 
            alias: 'Mundo Principal', 
            criadoEm: new Date().toISOString() 
        };
        
        // Salva a lista de slots e define o ativo
        await localforage.setItem(SYSTEM_KEYS.SLOTS, [slotPadrao]);
        await localforage.setItem(SYSTEM_KEYS.ACTIVE_SLOT, 0);

        // 3. Se existirem dados antigos, move para o prefixo "slot_0_"
        if (timesAntigos || campsAntigos) {
            console.log("📦 DADOS LEGADOS ENCONTRADOS. Migrando para Slot 0...");
            
            if (timesAntigos) {
                console.log(`--> Migrando ${timesAntigos.length} times.`);
                await localforage.setItem(`slot_0_${DATA_KEYS.TIMES}`, timesAntigos);
            }
            
            if (campsAntigos) {
                console.log(`--> Migrando ${campsAntigos.length} campeonatos.`);
                await localforage.setItem(`slot_0_${DATA_KEYS.CAMPEONATOS}`, campsAntigos);
            }
            
            // 4. Limpa as chaves antigas para evitar duplicidade e confusão futura
            // Opcional: Você pode comentar essas linhas se quiser manter um backup "fantasma" na raiz por enquanto
            await localforage.removeItem('lista_times');
            await localforage.removeItem('lista_campeonatos');
            
            console.log("✅ Migração concluída com sucesso.");
        } else {
            console.log("✨ Nenhum dado legado encontrado. Iniciando limpo.");
        }
    },

    // Cria um novo mundo
    async criarSlot(alias) {
        const slots = await this.getSlots();
        const newId = Date.now(); 
        
        const novoSlot = {
            id: newId,
            alias: alias,
            criadoEm: new Date().toISOString()
        };

        slots.push(novoSlot);
        await localforage.setItem(SYSTEM_KEYS.SLOTS, slots);
        return newId;
    },

    // Troca o mundo atual
    async trocarSlot(idSlot) {
        const slots = await this.getSlots();
        // Permite trocar se o slot existe OU se for o slot 0 (padrão)
        if (!slots.find(s => s.id === idSlot) && idSlot !== 0) return;

        await localforage.setItem(SYSTEM_KEYS.ACTIVE_SLOT, idSlot);
        window.location.reload(); // Recarrega para limpar memória do Vue
    },

    // Exclui um mundo
    async excluirSlot(idSlot) {
        const slots = await this.getSlots();
        const activeId = await this.getActiveSlotId();

        if (idSlot === activeId) {
            throw new Error("Não é possível excluir o mundo ativo. Troque de mundo antes.");
        }

        const novaLista = slots.filter(s => s.id !== idSlot);
        await localforage.setItem(SYSTEM_KEYS.SLOTS, novaLista);

        const prefixo = `slot_${idSlot}_`;
        await localforage.removeItem(prefixo + DATA_KEYS.TIMES);
        await localforage.removeItem(prefixo + DATA_KEYS.CAMPEONATOS);
    },

    async _getPrefix() {
        const id = await this.getActiveSlotId();
        return `slot_${id}_`;
    },

    // =================================================================
    // 2. MÉTODOS DE DADOS (TODOS AGORA USAM O PREFIXO)
    // =================================================================

    async getTimes() {
        const prefix = await this._getPrefix();
        const times = await localforage.getItem(prefix + DATA_KEYS.TIMES);
        return times || [];
    },

    async adicionarTime(novoTime) {
        const timesAtuais = await this.getTimes();
        const timeLimpo = JSON.parse(JSON.stringify(novoTime));
        timeLimpo.id = Date.now() + Math.random().toString(36).substr(2, 9);
        timesAtuais.push(timeLimpo);
        
        const prefix = await this._getPrefix();
        return await localforage.setItem(prefix + DATA_KEYS.TIMES, timesAtuais);
    },

    async getTimeById(id) {
        const times = await this.getTimes();
        return times.find(t => t.id == id);
    },

    async atualizarTime(timeAtualizado) {
        const times = await this.getTimes();
        const index = times.findIndex(t => t.id == timeAtualizado.id);
        const prefix = await this._getPrefix();

        if (index !== -1) {
            times[index] = JSON.parse(JSON.stringify(timeAtualizado));
            return await localforage.setItem(prefix + DATA_KEYS.TIMES, times);
        } else {
            throw new Error("Time não encontrado");
        }
    },

    async limparTimes() {
        const prefix = await this._getPrefix();
        return await localforage.removeItem(prefix + DATA_KEYS.TIMES);
    },

    // --- CAMPEONATOS ---

    async getCampeonatos() {
        const prefix = await this._getPrefix();
        const camps = await localforage.getItem(prefix + DATA_KEYS.CAMPEONATOS);
        return camps || [];
    },

    async getCampeonatoById(id) {
        const lista = await this.getCampeonatos();
        const camp = lista.find(c => String(c.id) === String(id));
        if (camp && camp.jogos) {
            camp.jogos.sort((a, b) => a.rodada - b.rodada);
        }
        return camp;
    },

    async adicionarCampeonato(dadosBasicos) {
        const idCampeonato = Date.now();
        let tabelaJogos = [];

        if (dadosBasicos.jogos && dadosBasicos.jogos.length > 0) {
            tabelaJogos = dadosBasicos.jogos;
        } else {
            tabelaJogos = gerarJogosPontosCorridos(dadosBasicos.times, dadosBasicos.turnos);
        }

        tabelaJogos = tabelaJogos.map(jogo => ({
            ...jogo,
            campeonatoId: idCampeonato
        }));

        const novoCampeonato = {
            id: idCampeonato,
            nome: dadosBasicos.nome,
            tipo: dadosBasicos.tipo || 'PONTOS_CORRIDOS',
            turnos: parseInt(dadosBasicos.turnos) || 1, 
            tipoClassificacao: dadosBasicos.tipoClassificacao,
            modoDefinicao: dadosBasicos.modoDefinicao,
            
            // Dados de Grupos
            grupos: dadosBasicos.grupos || [],
            classificadosPorGrupo: parseInt(dadosBasicos.classificadosPorGrupo) || 2,
            usarRepescagem: dadosBasicos.usarRepescagem || false,
            modoKnockout: dadosBasicos.modoKnockout || 'PADRAO',

            // === CORREÇÃO: ADICIONANDO OS CAMPOS QUE FALTAVAM ===
            turnosFaseFinal: dadosBasicos.turnosFaseFinal ? parseInt(dadosBasicos.turnosFaseFinal) : null,
            qtdClassificados: dadosBasicos.qtdClassificados ? parseInt(dadosBasicos.qtdClassificados) : null,
            zerarPontos: dadosBasicos.zerarPontos !== undefined ? Boolean(dadosBasicos.zerarPontos) : false,
            // ====================================================

            dataCriacao: new Date().toISOString(),
            status: 'EM_ANDAMENTO',
            timesParticipantes: JSON.parse(JSON.stringify(dadosBasicos.times)),
            jogos: JSON.parse(JSON.stringify(tabelaJogos))
        };

        const lista = await this.getCampeonatos();
        lista.push(novoCampeonato);
        
        const prefix = await this._getPrefix();
        await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, lista);

        return idCampeonato;
    },

    async atualizarCampeonato(campAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const index = listaCamps.findIndex(c => String(c.id) === String(campAtualizado.id));
        const prefix = await this._getPrefix();

        if (index !== -1) {
            listaCamps[index] = JSON.parse(JSON.stringify(campAtualizado));
            await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Campeonato não encontrado");
        }
    },

    async atualizarJogo(idCampeonato, jogoAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));
        const prefix = await this._getPrefix(); 

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];
        const indexJogo = campeonato.jogos.findIndex(j => j.id == jogoAtualizado.id);

        if (indexJogo !== -1) {
            campeonato.jogos[indexJogo] = JSON.parse(JSON.stringify(jogoAtualizado));
            await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Jogo não encontrado neste campeonato");
        }
    },

    async avancarFaseMataMata(idCampeonato, vencedores) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));
        const prefix = await this._getPrefix();

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);

        let novosJogos = gerarJogosProximaFaseMataMata(vencedores, campeonato.turnos, maxRodada);
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));

        campeonato.jogos = [...campeonato.jogos, ...novosJogos];
        
        await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, listaCamps);
        return true;
    },

    async avancarGruposParaMataMata(idCampeonato, classificadosPorGrupo) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));
        const prefix = await this._getPrefix();

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);

        let novosJogos = gerarJogosMataMataDeGrupos(classificadosPorGrupo, campeonato.turnos, maxRodada);
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));

        campeonato.jogos = [...campeonato.jogos, ...novosJogos];

        await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, listaCamps);
        return true;
    },

    async avancarGruposComSeeding(idCampeonato, listaFinalTimes) {
        const campeonato = await this.getCampeonatoById(idCampeonato);
        if (!campeonato) throw new Error("Campeonato não encontrado");
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);
        
        let novosJogos = gerarJogosMataMataSeedingGeral(listaFinalTimes, campeonato.turnos, maxRodada);
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));
        
        campeonato.jogos = [...campeonato.jogos, ...novosJogos];
        await this.atualizarCampeonato(campeonato);
        return true;
    },

    // =================================================================
    // 3. PERSISTÊNCIA, BACKUP E UTILITÁRIOS
    // =================================================================

    // [CORREÇÃO] Esta função foi restaurada para evitar o erro no App.vue
    async solicitarPersistencia() {
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted = await navigator.storage.persisted();
            if (isPersisted) {
                console.log("✅ Armazenamento já é persistente.");
                return true;
            }

            const granted = await navigator.storage.persist();
            if (granted) {
                console.log("✅ Permissão de persistência concedida!");
            } else {
                console.warn("⚠️ Permissão de persistência negada ou não atendida pelo navegador.");
            }
            return granted;
        } else {
            console.log("ℹ️ API de persistência não suportada neste navegador.");
            return false;
        }
    },

    // [CORREÇÃO] Função restaurada
    async verificarEspaco() {
        if (navigator.storage && navigator.storage.estimate) {
            const { usage, quota } = await navigator.storage.estimate();
            const usoMB = (usage / 1024 / 1024).toFixed(2);
            const totalMB = (quota / 1024 / 1024).toFixed(2);
            const porcentagem = ((usage / quota) * 100).toFixed(2);

            console.log(`📊 Uso de Disco: ${usoMB}MB de ${totalMB}MB (${porcentagem}%)`);
            return { usoMB, totalMB, porcentagem };
        }
        return null;
    },

    async resetarBanco() {
        await localforage.clear();
        window.location.reload();
    },
    
    async exportarBackup() {
        try {
            const slots = await this.getSlots();
            const activeId = await this.getActiveSlotId();
            
            const fullData = {
                version: '2.0',
                dataExportacao: new Date().toISOString(),
                slots: slots,
                activeSlotId: activeId,
                data: {} 
            };

            for (const slot of slots) {
                const prefix = `slot_${slot.id}_`;
                fullData.data[slot.id] = {
                    times: await localforage.getItem(prefix + DATA_KEYS.TIMES) || [],
                    campeonatos: await localforage.getItem(prefix + DATA_KEYS.CAMPEONATOS) || []
                };
            }

            return JSON.stringify(fullData, null, 2);
        } catch (error) {
            console.error("Erro ao gerar backup:", error);
            throw new Error("Falha ao exportar dados.");
        }
    },

    async importarBackup(jsonString, modo = 'SUBSTITUIR') {
        try {
            const dados = JSON.parse(jsonString);

            if (modo === 'SUBSTITUIR') {
                await localforage.clear();
            }

            // Compatibilidade com Backup V1 (sem slots)
            if (!dados.version || dados.version === '1.0') {
                const slotId = 0;
                let slots = await this.getSlots();
                if (!slots.find(s => s.id === slotId)) {
                    slots.push({ id: slotId, alias: 'Importado V1', criadoEm: new Date().toISOString() });
                    await localforage.setItem(SYSTEM_KEYS.SLOTS, slots);
                }
                
                const prefix = `slot_${slotId}_`;
                await localforage.setItem(prefix + DATA_KEYS.TIMES, dados.times || []);
                await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, dados.campeonatos || []);
                await localforage.setItem(SYSTEM_KEYS.ACTIVE_SLOT, slotId);
            } 
            // Backup V2 (Multi-Slots)
            else {
                await localforage.setItem(SYSTEM_KEYS.SLOTS, dados.slots);
                await localforage.setItem(SYSTEM_KEYS.ACTIVE_SLOT, dados.activeSlotId);
                
                for (const slotId in dados.data) {
                    const content = dados.data[slotId];
                    const prefix = `slot_${slotId}_`;
                    await localforage.setItem(prefix + DATA_KEYS.TIMES, content.times);
                    await localforage.setItem(prefix + DATA_KEYS.CAMPEONATOS, content.campeonatos);
                }
            }
            
            return true;
        } catch (error) {
            console.error("Erro ao importar backup:", error);
            throw error;
        }
    },

    async avancarLigaParaFaseFinal(idCampeonato, timesClassificados) {
        const campeonato = await this.getCampeonatoById(idCampeonato);
        if (!campeonato) throw new Error("Campeonato não encontrado");

        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);
        const turnosFinal = parseInt(campeonato.turnosFaseFinal) || 1;

        let novosJogos = gerarJogosFaseFinalPontosCorridos(timesClassificados, turnosFinal, maxRodada);
        
        // Vincula ID
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));
        
        campeonato.jogos = [...campeonato.jogos, ...novosJogos];
        
        // Atualiza status se necessário ou marca flag interna
        // campeonato.faseAtual = 'Fase Final'; 

        await this.atualizarCampeonato(campeonato);
        return true;
    }
};