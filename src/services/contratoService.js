// src/services/contratoService.js
import api from "../api/Api"; // Importa a instância do Axios configurada

// Criar novo contrato
export const criarContrato = (contrato) => api.post('/contratos', contrato);

// Upload de anexo para um contrato
export const uploadAnexo = (id, file) => {
  const formData = new FormData();
  formData.append('anexo', file);
  return api.patch(`/contratos/upload/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Listar todos os contratos
export const listarContratos = () => api.get('/contratos');

// Buscar contrato por ID
export const buscarContratoPorId = (id) => api.get(`/contratos/${id}`);

// Buscar colaboradores agregados a um contrato (GET)
export const buscarAgregados = (id) => api.get(`/contratos/agregados/${id}`);

// Buscar entregáveis de um contrato
export const buscarEntregaveis = (id) => api.get(`/contratos/entregaveis/${id}`);

// Visualizar anexo de um contrato
export const viewAnexo = (id) => api.get(`/contratos/view/${id}`, {
  responseType: 'blob',
});

// Fazer download do anexo de um contrato
export const downloadAnexo = (id) => api.get(`/contratos/download/${id}`, {
  responseType: 'blob',
});

// Exibir aditivos relacionados a um contrato
export const exibirAditivosDoContrato = (id) => api.get(`/contratos/aditivos/${id}`);

// Aditivar um contrato (criar um novo aditivo para um contrato existente)
export const aditivarContrato = (id, aditivoData) => api.post(`/contratos/aditivar/${id}`, aditivoData);


// Criar um novo entregável associado a um contrato
export const criarEntregavel = (contratoId, entregavelData) =>
  api.post(`/contratos/entregavel/${contratoId}`, entregavelData);


// Função para adicionar um ÚNICO colaborador agregado a um contrato
export const adicionarAgregadoAoContrato = (agregadoData) =>
  api.post('/contratos/agregados/', agregadoData);

// Ativar um contrato
export const ativarContrato = (id) => api.patch(`/contratos/ativar/${id}`);

// Arquivar um contrato
export const arquivarContrato = (id) => api.delete(`/contratos/arquivar/${id}`);

// Editar um contrato
export const editarContrato = (id, contrato) => api.patch(`/contratos/editar/${id}`, contrato);

// Exibir repactuação de um contrato
export const exibirRepactuacao = (id) => api.get(`/contratos/repactuacoes/${id}`);

// Repactuar um contrato
export const repactuarContrato = (id, repactuacaoData) =>
  api.post(`/contratos/repactuar/${id}`, repactuacaoData);