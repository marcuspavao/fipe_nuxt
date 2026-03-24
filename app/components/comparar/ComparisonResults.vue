<template>
  <div class="comparison-results mt-4">
    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando comparação...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="comparisonData && comparisonData.length > 0">
      <h2 class="mb-3 h4">Comparação de Valores: <span class="text-primary">{{ modeloNome }}</span></h2>
      <div class="row">
        <div v-for="(item, index) in comparisonData" :key="index + '-' + item.year" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-secondary text-white">
              <h5 class="card-title mb-0">Ano: {{ item.year === "32000" ? '0km' : item.year }}</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-6">{{ refPeriodo1Display }}:</dt>
                <dd class="col-sm-6 text-end">{{ item.price1 ? item.price1.replace(/"/g, '') : 'N/A' }}</dd>

                <dt class="col-sm-6">{{ refPeriodo2Display }}:</dt>
                <dd class="col-sm-6 text-end">{{ item.price2 ? item.price2.replace(/"/g, '') : 'N/A' }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !error && initialPrompt" class="alert alert-light text-center" role="alert">
      <i class="fas fa-filter me-2"></i>
      Por favor, selecione os períodos e o modelo para comparação.
    </div>

    <div v-else-if="!loading && !error && !initialPrompt && (!comparisonData || comparisonData.length === 0)" class="alert alert-info" role="alert">
      <i class="fas fa-info-circle me-2"></i>
      Nenhuma comparação disponível para os períodos e modelo selecionados, ou dados insuficientes para comparar.
    </div>
  </div>
</template>

<script setup>
defineProps({
  comparisonData: Array,
  modeloNome: String,
  refPeriodo1Display: String,
  refPeriodo2Display: String,
  loading: Boolean,
  error: String,
  initialPrompt: Boolean
});
</script>

<style scoped>
/* Custom styles largely removed in favor of Bootstrap defaults. */
/* Minor adjustments can be made here if necessary, but prefer Bootstrap utilities. */

/* Example: If card titles need specific adjustment not covered by Bootstrap heading classes */
/* .card-title { font-size: 1.1rem; } */

/* Example: If definition list terms/details need specific styling */
/* .card-body dl dt { font-weight: normal; color: #555; } */
/* .card-body dl dd { font-weight: bold; } */
/* Using Bootstrap text utilities (e.g., text-success, fw-bold) in the template is often preferred for dd styling. */
</style>
