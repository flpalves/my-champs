/**
 * Utilitário para geração de tabelas de jogos.
 */

// === FUNÇÕES BÁSICAS (Fase de Grupos / Pontos Corridos) ===

export function gerarRoundRobin(times, turnos) {
    let listaTimes = [...times];

    // Se impar, adiciona o time "fantasma" para folga
    if (listaTimes.length % 2 !== 0) {
        listaTimes.push({ id: 'GHOST', nome: 'FOLGA' });
    }

    const totalTimes = listaTimes.length;
    const totalRodadas = totalTimes - 1;
    const jogosPorRodada = totalTimes / 2;
    let jogosGerados = [];

    for (let rodada = 0; rodada < totalRodadas; rodada++) {
        for (let i = 0; i < jogosPorRodada; i++) {
            let t1 = listaTimes[i];
            let t2 = listaTimes[totalTimes - 1 - i];

            if (t1.id === 'GHOST' || t2.id === 'GHOST') continue;

            // Inversão de mando para balanceamento
            let mandante, visitante;
            if ((rodada + i) % 2 === 0) {
                mandante = t1; visitante = t2;
            } else {
                mandante = t2; visitante = t1;
            }

            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: rodada + 1,
                turno: 1,
                timeA: { id: mandante.id, nome: mandante.nome, escudo: mandante.escudo },
                timeB: { id: visitante.id, nome: visitante.nome, escudo: visitante.escudo },
                golsA: null, golsB: null, finalizado: false
            });
        }
        const ultimo = listaTimes.pop();
        listaTimes.splice(1, 0, ultimo);
    } 

    if (parseInt(turnos) === 2) {
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

// === FUNÇÕES DE MATA-MATA ===

export function gerarJogosMataMata(timesPareados, turnos, nomeFase = 'Fase 1', rodadaInicial = 1, confrontoIdInicial = 1) {
    const jogosGerados = [];
    let numeroConfronto = confrontoIdInicial;

    for (let i = 0; i < timesPareados.length; i += 2) {
        if (i + 1 >= timesPareados.length) break;
        const timeA = timesPareados[i];
        const timeB = timesPareados[i + 1];

        // Jogo de Ida
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

        // Jogo de Volta
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

// === LÓGICA HÍBRIDA: GRUPOS PARALELOS OU SEEDING GERAL ===

export function gerarJogosMataMataDeGrupos(classificadosPorGrupo, turnos, rodadaAtualMax, timesRepescagem = []) {
    const nomesGrupos = Object.keys(classificadosPorGrupo).sort();
    let timesCruzados = [];

    // LÓGICA DE DECISÃO:
    // Se tivermos grupos ÍMPARES (ex: 3, 5) OU se tivermos times de repescagem (melhores 3ºs),
    // a lógica de parzinho (A x B) falha. 
    // Nesse caso, usamos o "Seeding Geral" (todos contra todos baseados na campanha).
    const usarSeedingGeral = (nomesGrupos.length % 2 !== 0) || (timesRepescagem.length > 0);

    if (usarSeedingGeral) {
        // Junta todos numa lista só: Classificados Diretos + Repescagem
        const diretos = Object.values(classificadosPorGrupo).flat();
        const todos = [...diretos, ...timesRepescagem];

        // Manda para a função que ordena e cruza (Melhor x Pior)
        return gerarJogosMataMataSeedingGeral(todos, turnos, rodadaAtualMax);
    }

    // Se for o caso clássico (Grupos Pares e sem repescagem), mantém a tradição A x B
    for (let i = 0; i < nomesGrupos.length; i += 2) {
        const nomeG1 = nomesGrupos[i];
        const nomeG2 = nomesGrupos[i + 1];

        if (!nomeG2) break; // Segurança

        const g1 = classificadosPorGrupo[nomeG1];
        const g2 = classificadosPorGrupo[nomeG2];

        if (g1 && g2) {
            const qtd = Math.min(g1.length, g2.length);
            for (let k = 0; k < qtd; k++) {
                // Cruzamento: 1º do A pega o último classificado do B
                const timeA = g1[k];
                const timeB = g2[qtd - 1 - k];
                if (timeA && timeB) {
                    timesCruzados.push(timeA);
                    timesCruzados.push(timeB);
                }
            }
        }
    }

    // Geração Padrão
    const totalTimes = timesCruzados.length;
    let nomeNovaFase = `Fase de ${totalTimes}`;
    if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(timesCruzados, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

// === NOVA FUNÇÃO: SEEDING GERAL (MELHOR CAMPANHA x PIOR CAMPANHA) ===
// Esta é a função que estava faltando!
export function gerarJogosMataMataSeedingGeral(todosOsTimesClassificados, turnos, rodadaAtualMax) {

    // 1. Ordena todos os classificados pela campanha geral
    // Critérios: Pontos > Vitórias > Saldo > Gols Pro > Sorteio
    const rankingGeral = [...todosOsTimesClassificados].sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
        if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
        return Math.random() - 0.5;
    });

    // Se o número for ímpar (segurança), remove o pior
    if (rankingGeral.length % 2 !== 0) {
        console.warn("Número ímpar de classificados. O último colocado foi removido.");
        rankingGeral.pop();
    }

    const totalTimes = rankingGeral.length;
    const confrontos = [];

    // 2. Cruzamento Olímpico Geral (1º x Último, 2º x Penúltimo...)
    for (let i = 0; i < totalTimes / 2; i++) {
        const melhor = rankingGeral[i];
        const pior = rankingGeral[totalTimes - 1 - i];

        confrontos.push(pior);   // Mandante Ida (Pior campanha)
        confrontos.push(melhor); // Visitante Ida (Melhor campanha)
    }

    let nomeNovaFase = '';
    if (totalTimes === 32) nomeNovaFase = '16 avos de Final';
    else if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';
    else if (totalTimes === 6 || totalTimes === 12) nomeNovaFase = `Playoffs (${totalTimes} times)`;
    else nomeNovaFase = `Fase de ${totalTimes}`;

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(confrontos, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}
//
// Adicione esta nova função ao final do arquivo ou junto com as funções de Mata-Mata

export function gerarJogosComByeSystem(timesClassificados, turnos, rodadaAtualMax) {
    // 1. Ordenação Geral (Critério técnico)
    const ranking = [...timesClassificados].sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
        return b.golsPro - a.golsPro;
    });

    const N = ranking.length;

    // Encontrar a potência de 2 alvo
    let targetPowerOf2 = 1;
    while (targetPowerOf2 * 2 < N) {
        targetPowerOf2 *= 2;
    }

    if (targetPowerOf2 * 2 === N) {
        return gerarJogosMataMataSeedingGeral(ranking, turnos, rodadaAtualMax);
    }

    // Cálculos
    const qtdJogosPreliminares = N - targetPowerOf2;
    const qtdTimesNoPlayoff = qtdJogosPreliminares * 2;
    const qtdTimesBye = N - qtdTimesNoPlayoff;

    // Separação dos Times
    const timesBye = ranking.slice(0, qtdTimesBye);
    const timesPlayoff = ranking.slice(qtdTimesBye);

    const jogosGerados = [];
    const novaRodada = rodadaAtualMax + 1;
    let confrontoId = Date.now();

    // === NOVA LÓGICA DE DISTRIBUIÇÃO NA CHAVE ===

    // Divide os times de Bye em Topo e Fundo (Se for par, 1 pra cada lado)
    // Ex: Se tiver 2 Byes: Topo=[Flamengo], Fundo=[Palmeiras]
    const metadeBye = Math.ceil(timesBye.length / 2);
    const byesTopo = timesBye.slice(0, metadeBye);
    const byesFundo = timesBye.slice(metadeBye);

    // Função Auxiliar para criar jogo de Bye
    const criarJogoBye = (time) => ({
        id: crypto.randomUUID(),
        rodada: novaRodada,
        fase: 'Classificação Direta (Bye)',
        confrontoId: confrontoId++,
        turno: 1,
        timeA: time,
        timeB: { id: 'BYE', nome: 'CLASSIFICADO (BYE)', escudo: null },
        golsA: 1, golsB: 0,
        finalizado: true
    });

    // 1. Adiciona Byes do TOPO (Lado A da Chave)
    byesTopo.forEach(time => {
        jogosGerados.push(criarJogoBye(time));
    });

    // 2. Adiciona Jogos de Playoff (Meio da Chave)
    const nomeFase = `Playoff Preliminar (${qtdTimesNoPlayoff} times)`;

    for (let i = 0; i < qtdJogosPreliminares; i++) {
        const melhor = timesPlayoff[i];
        const pior = timesPlayoff[timesPlayoff.length - 1 - i];

        jogosGerados.push({
            id: crypto.randomUUID(),
            rodada: novaRodada,
            fase: nomeFase,
            confrontoId: confrontoId,
            turno: 1,
            timeA: pior, timeB: melhor, // Ida
            golsA: null, golsB: null, finalizado: false
        });

        if (turnos === 2) {
            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: novaRodada + 1,
                fase: nomeFase,
                confrontoId: confrontoId,
                turno: 2,
                timeA: melhor, timeB: pior, // Volta
                golsA: null, golsB: null, finalizado: false
            });
        }
        confrontoId++;
    }

    // 3. Adiciona Byes do FUNDO (Lado B da Chave)
    // Isso garante visualmente que o 2º melhor time fique no final da lista
    byesFundo.forEach(time => {
        jogosGerados.push(criarJogoBye(time));
    });

    return jogosGerados;
}

export function gerarJogosFaseFinalPontosCorridos(timesClassificados, turnos, rodadaAtualMax) {
    // Reutiliza a lógica de Round Robin (Todos contra Todos)
    // Mas ajusta os metadados para identificar que é uma Fase Final
    const jogosBase = gerarRoundRobin(timesClassificados, turnos);
    
    const novaRodadaInicial = rodadaAtualMax + 1;
    const jogosAjustados = jogosBase.map(jogo => ({
        ...jogo,
        id: crypto.randomUUID(), // Garante IDs novos
        rodada: jogo.rodada + novaRodadaInicial - 1, // Ajusta offset da rodada
        fase: 'Fase Final', // Marcador importante para o filtro de pontos
        confrontoId: null // Pontos corridos não tem confrontoId
    }));

    return jogosAjustados;
}

export const gerarTabela = gerarRoundRobin;