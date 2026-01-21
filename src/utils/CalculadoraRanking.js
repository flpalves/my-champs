/**
 * src/utils/CalculadoraRanking.js
 * Calcula os pontos do Hall da Fama ao encerrar um campeonato.
 */

export function gerarPontuacaoHall(campeonato, regras) {
    if (!regras) return [];

    const resultados = [];
    // Garante que temos a classificação final correta
    // Para campeonatos de pontos corridos ou liga, a view já deve ter passado a tabela ordenada
    // Para mata-mata/grupos, calculamos baseado nas fases atingidas
    
    // --- MODO 1: POR FASE (Mata-Mata ou Grupos) ---
    if (campeonato.tipo === 'MATA_MATA' || campeonato.tipo === 'GRUPOS') {
        const stats = {}; 
        
        // Todos começam com pontuação de participação (se houver)
        campeonato.timesParticipantes.forEach(t => stats[t.id] = 'PARTICIPACAO');

        if (campeonato.jogos) {
            campeonato.jogos.forEach(jogo => {
                if (!jogo.fase) return; // Ignora jogos de grupo
                
                const fase = normalizarNomeFase(jogo.fase);
                
                // Atualiza o nível alcançado pelos times
                atualizarNivel(stats, jogo.timeA.id, fase);
                atualizarNivel(stats, jogo.timeB.id, fase);

                // Se for a FINAL e acabou, define Campeão e Vice
                if (fase === 'FINAL' && jogo.finalizado) {
                    let vencedorId = null;
                    let perdedorId = null;
                    
                    if(jogo.golsA > jogo.golsB) { vencedorId = jogo.timeA.id; perdedorId = jogo.timeB.id; }
                    else if(jogo.golsB > jogo.golsA) { vencedorId = jogo.timeB.id; perdedorId = jogo.timeA.id; }
                    // (Pênaltis não tratados aqui, assume-se que alguém ganhou no tempo normal ou a view resolveu)
                    
                    if(vencedorId) {
                        stats[vencedorId] = 'CAMPEAO';
                        stats[perdedorId] = 'VICE';
                    }
                }
            });
        }

        // Gera lista final
        campeonato.timesParticipantes.forEach(t => {
            const nivel = stats[t.id];
            let pontos = regras[nivel] || regras['PARTICIPACAO'] || 0;
            
            // Fallback: Se chegou na final mas não sabemos quem ganhou (empate), dá pontos de vice
            if((nivel === 'FINAL') && !regras['FINAL']) pontos = regras['VICE'] || 0;

            resultados.push({
                timeId: t.id,
                nome: t.nome,
                escudo: t.escudo,
                pontosHall: parseInt(pontos),
                detalhe: nivel
            });
        });
    }

    // --- MODO 2: POR POSIÇÃO (Pontos Corridos ou Liga+Final) ---
    else {
        // Precisamos da tabela final já calculada pela view Detalhes
        const classificacao = campeonato.tabelaFinalSalva || [];

        classificacao.forEach((time, index) => {
            const posicao = index + 1;
            let pontos = 0;

            // Tenta pegar regra específica para a posição (1, 2, 3...)
            if (regras[posicao]) {
                pontos = regras[posicao];
            } else {
                pontos = regras['RESTANTE'] || 0;
            }

            resultados.push({
                timeId: time.id,
                nome: time.nome,
                escudo: time.escudo,
                pontosHall: parseInt(pontos),
                detalhe: `${posicao}º Lugar`
            });
        });
    }

    return resultados;
}

// Helpers internos
function normalizarNomeFase(nome) {
    if(!nome) return 'PARTICIPACAO';
    const n = nome.toUpperCase();
    if (n.includes('FINAL') && !n.includes('QUARTAS') && !n.includes('OITAVAS') && !n.includes('SEMI')) return 'FINAL';
    if (n.includes('SEMI')) return 'SEMIFINAL';
    if (n.includes('QUARTAS')) return 'QUARTAS';
    if (n.includes('OITAVAS') || n.includes('16')) return 'OITAVAS';
    return 'PARTICIPACAO'; // Fases preliminares ou grupos
}

function atualizarNivel(stats, timeId, novaFase) {
    const niveis = { 'PARTICIPACAO': 1, 'OITAVAS': 2, 'QUARTAS': 3, 'SEMIFINAL': 4, 'FINAL': 5, 'VICE': 6, 'CAMPEAO': 7 };
    const atual = stats[timeId] || 'PARTICIPACAO';
    
    // Só sobe de nível, nunca desce. E não sobrescreve campeão/vice se já definido.
    if (niveis[novaFase] > niveis[atual]) {
        if (atual !== 'CAMPEAO' && atual !== 'VICE') {
            stats[timeId] = novaFase;
        }
    }
}