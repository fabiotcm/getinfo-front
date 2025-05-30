// src/services/entregavelService.js
import api from "../api/Api"

// Criar um novo entregável
export const criarEntregavel = (entregavel) =>
  api.post('/entregaveis', entregavel)

// Listar todos os entregáveis
export const listarEntregaveis = () =>
  api.get('/entregaveis')

// Deletar um entregável pelo ID
export const deletarEntregavel = (id) =>
  api.delete(`/entregaveis/${id}`)
