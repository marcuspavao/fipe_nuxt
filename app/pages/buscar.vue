<template>
    <div class="container mt-4">
      <h1 class="mb-4">Consulta de Preços de Veículos - Tabela FIPE</h1>
  
      <div class="mb-3">
        <label for="tabela-referencia" class="form-label">Tabela de Referência:</label>
        <select id="tabela-referencia" v-model="tabelaSelecionada" @change="limparBusca" class="form-select">
          <option v-for="tabela in tabelas" :key="tabela.codigo" :value="tabela.codigo">
            {{ formatarPeriodoParaExibicao(tabela.mes) }}
          </option>
        </select>
      </div>
  
      <div class="mb-3">
        <label for="search-input" class="form-label">Digite o nome do veículo:</label>
        <input
          id="search-input"
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          class="form-control"
          placeholder="Ex: Fiat Palio 1.0"
          autocomplete="off"
        />
        <div v-if="searchResults.length > 0" class="list-group mt-1">
          <button
            type="button"
            class="list-group-item list-group-item-action"
            v-for="vehicle in searchResults"
            :key="vehicle.fipe_codigo"
            @click="selectVehicle(vehicle)"
          >
            {{ vehicle.name }} ({{ vehicle.marca }})
          </button>
        </div>
         <div v-if="isLoading" class="mt-2">
          Buscando...
        </div>
      </div>
  
      <!-- Exibição dos Detalhes do Veículo Selecionado -->
      <div v-if="veiculoSelecionado" class="card">
        <div class="card-header">
          <h5 class="card-title">{{ veiculoSelecionado.name || veiculoSelecionado.nome }}</h5>
        </div>
        <div class="card-body">
          <p class="card-text"><strong>Valor:</strong> {{ veiculoSelecionado.valor }}</p>
          <p class="card-text"><strong>Marca:</strong> {{ veiculoSelecionado.marca }}</p>
          <p class="card-text"><strong>Modelo:</strong> {{ veiculoSelecionado.modelo }}</p>
          <p class="card-text"><strong>Ano Modelo:</strong> {{ veiculoSelecionado.ano_modelo || veiculoSelecionado.anoModelo }}</p>
          <p class="card-text"><strong>Combustível:</strong> {{ veiculoSelecionado.combustivel || veiculoSelecionado.combustivelSigla }}</p>
          <p class="card-text"><strong>Código FIPE:</strong> {{ veiculoSelecionado.fipe_codigo || veiculoSelecionado.codigoFipe }}</p>
          <p class="card-text"><small>Consulta realizada em: {{ formatarPeriodoParaExibicao(tabelaSelecionadaNome) }}</small></p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  // Importa as funções do serviço de API, incluindo a nova searchVeiculos
  import { getTabelas, searchVeiculos, getVeiculos, formatarPeriodoParaExibicao } from '@/services/apiService';
  // Importa debounce do lodash para otimizar a chamada da API
  import { debounce } from 'lodash';
  
  // Estado reativo do componente
  const tabelas = ref([]); // Armazena a lista de tabelas FIPE disponíveis
  const tabelaSelecionada = ref(null); // Armazena o código da tabela FIPE selecionada pelo usuário
  const searchQuery = ref(''); // Armazena o texto digitado pelo usuário para busca
  const searchResults = ref([]); // Armazena os resultados da busca por texto
  const veiculoSelecionado = ref(null); // Armazena os detalhes do veículo selecionado
  const isLoading = ref(false); // Controla a exibição do indicador de carregamento
  
  // Carrega as tabelas de referência quando o componente é montado
  onMounted(async () => {
    try {
      const data = await getTabelas();
      tabelas.value = data;
      if (data.length > 0) {
        tabelaSelecionada.value = data[0].Codigo;
      }
    } catch (error) {
      console.error("Erro ao carregar tabelas FIPE:", error.message);
      // Aqui você pode adicionar lógica para notificar o usuário sobre o erro
    }
  });
  
  // Propriedade computada para obter o nome formatado da tabela selecionada
  const tabelaSelecionadaNome = computed(() => {
      const tabela = tabelas.value.find(t => t.Codigo === tabelaSelecionada.value);
      return tabela ? tabela.Mes : '';
  });
  
  // Função de busca com "debounce"
  // O debounce atrasa a execução da função até que o usuário pare de digitar por um tempo (500ms)
  const handleSearch = debounce(async () => {
    // Só executa a busca se a query tiver pelo menos 3 caracteres
    if (searchQuery.value.length < 3) {
      searchResults.value = []; // Limpa os resultados se a query for muito curta
      return;
    }
    
    isLoading.value = true; // Ativa o indicador de carregamento
    veiculoSelecionado.value = null; // Limpa qualquer veículo selecionado anteriormente
  
    try {
      // Chama a nova função searchVeiculos do apiService
      const results = await searchVeiculos(searchQuery.value, tabelaSelecionada.value);
      searchResults.value = results; // Atualiza os resultados da busca
    } catch (error) {
      console.error("Erro ao buscar veículos:", error.message);
      searchResults.value = []; // Limpa os resultados em caso de erro
      // Notificar o usuário sobre o erro
    } finally {
      isLoading.value = false; // Desativa o indicador de carregamento
    }
  }, 500); // 500ms de debounce
  
  // Função chamada quando um veículo é selecionado da lista de resultados
  const selectVehicle = async (vehicle) => {
    isLoading.value = true; // Ativa o indicador de carregamento
    try {
      // Busca os detalhes completos do veículo usando a função getVeiculos
      // Passa o código FIPE do veículo (ou nome se for a estrutura retornada pela busca)
      const detalhes = await getVeiculos(tabelaSelecionada.value, vehicle.codigoFipe || vehicle.fipe_codigo);
      // A API getVeiculos pode retornar um array, pegamos o primeiro
      if (detalhes && detalhes.length > 0) {
          veiculoSelecionado.value = detalhes[0];
      } else if (vehicle) { // Fallback para usar os dados da busca se getVeiculos não retornar nada
          veiculoSelecionado.value = vehicle;
      } else {
          veiculoSelecionado.value = null;
          console.warn("Nenhum detalhe encontrado para o veículo:", vehicle);
      }
    } catch (error) {
        console.error("Erro ao obter detalhes do veículo:", error.message);
        veiculoSelecionado.value = vehicle; // Fallback em caso de erro
        // Notificar o usuário
    } finally {
      // Limpa o campo de busca e os resultados após a seleção
      searchQuery.value = '';
      searchResults.value = [];
      isLoading.value = false; // Desativa o indicador de carregamento
    }
  };
  
  // Função para limpar a busca quando a tabela de referência é alterada
  const limparBusca = () => {
      searchQuery.value = '';
      searchResults.value = [];
      veiculoSelecionado.value = null;
  };
  </script>
  
  <style scoped>
  /* Estilos para a lista de resultados da busca, para que apareça como um dropdown */
  .list-group {
    position: absolute;
    z-index: 1000; /* Garante que a lista fique sobre outros elementos */
    width: calc(100% - 2rem); /* Ajusta a largura baseada no padding do container pai */
    max-height: 300px; /* Limita a altura da lista */
    overflow-y: auto; /* Adiciona scroll se a lista for muito grande */
  }
  
  .card {
    margin-top: 20px; /* Espaçamento acima do card de detalhes */
  }
  </style>
  