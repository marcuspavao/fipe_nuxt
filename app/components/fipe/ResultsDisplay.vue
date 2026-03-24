<template>
  <div class="results-display mt-4">
    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando informações do veículo...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Erro ao buscar os dados: {{ error }}
    </div>

    <div v-else-if="veiculos && veiculos.length > 0" class="card shadow-sm">
      <div class="card-header bg-dark text-white">
        <h2 class="h5 mb-0">Resultados da Consulta</h2>
      </div>
      <div class="card-body">
        <h3 class="h6 text-muted mb-3">{{ modeloNome }}</h3>
        <ul class="list-group list-group-flush">
          <li v-for="veiculo in veiculos" :key="veiculo.year + '-' + veiculo.price" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span class="fw-bold">{{ veiculo.year === "32000" ? '0km' : veiculo.year }}</span>
              <small class="d-block text-muted">Referência: {{ veiculo.monthReference ? veiculo.monthReference.replace(/"/g, '') : 'N/A' }}</small>
            </div>
            <span class="badge bg-success rounded-pill fs-6">{{ veiculo.price ? veiculo.price.replace(/"/g, '') : 'N/A' }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-else-if="!loading && !error && (!veiculos || veiculos.length === 0) && modeloNome" class="alert alert-info" role="alert">
      <i class="fas fa-info-circle me-2"></i>
      Nenhum veículo encontrado para "{{ modeloNome }}" neste período.
    </div>

    <div v-else-if="!loading && !error && !modeloNome" class="alert alert-light text-center" role="alert">
      <i class="fas fa-filter me-2"></i>
      Selecione os filtros acima para consultar os veículos.
    </div>
  </div>
</template>

<script setup>
defineProps({
  veiculos: Array,
  modeloNome: String,
  loading: Boolean,
  error: String
});
</script>

<style scoped>
.results-display {
  /* Styles previously in .result-container can be adjusted or removed if Bootstrap handles them */
  /* All custom styles removed to adhere to Bootstrap defaults */
}
</style>
