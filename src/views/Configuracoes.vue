<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-primary fw-bold mb-0">Configurações & Backup</h2>
        <span class="text-muted small">Gerencie seus dados e transfira entre dispositivos</span>
      </div>
      <BButton variant="outline-secondary" @click="$router.push('/')">Voltar</BButton>
    </div>

    <BRow>
      <BCol md="6" class="mb-4">
        <BCard title="📤 Exportar Dados" class="h-100 shadow-sm border-primary">
          <p class="text-muted small">
            Gera um arquivo <code>.json</code> para você salvar seus dados.
          </p>
          
          <div class="p-3 rounded mb-3 border bg-dark">
            <label class="form-label fw-bold small text-uppercase text-muted">O que exportar?</label>
            
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="tipoExport" id="expCompleto" value="COMPLETO" v-model="tipoExportacao">
              <label class="form-check-label" for="expCompleto">
                <strong>Sistema Completo (Backup)</strong>
                <br><span class="small text-muted">Todos os mundos, times e configurações.</span>
              </label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="radio" name="tipoExport" id="expMundo" value="MUNDO" v-model="tipoExportacao">
              <label class="form-check-label" for="expMundo">
                <strong>Apenas um Mundo</strong>
                <br><span class="small text-muted">Compartilhe um save específico com um amigo.</span>
              </label>
            </div>

            <div v-if="tipoExportacao === 'MUNDO'" class="mt-3 ps-4 fade-in">
                <select class="form-select form-select-sm" v-model="slotExportacaoSelecionado">
                    <option :value="null" disabled>Selecione o mundo...</option>
                    <option v-for="slot in slots" :key="slot.id" :value="slot.id">
                        🌍 {{ slot.alias }}
                    </option>
                </select>
            </div>
          </div>

          <div class="mt-auto pt-3">
            <BButton variant="primary" size="lg" class="w-100" @click="baixarBackup" :disabled="tipoExportacao === 'MUNDO' && slotExportacaoSelecionado === null">
              <span v-if="processandoExport">Gerando arquivo...</span>
              <span v-else>
                  {{ tipoExportacao === 'MUNDO' ? 'Baixar Mundo' : 'Baixar Backup Completo' }}
              </span>
            </BButton>
          </div>
        </BCard>
      </BCol>

      <BCol md="6" class="mb-4">
        <BCard title="📥 Importar Dados" class="h-100 shadow-sm border-warning">
          <p class="text-muted small mb-2">
            Restaure dados a partir de um arquivo <code>.json</code>.
          </p>
          
          <div class="p-3 rounded mb-3 border bg-dark">
            <label class="form-label fw-bold small text-uppercase text-muted">Modo de Importação:</label>
            
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="modoImport" id="modoNovoMundo" value="NOVO_MUNDO" v-model="modoImportacao">
              <label class="form-check-label text-success" for="modoNovoMundo">
                <strong>Importar como Novo Mundo</strong> 🌟
                <br><span class="small text-muted">Cria um novo slot com os dados do arquivo.</span>
              </label>
            </div>

            <div v-if="modoImportacao === 'NOVO_MUNDO'" class="ms-4 mb-3 fade-in">
                <label class="form-label small fw-bold text-muted">Nome do Novo Mundo:</label>
                <input type="text" class="form-control form-control-sm" v-model="nomeNovoMundo" placeholder="Ex: Campeonato Retro 98 (Opcional)">
            </div>

            <hr class="my-2 opacity-25">

            <div class="form-check">
              <input class="form-check-input" type="radio" name="modoImport" id="modoSubstituir" value="SUBSTITUIR" v-model="modoImportacao">
              <label class="form-check-label text-danger" for="modoSubstituir">
                <strong>Restaurar Backup Completo</strong> ⚠️
                <br><span class="small text-muted">Apaga <b>TUDO</b> o que você tem hoje.</span>
              </label>
            </div>
          </div>
          
          <div class="mt-3">
            <label class="form-label fw-bold">Selecione o arquivo:</label>
            <input type="file" class="form-control mb-3" accept=".json" ref="fileInput" @change="prepararImportacao" />
            
            <BButton variant="warning" size="lg" class="w-100 text-dark fw-bold" :disabled="!arquivoSelecionado || processandoImport" @click="executarImportacao">
              <span v-if="processandoImport">Processando...</span>
              <span v-else>Confirmar Importação</span>
            </BButton>
          </div>
        </BCard>
      </BCol>
    </BRow>

    <BRow class="mt-4">
      <BCol md="12">
        <BCard class="border-danger bg-dark">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="text-danger fw-bold">☠️ Zona de Perigo</h5>
              <p class="mb-0 text-danger small">Deseja começar do zero? Isso apagará tudo permanentemente.</p>
            </div>
            <BButton variant="outline-danger" @click="resetarTudo">Resetar Fábrica</BButton>
          </div>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BCard, BButton, BRow, BCol } from 'bootstrap-vue-next';

