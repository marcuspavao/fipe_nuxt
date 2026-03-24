<template>
  <div class="dashboard-controls card shadow-sm mb-4">
    <div class="card-body">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label for="tabela1-dashboard-select" class="form-label"><i class="fas fa-calendar-alt"></i> Primeiro Período:</label>
          <select id="tabela1-dashboard-select" class="form-select" v-model="selectedTabela1" @change="onTabela1Change" :disabled="loadingTabelas">
            <option value="">Selecione o 1º Período</option>
            <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
              {{ formatarPeriodoParaExibicao(tabela.mes) }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label for="tabela2-dashboard-select" class="form-label"><i class="fas fa-calendar-alt"></i> Segundo Período:</label>
          <select id="tabela2-dashboard-select" class="form-select" v-model="selectedTabela2" @change="onControlChange" :disabled="loadingTabelas">
            <option value="">Selecione o 2º Período</option>
            <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
              {{ formatarPeriodoParaExibicao(tabela.mes) }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label for="marca-dashboard-select" class="form-label"><i class="fas fa-trademark"></i> Marca:</label>
          <select id="marca-dashboard-select" class="form-select" v-model="selectedMarca" @change="onControlChange" :disabled="!marcaSelectEnabled || loadingMarcas">
            <option value="all">-- Todas as Marcas --</option>
            <option v-for="marca in marcas" :key="marca.brandCode" :value="marca.brandCode">
              {{ marca.brandName }}
            </option>
          </select>
        </div>

        <div class="col-12 d-grid">
          <button @click="onFetchDashboard" :disabled="!fetchButtonEnabled" class="btn btn-dark btn-lg mt-3">
            <i class="fas fa-chart-line me-2"></i>Comparar Marcas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getTabelas, getMarcas, formatarPeriodoParaExibicao } from '../../services/apiService';

const emit = defineEmits(['fetchDashboard', 'loading', 'error', 'status']);

const tabelas = ref([]);
const marcas = ref([]);

const selectedTabela1 = ref('');
const selectedTabela2 = ref('');
const selectedMarca = ref('all');

const loadingTabelas = ref(false);
const loadingMarcas = ref(false);

async function fetchInitialTabelas() {
  loadingTabelas.value = true;
  emit('status', 'Carregando períodos de referência...');
  emit('error', '');
  try {
    tabelas.value = await getTabelas();
    emit('status', 'Selecione os períodos para consulta.');
  } catch (err) {
    console.error(err);
    emit('error', 'Erro ao carregar períodos.');
    emit('status', 'Falha ao carregar dados iniciais. Tente recarregar a página.');
  } finally {
    loadingTabelas.value = false;
  }
}
onMounted(fetchInitialTabelas);

async function loadMarcas() {
  if (!selectedTabela1.value) {
    marcas.value = [];
    selectedMarca.value = 'all';
    return;
  }

  loadingMarcas.value = true;
  emit('status', `Carregando marcas para o período ${formatarPeriodoParaExibicao(tabelas.value.find(t => t.codigo === selectedTabela1.value)?.mes)}...`);
  emit('error', '');
  try {
    const fetchedMarcas = await getMarcas(selectedTabela1.value);
    marcas.value = fetchedMarcas.sort((a, b) => a.brandName.localeCompare(b.brandName));
    selectedMarca.value = 'all'; // Reset to all
    emit('status', 'Selecione os períodos e opcionalmente uma marca.');
  } catch (err) {
    console.error(err);
    marcas.value = [];
    selectedMarca.value = 'all';
    emit('error', 'Erro ao carregar marcas.');
    emit('status', 'Falha ao carregar marcas.');
  } finally {
    loadingMarcas.value = false;
  }
}

function onTabela1Change() {
  loadMarcas();
  onControlChange();
}

function onControlChange() {
  if (fetchButtonEnabled.value) {
    emit('status', 'Pronto para buscar dados do dashboard.');
    emit('error', ''); // Clear error if controls are valid for fetching
  } else if (selectedTabela1.value && selectedTabela2.value && selectedTabela1.value === selectedTabela2.value) {
    emit('status', 'O primeiro e o segundo período não podem ser iguais.');
    emit('error', 'Períodos de referência não podem ser iguais.');
  } else if (!selectedTabela1.value || !selectedTabela2.value) {
    emit('status', 'Por favor, selecione ambos os períodos de referência.');
     // Don't set an error here, as it might be too aggressive during initial selection
  } else {
     emit('status', 'Selecione os períodos para consulta.');
  }
}

const marcaSelectEnabled = computed(() => !!selectedTabela1.value);
const fetchButtonEnabled = computed(() => {
  return !!(selectedTabela1.value && selectedTabela2.value && selectedTabela1.value !== selectedTabela2.value);
});

function onFetchDashboard() {
  if (!fetchButtonEnabled.value) {
    if (selectedTabela1.value && selectedTabela2.value && selectedTabela1.value === selectedTabela2.value) {
         emit('error', 'Os períodos de referência não podem ser iguais.');
    } else if (!selectedTabela1.value || !selectedTabela2.value) {
         emit('error', 'Por favor, selecione ambos os períodos de referência.');
    } else {
        // Fallback, though button should be disabled
        emit('error', 'Por favor, verifique as seleções.');
    }
    return;
  }
  emit('error', ''); // Clear any previous errors
  emit('fetchDashboard', {
    tabela1: selectedTabela1.value,
    tabela2: selectedTabela2.value,
    marca: selectedMarca.value
  });
}
</script>

<style scoped>
.form-label i {
  margin-right: 0.5rem;
}
/* Custom button styles removed, relying on Bootstrap btn classes */
</style>
