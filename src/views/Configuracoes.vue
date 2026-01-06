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
          <p class="text-muted">
            Baixe um arquivo <code>.json</code> contendo todos os seus times, campeonatos, históricos e resultados.
            Guarde este arquivo em segurança.
          </p>
          <div class="alert alert-info small">
            <span class="fw-bold">Dica:</span> Use isso para fazer backup antes de limpar o navegador ou para mover seus dados para outro computador.
          </div>
          <div class="mt-auto pt-3">
            <BButton variant="primary" size="lg" class="w-100" @click="baixarBackup">
              <span v-if="processandoExport">Gerando arquivo...</span>
              <span v-else>Baixar Backup Agora</span>
            </BButton>
          </div>
        </BCard>
      </BCol>

      <BCol md="6" class="mb-4">
        <BCard title="📥 Importar Dados" class="h-100 shadow-sm border-warning">
          <p class="text-muted mb-2">
            Restaure um backup a partir de um arquivo <code>.json</code>.
          </p>
          
          <div class="p-3 rounded mb-3 border">
            <label class="form-label fw-bold small text-uppercase text-muted">Modo de Importação:</label>
            
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="modoImport" id="modoMesclar" value="MESCLAR" v-model="modoImportacao">
              <label class="form-check-label" for="modoMesclar">
                <strong>Mesclar</strong>
                <br><span class="small text-muted">Mantém seus dados atuais e adiciona os novos do arquivo.</span>
              </label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="radio" name="modoImport" id="modoSubstituir" value="SUBSTITUIR" v-model="modoImportacao">
              <label class="form-check-label text-danger" for="modoSubstituir">
                <strong>Substituir Tudo</strong>
                <br><span class="small text-muted">Apaga TUDO o que você tem hoje e coloca os dados do arquivo.</span>
              </label>
            </div>
          </div>
          
          <div class="mt-3">
            <label class="form-label fw-bold">Selecione o arquivo:</label>
            <input 
              type="file" 
              class="form-control mb-3" 
              accept=".json" 
              ref="fileInput"
              @change="prepararImportacao"
            />
            
            <BButton 
              variant="warning" 
              size="lg" 
              class="w-100 text-dark fw-bold" 
              :disabled="!arquivoSelecionado || processandoImport"
              @click="executarImportacao"
            >
              <span v-if="processandoImport">Restaurando...</span>
              <span v-else>Confirmar Importação</span>
            </BButton>
          </div>
        </BCard>
      </BCol>
    </BRow>

    <BRow class="mt-4">
      <BCol md="12">
        <BCard class="border-danger bg-light">
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
  components: {
    BCard, BButton, BRow, BCol
  },
  data() {
    return {
      processandoExport: false,
      processandoImport: false,
      arquivoSelecionado: null,
      modoImportacao: 'MESCLAR' // Padrão seguro
    }
  },
  methods: {
    // --- EXPORTAR ---
    async baixarBackup() {
      this.processandoExport = true;
      try {
        const jsonString = await DbService.exportarBackup();
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const dataHoje = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `backup_manager_${dataHoje}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } catch (error) {
        alert("Erro ao exportar dados.");
        console.error(error);
      } finally {
        this.processandoExport = false;
      }
    },

    // --- IMPORTAR ---
    prepararImportacao(event) {
      const file = event.target.files[0];
      if (file) {
        this.arquivoSelecionado = file;
      }
    },

    async executarImportacao() {
      if (!this.arquivoSelecionado) return;
      
      let msgConfirmacao = "Tem certeza?";
      if (this.modoImportacao === 'SUBSTITUIR') {
        msgConfirmacao = "ATENÇÃO: Você escolheu SUBSTITUIR. Todos os dados atuais serão APAGADOS. Continuar?";
      } else {
        msgConfirmacao = "Confirmar mesclagem de dados?";
      }

      if (!confirm(msgConfirmacao)) {
        return;
      }

      this.processandoImport = true;
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const conteudo = e.target.result;
          
          // Passamos o modo selecionado para o serviço
          await DbService.importarBackup(conteudo, this.modoImportacao);
          
          alert("Dados importados com sucesso! A página será recarregada.");
          window.location.reload(); 
        } catch (error) {
          alert("Erro ao importar: Arquivo inválido ou corrompido.");
          console.error(error);
        } finally {
          this.processandoImport = false;
        }
      };

      reader.readAsText(this.arquivoSelecionado);
    },

    // --- RESETAR ---
    async resetarTudo() {
      if(confirm("ATENÇÃO: Isso apagará TODOS os times e campeonatos. Não há volta. Confirmar?")) {
        await DbService.resetarBanco();
        window.location.reload();
      }
    }
  }
}
</script>