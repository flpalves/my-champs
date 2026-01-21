const fs = require('fs');
const path = require('path');

// Configurações de Pastas
const INPUT_DIR = path.join(__dirname, 'entrada');
const OUTPUT_FILE = path.join(__dirname, 'importacao_my_champs.json');

// Garante que a pasta de entrada existe
if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Pasta '${INPUT_DIR}' não encontrada. Crie a pasta e coloque os JSONs nela.`);
    process.exit(1);
}

// Função para gerar IDs únicos (simples)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Função para formatar Posição (ex: "gk" -> "GK")
const formatPosition = (arrPosicoes) => {
    if (!arrPosicoes || arrPosicoes.length === 0) return "DATA_MISSING";
    return arrPosicoes[0].toUpperCase(); 
};

// Função para calcular um Overall básico (Média dos atributos)
const calculateOverall = (habilidades) => {
    let soma = 0;
    let conta = 0;
    const attrLinha = ['forca', 'marcacao', 'passe', 'chute', 'velocidade', 'drible', 'agilidade'];
    const attrGoleiro = ['reflexo', 'comMao', 'reposicao', 'jogoAereo', 'posicionamento'];

    const ehGoleiro = parseInt(habilidades.reflexo) > 0;
    const listaParaUsar = ehGoleiro ? attrGoleiro : attrLinha;

    for (const key of listaParaUsar) {
        if (habilidades[key]) {
            soma += parseInt(habilidades[key]);
            conta++;
        }
    }
    
    const media = conta > 0 ? soma / conta : 0;
    
    // Ajuste empírico para escalas antigas (se média < 20, multiplica por ~5)
    if (media < 20) return Math.round(media * 5.2); 
    return Math.round(media);
};

// --- INÍCIO DO PROCESSO ---

console.log("🔄 Lendo arquivos da pasta /entrada ...");

const arquivos = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.json'));
const timesConvertidos = [];

arquivos.forEach(arquivo => {
    try {
        const rawData = fs.readFileSync(path.join(INPUT_DIR, arquivo), 'utf8');
        const sourceTeam = JSON.parse(rawData);

        console.log(`   > Processando: ${sourceTeam.name}`);

        // Junta Titulares e Reservas
        const sourcePlayers = [
            ...(sourceTeam.starting11 || []),
            ...(sourceTeam.beanch || []),
            ...(sourceTeam.bench || [])
        ];

        // Mapeia Jogadores (Agora com Nacionalidade)
        const jogadoresFormatados = sourcePlayers.map(p => {
            return {
                id: generateId(),
                nome: p.name,
                numero: p.camisa,
                posicao: formatPosition(p.posicoes),
                nacionalidade: p.nacionalidade || 'Desconhecida', // <--- NOVO CAMPO
                overall: calculateOverall(p.habilidades),
                atributos: p.habilidades 
            };
        });

        // Mapeia Uniformes (Padrão Interno/Externo/Borda)
        // [0] = Casa, [1] = Fora
        const cores = [
            {
                // Uniforme Casa (HomeKit)
                interno: sourceTeam.colors?.homeKit?.primary || '#ffffff',
                externo: sourceTeam.colors?.homeKit?.secondary || '#000000',
                borda: sourceTeam.colors?.homeKit?.third || '#888888' // <--- NOVO CAMPO
            },
            {
                // Uniforme Fora (AwayKit)
                interno: sourceTeam.colors?.awayKit?.primary || '#000000',
                externo: sourceTeam.colors?.awayKit?.secondary || '#ffffff',
                borda: sourceTeam.colors?.awayKit?.third || '#888888' // <--- NOVO CAMPO
            }
        ];

        // Cria Objeto do Time
        const novoTime = {
            id: generateId(),
            nome: sourceTeam.name,
            escudo: null, 
            estadio: "Estádio Padrão",
            tecnico: "Técnico CPU",
            jogadores: jogadoresFormatados,
            cores: cores, // <--- ADICIONADO AQUI
            
        };

        timesConvertidos.push(novoTime);

    } catch (err) {
        console.error(`❌ Erro ao processar ${arquivo}:`, err.message);
    }
});

// Cria o arquivo final para Importação
const arquivoFinal = {
    version: "1.0", 
    dataExportacao: new Date().toISOString(),
    times: timesConvertidos,
    campeonatos: [] 
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(arquivoFinal, null, 2));

console.log("\n✅ CONVERSÃO CONCLUÍDA!");
console.log(`📁 Arquivo gerado: ${OUTPUT_FILE}`);
console.log(`⚽ Total de times: ${timesConvertidos.length}`);