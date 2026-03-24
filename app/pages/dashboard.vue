<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <DashboardControls @fetchDashboard="handleFetchDashboard" @status="updateUserMessage" @error="handleErrorCondition" />
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <DashboardDisplay
          :dashboardData="data"
          :loading="loading"
          :error="error"
          :statusMessage="userMessage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DashboardControls from '../components/dashboard/DashboardControls.vue';
import DashboardDisplay from '../components/dashboard/DashboardDisplay.vue';
import { getDashboardData } from '../services/apiService';

const data = ref([]);
const loading = ref(false);
const error = ref('');
const userMessage = ref('Selecione os períodos e, opcionalmente, uma marca para visualizar o dashboard.'); // Initial message

async function handleFetchDashboard(payload) {
  const { tabela1, tabela2, marca } = payload;

  loading.value = true;
  error.value = '';
  userMessage.value = ''; // Clear user message, loading spinner will show
  data.value = [];

  try {
    const result = await getDashboardData(tabela1, tabela2, marca);
    data.value = result;
    if (result.length === 0) {
      userMessage.value = 'Nenhum dado encontrado para os critérios selecionados.';
    } else {
      userMessage.value = ''; // Data found, clear message
    }
  } catch (errCatch) {
    console.error(errCatch);
    error.value = errCatch.message || 'Erro ao buscar dados do dashboard.';
    userMessage.value = '';
    data.value = [];
  } finally {
    loading.value = false;
  }
}

function updateUserMessage(message) {
  // This message comes from DashboardControls (e.g. "loading marcas", "select periods")
  // It should usually clear data and errors, and potentially stop loading if it's just a status update.
  userMessage.value = message;
  error.value = '';
  data.value = [];
  // If the message indicates the form is ready/waiting, ensure loading is false.
  // If it's "loading X", the form's own selectors will be disabled.
  // The main DashboardDisplay loading should only be true during actual data fetch.
  loading.value = false;
}

function handleErrorCondition(errorMessage) {
  // This error comes from DashboardControls (e.g. "periods cannot be same")
  error.value = errorMessage;
  userMessage.value = ''; // Error takes precedence
  data.value = [];
  loading.value = false;
}

</script>

<style scoped>
/* Using Bootstrap container and row/col, specific styles might not be needed. */
</style>
