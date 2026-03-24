<template>
  <div class="comparison-form card shadow-sm mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label for="tabela1-select" class="form-label"><i class="fas fa-calendar-alt"></i> Primeiro Período:</label>
          <select id="tabela1-select" class="form-select" v-model="selectedTabela1" @change="onTabela1Change" :disabled="loadingTabelas">
            <option value="">Selecione o primeiro período</option>
            <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
              {{ formatarPeriodoParaExibicao(tabela.mes) }}
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="tabela2-select" class="form-label"><i class="fas fa-calendar-alt"></i> Segundo Período:</label>
          <select id="tabela2-select" class="form-select" v-model="selectedTabela2" @change="onTabela2Change" :disabled="loadingTabelas">
            <option value="">Selecione o segundo período</option>
            <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
              {{ formatarPeriodoParaExibicao(tabela.mes) }}
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="marca-select-compare" class="form-label"><i class="fas fa-trademark"></i> Marca:</label>
          <select id="marca-select-compare" class="form-select" v-model="selectedMarca" @change="onMarcaChange" :disabled="!marcaSelectEnabled || loadingMarcas">
            <option value="">Selecione uma marca</option>
            <option v-for="marca in marcas" :key="marca.brandCode" :value="marca.brandCode">
              {{ marca.brandName }}
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="modelo-select-compare" class="form-label"><i class="fas fa-car-side"></i> Modelo:</label>
          <select id="modelo-select-compare" class="form-select" v-model="selectedModelo" :disabled="!modeloSelectEnabled || loadingModelos">
            <option value="">Selecione um modelo</option>
            <option v-for="modelo in modelos" :key="modelo.modelCode" :value="modelo.modelCode">
              {{ modelo.modelName }}
            </option>
          </select>
        </div>
      </div>
      <div class="d-grid mt-3">
        <button @click="onCompare" :disabled="!compareButtonEnabled" class="btn btn-dark btn-lg">
          <i class="fas fa-exchange-alt me-2"></i>Comparar Valores
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getTabelas, getMarcas, getModelos, formatarPeriodoParaExibicao } from '../../services/apiService';

const emit = defineEmits(['compare', 'loading', 'error']);

const tabelas = ref([]);
const marcas = ref([]);
const modelos = ref([]);

const selectedTabela1 = ref('');
const selectedTabela2 = ref('');
const selectedMarca = ref('');
const selectedModelo = ref('');

const loadingTabelas = ref(false);
const loadingMarcas = ref(false);
const loadingModelos = ref(false);

const refPeriodo1Display = ref('');
const refPeriodo2Display = ref('');

async function fetchTabelasInitial() {
  loadingTabelas.value = true;
  emit('loading', true);
  emit('error', '');
  try {
    tabelas.value = await getTabelas();
  } catch (err) {
    console.error(err);
    emit('error', 'Erro ao carregar períodos de referência.');
  } finally {
    loadingTabelas.value = false;
    emit('loading', false);
  }
}
onMounted(fetchTabelasInitial);

function getFormattedPeriodFromCode(tabelaCode) {
    const tabela = tabelas.value.find(t => t.codigo === tabelaCode);
    return tabela ? formatarPeriodoParaExibicao(tabela.mes) : '';
}

function resetMarcaAndModelo() {
    selectedMarca.value = '';
    selectedModelo.value = '';
    marcas.value = [];
    modelos.value = [];
}

function onTabela1Change() {
  refPeriodo1Display.value = selectedTabela1.value ? getFormattedPeriodFromCode(selectedTabela1.value) : '';
  resetMarcaAndModelo();
  if (selectedTabela1.value && selectedTabela2.value) {
    loadMarcas();
  }
}

function onTabela2Change() {
  refPeriodo2Display.value = selectedTabela2.value ? getFormattedPeriodFromCode(selectedTabela2.value) : '';
  resetMarcaAndModelo();
  if (selectedTabela1.value && selectedTabela2.value) {
    loadMarcas();
  }
}

async function loadMarcas() {
  if (!selectedTabela1.value || !selectedTabela2.value) return;

  loadingMarcas.value = true;
  emit('loading', true);
  emit('error', '');
  try {
    // Fetching marcas based on the first selected table, as per original logic
    marcas.value = await getMarcas(selectedTabela1.value);
  } catch (err) {
    console.error(err);
    emit('error', 'Erro ao carregar marcas.');
  } finally {
    loadingMarcas.value = false;
    emit('loading', false);
  }
}

async function onMarcaChange() {
  selectedModelo.value = '';
  modelos.value = [];
  if (selectedMarca.value && selectedTabela1.value) { // Modelos dependem da tabela1 e marca
    loadingModelos.value = true;
    emit('loading', true);
    emit('error', '');
    try {
      modelos.value = await getModelos(selectedTabela1.value, selectedMarca.value);
    } catch (err) {
      console.error(err);
      emit('error', 'Erro ao carregar modelos.');
    } finally {
      loadingModelos.value = false;
      emit('loading', false);
    }
  }
}

const marcaSelectEnabled = computed(() => !!(selectedTabela1.value && selectedTabela2.value));
const modeloSelectEnabled = computed(() => !!selectedMarca.value);
const compareButtonEnabled = computed(() => !!(selectedTabela1.value && selectedTabela2.value && selectedMarca.value && selectedModelo.value));

function onCompare() {
  if (!compareButtonEnabled.value) return;

  const marcaObj = marcas.value.find(m => m.brandCode === selectedMarca.value);
  const modeloObj = modelos.value.find(m => m.modelCode === selectedModelo.value);

  emit('compare', {
    tabela1: selectedTabela1.value,
    tabela2: selectedTabela2.value,
    modelo: selectedModelo.value,
    marcaNome: marcaObj ? marcaObj.brandName : '',
    modeloNome: modeloObj ? modeloObj.modelName : '',
    refPeriodo1Display: refPeriodo1Display.value,
    refPeriodo2Display: refPeriodo2Display.value
  });
}
</script>

<style scoped>
.form-label i {
  margin-right: 0.5rem;
}
/* Removed custom styles for .compareButton as Bootstrap btn classes are now used */
/* Other custom styles related to form elements can be removed if Bootstrap defaults are sufficient */
</style>
