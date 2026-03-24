<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <ComparisonForm @compare="handleCompare" @loading="handleFormLoading" @error="handleError" />
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <ComparisonResults
          :comparisonData="results"
          :modeloNome="modeloNome"
          :refPeriodo1Display="refPeriodo1Display"
          :refPeriodo2Display="refPeriodo2Display"
          :loading="loading"
          :error="error"
          :initialPrompt="initialLoad" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ComparisonForm from '../components/comparar/ComparisonForm.vue';
import ComparisonResults from '../components/comparar/ComparisonResults.vue';
import { getVeiculos } from '../services/apiService';

const results = ref([]);
const modeloNome = ref('');
const refPeriodo1Display = ref('');
const refPeriodo2Display = ref('');
const loading = ref(false); // For the main comparison data fetching
const formLoading = ref(false); // For ComparisonForm's internal loading (marcas, modelos)
const error = ref('');
const initialLoad = ref(true); // To show initial prompt in Results

async function handleCompare(payload) {
  const { tabela1, tabela2, modelo, marcaNome, modeloNome: mNome, refPeriodo1Display: rP1, refPeriodo2Display: rP2 } = payload;

  loading.value = true;
  error.value = '';
  results.value = [];
  initialLoad.value = false;

  modeloNome.value = mNome;
  refPeriodo1Display.value = rP1;
  refPeriodo2Display.value = rP2;

  try {
    const [veiculosT1, veiculosT2] = await Promise.all([
      getVeiculos(tabela1, modelo),
      getVeiculos(tabela2, modelo)
    ]);

    const processedResults = [];
    const veiculosT2Map = new Map(veiculosT2.map(v => [v.year, v]));

    for (const v1 of veiculosT1) {
      const v2 = veiculosT2Map.get(v1.year);
      processedResults.push({
        year: v1.year,
        price1: v1.price,
        price2: v2 ? v2.price : 'N/A',
      });
      if (v2) veiculosT2Map.delete(v1.year); 
    }
    
    processedResults.sort((a, b) => {
        const yearA = a.year === "32000" ? 0 : parseInt(a.year);
        const yearB = b.year === "32000" ? 0 : parseInt(b.year);
        return yearA - yearB;
    });

    results.value = processedResults;

  } catch (err) {
    console.error(err);
    error.value = err.message || 'Erro ao buscar dados para comparação.';
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function handleFormLoading(isLoading) {
  formLoading.value = isLoading;
  // If the form starts loading its dependencies, reset the results and error states.
  if (isLoading) {
    results.value = [];
    error.value = '';
    initialLoad.value = true; 
    // The ComparisonResults component will show its own loading spinner via the `loading` prop
    // if we set `loading.value = true` here. We can decide if that's desired.
    // For now, let's make the main loading spinner active when the form is loading its dependencies.
    loading.value = true;
  } else {
    // When form is done loading its dependencies, if no comparison has been triggered yet,
    // set the main loading to false.
     if (initialLoad.value) {
        loading.value = false;
     }
  }
}

function handleError(errorMessage) {
  error.value = errorMessage;
  results.value = [];
  loading.value = false;
  formLoading.value = false; // Reset form loading state as well
  initialLoad.value = false;
}

</script>

<style scoped>
/* Using Bootstrap container and row/col, so specific styles might not be needed here. */
</style>