export default {
  name: 'Configuracoes',
  components: { BCard, BButton, BRow, BCol },
  data() {
    return {
      processandoExport: false,
      processandoImport: false,
      arquivoSelecionado: null,
      
      // Exportação
      tipoExportacao: 'COMPLETO',
      slotExportacaoSelecionado: null,
      slots: [],

      // Importação
      modoImportacao: 'NOVO_MUNDO',
      nomeNovoMundo: '' // Variável para armazenar o nome digitado
    }
  },
  async mounted() {
      await this.carregarSlots();
  },
  methods: {
    async carregarSlots() {
        this.slots = await DbService.getSlots();
    },

    async baixarBackup() {
      this.processandoExport = true;
      try {
        let jsonString = '';
        let nomeArquivo = '';
        const dataHoje = new Date().toISOString().split('T')[0];

        if (this.tipoExportacao === 'MUNDO') {
            if (this.slotExportacaoSelecionado === null) return;
            jsonString = await DbService.exportarMundo(this.slotExportacaoSelecionado);
            const slot = this.slots.find(s => s.id === this.slotExportacaoSelecionado);
            const aliasLimpo = slot ? slot.alias.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'mundo';
            nomeArquivo = `mychamps_mundo_${aliasLimpo}_${dataHoje}.json`;
        } else {
            jsonString = await DbService.exportarBackup();
            nomeArquivo = `mychamps_backup_completo_${dataHoje}.json`;
        }
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } catch (error) {
        alert("Erro ao exportar: " + error.message);
        console.error(error);
      } finally {
        this.processandoExport = false;
      }
    },

    prepararImportacao(event) {
      const file = event.target.files[0];
      if (file) this.arquivoSelecionado = file;
    },

    async executarImportacao() {
      if (!this.arquivoSelecionado) return;
      
      let msgConfirmacao = "";
      if (this.modoImportacao === 'SUBSTITUIR') {
        msgConfirmacao = "⚠️ PERIGO: Você escolheu RESTAURAR BACKUP COMPLETO.\n\nIsso apagará TODOS os mundos e times atuais. Tem certeza absoluta?";
      } else {
        const nomeFinal = this.nomeNovoMundo.trim() || "(Nome Automático)";
        msgConfirmacao = `O sistema irá criar um NOVO MUNDO chamado "${nomeFinal}" com os dados do arquivo.\n\nSeus dados atuais serão preservados. Continuar?`;
      }

      if (!confirm(msgConfirmacao)) return;

      this.processandoImport = true;
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const conteudo = e.target.result;
          
          if (this.modoImportacao === 'NOVO_MUNDO') {
              // Passamos o nome digitado (ou null) para o serviço
              const novoId = await DbService.importarMundo(conteudo, this.nomeNovoMundo.trim() || null);
              
              if(confirm("Mundo importado com sucesso! Deseja carregar este mundo agora?")) {
                  await DbService.trocarSlot(novoId);
              } else {
                  alert("Mundo importado! Você pode acessá-lo pelo menu da Home.");
                  window.location.reload();
              }
          } else {
              await DbService.importarBackup(conteudo, 'SUBSTITUIR');
              alert("Backup restaurado com sucesso! A página será recarregada.");
              window.location.reload(); 
          }
        } catch (error) {
          alert("Erro ao importar: " + error.message);
          console.error(error);
        } finally {
          this.processandoImport = false;
        }
      };
      reader.readAsText(this.arquivoSelecionado);
    },

    async resetarTudo() {
      if(confirm("ATENÇÃO: Isso apagará TODOS os times, campeonatos e mundos. Tem certeza?")) {
          await DbService.resetarBanco();
          window.location.reload();
      }
    }
  }
}
</script>

<style scoped>
.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>