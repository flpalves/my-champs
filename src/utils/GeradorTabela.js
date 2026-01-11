/**
 * Utilitário para geração de tabelas de jogos.
 */

// ... (MANTENHA AS FUNÇÕES ANTERIORES: gerarRoundRobin, gerarJogosPontosCorridos, gerarJogosGrupos, gerarJogosMataMata, gerarJogosProximaFaseMataMata) ...
// ... Copie o conteúdo anterior até chegar na função gerarJogosMataMataDeGrupos ...

export function gerarRoundRobin(times, turnos) {
    let listaTimes = [...times];
    if (listaTimes.length % 2 !== 0) {
        listaTimes.push({ id: 'GHOST', nome: 'FOLGA' });
    }
    const totalTimes = listaTimes.length;
    const totalRodadas = totalTimes - 1;
    const jogosPorRodada = totalTimes / 2;
    let jogosGerados = [];
    for (let rodada = 0; rodada < totalRodadas; rodada++) {
        for (let i = 0; i < jogosPorRodada; i++) {
            const timeA = listaTimes[i];
            const timeB = listaTimes[totalTimes - 1 - i];
            if (timeA.id === 'GHOST' || timeB.id === 'GHOST') continue;
            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: rodada + 1,
                turno: 1,
                timeA: { id: timeA.id, nome: timeA.nome, escudo: timeA.escudo },
                timeB: { id: timeB.id, nome: timeB.nome, escudo: timeB.escudo },
                golsA: null, golsB: null, finalizado: false
            });
        }
        const ultimo = listaTimes.pop();
        listaTimes.splice(1, 0, ultimo);
    }
    if (turnos === 2) {
        const jogosReturno = jogosGerados.map(jogo => ({
            ...jogo,
            id: crypto.randomUUID(),
            rodada: jogo.rodada + totalRodadas,
            turno: 2,
            timeA: jogo.timeB,
            timeB: jogo.timeA,
            golsA: null, golsB: null, finalizado: false
        }));
        jogosGerados = [...jogosGerados, ...jogosReturno];
    }
    return jogosGerados.sort((a, b) => a.rodada - b.rodada);
}

export function gerarJogosPontosCorridos(times, turnos) {
    return gerarRoundRobin(times, turnos);
}

export function gerarJogosGrupos(grupos, turnos) {
    let todosJogos = [];
    grupos.forEach((grupo, idx) => {
        if (!grupo.times || grupo.times.length < 2) return;
        const jogosGrupo = gerarRoundRobin(grupo.times, turnos);
        const jogosFormatados = jogosGrupo.map(j => ({
            ...j,
            grupo: grupo.nome,
            grupoIndex: idx
        }));
        todosJogos = [...todosJogos, ...jogosFormatados];
    });
    return todosJogos;
}

export function gerarJogosMataMata(timesPareados, turnos, nomeFase = 'Fase 1', rodadaInicial = 1, confrontoIdInicial = 1) {
    const jogosGerados = [];
    let numeroConfronto = confrontoIdInicial;
    for (let i = 0; i < timesPareados.length; i += 2) {
        if (i + 1 >= timesPareados.length) break;
        const timeA = timesPareados[i];
        const timeB = timesPareados[i+1];
        jogosGerados.push({
            id: crypto.randomUUID(),
            rodada: rodadaInicial, 
            fase: nomeFase,
            confrontoId: numeroConfronto,
            turno: 1,
            timeA: { id: timeA.id, nome: timeA.nome, escudo: timeA.escudo },
            timeB: { id: timeB.id, nome: timeB.nome, escudo: timeB.escudo },
            golsA: null, golsB: null, finalizado: false
        });
        if (turnos === 2) {
           jogosGerados.push({
            id: crypto.randomUUID(),
            rodada: rodadaInicial + 1,
            fase: nomeFase,
            confrontoId: numeroConfronto,
            turno: 2,
            timeA: { id: timeB.id, nome: timeB.nome, escudo: timeB.escudo },
            timeB: { id: timeA.id, nome: timeA.nome, escudo: timeA.escudo },
            golsA: null, golsB: null, finalizado: false
          });
        }
        numeroConfronto++;
    }
    return jogosGerados;
}

export function gerarJogosProximaFaseMataMata(vencedores, turnos, rodadaAtualMax) {
    const totalTimes = vencedores.length;
    let nomeNovaFase = '';
    if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';
    else nomeNovaFase = `Fase de ${totalTimes}`;
    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now(); 
    return gerarJogosMataMata(vencedores, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

// === CORREÇÃO AQUI ===
export function gerarJogosMataMataDeGrupos(classificadosPorGrupo, turnos, rodadaAtualMax) {
    // classificadosPorGrupo: { 'Grupo A': [1º, 2º, 3º, 4º], 'Grupo B': [1º, 2º, 3º, 4º] }
    
    const nomesGrupos = Object.keys(classificadosPorGrupo).sort();
    const timesCruzados = [];

    // Agrupa grupos em pares (A x B, C x D)
    for (let i = 0; i < nomesGrupos.length; i += 2) {
        const nomeG1 = nomesGrupos[i];
        const nomeG2 = nomesGrupos[i+1];

        // Se tivermos um número ímpar de grupos, o último sobra (falha de segurança)
        if (!nomeG2) break;

        const g1 = classificadosPorGrupo[nomeG1]; // Times do Grupo A
        const g2 = classificadosPorGrupo[nomeG2]; // Times do Grupo B

        // Garante que ambos têm times classificados
        if (g1 && g2) {
            const qtd = Math.min(g1.length, g2.length);
            
            // Lógica de Cruzamento: 1º vs Último, 2º vs Penúltimo, etc.
            // Ex: Se classificam 4:
            // 1º A x 4º B
            // 2º A x 3º B
            // 3º A x 2º B
            // 4º A x 1º B
            
            // Vamos gerar os pares A vs B
            for (let k = 0; k < qtd; k++) {
                // Time do Grupo A (do topo para baixo)
                const timeA = g1[k]; 
                // Time do Grupo B (do fundo para cima para cruzar forças)
                const timeB = g2[qtd - 1 - k];

                if (timeA && timeB) {
                    timesCruzados.push(timeA);
                    timesCruzados.push(timeB);
                }
            }
        }
    }

    if (timesCruzados.length === 0) {
        // Fallback: Se algo der errado (ex: 1 grupo só), joga todos num pote
        const flatTimes = Object.values(classificadosPorGrupo).flat();
        return gerarJogosProximaFaseMataMata(flatTimes, turnos, rodadaAtualMax);
    }

    const totalTimes = timesCruzados.length;
    let nomeNovaFase = '';
    if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';
    else nomeNovaFase = `Fase de ${totalTimes}`;

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(timesCruzados, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

export const gerarTabela = gerarRoundRobin;