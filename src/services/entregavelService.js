// src/services/entregavelService.js
import api from "../api/Api"

// Listar todos os entregáveis
export const listarEntregaveis = () =>
  api.get('/entregaveis')

