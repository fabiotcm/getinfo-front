// src/services/contratoService.js
import api from "../api/Api"

// Criar novo contrato
export const criarContrato = (contrato) => api.post('/contratos', contrato)

// Upload de anexo para um contrato
export const uploadAnexo = (id, file) => {
  const formData = new FormData()
  formData.append('anexo', file)
  return api.patch(`/contratos/upload/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Listar todos os contratos
export const listarContratos = () => api.get('/contratos')

// Buscar contrato por ID
export const buscarContratoPorId = (id) => api.get(`/contratos/${id}`)

// Buscar colaboradores agregados a um contrato (GET)
export const buscarAgregados = (id) => api.get(`/contratos/agregados/${id}`)

// Buscar entregáveis de um contrato
export const buscarEntregaveis = (id) => api.get(`/contratos/entregaveis/${id}`)

// Vizualizar anexo de um contrato
export const viewAnexo = (id) => api.get(`/contratos/view/${id}`, {
  responseType: 'blob' 
})

// Fazer download do anexo de um contrato
export const downloadAnexo = (id) => api.get(`/contratos/download/${id}`, {
  responseType: 'blob'
})

// --- MODIFICAÇÕES AQUI ---

// Função para adicionar um ÚNICO colaborador agregado a um contrato
// O backend tem um endpoint POST /contratos/agregados/ que espera um AgregadoCreateDTO.
// Esse DTO precisa do contratoId dentro dele, além do colaboradorId e funcao.
// Ajuste o nome da função para refletir que ela adiciona um único agregado, não uma lista.
export const adicionarAgregadoAoContrato = (agregadoData) =>
  api.post('/contratos/agregados/', agregadoData)

// Ativar um contrato
export const ativarContrato = (id) => api.patch(`/contratos/ativar/${id}`)

// Arquivar um contrato
export const arquivarContrato = (id) => api.delete(`/contratos/arquivar/${id}`)

// Editar um contrato
export const editarContrato = (id, contrato) => api.patch(`/contratos/editar/${id}`, contrato)