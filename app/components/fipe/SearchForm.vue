<template>
  <div class="search-container card shadow-sm mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <label for="tabela-select" class="form-label"><i class="fas fa-calendar-alt"></i> Ano de Referência:</label>
          <select id="tabela-select" class="form-select" v-model="selectedTabela" @change="onTabelaChange" :disabled="loadingTabelas">
            <option value="">Selecione a tabela</option>
            <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
              {{ formatarPeriodoParaExibicao(tabela.mes) }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="marca-select" class="form-label"><i class="fas fa-trademark"></i> Marca:</label>
          <select id="marca-select" class="form-select" v-model="selectedMarca" @change="onMarcaChange" :disabled="!selectedTabela || loadingMarcas">
            <option value="">Selecione uma marca</option>
            <option v-for="marca in marcas" :key="marca.brandCode" :value="marca.brandCode">
              {{ marca.brandName }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="modelo-select" class="form-label"><i class="fas fa-car-side"></i> Modelo:</label>
          <select id="modelo-select" class="form-select" v-model="selectedModelo" @change="onModeloChange" :disabled="!selectedMarca || loadingModelos">
            <option value="">Selecione um modelo</option>
            <option v-for="modelo in modelos" :key="modelo.modelCode" :value="modelo.modelCode">
              {{ modelo.modelName }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getTabelas, getMarcas, getModelos, formatarPeriodoParaExibicao } from '../../services/apiService';

const tabelas = ref([]);
const marcas = ref([]);
const modelos = ref([]);

const selectedTabela = ref('');
const selectedMarca = ref('');
const selectedModelo = ref('');

const loadingTabelas = ref(false);
const loadingMarcas = ref(false);
const loadingModelos = ref(false);

const emit = defineEmits(['modeloSelected', 'loading', 'error']);

async function fetchTabelas() {
  loadingTabelas.value = true;
  emit('loading', true);
  emit('error', ''); 
  try {
    tabelas.value = await getTabelas();
  } catch (err) {
    console.error(err);
    emit('error', err.message || 'Erro ao carregar tabelas de referência.');
  } finally {
    loadingTabelas.value = false;
    emit('loading', false);
  }
}

onMounted(fetchTabelas);

async function onTabelaChange() {
  selectedMarca.value = '';
  selectedModelo.value = '';
  marcas.value = [];
  modelos.value = [];
  emit('modeloSelected', null); // Clear previous results

  if (selectedTabela.value) {
    loadingMarcas.value = true;
    emit('loading', true);
    emit('error', '');
    try {
      marcas.value = await getMarcas(selectedTabela.value);
    } catch (err) {
      console.error(err);
      emit('error', err.message || 'Erro ao carregar marcas.');
    } finally {
      loadingMarcas.value = false;
      emit('loading', false);
    }
  }
}

async function onMarcaChange() {
  selectedModelo.value = '';
  modelos.value = [];
  emit('modeloSelected', null); // Clear previous results

  if (selectedMarca.value) {
    loadingModelos.value = true;
    emit('loading', true);
    emit('error', '');
    try {
      modelos.value = await getModelos(selectedTabela.value, selectedMarca.value);
    } catch (err) {
      console.error(err);
      emit('error', err.message || 'Erro ao carregar modelos.');
    } finally {
      loadingModelos.value = false;
      emit('loading', false);
    }
  }
}

function onModeloChange() {
  if (selectedModelo.value) {
    const modeloObj = modelos.value.find(m => m.modelCode === selectedModelo.value);
    const modeloNome = modeloObj ? modeloObj.modelName : '';
    emit('modeloSelected', { 
      tabela: selectedTabela.value, 
      modelo: selectedModelo.value,
      modeloNome: modeloNome 
    });
  } else {
    emit('modeloSelected', null); // Clear previous results
  }
}
</script>

<style scoped>
.search-container {
  /* Removed specific styling, relying on Bootstrap card and utilities */
}

.form-label i {
  margin-right: 0.5rem;
}

/* Custom styles can be kept if Bootstrap defaults are not sufficient,
   but try to use Bootstrap classes as much as possible. */
</style>
