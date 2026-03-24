<template>
  <div class="fipe-view-container">
    <div class="content-overlay-layer"></div>
    <div class="main-content-wrapper container py-4">
      <div class="header-section text-center">
        <h1 class="display-5 fw-bold text-white d-flex align-items-center justify-content-center">
<a>Consulta FIPE</a>
</h1>
        <p class="lead fs-5 text-white-75">
          Valores de referência de veículos no Brasil.
        </p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-9">
          <div class="shadow-lg">
              <SearchForm @modeloSelected="handleModeloSelected" @loading="handleSearchFormLoading"
                @error="handleError" />
          </div>
          <div class="row mt-md-4">
        <div class="col-12">
          <ResultsDisplay :veiculos="veiculos" :modeloNome="modeloNome" :loading="loadingResults" :error="error" />
        </div>
      </div>
        </div>

      </div>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SearchForm from '../components/fipe/SearchForm.vue';
import ResultsDisplay from '../components/fipe/ResultsDisplay.vue';
import { getVeiculos } from '../services/apiService';

const veiculos = ref([]);
const modeloNome = ref('');
const loadingResults = ref(false);
const loadingSearchForm = ref(false);
const error = ref('');
const selectedModelo = ref('');

async function handleModeloSelected(payload) {
  if (!payload || !payload.modelo) {
    veiculos.value = [];
    modeloNome.value = '';
    error.value = '';
    loadingResults.value = false;
    selectedModelo.value = '';
    return;
  }

  const { tabela, modelo, modeloNome: mNome } = payload;
  selectedModelo.value = modelo;

  loadingResults.value = true;
  error.value = '';
  veiculos.value = [];
  modeloNome.value = mNome;

  try {
    const result = await getVeiculos(tabela, modelo);
    veiculos.value = result;
  } catch (err) {
    console.error('Erro em handleModeloSelected:', err);
    error.value = err.message || 'Erro ao buscar veículos.';
    veiculos.value = [];
  } finally {
    loadingResults.value = false;
  }
}

function handleSearchFormLoading(isLoading) {
  loadingSearchForm.value = isLoading;
  if (isLoading) {
    veiculos.value = [];
    loadingResults.value = true;
  } else {
    if (!selectedModelo.value) {
      loadingResults.value = false;
    }
  }
}

function handleError(errorMessage) {
  error.value = errorMessage;
  veiculos.value = [];
  loadingResults.value = false;
  loadingSearchForm.value = false;
  selectedModelo.value = '';
}
</script>

<style scoped>
.fipe-view-container {
  position: relative;
  background-image: url('../assets/car-background.png'); /* Sua imagem de fundo principal */
  background-size: cover;
  background-position: center center;
  background-attachment: fixed; /* Imagem fica fixa durante o scroll */
  min-height: 100vh;
  padding-top: 1rem; /* Espaço para a navbar, se houver */
  padding-bottom: 3rem;
  color: #fff; /* Cor de texto padrão para conteúdo diretamente sobre o fundo */
}

.content-overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Overlay escuro para a imagem de fundo principal */
  z-index: 1;
}

.main-content-wrapper {
  position: relative;
  z-index: 2; /* Conteúdo principal acima do overlay da imagem de fundo */
}

.header-section {
  /* O texto aqui já é branco devido ao .fipe-view-container ou pode ser definido explicitamente */
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5); /* Sombra para destacar o texto do header */
}

.header-section .fas {
  opacity: 0.9;
}

.form-panel {
  background-color: #ffffff; /* Fundo branco para o painel do formulário */
  border: none;
  color: #212529; /* Cor de texto escura para conteúdo dentro do painel do formulário */
}

/* Estilos para os elementos dentro do SearchForm quando ele está no .form-panel */
.form-panel :deep(label),
.form-panel :deep(.form-text) {
  color: #495057 !important; /* Cor de texto padrão para rótulos (cinza escuro) */
}

.form-panel :deep(h1),
.form-panel :deep(h2),
.form-panel :deep(h3),
.form-panel :deep(h4),
.form-panel :deep(h5),
.form-panel :deep(h6) {
  color: #212529 !important; /* Cor de texto padrão para títulos (preto) */
}

.form-panel :deep(select.form-select) {
  background-color: #fff !important; /* Fundo branco padrão para selects */
  color: #212529 !important; /* Texto escuro padrão */
  border: 1px solid #ced4da !important; /* Borda padrão do Bootstrap */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important; /* Seta escura padrão */
}

.form-panel :deep(select.form-select:focus) {
  border-color: #86b7fe !important; /* Cor de foco padrão do Bootstrap */
  box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.25) !important; /* Sombra de foco padrão */
}

.form-panel :deep(select.form-select option) {
  background-color: #fff; /* Fundo branco para as opções */
  color: #212529; /* Texto escuro para as opções */
}

/* A estilização do ResultsDisplay não é alterada aqui,
   assumindo que ele já tem um design adequado ou será estilizado separadamente. */
</style>