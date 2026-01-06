/**
 * Utilitário para geração de tabelas de jogos.
 */

function gerarRoundRobin(times, turnos) {
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

// NOVA FUNÇÃO: Gera o cruzamento inicial do Mata-Mata vindo de Grupos
export function gerarJogosMataMataDeGrupos(classificadosPorGrupo, turnos, rodadaAtualMax) {
    // classificadosPorGrupo: Objeto onde a chave é o nome do grupo e o valor é array de times ordenados
    // Ex: { 'Grupo A': [1ºA, 2ºA], 'Grupo B': [1ºB, 2ºB] }
    
    const nomesGrupos = Object.keys(classificadosPorGrupo).sort();
    const timesCruzados = [];

    // Lógica de Cruzamento Olímpico (1º de um x 2º do outro)
    // Agrupamos grupos vizinhos: A x B, C x D, etc.
    for (let i = 0; i < nomesGrupos.length; i += 2) {
        const g1 = classificadosPorGrupo[nomesGrupos[i]];     // Ex: Grupo A
        const g2 = classificadosPorGrupo[nomesGrupos[i+1]];   // Ex: Grupo B

        if (g1 && g2) {
            // Assume que g1 e g2 tem o mesmo tamanho de classificados (ex: 2 cada)
            // 1º A x 2º B
            if (g1[0] && g2[1]) {
                timesCruzados.push(g1[0]);
                timesCruzados.push(g2[1]);
            }
            // 1º B x 2º A
            if (g2[0] && g1[1]) {
                timesCruzados.push(g2[0]);
                timesCruzados.push(g1[1]);
            }
            // Se classificam mais de 2, a lógica teria que expandir, mas por hora foca nisso
        }
    }

    // Se não gerou nada (ex: grupos ímpares ou só 1 classificado), faz um fallback simples
    if (timesCruzados.length === 0) {
        const flatTimes = Object.values(classificadosPorGrupo).flat();
        // Apenas para não quebrar, emparelha sequencial
        return gerarJogosProximaFaseMataMata(flatTimes, turnos, rodadaAtualMax);
    }

    const totalTimes = timesCruzados.length;
    let nomeNovaFase = '';
    if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else nomeNovaFase = 'Fase Eliminatória';

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(timesCruzados, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

export const gerarTabela = gerarRoundRobin;