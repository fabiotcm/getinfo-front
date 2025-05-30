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

// Buscar colaboradores agregados a um contrato
export const buscarAgregados = (id) => api.get(`/contratos/agregados/${id}`)

// Buscar entregáveis de um contrato
export const buscarEntregaveis = (id) => api.get(`/contratos/entregaveis/${id}`)

// Fazer download do anexo de um contrato
export const downloadAnexo = (id) => api.get(`/contratos/download/${id}`, {
  responseType: 'blob'
})

// Adicionar colaboradores a um contrato
export const adicionarColaboradores = (contratoId, idsColaboradores) =>
  api.post(`/contratos/${contratoId}/colaboradores`, idsColaboradores)

// Ativar um contrato
export const ativarContrato = (id) => api.patch(`/contratos/ativar/${id}`)

// Arquivar um contrato
export const arquivarContrato = (id) => api.delete(`/contratos/arquivar/${id}`)
