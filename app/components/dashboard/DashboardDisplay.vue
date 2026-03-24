<template>
  <div class="dashboard-display mt-4">
    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Buscando dados do dashboard...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Falha ao carregar dashboard: {{ error }}
    </div>

    <div v-else-if="statusMessage && !loading && !error && (!dashboardData || dashboardData.length === 0)" class="alert alert-info" role="alert">
      <i class="fas fa-info-circle me-2"></i>
      {{ statusMessage }}
    </div>
    
    <div v-if="dashboardData && dashboardData.length > 0 && !loading && !error" class="row">
      <div v-for="brandEntry in dashboardData" :key="brandEntry.brandCode" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-dark text-white">
            <h4 class="mb-0 text-center">{{ brandEntry.brandName }}</h4>
          </div>
          <div class="card-body">
            <div v-if="brandEntry.periodo1" class="mb-3">
              <h5 class="text-muted">{{ getPeriodRefLabel(brandEntry.periodo1.ref) }}</h5>
              <dl class="row dl-details mb-0">
                <dt class="col-sm-7">Menor Preço 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo1.menorPreco0km?.valorFmt || 'N/A' }}</dd>
                <dd v-if="brandEntry.periodo1.menorPreco0km?.modelo !== 'N/A'" class="col-12 text-end text-muted small">({{ brandEntry.periodo1.menorPreco0km?.modelo }})</dd>

                <dt class="col-sm-7">Maior Preço 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo1.maiorPreco0km?.valorFmt || 'N/A' }}</dd>
                <dd v-if="brandEntry.periodo1.maiorPreco0km?.modelo !== 'N/A'" class="col-12 text-end text-muted small">({{ brandEntry.periodo1.maiorPreco0km?.modelo }})</dd>

                <dt class="col-sm-7">Valor Médio 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo1.valorMedio0kmFmt || 'N/A' }}</dd>

                <dt class="col-sm-7">Total Modelos:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo1.totalModelos || 0 }}</dd>
              </dl>
            </div>
            <div v-else class="alert alert-light p-2">Dados não disponíveis para o primeiro período.</div>

            <div v-if="brandEntry.periodo2" class="mb-3">
              <h5 class="text-muted">{{ getPeriodRefLabel(brandEntry.periodo2.ref) }}</h5>
              <dl class="row dl-details mb-0">
                <dt class="col-sm-7">Menor Preço 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo2.menorPreco0km?.valorFmt || 'N/A' }}</dd>
                 <dd v-if="brandEntry.periodo2.menorPreco0km?.modelo !== 'N/A'" class="col-12 text-end text-muted small">({{ brandEntry.periodo2.menorPreco0km?.modelo }})</dd>

                <dt class="col-sm-7">Maior Preço 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo2.maiorPreco0km?.valorFmt || 'N/A' }}</dd>
                <dd v-if="brandEntry.periodo2.maiorPreco0km?.modelo !== 'N/A'" class="col-12 text-end text-muted small">({{ brandEntry.periodo2.maiorPreco0km?.modelo }})</dd>

                <dt class="col-sm-7">Valor Médio 0km:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo2.valorMedio0kmFmt || 'N/A' }}</dd>

                <dt class="col-sm-7">Total Modelos:</dt>
                <dd class="col-sm-5 text-end">{{ brandEntry.periodo2.totalModelos || 0 }}</dd>
              </dl>
            </div>
            <div v-else class="alert alert-light p-2">Dados não disponíveis para o segundo período.</div>

            <div class="diff-stats pt-3 border-top">
              <h5 class="text-center text-muted small">Diferenças Percentuais (Período 2 vs Período 1)</h5>
              <dl class="row mb-0">
                <dt class="col-sm-8">Valor Médio 0km:</dt>
                <dd class="col-sm-4 text-end" :class="getPercentageClass(brandEntry.diferencasPercentuais?.valorMedio0km)">
                  {{ formatDisplayPercentage(brandEntry.diferencasPercentuais?.valorMedio0km) }}
                </dd>
                <dt class="col-sm-8">Total de Modelos:</dt>
                <dd class="col-sm-4 text-end" :class="getPercentageClass(brandEntry.diferencasPercentuais?.totalModelos)">
                  {{ formatDisplayPercentage(brandEntry.diferencasPercentuais?.totalModelos) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!dashboardData || dashboardData.length === 0 && !loading && !error && !statusMessage" class="alert alert-secondary text-center" role="alert">
      Nenhum dado encontrado para os critérios selecionados.
    </div>
  </div>
</template>

<script setup>
import { formatarPeriodoParaExibicao } from '../../services/apiService';

const props = defineProps({
  dashboardData: Array,
  loading: Boolean,
  error: String,
  statusMessage: String
});

function getPeriodRefLabel(refCode) {
  if (!refCode) return 'Período Indefinido';
  const parts = refCode.split('/');
  if (parts.length >= 2) {
    const mesAnoString = parts.slice(parts.length - 2).join('/');
    return formatarPeriodoParaExibicao(mesAnoString);
  }
  return formatarPeriodoParaExibicao(refCode);
}

function formatDisplayPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  const formatted = value.toFixed(2).replace('.', ',');
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

function getPercentageClass(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-muted';
  }
  return value > 0 ? 'text-success' : (value < 0 ? 'text-danger' : 'text-muted');
}

</script>

<style scoped>
/* .card-header h4 { font-size: 1.25rem; } */ /* Bootstrap default for h4 is this size */
.dl-details dt {
  font-weight: normal;
  color: #555;
}
.dl-details dd {
  font-weight: bold;
}
.dl-details .small {
    font-size: 0.8em;
    margin-top: -0.25rem; /* Adjust spacing for sub-line model name */
    display: block;
}

/* .text-end class is provided by Bootstrap, no need to redefine */

.diff-stats dt {
    font-weight: normal;
}
.diff-stats dd {
    font-weight: bold;
}
</style>
