<template>
  <div id="app">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top">
      <div class="container">

        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <span class="fs-4 me-2">⚽</span>
          <span class="fw-bold text-uppercase text-white tracking-wide">
            MY<span class="text-primary">Champs</span>
          </span>
        </router-link>

        <button class="navbar-toggler" type="button" @click="menuAberto = !menuAberto" aria-controls="navbarNav"
          aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" :class="{ 'show': menuAberto }" id="navbarNav">
          <ul class="navbar-nav ms-auto gap-2">

            <li class="nav-item">
              <router-link to="/" class="nav-link" @click="menuAberto = false">
                Home
              </router-link>
            </li>

            <li class="nav-item dropdown-divider d-lg-none my-2 border-secondary"></li>

            <li class="nav-item">
              <router-link to="/lista-clubes" class="nav-link" @click="menuAberto = false">
                Clubes
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/novo-time" class="nav-link" @click="menuAberto = false">
                + Novo Clube
              </router-link>
            </li>

            <li class="nav-item dropdown-divider d-lg-none my-2 border-secondary"></li>

            <li class="nav-item">
              <router-link to="/lista-campeonatos" class="nav-link" @click="menuAberto = false">
                Campeonatos
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/novo-campeonato"
                class="nav-link btn btn-sm btn-outline-primary px-3 text-white-important" @click="menuAberto = false">
                Criar Torneio
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/configuracoes" class="nav-link" @click="menuAberto = false">
                ⚙️ Configurações
              </router-link>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <main class="py-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="text-center py-4 text-muted small border-top border-secondary mt-5 bg-dark">
      <div class="container">
        <p class="mb-0">© 2026 Football Manager System. Desenvolvido com Vue 3.</p>
      </div>
    </footer>

  </div>
</template>

<script>
export default {
  data() {
    return {
      menuAberto: false // Controla o estado do menu no mobile
    }
  }
}
</script>

<style lang="scss">
/* Se você estiver usando o manager-theme.css, essas cores virão de lá.
   Caso contrário, definimos alguns fallbacks aqui para garantir o visual. */

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bs-body-bg, #111827);
  /* Fundo Escuro */
  color: var(--bs-body-color, #f9fafb);
}

main {
  flex: 1;
  /* Empurra o rodapé para baixo */
}

/* Estilização da Navbar */
.navbar {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  background-color: #1f2937 !important;
  /* Cor da barra */
}

.tracking-wide {
  letter-spacing: 1px;
}

.nav-link {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: #9ca3af !important;
  /* Cinza claro */
  transition: all 0.3s ease;
  padding: 0.5rem 1rem !important;
  border-radius: 4px;

  &:hover {
    color: #fff !important;
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Link Ativo (Rota atual) */
  &.router-link-active {
    color: #fff !important;
    background-color: var(--bs-primary, #10b981);
    /* Verde Manager */
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

/* Botão especial no menu */
.btn-outline-primary.router-link-active {
  background-color: var(--bs-primary, #10b981) !important;
  border-color: var(--bs-primary, #10b981) !important;
}

/* Transição de Páginas (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ajuste para o botão toggle no mobile */
.navbar-toggler {
  border: none;

  &:focus {
    box-shadow: none;
  }
}
</style>