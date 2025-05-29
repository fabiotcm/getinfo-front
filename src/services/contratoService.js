// src/services/contratoService.js
import api from "../api/Api"

export const criarContrato = (contrato) => api.post('/contratos', contrato)

export const uploadAnexo = (id, file) => {
  const formData = new FormData()
  formData.append('anexo', file)
  return api.patch(`/contratos/upload/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const listarContratos = () => api.get('/contratos')
export const buscarContratoPorId = (id) => api.get(`/contratos/${id}`)
export const buscarAgregados = (id) => api.get(`/contratos/agregados/${id}`)
export const downloadAnexo = (id) => api.get(`/contratos/download/${id}`, {
  responseType: 'blob'
})
export const adicionarColaboradores = (contratoId, idsColaboradores) =>
  api.post(`/contratos/${contratoId}/colaboradores`, idsColaboradores)

export const ativarContrato = (id) => api.patch(`/contratos/ativar/${id}`)
export const arquivarContrato = (id) => api.delete(`/contratos/arquivar/${id}`)
